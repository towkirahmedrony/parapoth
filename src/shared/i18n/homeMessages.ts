/**
 * Homepage-only translation dictionary for Porokh (পরোখ).
 *
 * Scope note: this phase only localizes the homepage (dashboard home) and the
 * app shell chrome while the homepage is visible. Other routes keep their
 * existing Bengali copy until they are migrated in a later phase.
 */

export const HOME_LANGUAGES = ['bn', 'en'] as const;

export type HomeLanguage = (typeof HOME_LANGUAGES)[number];

export const DEFAULT_HOME_LANGUAGE: HomeLanguage = 'bn';

export const isHomeLanguage = (value: unknown): value is HomeLanguage =>
  value === 'bn' || value === 'en';

const bn = {
  'brand.name': 'পরোখ',

  'language.groupLabel': 'ভাষা নির্বাচন করুন',

  'nav.home': 'হোম',
  'nav.modelTest': 'মডেল টেস্ট',
  'nav.progress': 'অগ্রগতি',
  'nav.leaderboard': 'লিডারবোর্ড',
  'nav.history': 'হিস্টোরি',
  'nav.profile': 'প্রোফাইল',
  'nav.logout': 'লগ আউট',
  'nav.startExam': 'পরীক্ষা শুরু করুন',
  'nav.bottomLabel': 'নিচের নেভিগেশন',

  'header.logoAria':
    'পরোখ ড্যাশবোর্ড - SSC, HSC MCQ, মডেল টেস্ট ও অনলাইন পরীক্ষার প্রস্তুতি',
  'header.logoTitle': 'পরোখ - অনলাইন পরীক্ষা প্রস্তুতি প্ল্যাটফর্ম',
  'header.logoAlt': 'পরোখ অনলাইন পরীক্ষা প্রস্তুতি লোগো',
  'header.shortcutsLabel': 'শিক্ষার্থীর অগ্রগতি ও নোটিফিকেশন শর্টকাট',
  'header.leaderboardAria': 'পরীক্ষার প্র্যাকটিস XP ও লিডারবোর্ড',
  'header.leaderboardTitle': 'লিডারবোর্ড ও XP',
  'header.streakAria': 'দৈনিক পড়ার স্ট্রিক: {count} দিন',
  'header.streakTitle': 'দৈনিক পড়ার স্ট্রিক',
  'header.notificationsTitle': 'নোটিফিকেশন',
  'header.unreadNotifications': '{count}টি অপঠিত নোটিফিকেশন',
  'header.noUnreadNotifications': 'কোনো অপঠিত নোটিফিকেশন নেই',

  'layout.mainAria':
    'পরোখ অনলাইন পরীক্ষা প্রস্তুতি ড্যাশবোর্ড — SSC, HSC MCQ, মডেল টেস্ট, প্রশ্নব্যাংক ও বোর্ড পরীক্ষার প্র্যাকটিস',

  'home.studentFallback': 'শিক্ষার্থী',
  'home.loadingProfile': 'প্রোফাইল লোড হচ্ছে',
  'home.greetingLateNight': 'শুভ রাত',
  'home.greetingMorning': 'শুভ সকাল',
  'home.greetingAfternoon': 'শুভ দুপুর',
  'home.greetingEvening': 'শুভ সন্ধ্যা',
  'home.startLearning': 'আজকের শেখা শুরু হোক',
  'home.eyebrow': 'অনলাইন পরীক্ষা প্রস্তুতি',
  'home.heroTitle':
    'SSC, HSC ও বোর্ড পরীক্ষার প্রস্তুতি নিন MCQ, CQ, মডেল টেস্ট ও প্রশ্নব্যাংক দিয়ে',
  'home.heroBody':
    'Porokh (পরোখ) শিক্ষার্থীদের জন্য একটি স্মার্ট পরীক্ষা প্রস্তুতি প্ল্যাটফর্ম—এখানে অধ্যায়ভিত্তিক MCQ প্র্যাকটিস, মডেল টেস্ট, বিগত বছরের প্রশ্ন প্র্যাকটিস, সাজেশন, লিডারবোর্ড ও অগ্রগতি ট্র্যাকিং এক জায়গায় পাওয়া যায়।',
  'home.dailyGoal': 'আজকের লক্ষ্য',
  'home.dailyGoalProgress': 'আজকের লক্ষ্যের অগ্রগতি',
  'home.featuresLoading': 'হোমপেজের ফিচার লোড হচ্ছে',
  'home.bannerFallbackDescription': 'বিস্তারিত দেখুন',
  'home.bannerFallbackButton': 'ক্লিক করুন',
  'home.bannerSlide': 'স্লাইড {index}',

  'meta.title': 'পরোখ — অনলাইন পরীক্ষা প্ল্যাটফর্ম',
  'meta.description':
    'পরোখ (Porokh) হলো SSC, HSC ও বোর্ড পরীক্ষার প্রস্তুতির জন্য MCQ প্র্যাকটিস, CQ প্র্যাকটিস, মডেল টেস্ট, প্রশ্নব্যাংক, সাজেশন, লিডারবোর্ড ও অগ্রগতি ট্র্যাকিংয়ের প্ল্যাটফর্ম।',
  'meta.keywords':
    'পরোখ, Porokh, SSC MCQ, HSC MCQ, মডেল টেস্ট, প্রশ্নব্যাংক, অনলাইন পরীক্ষা, বোর্ড পরীক্ষা প্রস্তুতি, সাজেশন',
  'meta.ogLocale': 'bn_BD',
} as const;

export type HomeMessageKey = keyof typeof bn;

const en: Record<HomeMessageKey, string> = {
  'brand.name': 'Porokh',

  'language.groupLabel': 'Select language',

  'nav.home': 'Home',
  'nav.modelTest': 'Model Test',
  'nav.progress': 'Progress',
  'nav.leaderboard': 'Leaderboard',
  'nav.history': 'History',
  'nav.profile': 'Profile',
  'nav.logout': 'Log out',
  'nav.startExam': 'Start exam',
  'nav.bottomLabel': 'Bottom navigation',

  'header.logoAria':
    'Porokh dashboard - SSC, HSC MCQ, model test and online exam preparation',
  'header.logoTitle': 'Porokh - Online Exam Preparation Platform',
  'header.logoAlt': 'Porokh online exam preparation logo',
  'header.shortcutsLabel': 'Student progress and notification shortcuts',
  'header.leaderboardAria': 'Exam practice XP and leaderboard',
  'header.leaderboardTitle': 'Leaderboard and XP',
  'header.streakAria': 'Daily study streak: {count} days',
  'header.streakTitle': 'Daily study streak',
  'header.notificationsTitle': 'Notifications',
  'header.unreadNotifications': '{count} unread notifications',
  'header.noUnreadNotifications': 'No unread notifications',

  'layout.mainAria':
    'Porokh online exam preparation dashboard for SSC, HSC MCQ, model test, question bank and board exam practice',

  'home.studentFallback': 'Student',
  'home.loadingProfile': 'Loading profile',
  'home.greetingLateNight': 'Good night',
  'home.greetingMorning': 'Good morning',
  'home.greetingAfternoon': 'Good afternoon',
  'home.greetingEvening': 'Good evening',
  'home.startLearning': "Let's start today's learning",
  'home.eyebrow': 'Online Exam Preparation',
  'home.heroTitle':
    'Prepare for SSC, HSC and board exams with MCQs, CQs, model tests and a question bank',
  'home.heroBody':
    'Porokh is a smart exam preparation platform for students — chapter-wise MCQ practice, model tests, previous year questions, suggestions, leaderboards and progress tracking, all in one place.',
  'home.dailyGoal': "Today's goal",
  'home.dailyGoalProgress': "Today's goal progress",
  'home.featuresLoading': 'Loading homepage features',
  'home.bannerFallbackDescription': 'View details',
  'home.bannerFallbackButton': 'Click here',
  'home.bannerSlide': 'Slide {index}',

  'meta.title': 'Porokh — Online Examination Platform',
  'meta.description':
    'Porokh is an online exam preparation platform for SSC, HSC and board exams, with MCQ practice, CQ practice, model tests, a question bank, suggestions, leaderboards and progress tracking.',
  'meta.keywords':
    'Porokh, SSC MCQ, HSC MCQ, model test, question bank, online exam, board exam preparation, Bangladesh, suggestions',
  'meta.ogLocale': 'en_US',
};

export const HOME_MESSAGES: Record<
  HomeLanguage,
  Record<HomeMessageKey, string>
> = { bn, en };
