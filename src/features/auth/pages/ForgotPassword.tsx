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

    const inputStr = email.trim();

    if (!inputStr) {
      setMessage({ type: 'error', text: 'অনুগ্রহ করে ইমেইল বা ইউজারনেম দিন।' });
      return;
    }

    setIsLoading(true);

    try {
      let targetEmail = inputStr;
      
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputStr);

      if (isEmail) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', inputStr)
          .maybeSingle();

        if (profileError || !data) {
          throw new Error('এই ইমেইল দিয়ে কোনো একাউন্ট পাওয়া যায়নি।');
        }
      } else {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', inputStr)
          .maybeSingle();

        if (profileError || !data?.email) {
          throw new Error('এই ইউজারনেম দিয়ে কোনো একাউন্ট পাওয়া যায়নি।');
        }
        targetEmail = data.email;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
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
        text: err.message || 'রিসেট লিংক পাঠাতে সমস্যা হয়েছে। ইনপুট চেক করুন।' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-app text-text-primary p-4 justify-center items-center">
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-3 text-text-primary">পাসওয়ার্ড ভুলে গেছেন?</h1>
          <p className="text-text-secondary text-sm leading-relaxed px-4">
            পাসওয়ার্ড রিসেট করতে আপনার ইমেইল অথবা ইউজারনেম দিন।
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm border bg-surface-elevated border-border-color text-text-primary">
            {message.type === 'success' ? (
              <CheckCircle size={20} className="shrink-0 mt-0.5 text-text-primary" />
            ) : (
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-text-primary" />
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
              className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-focus-ring transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              'রিসেট লিংক পাঠান'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
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
