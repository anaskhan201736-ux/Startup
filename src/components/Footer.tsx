import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

interface FooterProps {
  onOpenDonate: () => void;
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDonate, onScrollToTop }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                BookCycle
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-2 max-w-sm">
              Connecting students to pass on textbooks, eliminate cost barriers, and keep books in circulation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-400">
            <button
              type="button"
              onClick={onScrollToTop}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Back to Top
            </button>
            <button
              type="button"
              onClick={onOpenDonate}
              className="hover:text-white transition-colors cursor-pointer text-emerald-400 font-semibold"
            >
              Donate a Book
            </button>
            <span>Textbook Exchange</span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} BookCycle. Free & open for students everywhere.</p>
          <p className="flex items-center gap-1.5">
            Built for student communities and circular learning.
          </p>
        </div>
      </div>
    </footer>
  );
};
