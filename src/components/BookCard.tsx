import React from 'react';
import { MapPin, User, ChevronRight, BookOpen, MessageSquare, Check, CheckCircle2 } from 'lucide-react';
import { Book } from '../types';
import { getWhatsAppChatUrl } from '../utils/whatsapp';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onToggleTaken: (bookId: string) => void;
}

const CONDITION_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  'Like New': { dot: 'bg-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50' },
  'Very Good': { dot: 'bg-teal-600', text: 'text-teal-800', bg: 'bg-teal-50' },
  'Good': { dot: 'bg-amber-600', text: 'text-amber-800', bg: 'bg-amber-50' },
  'Fair': { dot: 'bg-stone-500', text: 'text-stone-700', bg: 'bg-stone-100' },
};

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect, onToggleTaken }) => {
  const condStyle = CONDITION_COLORS[book.condition] || { dot: 'bg-stone-400', text: 'text-stone-700', bg: 'bg-stone-50' };
  const isTaken = book.status === 'taken' || book.status === 'claimed';
  
  // Direct WhatsApp chat URL - phone number is used in the link href but NEVER displayed on screen
  const whatsAppUrl = book.whatsappContact 
    ? getWhatsAppChatUrl(book.whatsappContact, book.title, book.classLevel, book.subject) 
    : null;

  return (
    <div
      onClick={() => onSelect(book)}
      className={`group bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
        isTaken ? 'border-stone-200/60 opacity-85 hover:opacity-100' : 'border-stone-200/90 hover:border-emerald-700/60'
      }`}
    >
      {/* Top spine accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
        isTaken ? 'bg-stone-300' : 'bg-stone-100 group-hover:bg-emerald-600'
      }`} />

      <div>
        {/* Book Photo if available */}
        {book.photoUrl ? (
          <div className="w-full h-44 mb-3.5 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 relative">
            <img
              src={book.photoUrl}
              alt={book.title}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isTaken ? 'grayscale-40 group-hover:scale-101' : 'group-hover:scale-102'
              }`}
            />
            {isTaken && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900/90 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span>Taken</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-24 mb-3.5 rounded-xl bg-gradient-to-br from-emerald-50/70 to-stone-100/70 border border-stone-200/50 flex items-center justify-center text-emerald-800/40 relative">
            <BookOpen className="w-7 h-7" />
            {isTaken && (
              <div className="absolute inset-0 bg-stone-900/40 rounded-xl flex items-center justify-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-900/90 text-white text-[11px] font-bold rounded-md uppercase tracking-wider">
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  <span>Taken</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Metadata: Standard · Subject */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2 font-medium">
          <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/80">
            {book.classLevel}
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="font-semibold text-stone-700">{book.subject}</span>
        </div>

        {/* Book Name */}
        <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
          {book.title}
        </h3>

        {/* Author / Publisher */}
        {book.author && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-1">
            by <span className="font-medium text-stone-700">{book.author}</span>
            {book.editionYear && (
              <>
                <span aria-hidden="true" className="mx-1 text-stone-300">·</span>
                <span className="text-stone-400">{book.editionYear}</span>
              </>
            )}
          </p>
        )}

        {/* Notes preview if present */}
        {book.notes && (
          <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
            "{book.notes}"
          </p>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-3">
        {/* Condition & Location (Phone is strictly hidden) */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${condStyle.dot}`} />
            <span className={`font-semibold ${condStyle.text}`}>{book.condition}</span>
          </div>

          <div className="flex items-center gap-1 text-stone-500 line-clamp-1 max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{book.pickupLocation}</span>
          </div>
        </div>

        {/* Listing Actions */}
        <div className="flex flex-col gap-2 pt-1">
          {isTaken ? (
            <div className="w-full py-2 px-3 flex items-center justify-between text-xs font-semibold text-stone-600 bg-stone-100 rounded-xl border border-stone-200">
              <span className="flex items-center gap-1.5 text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Book Taken</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTaken(book.id);
                }}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-medium hover:underline cursor-pointer"
                title="Mark as available again"
              >
                Mark Available
              </button>
            </div>
          ) : whatsAppUrl ? (
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer text-center"
              title="Open WhatsApp chat with donor"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Contact on WhatsApp</span>
            </a>
          ) : null}

          {/* Quick donor control: Mark as Taken & View Details */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-0.5 pt-0.5">
            {!isTaken ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTaken(book.id);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-emerald-900 bg-stone-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-stone-200/80 hover:border-emerald-300 transition-colors cursor-pointer"
                title="Donor: tap to mark this book as handed over"
              >
                <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                <span>Mark as Taken</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 truncate text-[11px] text-stone-400">
                <User className="w-3 h-3 text-stone-400" />
                <span className="truncate">{book.donorName || 'Donor'}</span>
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(book);
              }}
              className="text-stone-600 hover:text-emerald-800 font-semibold inline-flex items-center gap-0.5 cursor-pointer text-xs ml-auto"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
