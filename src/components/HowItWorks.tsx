import React from 'react';
import { BookPlus, Users2, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

interface HowItWorksProps {
  onOpenDonate: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenDonate }) => {
  return (
    <section id="how-it-works" className="py-16 border-t border-stone-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            Simple & Transparent
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight text-balance">
            How BookCycle works for students
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            No commerce cut, no shipping headaches, and zero dollars spent. Just passing knowledge forward across semesters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {/* Step 1 */}
          <div className="space-y-3 bg-stone-50/60 p-4.5 rounded-2xl border border-stone-200/70">
            <div className="text-xs font-bold text-emerald-800 tracking-wide font-mono">
              01. LIST
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100/60">
              <BookPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Donor lists book
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Upload a quick photo, select your standard (Class 1 to 10), subject, and preferred meeting spot.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 bg-stone-50/60 p-4.5 rounded-2xl border border-stone-200/70">
            <div className="text-xs font-bold text-emerald-800 tracking-wide font-mono">
              02. SEARCH
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100/60">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Student finds it
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Students and parents easily search by class, subject, or exact book name with live instant filtering.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 bg-stone-50/60 p-4.5 rounded-2xl border border-stone-200/70">
            <div className="text-xs font-bold text-emerald-800 tracking-wide font-mono">
              03. CHAT
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100/60">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Contact on WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              1-tap WhatsApp chat with private numbers. Agree on time and meeting spot to hand over the book.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 bg-stone-50/60 p-4.5 rounded-2xl border border-stone-200/70">
            <div className="text-xs font-bold text-emerald-800 tracking-wide font-mono">
              04. FINISH
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Donor marks as Taken
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Once handed over, the donor marks the book as Taken in 1 tap so other students know it's no longer available.
            </p>
          </div>
        </div>

        {/* Reassurance Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                Student Non-Profit Initiative
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Every book on BookCycle is gifted unconditionally. Buying and selling is strictly prohibited.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenDonate}
            className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Start by Donating
          </button>
        </div>
      </div>
    </section>
  );
};
