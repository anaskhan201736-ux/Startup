/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Filters } from './components/Filters';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { DonatePage } from './components/DonatePage';
import { HowItWorks } from './components/HowItWorks';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { Book, ClassLevel, SubjectCategory } from './types';
import { BookOpen, Plus, Inbox, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'bookcycle_books_v1';

export default function App() {
  // CRITICAL REQUIREMENT: Books must only be within 1-10 std.
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Keep only books strictly within 1st to 10th standard
          return parsed.filter((b: Book) => {
            const cls = (b.classLevel || '').toLowerCase();
            const isBeyond10 =
              cls.includes('11') ||
              cls.includes('12') ||
              cls.includes('undergraduate') ||
              cls.includes('college') ||
              cls.includes('graduate') ||
              cls.includes('masters') ||
              cls.includes('test prep');
            return !isBeyond10;
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse stored books', e);
    }
    return [];
  });

  // Page Routing State ('catalog' | 'donate')
  const [currentPage, setCurrentPage] = useState<'catalog' | 'donate'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#donate') {
      return 'donate';
    }
    return 'catalog';
  });

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#donate') {
        setCurrentPage('donate');
      } else {
        setCurrentPage('catalog');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToDonate = () => {
    setCurrentPage('donate');
    window.location.hash = '#donate';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCatalog = () => {
    setCurrentPage('catalog');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('All');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('All');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'taken'>('all');

  // Modal & Selection State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync books to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Failed to persist books', e);
    }
  }, [books]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add Book Handler (called from DonatePage after submission)
  const handleAddBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'status'>) => {
    const newBook: Book = {
      ...bookData,
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: 'available',
    };

    // Prepend to listings
    setBooks((prev) => [newBook, ...prev]);
    
    // Switch to catalog page
    setCurrentPage('catalog');
    window.location.hash = '';
    showToast(`"${newBook.title}" was listed successfully!`);

    // Reset filters so the newly created book is prominently visible
    setSearchQuery('');
    setSelectedClass('All');
    setSelectedSubject('All');
    setSelectedCondition('All Conditions');

    // Scroll to the book listings area
    setTimeout(() => {
      document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  // Toggle Claimed status
  // Toggle Taken status for donors
  const handleToggleTaken = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const isCurrentlyTaken = b.status === 'taken' || b.status === 'claimed';
          const nextStatus = isCurrentlyTaken ? 'available' : 'taken';
          showToast(
            nextStatus === 'taken'
              ? 'Book marked as Taken! Thank you for sharing.'
              : 'Book marked as Available again.'
          );
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );

    setSelectedBook((prev) => {
      if (prev && prev.id === bookId) {
        const isCurrentlyTaken = prev.status === 'taken' || prev.status === 'claimed';
        return {
          ...prev,
          status: isCurrentlyTaken ? 'available' : 'taken',
        };
      }
      return prev;
    });
  };

  // Delete Book
  const handleDeleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    showToast('Textbook listing removed.');
    setSelectedBook(null);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('All');
    setSelectedSubject('All');
    setSelectedCondition('All Conditions');
    setSelectedStatus('all');
  };

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    selectedClass !== 'All' ||
    selectedSubject !== 'All' ||
    selectedCondition !== 'All Conditions' ||
    selectedStatus !== 'all';

  // Filtered Books computation
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Search query matches book name, class/standard, or subject
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author ? book.author.toLowerCase().includes(q) : false;
        const matchesSubject = book.subject.toLowerCase().includes(q);
        const matchesClass = book.classLevel.toLowerCase().includes(q);
        const matchesLocation = book.pickupLocation.toLowerCase().includes(q);
        const matchesNotes = book.notes ? book.notes.toLowerCase().includes(q) : false;

        // Match numeric standard query (e.g. "10", "10th", "std 10", "class 9")
        let matchesNumericClass = false;
        const queryDigits = q.match(/\b([1-9]|10)\b/);
        if (queryDigits) {
          const num = queryDigits[1];
          const bookDigits = book.classLevel.match(/\b([1-9]|10)\b/);
          if (bookDigits && bookDigits[1] === num) {
            matchesNumericClass = true;
          }
        }

        if (
          !matchesTitle &&
          !matchesAuthor &&
          !matchesSubject &&
          !matchesClass &&
          !matchesLocation &&
          !matchesNotes &&
          !matchesNumericClass
        ) {
          return false;
        }
      }

      // Class Level match
      if (selectedClass !== 'All') {
        const bClass = book.classLevel.toLowerCase();
        const sClass = selectedClass.toLowerCase();
        if (!bClass.includes(sClass) && !sClass.includes(bClass)) {
          return false;
        }
      }

      // Subject match
      if (selectedSubject !== 'All') {
        if (selectedSubject === 'Other') {
          const standardSubjects = [
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
          ];
          if (standardSubjects.includes(book.subject)) {
            return false;
          }
        } else if (book.subject !== selectedSubject) {
          return false;
        }
      }

      // Condition match
      if (selectedCondition !== 'All Conditions' && book.condition !== selectedCondition) {
        return false;
      }

      // Status match (Available vs Taken)
      if (selectedStatus === 'available') {
        if (book.status === 'taken' || book.status === 'claimed') return false;
      } else if (selectedStatus === 'taken') {
        if (book.status !== 'taken' && book.status !== 'claimed') return false;
      }

      return true;
    });
  }, [books, searchQuery, selectedClass, selectedSubject, selectedCondition, selectedStatus]);

  const scrollToBrowse = () => {
    if (currentPage !== 'catalog') {
      setCurrentPage('catalog');
      window.location.hash = '';
      setTimeout(() => {
        document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    if (currentPage !== 'catalog') {
      setCurrentPage('catalog');
      window.location.hash = '';
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFAQ = () => {
    if (currentPage !== 'catalog') {
      setCurrentPage('catalog');
      window.location.hash = '';
      setTimeout(() => {
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3.5 bg-stone-900 text-white rounded-xl shadow-xl border border-stone-800 text-xs sm:text-sm animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigateToDonate={navigateToDonate}
        onNavigateToCatalog={navigateToCatalog}
        onNavigateToHowItWorks={scrollToHowItWorks}
        onNavigateToFAQ={scrollToFAQ}
        totalBooksCount={books.length}
      />

      <main className="flex-1">
        {currentPage === 'donate' ? (
          /* Dedicated Donate a Book Page */
          <DonatePage
            onBackToCatalog={navigateToCatalog}
            onAddBook={handleAddBook}
          />
        ) : (
          /* Catalog / Home Page */
          <>
            {/* Hero Section */}
            <Hero
              onOpenDonate={navigateToDonate}
              onScrollToSearch={scrollToBrowse}
              totalBooksCount={books.length}
            />

            {/* Catalog & Browse Section */}
            <div id="browse-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
              <Filters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedClass={selectedClass}
                onClassChange={setSelectedClass}
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
                selectedCondition={selectedCondition}
                onConditionChange={setSelectedCondition}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                onResetFilters={handleResetFilters}
                isFiltered={isFiltered}
                totalFilteredCount={filteredBooks.length}
              />

              {/* Book Catalog Display */}
              {books.length === 0 ? (
                /* Pristine Empty State when no books exist yet */
                <div className="p-8 sm:p-14 text-center rounded-2xl bg-white border border-stone-200/90 shadow-2xs max-w-2xl mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center border border-emerald-100 mb-4">
                    <BookOpen className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                    No textbooks listed yet
                  </h3>

                  <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-lg mx-auto leading-relaxed">
                    Be the first student to donate a used textbook. Listing takes less than 60 seconds and connects you directly with classmates via WhatsApp.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={navigateToDonate}
                      className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Donate a Book Now</span>
                    </button>
                  </div>

                  {/* Tips for first donors */}
                  <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500 max-w-md mx-auto space-y-1">
                    <p className="font-semibold text-stone-700">Popular textbooks students need (1st to 10th Std):</p>
                    <p>Class 10 Mathematics & Science, Class 9 NCERT/State Board, Class 8 Science, Social Studies, English Grammar, and EVS books for Standards 1 to 5.</p>
                  </div>
                </div>
              ) : filteredBooks.length === 0 ? (
                /* Empty State for no search results */
                <div className="p-10 text-center rounded-2xl bg-white border border-stone-200/90 shadow-2xs max-w-xl mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">
                      No textbooks match your filters
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 mt-1">
                      Try broadening your search query or reset your class and subject selection.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                    <button
                      type="button"
                      onClick={navigateToDonate}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Donate This Book Instead
                    </button>
                  </div>
                </div>
              ) : (
                /* Grid of Available Books */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={(b) => setSelectedBook(b)}
                      onToggleTaken={handleToggleTaken}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* How It Works Section */}
            <HowItWorks onOpenDonate={navigateToDonate} />

            {/* FAQ & Guidelines Section */}
            <FAQSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenDonate={navigateToDonate}
        onScrollToTop={scrollToTop}
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onToggleTaken={handleToggleTaken}
        onDeleteBook={handleDeleteBook}
      />
    </div>
  );
}
