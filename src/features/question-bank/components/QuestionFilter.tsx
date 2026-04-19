import React from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import type {
  QuestionBankChapter,
  QuestionBankFilterState,
  QuestionBankSubject,
  QuestionBankTopic,
} from '../types/questionBank';

interface QuestionFilterProps {
  filters: QuestionBankFilterState;
  subjects: QuestionBankSubject[];
  chapters: QuestionBankChapter[];
  topics: QuestionBankTopic[];
  onFilterChange: <K extends keyof QuestionBankFilterState>(
    key: K,
    value: QuestionBankFilterState[K]
  ) => void;
  onReset: () => void;
}

const QUESTION_TYPES = ['MCQ', 'CQ', 'SQ'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SOURCE_TYPES = ['board_exam', 'admission', 'model_test', 'textbook', 'guidebook', 'worksheet'];
const SORT_OPTIONS: Array<QuestionBankFilterState['sortBy']> = [
  'newest',
  'oldest',
  'most_attempted',
  'least_attempted',
];

function SelectField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{props.label}</span>
      <select
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
        'rounded-full border px-3 py-2 text-sm font-medium transition',
        props.active
          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
      ].join(' ')}
    >
      {props.label}
    </button>
  );
}

export const QuestionFilter: React.FC<QuestionFilterProps> = ({
  filters,
  subjects,
  chapters,
  topics,
  onFilterChange,
  onReset,
}) => {
  return (
    <Card className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-slate-100 p-2 dark:bg-slate-800">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Search, refine and organize questions</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onReset}
          className="h-10 rounded-2xl px-3 text-sm"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(event) => onFilterChange('search', event.target.value)}
            placeholder="Question, topic, explanation, tag দিয়ে খুঁজুন"
            className="h-12 rounded-2xl pl-11"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
          <SelectField
            label="Subject"
            value={filters.subjectId}
            onChange={(value) => onFilterChange('subjectId', value)}
            options={[
              { value: '', label: 'All Subjects' },
              ...subjects.map((item) => ({
                value: item.id,
                label: item.name_bn,
              })),
            ]}
          />

          <SelectField
            label="Chapter"
            value={filters.chapterId}
            onChange={(value) => onFilterChange('chapterId', value)}
            options={[
              { value: '', label: 'All Chapters' },
              ...chapters.map((item) => ({
                value: item.id,
                label: item.name_bn,
              })),
            ]}
          />

          <SelectField
            label="Topic"
            value={filters.topicId}
            onChange={(value) => onFilterChange('topicId', value)}
            options={[
              { value: '', label: 'All Topics' },
              ...topics.map((item) => ({
                value: item.id,
                label: item.name_bn,
              })),
            ]}
          />

          <SelectField
            label="Question Type"
            value={filters.questionType}
            onChange={(value) => onFilterChange('questionType', value)}
            options={[
              { value: '', label: 'All Types' },
              ...QUESTION_TYPES.map((item) => ({
                value: item,
                label: item,
              })),
            ]}
          />

          <SelectField
            label="Difficulty"
            value={filters.difficultyLevel}
            onChange={(value) => onFilterChange('difficultyLevel', value)}
            options={[
              { value: '', label: 'All Levels' },
              ...DIFFICULTIES.map((item) => ({
                value: item,
                label: item.charAt(0).toUpperCase() + item.slice(1),
              })),
            ]}
          />

          <SelectField
            label="Source"
            value={filters.sourceType}
            onChange={(value) => onFilterChange('sourceType', value)}
            options={[
              { value: '', label: 'All Sources' },
              ...SOURCE_TYPES.map((item) => ({
                value: item,
                label: item.replace(/_/g, ' '),
              })),
            ]}
          />

          <SelectField
            label="Sort By"
            value={filters.sortBy}
            onChange={(value) => onFilterChange('sortBy', value as QuestionBankFilterState['sortBy'])}
            options={SORT_OPTIONS.map((item) => ({
              value: item,
              label: item.replace(/_/g, ' '),
            }))}
          />
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <SlidersHorizontal className="h-4 w-4" />
            Quick filters
          </div>

          <div className="flex flex-wrap gap-2">
            <ToggleChip
              active={filters.bookmarkedOnly}
              label="Saved only"
              onClick={() => onFilterChange('bookmarkedOnly', !filters.bookmarkedOnly)}
            />
            <ToggleChip
              active={filters.mistakesOnly}
              label="Mistakes only"
              onClick={() => onFilterChange('mistakesOnly', !filters.mistakesOnly)}
            />
            <ToggleChip
              active={filters.premiumOnly}
              label="Premium only"
              onClick={() => onFilterChange('premiumOnly', !filters.premiumOnly)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
