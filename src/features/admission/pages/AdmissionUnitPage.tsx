import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, BookOpen, CalendarDays, Layers, PlayCircle, Trophy } from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import { AdmissionBreadcrumb } from '../components/AdmissionBreadcrumb';
import { AdmissionExamCard } from '../components/AdmissionExamCard';
import { AdmissionSkeleton } from '../components/AdmissionSkeleton';
import { AdmissionState } from '../components/AdmissionState';
import { formatAdmissionCount } from '../lib/admissionLabels';
import { toAdmissionExam } from '../lib/admissionUnitAdapter';
import { resolveAdmissionExamError } from '../services/admissionExamService';
import {
  useAdmissionUnitContent,
  useStartAdmissionPractice,
} from '../hooks/useAdmissionUnits';

/**
 * Admission → University → Unit, then the three unit sections:
 * past admission exams (grouped by session), subject preparation and model tests.
 *
 * Exams reuse the existing exam page/engine; subject practice reuses the existing
 * practice attempt runner (`/exam/attempt/:id`). No admission-specific engine.
 */
const AdmissionUnitPage: React.FC = () => {
  const { universityId, unitId } = useParams<{
    universityId: string;
    unitId: string;
  }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const contentQuery = useAdmissionUnitContent(unitId);
  const startPractice = useStartAdmissionPractice(unitId);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const content = contentQuery.data ?? null;

  const unitName = content
    ? language === 'en' && content.unit.nameEn
      ? content.unit.nameEn
      : content.unit.nameBn || content.unit.nameEn || content.unit.code
    : '';

  const universityName = content?.university
    ? language === 'en'
      ? content.university.nameEn || content.university.nameBn
      : content.university.nameBn || content.university.nameEn || ''
    : '';

  const selectedSubject = useMemo(
    () => content?.subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
    [content, selectedSubjectId]
  );

  const selectedChapter =
    selectedSubject && selectedChapterId
      ? selectedSubject.chapters.find((chapter) => chapter.id === selectedChapterId) ?? null
      : null;

  const breadcrumbItems = [
    { label: t('nav.home'), to: '/dashboard/home' },
    { label: t('admission.title'), to: '/admission' },
    {
      label: universityName || t('admission.universityNotFound'),
      to: `/admission/university/${encodeURIComponent(universityId ?? '')}`,
    },
    { label: unitName || t('admission.unitNotFound') },
  ];

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectId((previous) => (previous === subjectId ? null : subjectId));
    setSelectedChapterId(null);
  };

  const handleStartPractice = (subjectId: string) => {
    startPractice.mutate(
      {
        subject_id: subjectId,
        chapter_id: selectedSubjectId === subjectId ? selectedChapterId : null,
      },
      {
        onSuccess: (attempt) => navigate(`/exam/attempt/${attempt.id}`),
        onError: (error) =>
          toast.error(
            resolveAdmissionExamError(error, t('admission.subjectPracticeFailed'))
          ),
      }
    );
  };

  if (contentQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-8">
        <AdmissionState
          variant="error"
          title={t('admission.errorTitle')}
          message={t('admission.errorMessage')}
          actionLabel={t('admission.retry')}
          onAction={() => contentQuery.refetch()}
        />
      </div>
    );
  }

  if (contentQuery.isLoading || !content) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-8">
        <AdmissionSkeleton cards={4} columns={2} />
      </div>
    );
  }

  if (!content.unit.id) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-8">
        <AdmissionBreadcrumb items={breadcrumbItems} />
        <AdmissionState
          variant="not-found"
          title={t('admission.notFoundTitle')}
          message={t('admission.unitNotFound')}
          actionLabel={t('admission.backToAdmission')}
          onAction={() => navigate('/admission')}
        />
      </div>
    );
  }

  const isStartingFor = (subjectId: string) =>
    startPractice.isPending && startPractice.variables?.subject_id === subjectId;

  const hasAnySection =
    content.pastExams.length > 0 ||
    content.modelTests.length > 0 ||
    content.subjects.length > 0;

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <AdmissionBreadcrumb items={breadcrumbItems} />

      <section className="rounded-3xl border border-card-border bg-card-bg px-5 py-6 shadow-sm sm:px-7">
        <button
          type="button"
          onClick={() =>
            navigate(`/admission/university/${encodeURIComponent(universityId ?? '')}`)
          }
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('admission.back')}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-['Hind_Siliguri'] text-2xl font-bold text-text-primary sm:text-3xl">
            {unitName}
          </h1>
          <span className="rounded-full bg-badge-bg px-2.5 py-1 text-xs font-bold text-badge-text">
            {content.unit.code}
          </span>
        </div>

        {universityName && (
          <p className="mt-1 font-['Hind_Siliguri'] text-sm font-semibold text-text-secondary">
            {universityName}
          </p>
        )}

        {content.unit.description && (
          <p className="mt-2 max-w-2xl font-['Hind_Siliguri'] text-sm leading-7 text-text-secondary">
            {content.unit.description}
          </p>
        )}
      </section>

      {!hasAnySection && (
        <div className="mt-6">
          <AdmissionState
            variant="missing-data"
            title={t('admission.unitContentEmptyTitle')}
            message={t('admission.unitContentEmptyHint')}
            actionLabel={t('admission.backToAdmission')}
            onAction={() => navigate('/admission')}
          />
        </div>
      )}

      {content.pastExams.length > 0 && (
        <section className="mt-7">
          <div className="mb-3 flex items-start gap-2">
            <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-['Hind_Siliguri'] text-xl font-bold text-text-primary">
                {t('admission.pastExamsSection')}
              </h2>
              <p className="mt-0.5 font-['Hind_Siliguri'] text-sm text-text-secondary">
                {t('admission.pastExamsHint')}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {content.pastExams.map((group) => (
              <div key={group.session ?? 'unknown'}>
                <h3 className="mb-2 font-['Hind_Siliguri'] text-sm font-bold text-text-primary">
                  {group.session ?? t('admission.sessionOther')}
                </h3>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {group.papers.map((paper) => (
                    <AdmissionExamCard
                      key={paper.id}
                      exam={toAdmissionExam(paper, 'past-exams')}
                      universityName={universityName}
                      onStart={(examId) => navigate(`/admission/exam/${examId}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.pastExams.length === 0 && (
        <section className="mt-7">
          <h2 className="mb-2 flex items-center gap-2 font-['Hind_Siliguri'] text-xl font-bold text-text-primary">
            <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('admission.pastExamsSection')}
          </h2>
          <AdmissionState variant="empty" title={t('admission.noPastExams')} />
        </section>
      )}

      <section className="mt-7">
        <div className="mb-3 flex items-start gap-2">
          <BookOpen className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-['Hind_Siliguri'] text-xl font-bold text-text-primary">
              {t('admission.subjectPreparationSection')}
            </h2>
            <p className="mt-0.5 font-['Hind_Siliguri'] text-sm text-text-secondary">
              {t('admission.subjectPreparationHint')}
            </p>
          </div>
        </div>

        {content.subjects.length === 0 ? (
          <AdmissionState variant="empty" title={t('admission.noSubjects')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {content.subjects.map((subject) => {
              const isSelected = subject.id === selectedSubjectId;
              const subjectName =
                language === 'en' && subject.nameEn
                  ? subject.nameEn
                  : subject.nameBn || subject.nameEn || subject.slug || '';

              const practiceCount = selectedChapter
                ? selectedChapter.questionCount
                : subject.questionCount;

              return (
                <div
                  key={subject.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    isSelected
                      ? 'border-primary bg-accent/5'
                      : 'border-card-border bg-card-bg hover:border-primary/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSubject(subject.id)}
                    aria-pressed={isSelected}
                    className="flex w-full items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-['Hind_Siliguri'] text-base font-bold text-text-primary">
                          {subjectName}
                        </span>
                        {subject.isPremium && (
                          <span className="rounded-full bg-badge-bg px-2 py-0.5 text-[11px] font-bold text-badge-text">
                            {t('admission.premium')}
                          </span>
                        )}
                      </span>

                      <span className="mt-1 block text-xs font-semibold text-text-secondary">
                        {t('admission.questions', {
                          count: formatAdmissionCount(subject.questionCount, language),
                        })}
                      </span>
                    </span>

                    <Layers
                      className={`h-4 w-4 shrink-0 ${isSelected ? 'text-primary' : 'text-text-secondary'}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isSelected && (
                    <div className="mt-4 border-t border-border-color pt-4">
                      <p className="mb-2 font-['Hind_Siliguri'] text-xs font-bold text-text-primary">
                        {t('admission.chapterOptional')}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedChapterId(null)}
                          aria-pressed={selectedChapterId === null}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                            selectedChapterId === null
                              ? 'border-primary bg-accent/10 text-text-primary'
                              : 'border-border-color bg-surface text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {t('admission.allChapters')}
                        </button>

                        {subject.chapters.map((chapter) => {
                          const chapterName =
                            language === 'en' && chapter.nameEn
                              ? chapter.nameEn
                              : chapter.nameBn || chapter.nameEn || '';

                          return (
                            <button
                              key={chapter.id}
                              type="button"
                              onClick={() => setSelectedChapterId(chapter.id)}
                              aria-pressed={selectedChapterId === chapter.id}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                                selectedChapterId === chapter.id
                                  ? 'border-primary bg-accent/10 text-text-primary'
                                  : 'border-border-color bg-surface text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              {chapterName}
                              <span className="ml-1 text-[11px] opacity-70">
                                {formatAdmissionCount(chapter.questionCount, language)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-3 text-xs font-semibold text-text-secondary">
                        {t('admission.practiceQuestions', {
                          count: formatAdmissionCount(practiceCount, language),
                        })}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleStartPractice(subject.id)}
                        disabled={startPractice.isPending}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                      >
                        <PlayCircle className="h-4 w-4" aria-hidden="true" />
                        {isStartingFor(subject.id)
                          ? t('admission.startingPractice')
                          : t('admission.startPractice')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-start gap-2">
          <Trophy className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-['Hind_Siliguri'] text-xl font-bold text-text-primary">
              {t('admission.modelTestsSection')}
            </h2>
            <p className="mt-0.5 font-['Hind_Siliguri'] text-sm text-text-secondary">
              {t('admission.modelTestsHint')}
            </p>
          </div>
        </div>

        {content.modelTests.length === 0 ? (
          <AdmissionState variant="empty" title={t('admission.noModelTests')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {content.modelTests.map((paper) => (
              <AdmissionExamCard
                key={paper.id}
                exam={toAdmissionExam(paper, 'model-test')}
                universityName={universityName}
                onStart={(examId) => navigate(`/admission/exam/${examId}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdmissionUnitPage;
