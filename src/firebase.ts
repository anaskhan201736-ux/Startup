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
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Book } from './types';
import { INITIAL_SEED_BOOKS } from './data/seedBooks';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

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
 * Subscribe to all live book listings from Firestore
 * Real-time listener: all users and devices immediately receive updates
 */
export function subscribeToBooks(
  onUpdate: (books: Book[]) => void,
  onError?: (err: Error) => void
): () => void {
  const booksCol = collection(db, 'books');

  const unsubscribe = onSnapshot(
    booksCol,
    (snapshot) => {
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
          coverPalette: d.coverPalette,
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

      // If online database is empty, seed initial books once
      if (snapshot.empty) {
        seedInitialBooksIfEmpty();
      } else {
        onUpdate(booksList);
      }
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
 * Seed sample books if database is initially empty
 */
let isSeeding = false;
async function seedInitialBooksIfEmpty() {
  if (isSeeding) return;
  isSeeding = true;
  try {
    const booksCol = collection(db, 'books');
    const existingSnap = await getDocs(booksCol);
    if (!existingSnap.empty) {
      isSeeding = false;
      return;
    }

    const now = new Date();
    for (let i = 0; i < INITIAL_SEED_BOOKS.length; i++) {
      const seed = INITIAL_SEED_BOOKS[i];
      const bookId = `seed_book_${i + 1}`;
      // Stagger creation dates slightly
      const createdDate = new Date(now.getTime() - i * 3600000).toISOString();
      await setDoc(doc(db, 'books', bookId), {
        ...seed,
        createdAt: createdDate,
        updatedAt: createdDate,
      });
    }
  } catch (error) {
    console.error('Error seeding initial books:', error);
  } finally {
    isSeeding = false;
  }
}

/**
 * Create a new book listing stored permanently in Firestore
 */
export async function addBookListing(
  bookData: Omit<Book, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const path = 'books';
  try {
    const bookId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const bookRef = doc(db, 'books', bookId);
    const nowIso = new Date().toISOString();

    const payload = {
      title: bookData.title.trim(),
      classLevel: bookData.classLevel,
      subject: bookData.subject,
      condition: bookData.condition,
      pickupLocation: bookData.pickupLocation.trim(),
      status: 'available',
      author: (bookData.author || '').trim(),
      photoUrl: bookData.photoUrl || '',
      whatsappContact: (bookData.whatsappContact || '').trim(),
      donorName: (bookData.donorName || '').trim(),
      editionYear: (bookData.editionYear || '').trim(),
      notes: (bookData.notes || '').trim(),
      coverPalette: bookData.coverPalette || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(bookRef, payload);
    return bookId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Mark book as Taken or Available, syncing instantly for all users
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
