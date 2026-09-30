import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'Is every textbook on BookCycle free?',
    answer: 'Yes! BookCycle was built exclusively for student-to-student sharing. No student is charged, and selling or soliciting money for listed books is against the community pledge.',
  },
  {
    question: 'What types of books and study guides can I donate?',
    answer: 'Any textbook, course reader, problem set manual, lab guide, AP/IB study book, or graduate exam prep book (MCAT, LSAT, GRE, GMAT). Books with notes, highlighting, or slight wear are welcome as long as the pages are legible and intact.',
  },
  {
    question: 'Where is the best place to hand over textbooks?',
    answer: 'We always recommend well-lit public spots: the main library lobby, a student cafe, departmental commons, or near information desks during daytime hours.',
  },
  {
    question: 'How do I contact a donor for a book I found?',
    answer: 'Click "Contact on WhatsApp" on any listing. It directly opens a WhatsApp chat with the donor without exposing their phone number publicly. You can suggest a time and convenient meeting spot.',
  },
  {
    question: 'How does a donor mark a book as Taken?',
    answer: 'Once you hand over the book to the student, simply click "Mark as Taken" directly on the book card or in the details modal. The listing will immediately show as Taken so other students know it is no longer available.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-16 border-t border-stone-200/80 bg-stone-50/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            Student Guidelines
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Everything you need to know about donating and receiving textbooks on campus.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-stone-900 hover:text-emerald-800 transition-colors cursor-pointer text-sm sm:text-base"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4.5 pt-0 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
