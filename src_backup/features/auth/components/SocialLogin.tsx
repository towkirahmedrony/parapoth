import { supabase } from '../../../shared/lib/supabase';

export default function SocialLogin() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        }
      }
    });
  };

  return (
    <>
      <div className="my-8 flex items-center">
        <div 
          style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)' }} 
          className="flex-1 border-t"
        ></div>
        <span 
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }} 
          className="px-4 text-sm"
        >
          OR
        </span>
        <div 
          style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)' }} 
          className="flex-1 border-t"
        ></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        style={{ 
          color: 'var(--dyn-text)',
          borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)'
        }}
        className="w-full py-2.5 bg-transparent border font-medium rounded-lg transition-colors flex justify-center items-center gap-2 hover:bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    </>
  );
}
