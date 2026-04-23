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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-app text-text-primary">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4 bg-accent text-primary">
            {icon}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-text-primary">
            {language === 'bn' ? title.bn : title.en}
          </h1>
          <p className="text-lg max-w-xl text-text-secondary">
            {language === 'bn' ? description.bn : description.en}
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl shadow-sm border border-card-border overflow-hidden transition-all bg-card-bg">
          
          {/* Card Toolbar / Language Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-border-color gap-4 sm:gap-0 bg-surface">
            <span className="text-sm font-medium text-text-secondary">
              {language === 'bn' ? lastUpdated.bn : lastUpdated.en}
            </span>
            
            {/* Toggle Button Group */}
            <div className="flex p-1 rounded-lg bg-secondary">
              <button
                onClick={() => setLanguage('bn')}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${language === 'bn' ? 'shadow-sm bg-surface text-primary' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}
                aria-pressed={language === 'bn'}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${language === 'en' ? 'shadow-sm bg-surface text-primary' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}
                aria-pressed={language === 'en'}
              >
                English
              </button>
            </div>
          </div>

          {/* Markdown Content Area */}
          <div className="p-6 md:p-10">
            <article 
              className="prose dark:prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-primary prose-p:opacity-80 prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border-color prose-h2:pb-2 prose-p:leading-relaxed prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:decoration-2 hover:prose-a:underline-offset-4 prose-a:transition-all prose-strong:text-text-primary prose-strong:font-semibold prose-ul:mt-2 prose-ul:space-y-2 prose-li:text-text-primary prose-hr:border-border-color"
            >
              <ReactMarkdown>{activeContent}</ReactMarkdown>
            </article>
          </div>
          
        </div>
      </div>
    </div>
  );
};
