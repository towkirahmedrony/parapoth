import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Shared Components & Layouts
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { PermissionGuard } from '@/features/auth/components/PermissionGuard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

// ==========================================
// ১. মূল ৫টি ট্যাব (সরাসরি ইম্পোর্ট - ইনস্ট্যান্ট নেভিগেশনের জন্য)
// ==========================================
import Home from '@/features/dashboard/pages/Home';
import Progress from '@/features/progress/pages/Progress';
import History from '@/features/history/pages/History';
import UserProfile from '@/features/profile/pages/UserProfile';
import Selection from '@/features/exam/pages/Selection';

// ==========================================
// ২. বাকি পেজগুলো (Lazy Loaded - মেমোরি বাঁচানোর জন্য)
// ==========================================
const Streak = lazy(() => import('@/features/dashboard/pages/Streak'));
const Marketplace = lazy(() => import('@/features/economy/pages/Marketplace'));
const Login = lazy(() => import('@/features/auth/pages/Login'));
const Register = lazy(() => import('@/features/auth/pages/Register'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const ChangePassword = lazy(() => import('@/features/auth/pages/ChangePassword'));
const Arena = lazy(() => import('@/features/exam/pages/Arena'));
const Analysis = lazy(() => import('@/features/exam/pages/Analysis'));
const QuestionBank = lazy(() => import('@/features/question-bank/pages/QuestionBank'));

// AI Chat Integration (Lazy Loaded)
const AIChatPage = lazy(() => import('@/features/ai/pages/AIChatPage'));

// Named exports-এর জন্য Lazy loading
const ChallengePlay = lazy(() =>
  import('@/features/exam/pages/ChallengePlay').then((m) => ({
    default: m.ChallengePlay,
  }))
);

const Contact = lazy(() =>
  import('@/features/contact/pages/Contact').then((m) => ({
    default: m.Contact,
  }))
);

const Notifications = lazy(() => import('@/features/notifications/pages/Notifications'));
const PublicProfile = lazy(() => import('@/features/profile/pages/PublicProfile'));
const Settings = lazy(() => import('@/features/profile/pages/Settings'));
const EditProfile = lazy(() => import('@/features/profile/pages/EditProfile'));
const Referral = lazy(() => import('@/features/referral/pages/Referral'));
const Leaderboard = lazy(() => import('@/features/leaderboard/pages/Leaderboard'));
const PrivacyPolicy = lazy(() => import('@/features/legal/pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('@/features/legal/pages/TermsConditions'));
const AboutUs = lazy(() => import('@/features/legal/pages/AboutUs'));
const CookiePolicy = lazy(() => import('@/features/legal/pages/CookiePolicy'));
const FAQ = lazy(() => import('@/features/legal/pages/FAQ'));
const DataDeletion = lazy(() => import('@/features/legal/pages/DataDeletion'));

// Subscription Pages (Lazy Loaded)
const Plans = lazy(() => import('@/features/subscription/pages/Plans'));
const Checkout = lazy(() => import('@/features/subscription/pages/Checkout'));

// Group & Squad Pages (Lazy Loaded)
const Lobby = lazy(() => import('@/features/leaderboard/pages/Lobby'));

const FullPageLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />
);

// Placeholder component
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-[60vh] flex-col items-center justify-center">
    <EmptyState message={`${title} - কাজ চলছে, শীঘ্রই আসবে...`} />
  </div>
);

// NotFound Component
const NotFound = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center">
    <EmptyState message="৪o৪ - পৃষ্ঠাটি পাওয়া যায়নি" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* --- Public auth routes --- */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        {/*
          Password reset route must stay public.
          Supabase recovery links may open this route before the normal auth guard is ready.
          ChangePassword itself validates/exchanges the recovery token/session.
        */}
        <Route path="/auth/change-password" element={<ChangePassword />} />

        {/*
          Backward compatibility:
          Old internal links using /change-password will still work.
          The component will redirect unauthenticated normal users to login by itself.
        */}
        <Route path="/change-password" element={<ChangePassword />} />

        {/* --- Public legal/support routes --- */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/data-deletion" element={<DataDeletion />} />

        {/* --- Fullscreen protected routes --- */}
        <Route
          path="/exam/selection"
          element={
            <PermissionGuard>
              <Selection />
            </PermissionGuard>
          }
        />

        <Route
          path="/exam/live"
          element={
            <PermissionGuard>
              <Arena />
            </PermissionGuard>
          }
        />

        <Route
          path="/exam/live/:subjectSlug"
          element={
            <PermissionGuard>
              <Arena />
            </PermissionGuard>
          }
        />

        <Route
          path="/exam/analysis"
          element={
            <PermissionGuard>
              <Analysis />
            </PermissionGuard>
          }
        />

        <Route
          path="/exam/analysis/:id"
          element={
            <PermissionGuard>
              <Analysis />
            </PermissionGuard>
          }
        />

        <Route
          path="/exam/challenge-play"
          element={
            <PermissionGuard>
              <ChallengePlay />
            </PermissionGuard>
          }
        />

        <Route
          path="/parasathi"
          element={
            <PermissionGuard>
              <AIChatPage />
            </PermissionGuard>
          }
        />

        <Route
          path="/premium/checkout/:planId"
          element={
            <PermissionGuard>
              <Checkout />
            </PermissionGuard>
          }
        />

        <Route
          path="/notifications"
          element={
            <PermissionGuard>
              <Notifications />
            </PermissionGuard>
          }
        />

        <Route
          path="/settings"
          element={
            <PermissionGuard>
              <Settings />
            </PermissionGuard>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <PermissionGuard>
              <EditProfile />
            </PermissionGuard>
          }
        />

        <Route
          path="/profile/view/:id"
          element={
            <PermissionGuard>
              <PublicProfile />
            </PermissionGuard>
          }
        />

        {/* --- Main Layout Routes (With Sidebar & Header & BottomNav) --- */}
        <Route
          path="/"
          element={
            <PermissionGuard>
              <MainLayout />
            </PermissionGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard/home" replace />} />

          <Route path="dashboard" element={<Navigate to="/dashboard/home" replace />} />

          {/* Dashboard & Gamification */}
          <Route path="dashboard/home" element={<Home />} />
          <Route path="dashboard/streak" element={<Streak />} />
          <Route path="dashboard/leaderboard" element={<Leaderboard />} />
          <Route path="dashboard/marketplace" element={<Marketplace />} />
          <Route path="progress" element={<Progress />} />

          <Route path="quests" element={<Placeholder title="ডেইলি কোয়েস্ট (Missions)" />} />

          {/* History & Analytics */}
          <Route path="history" element={<History />} />

          {/* User Profile & Economy */}
          <Route path="profile" element={<UserProfile />} />
          <Route path="referral" element={<Referral />} />

          {/* Premium Showcase */}
          <Route path="premium" element={<Plans />} />

          {/* Group & Social */}
          <Route path="group" element={<Lobby />} />
          <Route path="group/:groupId/battle" element={<Placeholder title="গ্রুপ ব্যাটেল" />} />
          <Route path="group/:groupId/focus" element={<Placeholder title="ফোকাস সেশন" />} />

          {/* Academic & Materials */}
          <Route path="suggestion" element={<Placeholder title="সাজেশন" />} />
          <Route path="bank" element={<QuestionBank />} />
          <Route path="materials" element={<Placeholder title="স্টাডি ম্যাটেরিয়ালস" />} />

          {/* Support & Moderation */}
          <Route path="support" element={<Placeholder title="হেল্প ও সাপোর্ট" />} />

          {/* 404 Fallback inside protected layout */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Public 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
