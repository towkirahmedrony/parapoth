import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SUPPORT_CONFIG } from '../../../shared/constants/supportConfig';

type Language = 'bn' | 'en';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const TEXTS = {
  bn: {
    title: 'আমাদের সাথে যোগাযোগ করুন',
    subtitle: 'কীভাবে পারাপথ আপনাকে সাহায্য করতে পারে তা জানান।',
    nameLabel: 'আপনার নাম',
    namePlaceholder: 'যেমন: রহিম',
    emailLabel: 'ইমেইল অ্যাড্রেস',
    emailPlaceholder: 'your.email@example.com',
    messageLabel: 'আপনার মেসেজ',
    messagePlaceholder: 'কী বিষয়ে জানতে চান, বিস্তারিত লিখুন...',
    submitBtn: 'মেসেজ পাঠান',
    submittingBtn: 'পাঠানো হচ্ছে...',
    successMsg: 'আপনার মেসেজ সফলভাবে পাঠানো হয়েছে!',
    errorMsg: 'দুঃখিত, কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    directContact: 'অথবা সরাসরি যোগাযোগ করুন',
    emailBtn: 'ইমেইল করুন',
    fbBtn: 'ফেসবুক পেজ'
  },
  en: {
    title: 'Contact Us',
    subtitle: 'Let us know how ParaPoth can help you.',
    nameLabel: 'Your Name',
    namePlaceholder: 'e.g., Rahim',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your.email@example.com',
    messageLabel: 'Your Message',
    messagePlaceholder: 'Write your message in detail...',
    submitBtn: 'Send Message',
    submittingBtn: 'Sending...',
    successMsg: 'Your message has been sent successfully!',
    errorMsg: 'Sorry, something went wrong. Please try again.',
    directContact: 'Or contact us directly',
    emailBtn: 'Email Us',
    fbBtn: 'Facebook Page'
  }
} as const;

export const Contact = () => {
  const [language, setLanguage] = useState<Language>('bn');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const t = TEXTS[language];

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      // .env থেকে VITE_API_URL নেওয়া হচ্ছে। নাম সঠিক করা হয়েছে।
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      
      // apiUrl-এর শেষে স্ল্যাশ (/) থাকলে সেটি হ্যান্ডেল করা হচ্ছে
      const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      const response = await fetch(`${cleanApiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      setFormData({ name: '', email: '', message: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    },
    onError: (error) => {
      console.error('Submission Error:', error);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300"
      style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}
    >
      <div className="mb-8 text-center">
         <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)', 
              color: 'var(--dyn-primary)' 
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">{t.title}</h1>
        <p style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>{t.subtitle}</p>
      </div>

      <div 
        className="max-w-md w-full rounded-xl shadow-sm overflow-hidden"
        style={{ 
          backgroundColor: 'var(--dyn-card)', 
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        }}
      >
        <div className="flex justify-end p-4 bg-black/5">
          <div className="flex bg-black/5 rounded-lg p-1">
            {(['bn', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${language === lang ? 'bg-white shadow-sm' : ''}`}
                style={language === lang ? { color: 'var(--dyn-primary)' } : { color: 'var(--dyn-text)' }}
              >
                {lang === 'bn' ? 'বাংলা' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">{t.nameLabel}</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-black/5 border border-black/10 focus:ring-2 outline-none transition-all"
                style={{ ['--tw-ring-color' as any]: 'var(--dyn-primary)' }}
                placeholder={t.namePlaceholder}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">{t.emailLabel}</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-black/5 border border-black/10 focus:ring-2 outline-none transition-all"
                style={{ ['--tw-ring-color' as any]: 'var(--dyn-primary)' }}
                placeholder={t.emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">{t.messageLabel}</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-black/5 border border-black/10 focus:ring-2 outline-none transition-all resize-none"
                style={{ ['--tw-ring-color' as any]: 'var(--dyn-primary)' }}
                placeholder={t.messagePlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full py-3 rounded-lg font-bold disabled:opacity-50 flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)' }}
            >
              {submitMutation.isPending && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {submitMutation.isPending ? t.submittingBtn : t.submitBtn}
            </button>

            {showSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm text-center font-medium">
                {t.successMsg}
              </div>
            )}
            {submitMutation.isError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center font-medium">
                {t.errorMsg}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm opacity-70 mb-4">{t.directContact}</p>
        <div className="flex gap-4">
          <a href={`mailto:${SUPPORT_CONFIG.EMAIL}`} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10" aria-label="Email Support">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
          </a>
          <a href={SUPPORT_CONFIG.FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10" aria-label="Facebook Support">
             <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
};
