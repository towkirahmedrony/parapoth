import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // রিকভারি মোড স্টেট
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // ১. URL প্যারামিটার চেক করা (Supabase v2 PKCE flow-তে 'code' পাঠায়)
    const hasCode = searchParams.has('code');
    // ২. URL Hash বা Search চেক করা (পুরনো ফ্লো বা ম্যানুয়াল লিংকের জন্য)
    const hasRecoveryKeyword = window.location.href.includes('type=recovery');

    if (hasCode || hasRecoveryKeyword) {
      setIsRecoveryMode(true);
    }

    // ৩. Auth State Change ইভেন্ট লিসেন করা (নিরাপত্তার জন্য)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // বেসিক ভ্যালিডেশন
    if (!isRecoveryMode && !oldPassword) {
      setError('বর্তমান পাসওয়ার্ড দিতে হবে।');
      return;
    }
    if (newPassword.length < 6) {
      setError('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('নতুন পাসওয়ার্ড দুটি মিলছে না। অনুগ্রহ করে চেক করুন।');
      return;
    }
    if (!isRecoveryMode && oldPassword === newPassword) {
      setError('বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড একই হতে পারবে না।');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) throw new Error('ইউজারের তথ্য পাওয়া যায়নি। আবার লগ-ইন করুন।');

      // যদি সাধারণ পরিবর্তন হয় (রিকভারি না হয়), তবে আগের পাসওয়ার্ড যাচাই করুন
      if (!isRecoveryMode) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });

        if (signInError) {
          throw new Error('আপনার বর্তমান পাসওয়ার্ডটি ভুল হয়েছে।');
        }
      }

      // নতুন পাসওয়ার্ড আপডেট করা
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // সফল হলে URL থেকে Hash এবং Code ক্লিয়ার করা যাতে রিলোড দিলে আবার রিকভারি মোডে না থাকে
      window.history.replaceState(null, '', window.location.pathname);

      // ৩ সেকেন্ড পর প্রোফাইল বা ড্যাশবোর্ডে রিডাইরেক্ট
      setTimeout(() => {
        navigate('/dashboard/home', { replace: true });
      }, 3000);

    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
          {isRecoveryMode ? 'পাসওয়ার্ড রিসেট' : 'পাসওয়ার্ড পরিবর্তন'}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-8">
        <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8">
          
          <div className="text-center mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
              {isRecoveryMode ? <KeyRound size={32} /> : <Lock size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {isRecoveryMode ? 'নতুন পাসওয়ার্ড সেট করুন' : 'পাসওয়ার্ড আপডেট করুন'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRecoveryMode 
                ? 'আপনার অ্যাকাউন্টের জন্য একটি নতুন এবং শক্তিশালী পাসওয়ার্ড দিন।' 
                : 'নিরাপত্তার স্বার্থে প্রথমে আপনার বর্তমান পাসওয়ার্ডটি দিন।'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 flex items-start gap-2 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm border border-emerald-200 dark:border-emerald-800/30">
              <CheckCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-1">পাসওয়ার্ড সফলভাবে {isRecoveryMode ? 'রিসেট' : 'পরিবর্তিত'} হয়েছে!</p>
                <p className="opacity-90">আপনাকে মূল পেজে নিয়ে যাওয়া হচ্ছে...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Old Password Input - Only shown if NOT in recovery mode */}
            {!isRecoveryMode && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      বর্তমান পাসওয়ার্ড
                    </label>
                    <Link 
                      to="/auth/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="বর্তমান পাসওয়ার্ড দিন"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                      required={!isRecoveryMode}
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                    >
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700"></div>
              </>
            )}

            {/* New Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                নতুন পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড দিন"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                  required
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                নতুন পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="আবার নতুন পাসওয়ার্ড দিন"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                  required
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || success || (!isRecoveryMode && !oldPassword) || !newPassword || !confirmPassword}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isRecoveryMode ? 'পাসওয়ার্ড সেভ করুন' : 'পাসওয়ার্ড পরিবর্তন করুন'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
