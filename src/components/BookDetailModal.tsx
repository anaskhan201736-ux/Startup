import React, { useState } from 'react';
import { X, MapPin, User, Trash2, MessageSquare, ExternalLink, ShieldCheck, Check, CheckCircle2 } from 'lucide-react';
import { Book } from '../types';
import { getWhatsAppChatUrl } from '../utils/whatsapp';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onToggleTaken: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onToggleTaken,
  onDeleteBook,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!book) return null;

  const isTaken = book.status === 'taken' || book.status === 'claimed';

  // WhatsApp link is generated with pre-filled message; the phone number is NEVER rendered in plain text
  const whatsAppUrl = book.whatsappContact
    ? getWhatsAppChatUrl(book.whatsappContact, book.title, book.classLevel, book.subject)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {book.classLevel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-700 font-semibold">{book.subject}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Photo Display if provided */}
          {book.photoUrl && (
            <div className="w-full h-64 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 relative">
              <img
                src={book.photoUrl}
                alt={book.title}
                className="w-full h-full object-contain bg-stone-950/5"
              />
              {isTaken && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900/90 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span>Taken</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Title & Author */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
              {book.title}
            </h2>
            {book.author && (
              <p className="text-sm text-stone-600 mt-1">
                by <span className="font-semibold text-stone-800">{book.author}</span>
                {book.editionYear && (
                  <>
                    <span aria-hidden="true" className="mx-1.5 text-stone-300">·</span>
                    <span className="text-stone-500">{book.editionYear}</span>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Condition Box */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
            <div>
              <div className="text-xs font-bold text-stone-900">
                Condition: <span className="text-emerald-800">{book.condition}</span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {book.condition === 'Like New' && 'Crisp, unused or barely opened, no markings.'}
                {book.condition === 'Very Good' && 'Very light wear, clean spine, all pages legible.'}
                {book.condition === 'Good' && 'Contains study notes or highlighting, completely usable.'}
                {book.condition === 'Fair' && 'Shelf wear, dog ears, or study marks, fully readable.'}
              </p>
            </div>
          </div>

          {/* Meeting Location */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Meeting Location
            </span>
            <div className="flex items-center gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-stone-800 text-sm">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-medium">{book.pickupLocation}</span>
            </div>
          </div>

          {/* Notes if available */}
          {book.notes && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Donor Notes
              </span>
              <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 italic">
                "{book.notes}"
              </p>
            </div>
          )}

          {/* Contact on WhatsApp Section (Phone number strictly NOT publicly displayed) */}
          <div className="p-4.5 bg-stone-50/90 rounded-2xl border border-stone-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[10px] font-bold">
                  WA
                </span>
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Contact Donor
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                Listed {new Date(book.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-stone-700 font-medium">
                <User className="w-4 h-4 text-stone-400" />
                <span>{book.donorName || 'Student Donor'}</span>
              </div>
              
              <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Phone number kept private</span>
              </div>
            </div>

            {/* Direct Contact Button or Taken Notice */}
            {isTaken ? (
              <div className="p-3 text-center text-xs font-semibold text-stone-600 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>This textbook has been marked as Taken.</span>
              </div>
            ) : whatsAppUrl ? (
              <div className="space-y-3">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Contact on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
                <p className="text-[11px] text-stone-400 text-center">
                  Opens WhatsApp directly with a prefilled message asking about this book.
                </p>

                {/* Donor Quick Action Banner */}
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs text-stone-700">
                    <span className="font-bold text-emerald-950">Are you the donor?</span>
                    <p className="text-[11px] text-stone-500">Done handing over the book? Mark it as taken so others know.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleTaken(book.id)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    <span>Mark as Taken</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Delete listing prompt */}
          {showConfirmDelete ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
              <p className="font-semibold text-rose-900">
                Remove this textbook listing from BookCycle?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteBook(book.id);
                    onClose();
                  }}
                  className="px-3 py-1 bg-rose-700 text-white font-medium rounded-lg hover:bg-rose-800 cursor-pointer"
                >
                  Yes, Remove Listing
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1 bg-stone-200 text-stone-700 font-medium rounded-lg hover:bg-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="text-xs text-stone-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Listing</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => onToggleTaken(book.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  isTaken
                    ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isTaken ? 'Mark as Available' : 'Mark as Taken'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
