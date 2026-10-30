import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Landmark, MapPin, Search, X } from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import { AdmissionBreadcrumb } from '../components/AdmissionBreadcrumb';
import { AdmissionSkeleton } from '../components/AdmissionSkeleton';
import { AdmissionState } from '../components/AdmissionState';
import { formatAdmissionCount } from '../lib/admissionLabels';
import { useAdmissionUnitCatalog } from '../hooks/useAdmissionUnits';

const normalizeSearch = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Admission entry point of the unit-first flow: Admission → University.
 * Universities come from `admission_units` and only appear when they own at
 * least one active unit, so an empty directory never shows a dead end.
 */
const AdmissionUniversitiesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { data, isLoading, isError, refetch } = useAdmissionUnitCatalog();
  const [search, setSearch] = useState('');

  const universities = useMemo(() => {
    const items = data ?? [];
    const query = normalizeSearch(search);
    if (!query) return items;

    return items.filter((university) =>
      normalizeSearch(
        [
          university.nameBn,
          university.nameEn ?? '',
          university.shortName ?? '',
          university.location ?? '',
        ].join(' ')
      ).includes(query)
    );
  }, [data, search]);

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <AdmissionBreadcrumb
        items={[
          { label: t('nav.home'), to: '/dashboard/home' },
          { label: t('admission.title') },
        ]}
      />

      <header className="rounded-3xl border border-card-border bg-card-bg px-5 py-6 shadow-sm sm:px-7 sm:py-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-badge-bg px-3 py-1.5 text-xs font-bold text-badge-text">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          {t('admission.eyebrow')}
        </div>

        <h1 className="font-['Hind_Siliguri'] text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
          {t('admission.universityListTitle')}
        </h1>

        <p className="mt-2 max-w-2xl font-['Hind_Siliguri'] text-sm leading-7 text-text-secondary sm:text-base">
          {t('admission.universityListHint')}
        </p>

        <div className="mt-5">
          <label
            htmlFor="admission-university-entry-search"
            className="mb-1.5 block font-['Hind_Siliguri'] text-sm font-semibold text-text-primary"
          >
            {t('admission.searchLabel')}
          </label>

          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              aria-hidden="true"
            />

            <input
              id="admission-university-entry-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('admission.searchPlaceholder')}
              className="w-full rounded-xl border border-input-border bg-input-bg py-2.5 pl-9 pr-10 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label={t('admission.clearSearch')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {isError ? (
        <div className="mt-6">
          <AdmissionState
            variant="error"
            title={t('admission.errorTitle')}
            message={t('admission.errorMessage')}
            actionLabel={t('admission.retry')}
            onAction={() => refetch()}
          />
        </div>
      ) : isLoading || !data ? (
        <div className="mt-6">
          <AdmissionSkeleton cards={6} columns={3} />
        </div>
      ) : data.length === 0 ? (
        <div className="mt-6">
          <AdmissionState
            variant="missing-data"
            title={t('admission.noUniversitiesWithUnits')}
            message={t('admission.noUniversitiesWithUnitsHint')}
          />
        </div>
      ) : universities.length === 0 ? (
        <div className="mt-6">
          <AdmissionState
            variant="empty"
            title={t('admission.noSearchResults')}
            message={t('admission.noSearchResultsHint')}
            actionLabel={t('admission.clearSearch')}
            onAction={() => setSearch('')}
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {universities.map((university) => {
            const name =
              language === 'en'
                ? university.nameEn || university.nameBn
                : university.nameBn || university.nameEn || t('admission.universityNotFound');
            const initial = name.trim().charAt(0).toUpperCase() || 'U';

            return (
              <Link
                key={university.id}
                to={`/admission/university/${encodeURIComponent(university.id)}`}
                className="flex flex-col rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-color bg-surface font-['Hind_Siliguri'] text-lg font-bold text-primary">
                    {initial}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-['Hind_Siliguri'] text-base font-bold leading-snug text-text-primary">
                      {name}
                    </h2>

                    {university.shortName && (
                      <p className="mt-0.5 text-xs font-semibold text-text-secondary">
                        {university.shortName}
                      </p>
                    )}
                  </div>
                </div>

                {university.location && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{university.location}</span>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-text-secondary">
                  <span className="rounded-full bg-surface px-2.5 py-1">
                    {t('admission.unitsCount', {
                      count: formatAdmissionCount(university.units.length, language),
                    })}
                  </span>
                  <span className="rounded-full bg-surface px-2.5 py-1">
                    {t('admission.unitPapersCount', {
                      count: formatAdmissionCount(university.paperCount, language),
                    })}
                  </span>
                </div>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {t('admission.viewUnits')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdmissionUniversitiesPage;
