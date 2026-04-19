import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage({ type: 'error', text: 'অনুগ্রহ করে ইমেইল ঠিকানা দিন।' });
      return;
    }

    setIsLoading(true);

    try {
      // Supabase Password Reset Logic
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/change-password`,
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। ইনবক্স (বা স্প্যাম ফোল্ডার) চেক করুন।' 
      });
      setEmail('');

    } catch (err: any) {
      console.error('Reset error:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'রিসেট লিংক পাঠাতে সমস্যা হয়েছে। ইমেইলটি সঠিক কিনা চেক করুন।' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f111a] text-white p-4 justify-center items-center">
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-3">পাসওয়ার্ড ভুলে গেছেন?</h1>
          <p className="text-[#8e95a9] text-sm leading-relaxed px-4">
            পাসওয়ার্ড রিসেট করতে আপনার ইমেইল অথবা ইউজারনেম দিন।
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm border ${
            message.type === 'success' 
              ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' 
              : 'bg-red-900/20 text-red-400 border-red-800/50'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ইমেইল বা ইউজারনেম"
              className="w-full bg-[#1e2330] border border-[#2a3042] rounded-xl px-4 py-3.5 text-white placeholder-[#5e667b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'রিসেট লিংক পাঠান'
            )}
          </button>
        </form>

        {/* Dynamic Back Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#e2e8f0] hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span>ফিরে যান</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
