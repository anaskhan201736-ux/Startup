import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  getDocFromServer,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import { Book } from './types';

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const storage = getStorage(app);

// Test Firestore Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message);
    }
  }
}
testConnection();

// Standard Firestore Error Handling conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Maps raw Firestore documents to the Book type
 */
function mapSnapshotToBooks(snapshot: QuerySnapshot<DocumentData>): Book[] {
  const booksList: Book[] = [];
  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    booksList.push({
      id: docSnap.id,
      title: d.title || '',
      author: d.author || '',
      classLevel: d.classLevel || '',
      subject: d.subject || '',
      condition: d.condition || 'Good',
      pickupLocation: d.pickupLocation || '',
      photoUrl: d.photoUrl || '',
      whatsappContact: d.whatsappContact || '',
      donorName: d.donorName || '',
      editionYear: d.editionYear || '',
      notes: d.notes || '',
      coverPalette: d.coverPalette || undefined,
      createdAt: d.createdAt || new Date().toISOString(),
      status: d.status || 'available',
    });
  });

  // Sort client-side by creation date (newest first)
  booksList.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  return booksList;
}

/**
 * Fetch book listings directly from Cloud Firestore server
 * Guarantees fresh data across all devices and browsers without stale cache
 */
export async function getBooksFromFirestore(): Promise<Book[]> {
  const booksCol = collection(db, 'books');
  try {
    // Attempt direct server fetch first to bypass any stale client cache
    const snapshot = await getDocsFromServer(booksCol);
    return mapSnapshotToBooks(snapshot);
  } catch (serverErr) {
    console.warn('Direct server read failed, using standard network getDocs:', serverErr);
    try {
      const snapshot = await getDocs(booksCol);
      return mapSnapshotToBooks(snapshot);
    } catch (networkErr) {
      handleFirestoreError(networkErr, OperationType.GET, 'books');
    }
  }
}

/**
 * Subscribe to live book listings from Firestore
 * Real-time listener: all connected devices receive updates immediately
 */
export function subscribeToBooks(
  onUpdate: (books: Book[]) => void,
  onError?: (err: Error) => void
): () => void {
  const booksCol = collection(db, 'books');

  const unsubscribe = onSnapshot(
    booksCol,
    (snapshot) => {
      const booksList = mapSnapshotToBooks(snapshot);
      onUpdate(booksList);
    },
    (error) => {
      console.error('Failed to listen to books collection', error);
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.GET, 'books');
    }
  );

  return unsubscribe;
}

/**
 * Upload book photo to Firebase Storage with automatic timeout & fallback
 */
export async function uploadBookPhoto(
  fileOrDataUrl: File | string,
  bookId: string
): Promise<string> {
  if (!fileOrDataUrl) return '';
  const timestamp = Date.now();
  const storagePath = `book-photos/${bookId}_${timestamp}`;
  const fallbackUrl = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';

  try {
    const uploadTask = async (): Promise<string> => {
      if (fileOrDataUrl instanceof File) {
        const ext = fileOrDataUrl.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `${storagePath}.${ext}`);
        const snapshot = await uploadBytes(storageRef, fileOrDataUrl, {
          contentType: fileOrDataUrl.type || 'image/jpeg',
        });
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } else if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
        const storageRef = ref(storage, `${storagePath}.jpg`);
        const snapshot = await uploadString(storageRef, fileOrDataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      }
      return fallbackUrl;
    };

    // 2.5-second safety timeout so publish never hangs
    const timeout = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timed out')), 2500)
    );

    const storageUrl = await Promise.race([uploadTask(), timeout]);
    if (storageUrl) {
      return storageUrl;
    }
  } catch (storageError) {
    console.warn('Storage upload notice, falling back to data URL:', storageError);
  }

  return fallbackUrl;
}

/**
 * Publish a new book listing:
 * 1. Upload the book photo to Firebase Storage (with instant data URL fallback)
 * 2. Save all book details to Firestore
 */
export async function addBookListing(
  bookData: Omit<Book, 'id' | 'createdAt' | 'status'>,
  photoFile?: File | null
): Promise<string> {
  const path = 'books';
  try {
    const bookId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Upload photo to Firebase Storage
    let finalPhotoUrl = bookData.photoUrl || '';
    if (photoFile) {
      const storageUrl = await uploadBookPhoto(photoFile, bookId);
      if (storageUrl) {
        finalPhotoUrl = storageUrl;
      }
    } else if (bookData.photoUrl && bookData.photoUrl.startsWith('data:')) {
      const storageUrl = await uploadBookPhoto(bookData.photoUrl, bookId);
      if (storageUrl) {
        finalPhotoUrl = storageUrl;
      }
    }

    const bookRef = doc(db, 'books', bookId);
    const nowIso = new Date().toISOString();

    const payload: Record<string, any> = {
      title: (bookData.title || '').trim(),
      classLevel: bookData.classLevel || 'Class 10 (10th Std)',
      subject: bookData.subject || 'General Studies',
      condition: bookData.condition || 'Good',
      pickupLocation: (bookData.pickupLocation || '').trim(),
      status: 'available',
      author: (bookData.author || '').trim(),
      photoUrl: finalPhotoUrl || '',
      whatsappContact: (bookData.whatsappContact || '').trim(),
      donorName: (bookData.donorName || '').trim(),
      editionYear: (bookData.editionYear || '').trim(),
      notes: (bookData.notes || '').trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(bookRef, payload);
    return bookId;
  } catch (error) {
    console.error('Failed to write book document to Firestore:', error);
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Mark book as Taken or Available, syncing instantly for all users via Firestore
 */
export async function updateBookStatus(
  bookId: string,
  newStatus: 'available' | 'taken' | 'claimed'
): Promise<void> {
  const path = `books/${bookId}`;
  try {
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Remove a book listing from Firestore
 */
export async function deleteBookListing(bookId: string): Promise<void> {
  const path = `books/${bookId}`;
  try {
    const bookRef = doc(db, 'books', bookId);
    await deleteDoc(bookRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
