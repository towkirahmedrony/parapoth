import React, { useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { requestNotificationPermission } from '@/features/notifications/services/notificationService';
import { useAuth } from '@/features/auth/hooks/useAuth';

const SITE_TITLE = 'ParaPoth - SSC HSC MCQ, Model Test & Exam Preparation';

const SITE_DESCRIPTION =
  'ParaPoth হলো SSC, HSC ও board exam প্রস্তুতির জন্য MCQ practice, CQ exam, model test, question bank, suggestion ও progress tracking platform.';

const updateMetaTag = (
  selector: string,
  attributeName: 'name' | 'property',
  attributeValue: string,
  content: string
) => {
  let tag = document.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attributeName, attributeValue);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

const updateSeoMeta = (pathname: string) => {
  const routeTitleMap: Record<string, string> = {
    '/dashboard': SITE_TITLE,
    '/dashboard/home': SITE_TITLE,
    '/dashboard/question-bank': 'Question Bank - SSC HSC MCQ Practice | ParaPoth',
    '/dashboard/arena': 'Online Exam Arena - MCQ Model Test | ParaPoth',
    '/dashboard/leaderboard': 'Leaderboard - Exam Practice Ranking | ParaPoth',
    '/dashboard/progress': 'Progress Tracking - Exam Preparation | ParaPoth',
    '/dashboard/streak': 'Daily Study Streak - ParaPoth',
  };

  const title = routeTitleMap[pathname] ?? SITE_TITLE;

  document.title = title;

  updateMetaTag(
    'meta[name="description"]',
    'name',
    'description',
    SITE_DESCRIPTION
  );

  updateMetaTag(
    'meta[name="keywords"]',
    'name',
    'keywords',
    'ParaPoth, SSC MCQ, HSC MCQ, MCQ practice, CQ exam, model test, question bank, board exam, online exam preparation, suggestion, leaderboard'
  );

  updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title);

  updateMetaTag(
    'meta[property="og:description"]',
    'property',
    'og:description',
    SITE_DESCRIPTION
  );

  updateMetaTag(
    'meta[property="og:url"]',
    'property',
    'og:url',
    `https://parapothexam.web.app${pathname === '/dashboard/home' ? '/' : pathname}`
  );

  updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);

  updateMetaTag(
    'meta[name="twitter:description"]',
    'name',
    'twitter:description',
    SITE_DESCRIPTION
  );
};

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    updateSeoMeta(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (user?.id) {
      requestNotificationPermission().catch(() => undefined);
    }
  }, [user?.id]);

  return (
    <div className="flex h-screen overflow-hidden bg-app text-text-primary transition-colors duration-500">
      <Sidebar />

      <div className="relative flex w-full flex-1 flex-col">
        <Header />

        <main
          className="scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6"
          aria-label="ParaPoth online exam preparation dashboard for SSC HSC MCQ model test question bank and board exam practice"
        >
          <div className="mx-auto min-h-[calc(100vh-100px)] w-full max-w-7xl">
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-nav-bg md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
