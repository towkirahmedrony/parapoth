import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Filter,
  Search,
  ChevronLeft,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Loader } from '@/shared/components/feedback/Loader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { QuestionFilter } from '../components/QuestionFilter';
import { useQuestionBank } from '../hooks/useQuestionBank';
import type { QuestionBankQuestion } from '../types/questionBank';

function InfoBadge(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border-color bg-badge-bg px-2 py-0.5 text-[11px] font-medium text-badge-text">
      {props.children}
    </span>
  );
}

function getQuestionPreview(question: QuestionBankQuestion): string {
  return question.body.text_bn || question.body.text_en || 'প্রশ্নের প্রিভিউ পাওয়া যাচ্ছে না';
}

function getAccuracy(question: QuestionBankQuestion): number {
  if (!question.totalAttempts) return 0;
  return Math.round((question.correctAttempts / question.totalAttempts) * 100);
}

function QuestionCard(props: {
  question: QuestionBankQuestion;
  onBookmarkToggle: (questionId: string, isBookmarked: boolean) => Promise<void>;
  isBookmarkUpdating: boolean;
}) {
  const { question, onBookmarkToggle, isBookmarkUpdating } = props;
  const preview = getQuestionPreview(question);
  const accuracy = getAccuracy(question);

  return (
    <Card className="rounded-3xl border border-card-border bg-card-bg p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              <InfoBadge>{question.type}</InfoBadge>
              {question.difficultyLevel && <InfoBadge>{question.difficultyLevel === 'easy' ? 'সহজ' : question.difficultyLevel === 'medium' ? 'মাঝারি' : 'কঠিন'}</InfoBadge>}
              {question.isPremium && <InfoBadge>প্রিমিয়াম</InfoBadge>}
              {question.isWrongAnswered && <InfoBadge>ভুল উত্তর</InfoBadge>}
            </div>

            <div className="text-[11px] text-text-secondary">
              {question.subjectNameBn || 'অজানা বিষয়'}
              {question.chapterNameBn ? ` • ${question.chapterNameBn}` : ''}
              {question.topicNameBn ? ` • ${question.topicNameBn}` : ''}
            </div>
          </div>

          <Button
            variant="ghost"
            className="h-8 rounded-xl px-2.5 text-xs font-medium"
            disabled={isBookmarkUpdating}
            onClick={() => onBookmarkToggle(question.id, question.isBookmarked)}
          >
            {question.isBookmarked ? (
              <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Bookmark className="mr-1.5 h-3.5 w-3.5" />
            )}
            {question.isBookmarked ? 'সেভড' : 'সেভ'}
          </Button>
        </div>

        <div>
          <h3 className="line-clamp-3 text-[15px] font-semibold leading-relaxed text-text-primary">
            {preview}
          </h3>

          {question.options.length > 0 && (
            <p className="mt-1.5 text-xs text-text-secondary font-medium">
              {question.options.length} টি অপশন আছে
            </p>
          )}
        </div>

        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {question.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-text-secondary font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-xl bg-surface p-2">
            <p className="text-[10px] text-text-secondary">মোট চেষ্টা</p>
            <p className="mt-0.5 text-[13px] font-bold text-text-primary">{question.totalAttempts}</p>
          </div>
          <div className="rounded-xl bg-surface p-2">
            <p className="text-[10px] text-text-secondary">সঠিক উত্তর</p>
            <p className="mt-0.5 text-[13px] font-bold text-text-primary">{question.correctAttempts}</p>
          </div>
          <div className="rounded-xl bg-surface p-2">
            <p className="text-[10px] text-text-secondary">সঠিকতা</p>
            <p className="mt-0.5 text-[13px] font-bold text-text-primary">{accuracy}%</p>
          </div>
          <div className="rounded-xl bg-surface p-2 overflow-hidden">
            <p className="text-[10px] text-text-secondary">আইডি</p>
            <p className="mt-0.5 truncate text-[13px] font-bold text-text-primary">{question.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          <Button className="h-10 rounded-xl text-xs px-4 font-bold">
            প্র্যাকটিস
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" className="h-10 rounded-xl text-xs px-4 font-bold">
            বিস্তারিত
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function QuestionBank() {
  const {
    filters,
    updateFilter,
    resetFilters,
    subjects,
    chapters,
    topics,
    boards,
    colleges,
    admissions,
    questions,
    stats,
    isLoading,
    error,
    toggleBookmark,
    isBookmarkUpdating,
  } = useQuestionBank();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    return [
      filters.search,
      filters.subjectId,
      filters.chapterId,
      filters.topicId,
      filters.institutionType,
      filters.institutionEiin, // Checked against EIIN now
      filters.year,
      filters.bookmarkedOnly ? 'bookmarked' : '',
      filters.mistakesOnly ? 'mistakes' : '',
      filters.premiumOnly ? 'premium' : '',
    ].filter(Boolean).length;
  }, [filters]);

  const isSubjectSelectionMode = !(
    filters.subjectId ||
    filters.search ||
    filters.bookmarkedOnly ||
    filters.mistakesOnly ||
    filters.premiumOnly
  );

  return (
    <div className="min-h-full bg-app px-4 py-4 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {isSubjectSelectionMode ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-color">
              <h2 className="text-lg font-bold text-text-primary">বিষয় নির্বাচন করুন</h2>
              <span className="text-[11px] font-bold text-text-secondary bg-surface px-2.5 py-1 rounded-full">{subjects.length} টি বিষয়</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  onClick={() => updateFilter('subjectId', subject.id)}
                  className="group cursor-pointer rounded-[20px] border border-card-border bg-card-bg p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-[13px] font-bold text-text-primary line-clamp-1">
                    {subject.name_bn}
                  </h3>
                  {subject.name_en && (
                    <p className="mt-0.5 text-[10px] text-text-secondary line-clamp-1 opacity-70">
                      {subject.name_en}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-border-color">
               <Button variant="ghost" onClick={resetFilters} className="h-8 rounded-full px-2 text-xs font-bold text-text-secondary hover:text-text-primary">
                 <ChevronLeft className="mr-1 h-4 w-4" />
                 ফিরে যান
               </Button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
              
              <aside className="space-y-4">
                {!isFilterOpen && (
                  <div className="xl:hidden">
                    <Button 
                      onClick={() => setIsFilterOpen(true)} 
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl font-bold"
                    >
                      <Filter className="h-4 w-4" />
                      ফিল্টার খুলুন
                    </Button>
                  </div>
                )}

                <div className={`${isFilterOpen ? 'block' : 'hidden'} xl:block space-y-4`}>
                  <QuestionFilter
                    filters={filters}
                    chapters={chapters}
                    topics={topics}
                    boards={boards}
                    colleges={colleges}
                    admissions={admissions}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                  />
                  
                  <div className="xl:hidden">
                    <Button 
                      onClick={() => setIsFilterOpen(false)} 
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl font-bold"
                    >
                      <Filter className="h-4 w-4" />
                      ফিল্টার বন্ধ করুন
                    </Button>
                  </div>
                </div>
              </aside>

              <main className="space-y-4">
                <Card className="rounded-[20px] border border-card-border bg-card-bg p-3 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-text-primary">ফলাফল</h2>
                      <p className="text-[11px] text-text-secondary font-medium">
                        {stats.total} টি প্রশ্ন পাওয়া গেছে
                        {activeFilterCount > 0 ? ` • ${activeFilterCount} টি ফিল্টার` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {filters.institutionType && <InfoBadge>উৎস: {filters.institutionType === 'board' ? 'বোর্ড' : filters.institutionType === 'college' ? 'কলেজ' : 'এডমিশন'}</InfoBadge>}
                      
                      {/* Name fetched using EIIN to display gracefully */}
                      {filters.institutionEiin && (
                        <InfoBadge>
                          নাম: {
                            [...boards, ...colleges, ...admissions].find(
                              (inst) => (inst.eiin || inst.id) === filters.institutionEiin
                            )?.name_bn || 'অজানা'
                          }
                        </InfoBadge>
                      )}

                      {filters.year && <InfoBadge>সাল: {filters.year}</InfoBadge>}
                      {filters.bookmarkedOnly && <InfoBadge>সেভ করা</InfoBadge>}
                      {filters.mistakesOnly && <InfoBadge>ভুল উত্তর</InfoBadge>}
                    </div>
                  </div>
                </Card>

                {isLoading ? (
                  <div className="flex min-h-[250px] items-center justify-center rounded-[20px] border border-card-border bg-card-bg">
                    <Loader />
                  </div>
                ) : error ? (
                  <Card className="rounded-[20px] border border-border-color bg-card-bg p-6">
                    <div className="space-y-2 text-center">
                      <h3 className="text-sm font-bold text-text-primary">ত্রুটি হয়েছে</h3>
                      <p className="text-[11px] text-text-secondary font-medium">
                        {(error as Error)?.message || 'প্রশ্ন লোড করা সম্ভব হয়নি।'}
                      </p>
                    </div>
                  </Card>
                ) : questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-10 w-10 text-text-secondary mb-3 opacity-30" />
                    <EmptyState title="কোনো প্রশ্ন নেই" />
                    <p className="mt-1 text-[11px] text-text-secondary font-medium">
                      আবার চেষ্টা করুন।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        onBookmarkToggle={(questionId, isBookmarked) => 
                          toggleBookmark({ questionId, isBookmarked })
                        }
                        isBookmarkUpdating={isBookmarkUpdating}
                      />
                    ))}
                  </div>
                )}
              </main>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
