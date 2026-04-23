import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
    const hasCode = searchParams.has('code');
    const hasRecoveryKeyword = window.location.href.includes('type=recovery');

    if (hasCode || hasRecoveryKeyword) {
      setIsRecoveryMode(true);
    }

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

      if (!isRecoveryMode) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });

        if (signInError) {
          throw new Error('আপনার বর্তমান পাসওয়ার্ডটি ভুল হয়েছে।');
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      window.history.replaceState(null, '', window.location.pathname);

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

  const inputClasses = "w-full px-4 py-3.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring text-base bg-input-bg border border-input-border text-text-primary placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="min-h-screen flex flex-col bg-app transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-nav-bg/80 border-b border-border-color px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full hover:bg-surface-elevated transition-colors text-nav-text"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-nav-text">
          {isRecoveryMode ? 'পাসওয়ার্ড রিসেট' : 'পাসওয়ার্ড পরিবর্তন'}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-8">
        <div className="max-w-md w-full mx-auto bg-card-bg rounded-2xl shadow-sm border border-card-border p-6 sm:p-8">
          
          <div className="text-center mb-8">
            <div className="bg-surface-elevated w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-text-primary">
              {isRecoveryMode ? <KeyRound size={32} /> : <Lock size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {isRecoveryMode ? 'নতুন পাসওয়ার্ড সেট করুন' : 'পাসওয়ার্ড আপডেট করুন'}
            </h2>
            <p className="text-sm text-text-secondary">
              {isRecoveryMode 
                ? 'আপনার অ্যাকাউন্টের জন্য একটি নতুন এবং শক্তিশালী পাসওয়ার্ড দিন।' 
                : 'নিরাপত্তার স্বার্থে প্রথমে আপনার বর্তমান পাসওয়ার্ডটি দিন।'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-2 p-3 rounded-lg text-sm bg-surface-elevated border border-border-color text-text-primary">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-text-primary" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 flex items-start gap-2 p-4 rounded-lg text-sm bg-surface-elevated border border-border-color text-text-primary">
              <CheckCircle size={20} className="mt-0.5 shrink-0 text-text-primary" />
              <div>
                <p className="font-semibold mb-1">পাসওয়ার্ড সফলভাবে {isRecoveryMode ? 'রিসেট' : 'পরিবর্তিত'} হয়েছে!</p>
                <p className="opacity-90">আপনাকে মূল পেজে নিয়ে যাওয়া হচ্ছে...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Old Password Input */}
            {!isRecoveryMode && (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-text-primary">
                      বর্তমান পাসওয়ার্ড
                    </label>
                    <Link 
                      to="/auth/forgot-password" 
                      className="text-sm font-medium text-text-secondary hover:text-text-primary hover:underline transition-colors"
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
                      className={inputClasses}
                      required={!isRecoveryMode}
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 focus:outline-none text-text-secondary hover:text-text-primary"
                    >
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-color"></div>
              </>
            )}

            {/* New Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">
                নতুন পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড দিন"
                  className={inputClasses}
                  required
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 focus:outline-none text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">
                নতুন পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="আবার নতুন পাসওয়ার্ড দিন"
                  className={inputClasses}
                  required
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 focus:outline-none text-text-secondary hover:text-text-primary"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || success || (!isRecoveryMode && !oldPassword) || !newPassword || !confirmPassword}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-lg font-bold transition-all duration-200 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
