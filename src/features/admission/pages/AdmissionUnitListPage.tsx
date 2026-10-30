import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import { AdmissionBreadcrumb } from '../components/AdmissionBreadcrumb';
import { AdmissionSkeleton } from '../components/AdmissionSkeleton';
import { AdmissionState } from '../components/AdmissionState';
import { formatAdmissionCount } from '../lib/admissionLabels';
import { useAdmissionUnitCatalog } from '../hooks/useAdmissionUnits';

/** Admission → University → Unit: the units offered by one university. */
const AdmissionUnitListPage: React.FC = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data, isLoading, isError, refetch } = useAdmissionUnitCatalog();

  const university = data?.find((entry) => entry.id === universityId) ?? null;
  const universityName = university
    ? language === 'en'
      ? university.nameEn || university.nameBn
      : university.nameBn || university.nameEn || university.shortName || ''
    : '';

  const breadcrumbItems = [
    { label: t('nav.home'), to: '/dashboard/home' },
    { label: t('admission.title'), to: '/admission' },
    { label: universityName || t('admission.notFoundTitle') },
  ];

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-8">
        <AdmissionState
          variant="error"
          title={t('admission.errorTitle')}
          message={t('admission.errorMessage')}
          actionLabel={t('admission.retry')}
          onAction={() => refetch()}
        />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-8">
        <AdmissionSkeleton cards={3} columns={3} />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-8">
        <AdmissionBreadcrumb items={breadcrumbItems} />
        <AdmissionState
          variant="not-found"
          title={t('admission.notFoundTitle')}
          message={t('admission.universityNotFound')}
          actionLabel={t('admission.backToAdmission')}
          onAction={() => navigate('/admission')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-8">
      <AdmissionBreadcrumb items={breadcrumbItems} />

      <section className="rounded-3xl border border-card-border bg-card-bg px-5 py-6 shadow-sm sm:px-7">
        <button
          type="button"
          onClick={() => navigate('/admission')}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('admission.backToAdmission')}
        </button>

        <h1 className="font-['Hind_Siliguri'] text-2xl font-bold text-text-primary sm:text-3xl">
          {universityName}
        </h1>

        <p className="mt-1 font-['Hind_Siliguri'] text-sm text-text-secondary sm:text-base">
          {t('admission.unitListHint')}
        </p>

        <p className="mt-3 text-xs font-semibold text-text-secondary">
          {t('admission.unitsCount', {
            count: formatAdmissionCount(university.units.length, language),
          })}
        </p>
      </section>

      {university.units.length === 0 ? (
        <div className="mt-6">
          <AdmissionState
            variant="empty"
            title={t('admission.noUnits')}
            message={t('admission.noUniversitiesWithUnitsHint')}
            actionLabel={t('admission.backToAdmission')}
            onAction={() => navigate('/admission')}
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {university.units.map((unit) => {
            const unitName =
              language === 'en' && unit.nameEn
                ? unit.nameEn
                : unit.nameBn || unit.nameEn || unit.code;

            return (
              <Link
                key={unit.id}
                to={`/admission/university/${encodeURIComponent(university.id)}/unit/${encodeURIComponent(unit.id)}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-['Hind_Siliguri'] text-lg font-bold text-text-primary">
                      {unitName}
                    </h2>
                    <span className="rounded-full bg-badge-bg px-2.5 py-0.5 text-[11px] font-bold text-badge-text">
                      {unit.code}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs font-semibold text-text-secondary">
                    {t('admission.unitPapersCount', {
                      count: formatAdmissionCount(unit.paperCount, language),
                    })}
                  </p>
                </div>

                <ArrowRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdmissionUnitListPage;
