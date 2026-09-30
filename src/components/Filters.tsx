import React from 'react';
import { Search, X, SlidersHorizontal, BookOpen, Layers } from 'lucide-react';
import { BookCondition, ClassLevel, SubjectCategory } from '../types';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClass: ClassLevel;
  onClassChange: (cls: ClassLevel) => void;
  selectedSubject: SubjectCategory;
  onSubjectChange: (sub: SubjectCategory) => void;
  selectedCondition: string;
  onConditionChange: (cond: string) => void;
  selectedStatus: 'all' | 'available' | 'taken';
  onStatusChange: (status: 'all' | 'available' | 'taken') => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalFilteredCount: number;
}

export const CLASS_OPTIONS: ClassLevel[] = [
  'All',
  'Class 1 (1st Std)',
  'Class 2 (2nd Std)',
  'Class 3 (3rd Std)',
  'Class 4 (4th Std)',
  'Class 5 (5th Std)',
  'Class 6 (6th Std)',
  'Class 7 (7th Std)',
  'Class 8 (8th Std)',
  'Class 9 (9th Std)',
  'Class 10 (10th Std)',
];

export const SUBJECT_OPTIONS: SubjectCategory[] = [
  'All',
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
  'Other',
];

const CONDITION_OPTIONS = ['All Conditions', 'Like New', 'Very Good', 'Good', 'Fair'];

export const Filters: React.FC<FiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedCondition,
  onConditionChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  isFiltered,
  totalFilteredCount,
}) => {
  return (
    <div id="browse-section" className="space-y-6 pt-4">
      {/* Search Bar Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Find Textbooks (1st – 10th Std)
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Search titles, subjects, or filter by standard (Classes 1 to 10 only)
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-96 lg:w-[440px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4 text-emerald-700" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by class, subject or book name..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all placeholder:text-stone-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-stone-500 overflow-x-auto pb-0.5">
            <span className="text-stone-400 shrink-0">Try:</span>
            {['Class 10', 'Class 9', 'Mathematics', 'Science', 'English'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onSearchChange(term)}
                className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors shrink-0 cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Matrix Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-5">
        {/* Class / Grade Level Filter */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Browse by Standard / Class (1st to 10th Std)</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {CLASS_OPTIONS.map((cls) => {
              const active = selectedClass === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onClassChange(cls)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-stone-900 text-white shadow-xs font-semibold'
                      : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                  }`}
                >
                  {cls === 'All' ? 'All Classes' : cls}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="border-t border-stone-100" />

        {/* Subject Category Filter */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Browse by Subject</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SUBJECT_OPTIONS.map((subject) => {
              const active = selectedSubject === subject;
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => onSubjectChange(subject)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                      : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                  }`}
                >
                  {subject === 'All' ? 'All Subjects' : subject}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Condition, Status & Reset Row */}
        <div className="border-t border-stone-100 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status / Availability Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Status:</span>
              <div className="flex items-center gap-1">
                {(['all', 'available', 'taken'] as const).map((st) => {
                  const active = selectedStatus === st;
                  const label = st === 'all' ? 'All' : st === 'available' ? 'Available' : 'Taken';
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onStatusChange(st)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        active
                          ? st === 'available'
                            ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                            : st === 'taken'
                            ? 'bg-stone-800 text-white font-bold'
                            : 'bg-stone-200 text-stone-900 font-bold'
                          : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden sm:block w-px h-4 bg-stone-200" />

            {/* Condition Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Condition:</span>
              <div className="flex items-center gap-1">
                {CONDITION_OPTIONS.map((cond) => {
                  const active = selectedCondition === cond;
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => onConditionChange(cond)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        active
                          ? 'bg-stone-200 text-stone-900 font-semibold'
                          : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reset Filters & Results Indicator */}
          <div className="flex items-center gap-3 text-xs text-stone-500 w-full md:w-auto justify-between md:justify-end">
            <span>
              Showing <strong className="font-semibold text-stone-800 tabular-nums">{totalFilteredCount}</strong> textbooks
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
