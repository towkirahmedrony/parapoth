import React, { memo } from 'react';
import { Search, ChevronDown, ChevronLeft, Calendar, Building2 } from 'lucide-react';
import { Subject } from '../types/content';

interface BoardExamFilterProps {
  subject: Subject;
  selectedBoard: string;
  setSelectedBoard: (board: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onBack: () => void;
}

const BOARDS = [
  'ঢাকা বোর্ড', 'রাজশাহী বোর্ড', 'কুমিল্লা বোর্ড', 
  'যশোর বোর্ড', 'চট্টগ্রাম বোর্ড', 'বরিশাল বোর্ড', 
  'সিলেট বোর্ড', 'দিনাজপুর বোর্ড', 'ময়মনসিংহ বোর্ড', 
  'মাদ্রাসা বোর্ড', 'কারিগরি বোর্ড'
] as const;

const YEARS = ['2025', '2024', '2023', '2022', '2021'] as const;

const BoardExamFilter: React.FC<BoardExamFilterProps> = memo(({
  subject,
  selectedBoard,
  setSelectedBoard,
  selectedYear,
  setSelectedYear,
  searchQuery,
  setSearchQuery,
  onBack
}) => {
  return (
    <div className="space-y-4">
      
      {/* Header with Circular Back Button */}
      <div 
        className="flex items-center gap-4 p-4 rounded-xl border shadow-sm sticky top-0 z-10"
        style={{ 
          backgroundColor: 'var(--dyn-card)',
          borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
        }}
      >
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center rounded-full border transition-all active:scale-95 hover:bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)] hover:text-[var(--dyn-primary)]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
            borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
            color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)'
          }}
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--dyn-text)' }}>
            {subject.name_bn}
          </h2>
          <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
            বোর্ড প্রশ্ন খুঁজুন
          </p>
        </div>
      </div>

      {/* Filters */}
      <div 
        className="p-4 rounded-xl border space-y-4"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--dyn-bg) 50%, var(--dyn-card) 50%)',
          borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
        }}
      >
        
        <div className="grid grid-cols-2 gap-3">
          {/* Board Dropdown */}
          <div className="relative">
            <div 
              className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
            >
              <Building2 size={16} />
            </div>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="w-full text-sm rounded-lg pl-9 pr-8 py-3 border appearance-none outline-none transition-all focus:ring-1 focus:border-[var(--dyn-primary)] focus:ring-[var(--dyn-primary)]"
              style={{
                backgroundColor: 'var(--dyn-bg)',
                color: 'var(--dyn-text)',
                borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)'
              }}
            >
              <option value="">সকল বোর্ড</option>
              {BOARDS.map(board => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>
            <div 
              className="absolute inset-y-0 right-3 flex items-center pointer-events-none"
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
            >
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <div 
              className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
            >
              <Calendar size={16} />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full text-sm rounded-lg pl-9 pr-8 py-3 border appearance-none outline-none transition-all focus:ring-1 focus:border-[var(--dyn-primary)] focus:ring-[var(--dyn-primary)]"
              style={{
                backgroundColor: 'var(--dyn-bg)',
                color: 'var(--dyn-text)',
                borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)'
              }}
            >
              <option value="">সকল সাল</option>
              {YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div 
              className="absolute inset-y-0 right-3 flex items-center pointer-events-none"
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
            >
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div 
            className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--dyn-primary)]"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
          >
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="প্রশ্নপত্র খুঁজুন... (যেমন: ঢাকা বোর্ড ২০২৩)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg pl-10 pr-4 py-3 border outline-none transition-all focus:ring-1 focus:border-[var(--dyn-primary)] focus:ring-[var(--dyn-primary)] placeholder:text-[color-mix(in_srgb,var(--dyn-text)_40%,transparent)]"
            style={{
              backgroundColor: 'var(--dyn-bg)',
              color: 'var(--dyn-text)',
              borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)'
            }}
          />
        </div>
      </div>
    </div>
  );
});

BoardExamFilter.displayName = 'BoardExamFilter';

export default BoardExamFilter;
