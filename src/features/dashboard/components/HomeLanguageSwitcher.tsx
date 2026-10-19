import React from 'react';
import { useHomeLanguage } from '@/shared/i18n/HomeLanguageProvider';
import { HOME_LANGUAGES, type HomeLanguage } from '@/shared/i18n/homeMessages';

const OPTION_LABELS: Record<HomeLanguage, string> = {
  bn: 'বাংলা',
  en: 'English',
};

interface HomeLanguageSwitcherProps {
  className?: string;
}

/**
 * Homepage language switch. Native buttons keep it keyboard accessible and
 * `aria-pressed` exposes the current selection to assistive technology.
 */
const HomeLanguageSwitcher: React.FC<HomeLanguageSwitcherProps> = ({
  className = '',
}) => {
  const { language, setLanguage, t } = useHomeLanguage();

  return (
    <div
      role="group"
      aria-label={t('language.groupLabel')}
      className={`inline-flex shrink-0 items-center rounded-full border border-border-color bg-surface-elevated p-0.5 ${className}`}
    >
      {HOME_LANGUAGES.map((option) => {
        const isActive = language === option;

        return (
          <button
            key={option}
            type="button"
            lang={option}
            onClick={() => setLanguage(option)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card-bg sm:px-3 sm:text-xs ${
              option === 'bn' ? "font-['Hind_Siliguri']" : 'font-sans'
            } ${
              isActive
                ? 'bg-badge-bg text-badge-text shadow-sm'
                : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
            }`}
          >
            {OPTION_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
};

export default HomeLanguageSwitcher;
