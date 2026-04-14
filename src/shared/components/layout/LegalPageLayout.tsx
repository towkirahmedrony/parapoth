import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export type Language = 'bn' | 'en';

export interface LegalPageLayoutProps {
  icon: React.ReactNode;
  title: { bn: string; en: string };
  description: { bn: string; en: string };
  lastUpdated: { bn: string; en: string };
  content: { bn: string; en: string };
}

// Hoisted static styles to prevent reallocation on every render
const STATIC_STYLES = {
  container: { backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' },
  iconWrapper: { backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)', color: 'var(--dyn-primary)' },
  textPrimary: { color: 'var(--dyn-text)' },
  textSecondary: { color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' },
  textMuted: { color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' },
  card: { backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' },
  toolbar: { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)', borderColor: 'color-mix(in srgb, var(--dyn-text) 8%, transparent)' },
  toggleGroup: { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 8%, transparent)' },
} as const;

// Prose specific styles extracted safely
const PROSE_STYLES: React.CSSProperties = {
  '--tw-prose-body': 'var(--dyn-text)',
  '--tw-prose-headings': 'var(--dyn-text)',
  '--tw-prose-links': 'var(--dyn-primary)',
  '--tw-prose-bullets': 'var(--dyn-primary)',
  '--tw-prose-strong': 'var(--dyn-text)',
  '--tw-prose-hr': 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
} as React.CSSProperties;

const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
  backgroundColor: isActive ? 'var(--dyn-card)' : 'transparent',
  color: isActive ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 60%, transparent)'
});

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  icon,
  title,
  description,
  lastUpdated,
  content,
}) => {
  const [language, setLanguage] = useState<Language>('bn');
  const activeContent = language === 'en' ? content.en : content.bn;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={STATIC_STYLES.container}>
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4" style={STATIC_STYLES.iconWrapper}>
            {icon}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={STATIC_STYLES.textPrimary}>
            {language === 'bn' ? title.bn : title.en}
          </h1>
          <p className="text-lg max-w-xl" style={STATIC_STYLES.textSecondary}>
            {language === 'bn' ? description.bn : description.en}
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl shadow-sm border overflow-hidden transition-all" style={STATIC_STYLES.card}>
          
          {/* Card Toolbar / Language Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b gap-4 sm:gap-0" style={STATIC_STYLES.toolbar}>
            <span className="text-sm font-medium" style={STATIC_STYLES.textMuted}>
              {language === 'bn' ? lastUpdated.bn : lastUpdated.en}
            </span>
            
            {/* Toggle Button Group */}
            <div className="flex p-1 rounded-lg" style={STATIC_STYLES.toggleGroup}>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${language === 'bn' ? 'shadow-sm' : ''}`}
                style={getButtonStyle(language === 'bn')}
                aria-pressed={language === 'bn'}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${language === 'en' ? 'shadow-sm' : ''}`}
                style={getButtonStyle(language === 'en')}
                aria-pressed={language === 'en'}
              >
                English
              </button>
            </div>
          </div>

          {/* Markdown Content Area */}
          <div className="p-6 md:p-10">
            <article 
              className="prose dark:prose-invert max-w-none prose-p:opacity-80 prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2 prose-p:leading-relaxed prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:decoration-2 hover:prose-a:underline-offset-4 prose-a:transition-all prose-strong:font-semibold prose-ul:mt-2 prose-ul:space-y-2"
              style={PROSE_STYLES}
            >
              <ReactMarkdown>{activeContent}</ReactMarkdown>
            </article>
          </div>
          
        </div>
      </div>
    </div>
  );
};
