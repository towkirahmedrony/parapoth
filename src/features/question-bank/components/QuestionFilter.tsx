import React from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import type {
  QuestionBankChapter,
  QuestionBankFilterState,
  QuestionBankInstitution,
  QuestionBankTopic,
} from '../types/questionBank';

interface QuestionFilterProps {
  filters: QuestionBankFilterState;
  chapters: QuestionBankChapter[];
  topics: QuestionBankTopic[];
  boards: QuestionBankInstitution[];
  colleges: QuestionBankInstitution[];
  admissions: QuestionBankInstitution[];
  onFilterChange: <K extends keyof QuestionBankFilterState>(
    key: K,
    value: QuestionBankFilterState[K]
  ) => void;
  onReset: () => void;
}

const SORT_OPTIONS: Array<{ value: QuestionBankFilterState['sortBy']; label: string }> = [
  { value: 'newest', label: 'নতুন' },
  { value: 'oldest', label: 'পুরানো' },
  { value: 'most_attempted', label: 'বেশি চেষ্টা' },
  { value: 'least_attempted', label: 'কম চেষ্টা' },
];

const YEARS = Array.from({ length: 15 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

function SelectField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-text-secondary ml-1">{props.label}</span>
      <select
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="h-9 rounded-xl border border-input-border bg-input-bg px-2 text-[13px] text-text-primary outline-none transition focus:ring-2 focus:ring-focus-ring focus:border-transparent appearance-none"
      >
        {props.options.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleChip(props: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={[
        'rounded-full border px-3 py-1.5 text-xs font-medium transition outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-app',
        props.active
          ? 'border-transparent bg-primary text-primary-foreground'
          : 'border-border-color bg-surface text-text-secondary hover:bg-secondary hover:text-text-primary',
      ].join(' ')}
    >
      {props.label}
    </button>
  );
}

export const QuestionFilter: React.FC<QuestionFilterProps> = ({
  filters,
  chapters,
  topics,
  boards,
  colleges,
  admissions,
  onFilterChange,
  onReset,
}) => {
  return (
    <Card className="rounded-3xl border border-card-border bg-card-bg p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-secondary p-2 text-text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">ফিল্টার</h3>
        </div>

        <Button
          variant="ghost"
          onClick={onReset}
          className="h-8 rounded-xl px-2.5 text-xs"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          রিসেট
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={filters.search}
            onChange={(event) => onFilterChange('search', event.target.value)}
            placeholder="খুঁজুন..."
            className="h-10 rounded-xl pl-9 bg-input-bg border-input-border text-sm text-text-primary focus:ring-focus-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
          <SelectField
            label="অধ্যায়"
            value={filters.chapterId}
            onChange={(value) => onFilterChange('chapterId', value)}
            options={[
              { value: '', label: 'সব অধ্যায়' },
              ...chapters.map((item) => ({
                value: item.id,
                label: item.name_bn,
              })),
            ]}
          />

          <SelectField
            label="টপিক"
            value={filters.topicId}
            onChange={(value) => onFilterChange('topicId', value)}
            options={[
              { value: '', label: 'সব টপিক' },
              ...topics.map((item) => ({
                value: item.id,
                label: item.name_bn,
              })),
            ]}
          />

          <SelectField
            label="উৎস"
            value={filters.institutionType}
            onChange={(value) => onFilterChange('institutionType', value)}
            options={[
              { value: '', label: 'সব উৎস' },
              { value: 'board', label: 'বোর্ড' },
              { value: 'college', label: 'কলেজ' },
              { value: 'admission', label: 'এডমিশন' },
            ]}
          />

          {filters.institutionType && (
            <SelectField
              label={
                filters.institutionType === 'board' ? 'বোর্ড নির্বাচন করুন' :
                filters.institutionType === 'college' ? 'কলেজ নির্বাচন করুন' : 
                'এডমিশন নির্বাচন করুন'
              }
              value={filters.institutionEiin}
              onChange={(value) => onFilterChange('institutionEiin', value)}
              options={[
                { value: '', label: 'সব নির্বাচন করুন' },
                ...(filters.institutionType === 'board' ? boards :
                   filters.institutionType === 'college' ? colleges :
                   admissions).map((item) => ({
                  value: item.eiin || item.id, // Fallback to ID if EIIN is missing
                  label: item.name_bn,
                })),
              ]}
            />
          )}

          <SelectField
            label="সাল"
            value={filters.year}
            onChange={(value) => onFilterChange('year', value)}
            options={[
              { value: '', label: 'সব সাল' },
              ...YEARS,
            ]}
          />

          <SelectField
            label="সাজান"
            value={filters.sortBy}
            onChange={(value) => onFilterChange('sortBy', value as QuestionBankFilterState['sortBy'])}
            options={SORT_OPTIONS}
          />
        </div>

        <div className="space-y-3 border-t border-border-color pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            দ্রুত ফিল্টার
          </div>

          <div className="flex flex-wrap gap-1.5">
            <ToggleChip
              active={filters.bookmarkedOnly}
              label="সেভ করা"
              onClick={() => onFilterChange('bookmarkedOnly', !filters.bookmarkedOnly)}
            />
            <ToggleChip
              active={filters.mistakesOnly}
              label="ভুল গুলো"
              onClick={() => onFilterChange('mistakesOnly', !filters.mistakesOnly)}
            />
            <ToggleChip
              active={filters.premiumOnly}
              label="প্রিমিয়াম"
              onClick={() => onFilterChange('premiumOnly', !filters.premiumOnly)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
