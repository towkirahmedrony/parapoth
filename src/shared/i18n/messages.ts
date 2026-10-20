/**
 * Application translation dictionary for Porokh (পরোখ).
 *
 * Scope note: this phase localizes the homepage (dashboard home), Settings,
 * Progress, History and the shared navigation chrome. Other routes (auth,
 * exam, question review, results, admin) keep their existing Bengali copy
 * until they are migrated in a later phase.
 *
 * Keys are stable and namespaced by feature (`nav.*`, `home.*`,
 * `settings.*`, `progress.*`, `history.*`). `bn` is the source of truth for
 * the key set; `en` must implement every key, so a missing translation is a
 * compile error rather than a runtime surprise. `t()` additionally falls
 * back to Bengali and then to the raw key so a lookup can never crash.
 */

export const APP_LANGUAGES = ['bn', 'en'] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'bn';

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  value === 'bn' || value === 'en';

/** Document/number formatting locale per language. */
export const LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
  bn: 'bn-BD',
  en: 'en-GB',
};

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

/** Localizes digits for Bengali; leaves English (Latin) digits untouched. */
export const localizeDigits = (
  value: string | number,
  language: AppLanguage
): string => {
  const raw = String(value);
  if (language !== 'bn') return raw;
  return raw.replace(/[0-9]/g, (digit) => BN_DIGITS[Number(digit)]);
};

const bn = {
  'brand.name': 'পরোখ',

  'language.groupLabel': 'ভাষা নির্বাচন করুন',

  'nav.home': 'হোম',
  'nav.modelTest': 'মডেল টেস্ট',
  'nav.admission': 'অ্যাডমিশন',
  'nav.progress': 'অগ্রগতি',
  'nav.leaderboard': 'লিডারবোর্ড',
  'nav.history': 'হিস্টোরি',
  'nav.profile': 'প্রোফাইল',
  'nav.settings': 'সেটিংস',
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
  'home.admissionTitle': 'অ্যাডমিশন পরীক্ষার প্রস্তুতি',
  'home.admissionBody':
    'বিশ্ববিদ্যালয়ভিত্তিক মডেল টেস্ট ও বিগত বছরের প্রশ্ন দিয়ে ভর্তি পরীক্ষার প্রস্তুতি নিন।',
  'home.admissionCta': 'অ্যাডমিশন দেখুন',
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

  // --------------------------------- Settings --------------------------------
  'settings.title': 'সেটিংস',
  'settings.sectionLanguage': 'ভাষা',
  'settings.languageLabel': 'অ্যাপের ভাষা',
  'settings.languageDescription':
    'হোম, সেটিংস, অগ্রগতি ও হিস্টোরি পৃষ্ঠায় নির্বাচিত ভাষা প্রয়োগ হবে।',
  'settings.languageCurrent': 'বর্তমান ভাষা: {language}',
  'settings.sectionAppearance': 'থিম',
  'settings.themeLabel': 'ডিসপ্লে থিম',
  'settings.themeDescription':
    'আপনার ডিভাইসের সাথে মিলিয়ে বা নিজের পছন্দমতো লাইট বা ডার্ক রাখুন।',
  'settings.themeSystem': 'সিস্টেম',
  'settings.themeLight': 'লাইট',
  'settings.themeDark': 'ডার্ক',
  'settings.sectionAccount': 'অ্যাকাউন্ট',
  'settings.viewProfile': 'প্রোফাইল দেখুন',
  'settings.editProfile': 'প্রোফাইল সম্পাদনা',
  'settings.changePassword': 'পাসওয়ার্ড পরিবর্তন',
  'settings.logout': 'লগ আউট',
  'settings.sectionPreferences': 'প্রেফারেন্স',
  'settings.notifications': 'নোটিফিকেশন সেটিংস',
  'settings.notificationsDescription':
    'পরীক্ষা ও অ্যাপ আপডেটের নোটিফিকেশন পরিচালনা করুন।',
  'settings.sectionAbout': 'সম্পর্কে',
  'settings.appName': 'পরোখ (Porokh)',
  'settings.appNameEn': 'Porokh (পরোখ)',
  'settings.version': 'সংস্করণ',
  'settings.aboutUs': 'আমাদের সম্পর্কে',
  'settings.faq': 'সচরাচর জিজ্ঞাসিত প্রশ্ন',
  'settings.privacy': 'প্রাইভেসি পলিসি',
  'settings.help': 'হেল্প ও সাপোর্ট',

  // --------------------------------- Progress --------------------------------
  'progress.loadingLabel': 'প্রগ্রেস লোড হচ্ছে',
  'progress.errorTitle': 'ডেটা লোড করতে সমস্যা হয়েছে!',
  'progress.errorMessage':
    'দয়া করে আবার চেষ্টা করুন অথবা ইন্টারনেট সংযোগ চেক করুন।',
  'progress.retry': 'আবার চেষ্টা করুন',
  'progress.emptyTitle': 'কোনো প্রগ্রেস ডেটা পাওয়া যায়নি!',
  'progress.emptyMessage': 'আপনি এখনো কোনো পরীক্ষায় অংশগ্রহণ করেননি।',
  'progress.batch': 'ব্যাচ: {batch}',
  'progress.batchFallback': 'N/A',
  'progress.metricAvgScore': 'গড় স্কোর',
  'progress.metricAvgScoreSub': 'সর্বশেষ ডেটা অনুযায়ী',
  'progress.metricTotalExams': 'টোটাল এক্সাম',
  'progress.metricTotalExamsSub': 'সর্বমোট দেওয়া হয়েছে',
  'progress.metricStreak': 'স্ট্রিক',
  'progress.metricStreakSub': 'টানা পড়াশোনা চলছে',
  'progress.metricRank': 'গ্লোবাল র‍্যাংক',
  'progress.metricRankSub': 'লিডারবোর্ড অনুযায়ী',
  'progress.metricStreakValue': '{count} দিন',
  'progress.metricNoExamsSub': 'এখনো কোনো পরীক্ষা দেওয়া হয়নি',
  'progress.chartTitle': 'পারফরম্যান্স গ্রাফ',
  'progress.chartSubtitle': 'গত ৭টি পরীক্ষার ফলাফলের ভিত্তিতে',
  'progress.chartEmpty': 'পর্যাপ্ত ডেটা নেই।',
  'progress.chartScore': 'স্কোর',
  'progress.radarTitle': 'স্কিল ম্যাপিং',
  'progress.radarSubtitle': 'বিষয়ভিত্তিক দক্ষতার চিত্র',
  'progress.radarEmpty': 'স্কিল ম্যাপিং এর জন্য ডেটা নেই।',
  'progress.radarMastery': 'দক্ষতা',
  'progress.aiTitle': 'AI মেন্টর সাজেশন',
  'progress.aiFallback':
    'আপনার সাম্প্রতিক এনালাইসিস অনুযায়ী, আজকে "{topic}" রিভিশন দিলে আপনার স্কোর দ্রুত বাড়বে।',
  'progress.aiStrong': 'আপনার শক্তিশালী দিক',
  'progress.aiAction': 'সাজেশন অনুযায়ী পরীক্ষা দিন',
  'progress.weaknessTitle': 'দুর্বলতা বিশ্লেষণ (Attention Needed)',
  'progress.weaknessEmpty': 'পর্যাপ্ত ডেটা পাওয়া যায়নি। আরও পরীক্ষা দিন।',
  'progress.wrongCount': '{rate} ভুল',
  'progress.revision': 'রিভাইস দিন',
  'progress.subjectReportTitle': 'সাবজেক্ট ভিত্তিক রিপোর্ট',
  'progress.subjectReportEmpty': 'কোনো সাবজেক্টের ডেটা পাওয়া যায়নি।',
  'progress.correct': 'সঠিক',
  'progress.wrong': 'ভুল',
  'progress.skipped': 'স্কিপড',
  'progress.heatmapTitle': 'অ্যাক্টিভিটি ক্যালেন্ডার',
  'progress.heatmapDay': '{date}: {count} টি পরীক্ষা',
  'progress.heatmapLess': 'কম',
  'progress.heatmapMore': 'বেশি',

  // --------------------------------- History ---------------------------------
  'history.tabsHistory': 'ইতিহাস',
  'history.tabsMistakes': 'ভুলসমূহ',
  'history.tabsBookmarks': 'বুকমার্কড',
  'history.loading': 'কন্টেন্ট লোড হচ্ছে',
  'history.searchLabel': 'পরীক্ষার হিস্টোরি খুঁজুন',
  'history.searchPlaceholder': 'পরীক্ষার নাম লিখুন...',
  'history.clearSearch': 'সার্চ মুছুন',
  'history.sortLabel': 'সাজানো',
  'history.sortNewest': 'সর্বশেষ আগে',
  'history.sortOldest': 'সর্বপ্রথম আগে',
  'history.resultsCount': '{count}টি ফলাফল',
  'history.showing': '{shown} / {total} দেখানো হচ্ছে',
  'history.loadMore': 'আরও দেখুন',
  'history.noMatchesTitle': 'সার্চের সাথে মিলে এমন কিছু নেই',
  'history.noMatchesMessage': 'অন্য কিছু দিয়ে খুঁজে দেখুন।',
  'history.errorTitle': 'ডেটা আনা যায়নি',
  'history.errorMessage': 'দয়া করে আবার চেষ্টা করুন অথবা ইন্টারনেট সংযোগ চেক করুন।',
  'history.retry': 'আবার চেষ্টা করুন',
  'history.cardFallbackTitle': 'পরীক্ষা',
  'history.cardDetails': 'বিস্তারিত দেখুন',
  'history.cardPercent': '{percent}%',
  'history.emptyHistoryTitle': 'এখনো কোনো পরীক্ষা দেননি?',
  'history.emptyHistoryDesc':
    'আপনার মেধা যাচাই করতে এখনই একটি পরীক্ষা শুরু করুন।',
  'history.emptyHistoryBtn': 'মডেল টেস্ট দিন',
  'history.emptyMistakesTitle': 'অসাধারণ! কোনো ভুল নেই',
  'history.emptyMistakesDesc':
    'আপনি সব প্রশ্নের সঠিক উত্তর দিয়েছেন অথবা এখনো ভুল করেননি।',
  'history.emptyMistakesBtn': 'অনুশীলন চালিয়ে যান',
  'history.emptyBookmarksTitle': 'বুকমার্ক তালিকা খালি',
  'history.emptyBookmarksDesc':
    'গুরুত্বপূর্ণ বা কঠিন প্রশ্নগুলো পরে পড়ার জন্য বুকমার্ক করে রাখুন।',
  'history.emptyBookmarksBtn': 'প্রশ্ন খুঁজুন',
  'history.deleteTitle': 'আপনি কি নিশ্চিত?',
  'history.deleteMessage': 'এটি তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।',
  'history.deleteNo': 'না',
  'history.deleteYes': 'হ্যাঁ, মুছুন',
  'history.deleteMistakeAria': 'ভুল মুছে ফেলুন',
  'history.deleteBookmarkAria': 'বুকমার্ক মুছে ফেলুন',
  'history.mistakeBadge': 'ভুল উত্তর',
  'history.mistakeYourAnswer': 'আপনার উত্তর',
  'history.mistakeCorrectAnswer': 'সঠিক উত্তর',
  'history.questionMissing': 'প্রশ্ন লোড হয়নি বা মুছে ফেলা হয়েছে',
  'history.questionNotLoaded': 'প্রশ্ন লোড হয়নি',
  'history.answerMissing': 'উত্তর পাওয়া যায়নি',
  'history.unknownAnswer': 'অজানা উত্তর',
  'history.saveError': 'ডেটাবেজে ভুল সেভ হয়েছে',
  'history.correctNotSet': 'সঠিক উত্তর সেট করা নেই',
  'history.unknown': 'অজানা',

  // -------------------------------- Admission -------------------------------
  'admission.eyebrow': 'ভর্তি পরীক্ষা প্রস্তুতি',
  'admission.title': 'অ্যাডমিশন',
  'admission.intro':
    'বিশ্ববিদ্যালয় ও ইউনিট অনুযায়ী মডেল টেস্ট ও বিগত বছরের প্রশ্ন দিয়ে ভর্তি পরীক্ষার প্রস্তুতি নিন।',
  'admission.backToHome': 'হোমে ফিরুন',
  'admission.backToAdmission': 'অ্যাডমিশনে ফিরুন',
  'admission.back': 'পিছনে',
  'admission.browseGroups': 'গ্রুপ বেছে নিন',
  'admission.browseGroupsHint':
    'আপনার এইচএসসি গ্রুপ অনুযায়ী ভর্তি পরীক্ষার প্রস্তুতি শুরু করুন।',
  'admission.featuredUniversities': 'জনপ্রিয় বিশ্ববিদ্যালয়',
  'admission.featuredHint': 'যেসব বিশ্ববিদ্যালয়ের পরীক্ষা এখন পাওয়া যাচ্ছে।',
  'admission.viewAll': 'সব দেখুন',
  'admission.group.science': 'বিজ্ঞান',
  'admission.group.arts': 'মানবিক',
  'admission.group.commerce': 'ব্যবসায় শিক্ষা',
  'admission.group.scienceDescription': 'পদার্থ, রসায়ন, জীববিজ্ঞান ও গণিত',
  'admission.group.artsDescription': 'বাংলা, ইংরেজি, ইতিহাস ও সমাজবিজ্ঞান',
  'admission.group.commerceDescription': 'হিসাববিজ্ঞান, ব্যবসায় সংগঠন ও ফিন্যান্স',
  'admission.examType.modelTest': 'মডেল টেস্ট',
  'admission.examType.pastExams': 'বিগত বছরের প্রশ্ন',
  'admission.examType.modelTestDescription': 'নতুন প্রশ্নে নিজেকে যাচাই করুন',
  'admission.examType.pastExamsDescription':
    'আগের বছরের ভর্তি পরীক্ষার প্রশ্ন অনুশীলন করুন',
  'admission.examTypeCount': '{count}টি পরীক্ষা',
  'admission.noExamType': 'এই গ্রুপে এখনো কোনো পরীক্ষা যোগ হয়নি।',
  'admission.typeUnavailable': 'এখনো পরীক্ষা নেই',
  'admission.universityCount': '{count}টি বিশ্ববিদ্যালয়',
  'admission.totalExams': 'মোট পরীক্ষা',
  'admission.universityStat': 'বিশ্ববিদ্যালয়',
  'admission.unitsCount': '{count}টি ইউনিট',
  'admission.examsCount': '{count}টি পরীক্ষা',
  'admission.universityTitle': 'বিশ্ববিদ্যালয় বেছে নিন',
  'admission.universitySubtitle': '{group} • {examType}',
  'admission.searchLabel': 'বিশ্ববিদ্যালয় খুঁজুন',
  'admission.searchPlaceholder': 'বাংলা বা ইংরেজি নাম লিখুন...',
  'admission.searchResults': '{count}টি বিশ্ববিদ্যালয় পাওয়া গেছে',
  'admission.clearSearch': 'সার্চ মুছুন',
  'admission.noUniversities': 'এই নির্বাচনের জন্য কোনো বিশ্ববিদ্যালয় পাওয়া যায়নি।',
  'admission.noUniversitiesHint': 'অন্য গ্রুপ বা পরীক্ষার ধরন বেছে দেখুন।',
  'admission.noSearchResults': 'সার্চের সাথে কোনো বিশ্ববিদ্যালয় মেলেনি।',
  'admission.noSearchResultsHint': 'অন্য নাম দিয়ে খুঁজে দেখুন।',
  'admission.missingUniversityData':
    'ভর্তি পরীক্ষা আছে, কিন্তু সেগুলো এখনো কোনো বিশ্ববিদ্যালয়ের সাথে যুক্ত করা হয়নি।',
  'admission.universityExamsTitle': 'পরীক্ষা বেছে নিন',
  'admission.universityExamsHint': 'এই বিশ্ববিদ্যালয়ের জন্য পাওয়া পরীক্ষাগুলো।',
  'admission.unitsTitle': 'ইউনিট বেছে নিন',
  'admission.unitsHint': 'এই বিশ্ববিদ্যালয়ে ইউনিটভিত্তিক ভর্তি পরীক্ষা হয়।',
  'admission.allUnits': 'সব ইউনিট',
  'admission.viewExams': 'পরীক্ষা দেখুন',
  'admission.continueToExams': 'পরীক্ষার তালিকায় যান',
  'admission.noUnits':
    'এই বিশ্ববিদ্যালয়ে আলাদা ইউনিট নেই—সরাসরি পরীক্ষা বেছে নিন।',
  'admission.notFoundTitle': 'পাতাটি পাওয়া যায়নি',
  'admission.notFoundMessage':
    'ঠিকানাটি সঠিক নয় বা তথ্যটি সরিয়ে ফেলা হয়েছে।',
  'admission.groupNotFound': 'এই গ্রুপ পাওয়া যায়নি।',
  'admission.examTypeNotFound': 'এই পরীক্ষার ধরন পাওয়া যায়নি।',
  'admission.universityNotFound': 'এই বিশ্ববিদ্যালয় পাওয়া যায়নি।',
  'admission.unitNotFound': 'এই ইউনিট পাওয়া যায়নি।',
  'admission.examNotFound': 'পরীক্ষাটি পাওয়া যায়নি বা প্রকাশ করা হয়নি।',
  'admission.loading': 'লোড হচ্ছে...',
  'admission.loadingExams': 'পরীক্ষা লোড হচ্ছে...',
  'admission.errorTitle': 'ডেটা লোড করা যায়নি',
  'admission.errorMessage': 'ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।',
  'admission.retry': 'আবার চেষ্টা করুন',
  'admission.dataMissingTitle': 'অ্যাডমিশন পরীক্ষা এখনো যোগ করা হয়নি',
  'admission.dataMissingMessage':
    'এই বিভাগের পরীক্ষা এখনো প্রকাশ করা হয়নি। পরে আবার দেখুন।',
  'admission.examUnavailableTitle': 'পরীক্ষাটি এখন শুরু করা যাবে না',
  'admission.examUnavailableMessage':
    'পরীক্ষার সময়সীমা শেষ বা এখনো শুরু হয়নি।',
  'admission.availability.available': 'শুরু করা যাবে',
  'admission.availability.notStarted': 'শুরু হয়নি',
  'admission.availability.closed': 'সময় শেষ',
  'admission.availability.unpublished': 'প্রকাশিত নয়',
  'admission.premium': 'প্রিমিয়াম',
  'admission.year': 'সাল {year}',
  'admission.modelNo': 'মডেল {number}',
  'admission.duration': '{count} মিনিট',
  'admission.marks': '{count} নম্বর',
  'admission.questions': '{count}টি প্রশ্ন',
  'admission.startExam': 'পরীক্ষা শুরু করুন',
  'admission.unitLabel': 'ইউনিট',
  'admission.previous': 'আগের প্রশ্ন',
  'admission.next': 'পরের প্রশ্ন',
  'admission.questionOf': 'প্রশ্ন {current} / {total}',
  'admission.answered': 'উত্তর দেওয়া',
  'admission.unanswered': 'উত্তর দেওয়া হয়নি',
  'admission.questionNavigator': 'প্রশ্ন নেভিগেশন',
  'admission.currentQuestion': 'বর্তমান প্রশ্ন',
  'admission.breadcrumb': 'ব্রেডক্রাম্ব নেভিগেশন',
  'admission.timeLeft': 'বাকি সময়',
  'admission.submit': 'উত্তরপত্র জমা দিন',
  'admission.submitting': 'জমা দেওয়া হচ্ছে...',
  'admission.submitTitle': 'পরীক্ষা জমা দেবেন?',
  'admission.submitMessage':
    'আপনি {answered}টি প্রশ্নের উত্তর দিয়েছেন। জমা দিলে আর পরিবর্তন করা যাবে না।',
  'admission.submitConfirm': 'হ্যাঁ, জমা দিন',
  'admission.submitCancel': 'না',
  'admission.examHeader': 'অ্যাডমিশন পরীক্ষা',
  'admission.examLoading': 'পরীক্ষা প্রস্তুত হচ্ছে...',
  'admission.examFailed': 'পরীক্ষা শুরু করা যায়নি।',
  'admission.noQuestions': 'এই পরীক্ষায় কোনো প্রশ্ন নেই।',
  'admission.noQuestionsHint': 'পরে আবার চেষ্টা করুন বা অন্য পরীক্ষা বেছে নিন।',
  'admission.backToExams': 'পরীক্ষার তালিকায় ফিরুন',

  'exam.submitFailed': 'পরীক্ষা জমা দেওয়া যায়নি। আপনার উত্তরগুলো সংরক্ষিত আছে, আবার চেষ্টা করুন।',
  'exam.submitNetworkFailed':
    'সার্ভারের সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
} as const;

export type AppMessageKey = keyof typeof bn;

const en: Record<AppMessageKey, string> = {
  'brand.name': 'Porokh',

  'language.groupLabel': 'Select language',

  'nav.home': 'Home',
  'nav.modelTest': 'Model Test',
  'nav.admission': 'Admission',
  'nav.progress': 'Progress',
  'nav.leaderboard': 'Leaderboard',
  'nav.history': 'History',
  'nav.profile': 'Profile',
  'nav.settings': 'Settings',
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
  'home.admissionTitle': 'Admission exam preparation',
  'home.admissionBody':
    'Prepare for university admission tests with model tests and previous year questions by university.',
  'home.admissionCta': 'Explore admission',
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

  // --------------------------------- Settings --------------------------------
  'settings.title': 'Settings',
  'settings.sectionLanguage': 'Language',
  'settings.languageLabel': 'App language',
  'settings.languageDescription':
    'The selected language applies to the Home, Settings, Progress and History pages.',
  'settings.languageCurrent': 'Current language: {language}',
  'settings.sectionAppearance': 'Appearance',
  'settings.themeLabel': 'Display theme',
  'settings.themeDescription':
    'Follow your device or pick light / dark yourself.',
  'settings.themeSystem': 'System',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.sectionAccount': 'Account',
  'settings.viewProfile': 'View profile',
  'settings.editProfile': 'Edit profile',
  'settings.changePassword': 'Change password',
  'settings.logout': 'Log out',
  'settings.sectionPreferences': 'Preferences',
  'settings.notifications': 'Notification settings',
  'settings.notificationsDescription':
    'Manage exam and app update notifications.',
  'settings.sectionAbout': 'About',
  'settings.appName': 'Porokh (পরোখ)',
  'settings.appNameEn': 'Porokh (পরোখ)',
  'settings.version': 'Version',
  'settings.aboutUs': 'About us',
  'settings.faq': 'Frequently asked questions',
  'settings.privacy': 'Privacy policy',
  'settings.help': 'Help & support',

  // --------------------------------- Progress --------------------------------
  'progress.loadingLabel': 'Loading progress',
  'progress.errorTitle': 'Could not load your data!',
  'progress.errorMessage':
    'Please try again or check your internet connection.',
  'progress.retry': 'Try again',
  'progress.emptyTitle': 'No progress data found!',
  'progress.emptyMessage': 'You have not taken any exams yet.',
  'progress.batch': 'Batch: {batch}',
  'progress.batchFallback': 'N/A',
  'progress.metricAvgScore': 'Average score',
  'progress.metricAvgScoreSub': 'Based on latest data',
  'progress.metricTotalExams': 'Total exams',
  'progress.metricTotalExamsSub': 'Taken in total',
  'progress.metricStreak': 'Streak',
  'progress.metricStreakSub': 'Consistent studying',
  'progress.metricRank': 'Global rank',
  'progress.metricRankSub': 'Based on leaderboard',
  'progress.metricStreakValue': '{count} days',
  'progress.metricNoExamsSub': 'No exams taken yet',
  'progress.chartTitle': 'Performance graph',
  'progress.chartSubtitle': 'Based on your last 7 exams',
  'progress.chartEmpty': 'Not enough data yet.',
  'progress.chartScore': 'Score',
  'progress.radarTitle': 'Skill mapping',
  'progress.radarSubtitle': 'Subject-wise mastery overview',
  'progress.radarEmpty': 'No data for skill mapping yet.',
  'progress.radarMastery': 'MASTERY',
  'progress.aiTitle': 'AI mentor suggestions',
  'progress.aiFallback':
    'Based on your recent analysis, revising "{topic}" today will raise your score quickly.',
  'progress.aiStrong': 'Your strong points',
  'progress.aiAction': 'Take the suggested exam',
  'progress.weaknessTitle': 'Weakness analysis (Attention Needed)',
  'progress.weaknessEmpty': 'Not enough data yet. Take more exams.',
  'progress.wrongCount': '{rate} wrong',
  'progress.revision': 'Revise now',
  'progress.subjectReportTitle': 'Subject-wise report',
  'progress.subjectReportEmpty': 'No subject data available.',
  'progress.correct': 'correct',
  'progress.wrong': 'wrong',
  'progress.skipped': 'skipped',
  'progress.heatmapTitle': 'Activity calendar',
  'progress.heatmapDay': '{date}: {count} exams',
  'progress.heatmapLess': 'Less',
  'progress.heatmapMore': 'More',

  // --------------------------------- History ---------------------------------
  'history.tabsHistory': 'History',
  'history.tabsMistakes': 'Mistakes',
  'history.tabsBookmarks': 'Bookmarks',
  'history.loading': 'Loading content',
  'history.searchLabel': 'Search exam history',
  'history.searchPlaceholder': 'Type an exam title...',
  'history.clearSearch': 'Clear search',
  'history.sortLabel': 'Sort',
  'history.sortNewest': 'Newest first',
  'history.sortOldest': 'Oldest first',
  'history.resultsCount': '{count} results',
  'history.showing': 'Showing {shown} of {total}',
  'history.loadMore': 'Load more',
  'history.noMatchesTitle': 'Nothing matches your search',
  'history.noMatchesMessage': 'Try a different search term.',
  'history.errorTitle': 'Could not load data',
  'history.errorMessage':
    'Please try again or check your internet connection.',
  'history.retry': 'Try again',
  'history.cardFallbackTitle': 'Exam',
  'history.cardDetails': 'View details',
  'history.cardPercent': '{percent}%',
  'history.emptyHistoryTitle': "Haven't taken an exam yet?",
  'history.emptyHistoryDesc':
    'Start an exam right now to test yourself.',
  'history.emptyHistoryBtn': 'Take a model test',
  'history.emptyMistakesTitle': 'Awesome! No mistakes',
  'history.emptyMistakesDesc':
    'You answered everything correctly, or have not made a mistake yet.',
  'history.emptyMistakesBtn': 'Keep practicing',
  'history.emptyBookmarksTitle': 'Bookmark list is empty',
  'history.emptyBookmarksDesc':
    'Bookmark important or difficult questions to review later.',
  'history.emptyBookmarksBtn': 'Find questions',
  'history.deleteTitle': 'Are you sure?',
  'history.deleteMessage': 'This will be permanently removed from the list.',
  'history.deleteNo': 'No',
  'history.deleteYes': 'Yes, delete',
  'history.deleteMistakeAria': 'Delete mistake',
  'history.deleteBookmarkAria': 'Delete bookmark',
  'history.mistakeBadge': 'Wrong answer',
  'history.mistakeYourAnswer': 'Your answer',
  'history.mistakeCorrectAnswer': 'Correct answer',
  'history.questionMissing': 'Question could not be loaded or was removed',
  'history.questionNotLoaded': 'Question could not be loaded',
  'history.answerMissing': 'Answer not found',
  'history.unknownAnswer': 'Unknown answer',
  'history.saveError': 'Saved incorrectly in database',
  'history.correctNotSet': 'Correct answer not set',
  'history.unknown': 'Unknown',

  // -------------------------------- Admission -------------------------------
  'admission.eyebrow': 'Admission test preparation',
  'admission.title': 'Admission',
  'admission.intro':
    'Prepare for admission tests with model tests and previous year questions, organised by university and unit.',
  'admission.backToHome': 'Back to home',
  'admission.backToAdmission': 'Back to admission',
  'admission.back': 'Back',
  'admission.browseGroups': 'Choose your group',
  'admission.browseGroupsHint':
    'Start admission preparation for your HSC group.',
  'admission.featuredUniversities': 'Popular universities',
  'admission.featuredHint': 'Universities with exams available now.',
  'admission.viewAll': 'View all',
  'admission.group.science': 'Science',
  'admission.group.arts': 'Arts',
  'admission.group.commerce': 'Commerce',
  'admission.group.scienceDescription':
    'Physics, chemistry, biology and mathematics',
  'admission.group.artsDescription':
    'Bangla, English, history and social science',
  'admission.group.commerceDescription':
    'Accounting, business organisation and finance',
  'admission.examType.modelTest': 'Model Test',
  'admission.examType.pastExams': 'Past Exams',
  'admission.examType.modelTestDescription': 'Test yourself with fresh questions',
  'admission.examType.pastExamsDescription':
    'Practise previous years’ admission questions',
  'admission.examTypeCount': '{count} exams',
  'admission.noExamType': 'No exams have been added to this group yet.',
  'admission.typeUnavailable': 'No exams yet',
  'admission.universityCount': '{count} universities',
  'admission.totalExams': 'Total exams',
  'admission.universityStat': 'Universities',
  'admission.unitsCount': '{count} units',
  'admission.examsCount': '{count} exams',
  'admission.universityTitle': 'Choose a university',
  'admission.universitySubtitle': '{group} • {examType}',
  'admission.searchLabel': 'Search universities',
  'admission.searchPlaceholder': 'Type a Bangla or English name...',
  'admission.searchResults': '{count} universities found',
  'admission.clearSearch': 'Clear search',
  'admission.noUniversities': 'No universities found for this selection.',
  'admission.noUniversitiesHint': 'Try another group or exam type.',
  'admission.noSearchResults': 'No university matches your search.',
  'admission.noSearchResultsHint': 'Try searching with a different name.',
  'admission.missingUniversityData':
    'Admission exams exist but are not linked to a university yet.',
  'admission.universityExamsTitle': 'Choose an exam',
  'admission.universityExamsHint': 'Exams available for this university.',
  'admission.unitsTitle': 'Choose a unit',
  'admission.unitsHint': 'This university holds unit-wise admission tests.',
  'admission.allUnits': 'All units',
  'admission.viewExams': 'View exams',
  'admission.continueToExams': 'Go to exam list',
  'admission.noUnits':
    'This university has no separate units — choose an exam directly.',
  'admission.notFoundTitle': 'Page not found',
  'admission.notFoundMessage':
    'The address is invalid or the content was removed.',
  'admission.groupNotFound': 'This group was not found.',
  'admission.examTypeNotFound': 'This exam type was not found.',
  'admission.universityNotFound': 'This university was not found.',
  'admission.unitNotFound': 'This unit was not found.',
  'admission.examNotFound': 'This exam could not be found or is not published.',
  'admission.loading': 'Loading...',
  'admission.loadingExams': 'Loading exams...',
  'admission.errorTitle': 'Could not load data',
  'admission.errorMessage': 'Check your connection and try again.',
  'admission.retry': 'Try again',
  'admission.dataMissingTitle': 'Admission exams are not available yet',
  'admission.dataMissingMessage':
    'Exams for this section have not been published yet. Check back later.',
  'admission.examUnavailableTitle': 'This exam cannot be started now',
  'admission.examUnavailableMessage':
    'The exam window is closed or has not started yet.',
  'admission.availability.available': 'Available',
  'admission.availability.notStarted': 'Not started',
  'admission.availability.closed': 'Closed',
  'admission.availability.unpublished': 'Unpublished',
  'admission.premium': 'Premium',
  'admission.year': 'Year {year}',
  'admission.modelNo': 'Model {number}',
  'admission.duration': '{count} min',
  'admission.marks': '{count} marks',
  'admission.questions': '{count} questions',
  'admission.startExam': 'Start exam',
  'admission.unitLabel': 'Unit',
  'admission.previous': 'Previous',
  'admission.next': 'Next',
  'admission.questionOf': 'Question {current} / {total}',
  'admission.answered': 'Answered',
  'admission.unanswered': 'Unanswered',
  'admission.questionNavigator': 'Question navigation',
  'admission.currentQuestion': 'Current question',
  'admission.breadcrumb': 'Breadcrumb navigation',
  'admission.timeLeft': 'Time left',
  'admission.submit': 'Submit answers',
  'admission.submitting': 'Submitting...',
  'admission.submitTitle': 'Submit this exam?',
  'admission.submitMessage':
    'You answered {answered} questions. You cannot change answers after submitting.',
  'admission.submitConfirm': 'Yes, submit',
  'admission.submitCancel': 'No',
  'admission.examHeader': 'Admission exam',
  'admission.examLoading': 'Preparing exam...',
  'admission.examFailed': 'The exam could not be started.',
  'admission.noQuestions': 'This exam has no questions.',
  'admission.noQuestionsHint': 'Try again later or choose another exam.',
  'admission.backToExams': 'Back to exam list',

  'exam.submitFailed':
    'Could not submit the exam. Your answers are still here — please try again.',
  'exam.submitNetworkFailed':
    'Could not reach the server. Check your connection and try again.',
};

export const APP_MESSAGES: Record<AppLanguage, Record<AppMessageKey, string>> =
  { bn, en };

/** Human label for a language option (used by the switcher + Settings). */
export const LANGUAGE_OPTION_LABELS: Record<AppLanguage, string> = {
  bn: 'বাংলা',
  en: 'English',
};
