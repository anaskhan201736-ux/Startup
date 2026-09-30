import React from 'react';
import { Plus, Search, BookMarked, ArrowDown, GraduationCap, Sparkles } from 'lucide-react';
import heroCampusImg from '../assets/images/hero_bookcycle_campus_1790777092029.jpg';

interface HeroProps {
  onOpenDonate: () => void;
  onScrollToSearch: () => void;
  totalBooksCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenDonate,
  onScrollToSearch,
  totalBooksCount,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/80 via-stone-50 to-[#FAFAF9] border-b border-stone-200/80 pt-10 pb-16 lg:pt-14 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Mission & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Student Textbook Exchange · Class 1 to 10 Only
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] text-balance">
              Never let a good school textbook gather dust on a shelf.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              BookCycle helps students and parents donate and find school textbooks for 1st to 10th Standard for free. No fees, no delays—just friendly, direct book sharing between students.
            </p>

            {/* Clean feature list */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-stone-600 pt-1">
              <span className="flex items-center gap-1.5 font-medium text-stone-800">
                <span className="text-emerald-700 font-bold">✓</span> Direct Student Sharing
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1.5 font-medium text-stone-800">
                <span className="text-emerald-700 font-bold">✓</span> Local Hand-off
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1.5 font-medium text-stone-800">
                <span className="text-emerald-700 font-bold">✓</span> No Fees
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onOpenDonate}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Donate a Book</span>
              </button>

              <button
                type="button"
                onClick={onScrollToSearch}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-base font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-2xs hover:border-stone-400 transition-all cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4 text-stone-500" />
                <span>Find by Standard & Subject (1–10)</span>
                <ArrowDown className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            {/* Live catalog status notice */}
            <div className="pt-2 text-xs text-stone-500 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {totalBooksCount === 0 ? (
                  <span>The 1st–10th Std exchange board is open. Be the first to donate a book!</span>
                ) : (
                  <span>
                    Currently <strong className="font-semibold text-stone-800 tabular-nums">{totalBooksCount}</strong> {totalBooksCount === 1 ? 'school textbook' : 'school textbooks'} available for exchange.
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200/90 bg-stone-200 aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/11]">
              <img
                src={heroCampusImg}
                alt="Stack of school textbooks and study guides on a library desk"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-white/90 backdrop-blur-md rounded-xl border border-white/60 shadow-xs">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Class 1–10 BookCycle
                </p>
                <p className="text-xs text-stone-700 mt-0.5">
                  "Promoted to the next standard? Pass your textbooks to a junior who needs them."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
