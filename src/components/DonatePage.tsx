import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  X, 
  Check, 
  MapPin, 
  Phone, 
  BookOpen, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Book, BookCondition } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { sanitizeWhatsAppNumber, getWhatsAppChatUrl } from '../utils/whatsapp';

interface DonatePageProps {
  onBackToCatalog: () => void;
  onAddBook: (
    newBook: Omit<Book, 'id' | 'createdAt' | 'status'>,
    photoFile?: File | null
  ) => Promise<void> | void;
}

const CLASS_CHOICES = [
  'Class 10 (10th Std)',
  'Class 9 (9th Std)',
  'Class 8 (8th Std)',
  'Class 7 (7th Std)',
  'Class 6 (6th Std)',
  'Class 5 (5th Std)',
  'Class 4 (4th Std)',
  'Class 3 (3rd Std)',
  'Class 2 (2nd Std)',
  'Class 1 (1st Std)',
];

const SUBJECT_CHOICES = [
  'Mathematics',
  'Science',
  'Social Studies',
  'English',
  'Hindi',
  'Environmental Studies (EVS)',
  'Computer Studies',
  'Physics (Class 9-10)',
  'Chemistry (Class 9-10)',
  'Biology (Class 9-10)',
  'History & Civics',
  'Geography',
  'Sanskrit / Regional Language',
  'General Knowledge',
  'Other',
];

const CONDITION_INFO: Record<BookCondition, { label: string; desc: string; dotColor: string }> = {
  'Like New': {
    label: 'Like New',
    desc: 'Crisp, spotless pages, looks almost unread.',
    dotColor: 'bg-emerald-600',
  },
  'Very Good': {
    label: 'Very Good',
    desc: 'Light cover wear, clean spine, minimal notes.',
    dotColor: 'bg-teal-600',
  },
  'Good': {
    label: 'Good',
    desc: 'Contains highlighting or study notes, intact binding.',
    dotColor: 'bg-amber-600',
  },
  'Fair': {
    label: 'Fair',
    desc: 'Heavily used or dog-eared, fully readable and usable.',
    dotColor: 'bg-stone-500',
  },
};

export const DonatePage: React.FC<DonatePageProps> = ({
  onBackToCatalog,
  onAddBook,
}) => {
  // Required fields according to prompt:
  // - Book name
  // - Class
  // - Subject
  // - Condition
  // - Location
  // - Book photo
  // - WhatsApp contact

  const [bookName, setBookName] = useState('');
  const [classChoice, setClassChoice] = useState('Class 10 (10th Std)');
  const [subjectChoice, setSubjectChoice] = useState('Mathematics');
  const [customSubject, setCustomSubject] = useState('');
  const [condition, setCondition] = useState<BookCondition>('Very Good');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [whatsappContact, setWhatsappContact] = useState('');

  // Optional supportive fields
  const [author, setAuthor] = useState('');
  const [donorName, setDonorName] = useState('');
  const [notes, setNotes] = useState('');

  // Drag, photo & submission state
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo selection & compression (optimizes for crisp display and fast online sync)
  const handlePhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsPhotoProcessing(true);
      setErrorMessage('');
      setPhotoFile(file);
      const compressedDataUrl = await compressImage(file, 720, 720, 0.72);
      setPhotoUrl(compressedDataUrl);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not process this image. Please try another photo.');
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  };

  // Form submission: saves directly to shared online database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookName.trim()) {
      setErrorMessage('Please provide the Book Name.');
      return;
    }

    const resolvedClass = classChoice;

    const resolvedSubject =
      subjectChoice === 'Other'
        ? customSubject.trim() || 'General Studies'
        : subjectChoice;

    if (!location.trim()) {
      setErrorMessage('Please provide a meeting location.');
      return;
    }

    const cleanNumber = sanitizeWhatsAppNumber(whatsappContact);
    if (!cleanNumber || cleanNumber.length < 7) {
      setErrorMessage('Please enter a valid WhatsApp phone number with country code (e.g. +1 555-234-5678 or +91 98765 43210).');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onAddBook(
        {
          title: bookName.trim(),
          author: author.trim() || 'School Textbook',
          classLevel: resolvedClass,
          subject: resolvedSubject,
          condition,
          pickupLocation: location.trim(),
          photoUrl: photoUrl || undefined,
          whatsappContact: whatsappContact.trim(),
          donorName: donorName.trim() || 'Student Donor',
          notes: notes.trim() || undefined,
        },
        photoFile
      );
    } catch (err: any) {
      console.error('Publish error:', err);
      let msg = 'Failed to publish listing online. Please try again.';
      if (err?.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error) {
            msg = `Error: ${parsed.error}`;
          }
        } catch {
          msg = err.message;
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived effective values for preview
  const previewClass = classChoice;
  const previewSubject = subjectChoice === 'Other' ? (customSubject || 'Your Subject') : subjectChoice;
  const testWhatsAppUrl = whatsappContact ? getWhatsAppChatUrl(whatsappContact, bookName || 'Textbook', location) : null;

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation & header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-emerald-800 transition-colors p-1 -ml-1 rounded-md mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Book Catalog</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Textbook Sharing</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Donate a Book
              </h1>
              <p className="text-sm text-stone-600 mt-1 max-w-xl">
                Fill in the book details and upload a quick photo. Once submitted, your book will immediately be listed for fellow students to contact you on WhatsApp.
              </p>
            </div>

            <div className="hidden lg:block text-right">
              <span className="text-xs text-stone-500 block">Typical response time</span>
              <span className="text-sm font-bold text-emerald-800">Under 24 hours</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Form on Left, Live Listing Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Book Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Book Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookName}
                  onChange={(e) => {
                    setBookName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. Campbell Biology, Stewart Calculus, Organic Chemistry"
                  className="w-full px-4 py-2.5 text-sm sm:text-base bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:bg-white transition-all placeholder:text-stone-400 font-medium"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Enter the exact title printed on the cover.
                </p>
              </div>

              {/* Optional Author */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Author / Publisher <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Halliday, Resnick & Walker, or Pearson"
                  className="w-full px-4 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:bg-white transition-all placeholder:text-stone-400"
                />
              </div>

              {/* 2. Class & 3. Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Standard / Class (1st – 10th Std) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={classChoice}
                    onChange={(e) => setClassChoice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:bg-white transition-all text-stone-800"
                  >
                    {CLASS_CHOICES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Only textbooks within 1st to 10th Standard are accepted.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Subject <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={subjectChoice}
                    onChange={(e) => setSubjectChoice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:bg-white transition-all text-stone-800"
                  >
                    {SUBJECT_CHOICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {subjectChoice === 'Other' && (
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Specify subject (e.g. Microbiology, Anthropology)"
                      className="mt-2 w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700"
                    />
                  )}
                </div>
              </div>

              {/* 4. Condition */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Condition <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(CONDITION_INFO) as BookCondition[]).map((cond) => {
                    const info = CONDITION_INFO[cond];
                    const isSelected = condition === cond;
                    return (
                      <div
                        key={cond}
                        onClick={() => setCondition(cond)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50/80 ring-1 ring-emerald-700'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${info.dotColor}`} />
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-stone-800'}`}>
                            {info.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                          {info.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Location */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Location <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                  </div>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Science Library front desk, Central Cafeteria, Student Center"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:bg-white transition-all placeholder:text-stone-400"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Choose a convenient meeting spot for peer hand-off.
                </p>
              </div>

              {/* 6. Book Photo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Book Photo
                  </label>
                  <span className="text-[11px] text-stone-400">
                    Helps students verify the textbook edition
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileInputChange}
                  className="hidden"
                />

                {photoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 max-w-sm">
                    <img
                      src={photoUrl}
                      alt="Uploaded textbook cover"
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-xs text-white font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Photo Ready
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs bg-white/90 hover:bg-white text-stone-900 rounded-md font-medium cursor-pointer backdrop-blur-xs transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoUrl(null);
                            setPhotoFile(null);
                          }}
                          className="px-2.5 py-1 text-xs bg-rose-600/90 hover:bg-rose-700 text-white rounded-md font-medium cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-700 bg-emerald-50/50'
                        : 'border-stone-300 hover:border-emerald-700/60 bg-stone-50/50 hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                      {isPhotoProcessing ? (
                        <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-stone-800">
                      {isPhotoProcessing ? 'Optimizing photo...' : 'Click to take a photo or upload cover'}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      PNG, JPG, HEIC up to 10MB (automatically compressed for web)
                    </p>
                  </div>
                )}
              </div>

              {/* 7. WhatsApp Contact */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Contact <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[10px] font-bold">
                      WA
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={whatsappContact}
                    onChange={(e) => setWhatsappContact(e.target.value)}
                    placeholder="e.g. +1 555-019-2834 or +91 9876543210"
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:bg-white transition-all placeholder:text-stone-400 font-mono"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                  <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Privacy protected: Your number is never shown publicly on the listing.</span>
                  </p>
                  {testWhatsAppUrl && (
                    <a
                      href={testWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Test WhatsApp Link
                    </a>
                  )}
                </div>
              </div>

              {/* Additional Details (Donor Name & Notes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Your Name / Nickname <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Alex M."
                    className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-700 focus:bg-white transition-all placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Notes for Classmates <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 8th Edition, contains class midterm study notes"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-700 focus:bg-white transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Error Alert above submit button */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onBackToCatalog}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPhotoProcessing || isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSubmitting ? 'Publishing Online...' : 'Publish Book Listing'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Live Listing Preview */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Live Listing Preview
              </span>
              <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                How students will see it
              </span>
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-5 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-700" />

              {/* Photo preview or spine placeholder */}
              {photoUrl ? (
                <div className="w-full h-44 rounded-xl overflow-hidden mb-4 bg-stone-100 border border-stone-200">
                  <img
                    src={photoUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-28 rounded-xl bg-gradient-to-br from-emerald-50 to-stone-100 border border-dashed border-stone-300 flex flex-col items-center justify-center mb-4 text-stone-400">
                  <BookOpen className="w-8 h-8 text-emerald-800/40 mb-1" />
                  <span className="text-xs text-stone-500 font-medium">
                    Upload photo to display cover
                  </span>
                </div>
              )}

              {/* Category & Class Metadata */}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2 font-medium">
                <span className="text-emerald-800 font-semibold">{previewSubject}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{previewClass}</span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-stone-900 leading-snug line-clamp-2">
                {bookName || 'Your Textbook Name'}
              </h3>

              {/* Author */}
              <p className="text-xs text-stone-500 mt-1">
                by <span className="font-semibold text-stone-700">{author || 'Author name'}</span>
              </p>

              {/* Condition & Location row */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${CONDITION_INFO[condition].dotColor}`} />
                  <span className="font-bold text-stone-800">{condition}</span>
                </div>

                <div className="flex items-center gap-1 text-stone-500 max-w-[60%] truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{location || 'Meeting location'}</span>
                </div>
              </div>

              {/* Notes preview if given */}
              {notes && (
                <p className="text-xs text-stone-500 mt-2.5 bg-stone-50 p-2 rounded-lg border border-stone-100 italic line-clamp-2">
                  "{notes}"
                </p>
              )}

              {/* Direct WhatsApp Callout */}
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                <div className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-xs">
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>Contact on WhatsApp</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>Donor: {donorName || 'Student Donor'}</span>
                  <span className="text-emerald-700 font-medium">Number kept private</span>
                </div>
              </div>

            </div>

            {/* Donation Safety & Community tips */}
            <div className="bg-stone-50 rounded-2xl border border-stone-200/80 p-4 text-xs text-stone-600 space-y-2">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>Student Donor Checklist</span>
              </div>
              <ul className="space-y-1 text-stone-500 list-disc list-inside">
                <li>Textbooks are for student sharing — no selling fees.</li>
                <li>Coordinate safe hand-offs in public areas.</li>
                <li>Once handed over, you can tap "Mark as Taken" at any time.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
