import React from 'react';
import { BookOpen, Plus, Sparkles, HeartHandshake } from 'lucide-react';

interface NavbarProps {
  currentPage: 'catalog' | 'donate';
  onNavigateToDonate: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToHowItWorks: () => void;
  onNavigateToFAQ: () => void;
  totalBooksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigateToDonate,
  onNavigateToCatalog,
  onNavigateToHowItWorks,
  onNavigateToFAQ,
  totalBooksCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title, single line */}
        <button
          onClick={onNavigateToCatalog}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-800 transition-colors">
            <BookOpen className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors font-sans">
              BookCycle
            </span>
          </div>
        </button>

        {/* Zone 2: Clean nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={onNavigateToCatalog}
            className={`transition-colors cursor-pointer ${
              currentPage === 'catalog'
                ? 'text-emerald-800 font-bold'
                : 'hover:text-stone-950'
            }`}
          >
            Find Books
            {totalBooksCount > 0 && (
              <span className="ml-1.5 text-xs text-emerald-700 font-semibold tabular-nums">
                ({totalBooksCount})
              </span>
            )}
          </button>
          <button
            onClick={onNavigateToDonate}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentPage === 'donate'
                ? 'text-emerald-800 font-bold'
                : 'hover:text-stone-950'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-emerald-700" />
            <span>Donate a Book</span>
          </button>
          <button
            onClick={onNavigateToHowItWorks}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={onNavigateToFAQ}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Student Guidelines
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          {currentPage === 'donate' ? (
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg shadow-2xs transition-all whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>Browse Books</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNavigateToDonate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Donate a Book</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
