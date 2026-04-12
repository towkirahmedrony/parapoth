import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function RegisterSuccess({ email }: { email: string }) {
  return (
    <div 
      style={{ backgroundColor: 'var(--dyn-bg)' }}
      className="min-h-screen grid lg:grid-cols-2"
    >
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto text-center">
          <div 
            style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle 
              style={{ color: 'var(--dyn-primary)' }} 
              className="w-8 h-8" 
            />
          </div>
          <h2 style={{ color: 'var(--dyn-text)' }} className="text-3xl font-bold mb-4">Check Your Email</h2>
          <p style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }} className="mb-8">
            We've sent a verification link to <strong style={{ color: 'var(--dyn-text)' }}>{email}</strong>. 
            Please confirm your account to access the platform.
          </p>
          <Link 
            to="/auth/login"
            style={{ 
              backgroundColor: 'var(--dyn-primary)', 
              color: 'var(--dyn-bg)' 
            }}
            className="inline-block w-full py-3 font-semibold rounded-lg shadow-md transition-all hover:opacity-90"
          >
            Return to Login
          </Link>
        </div>
      </div>
      
      {/* Right Side Branding */}
      <div 
        style={{ backgroundColor: 'var(--dyn-bg)' }}
        className="hidden lg:flex relative overflow-hidden items-center justify-center border-l"
      >
        <div 
          style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--dyn-primary) 15%, transparent), var(--dyn-bg))' }}
          className="absolute inset-0 z-10"
        ></div>
        <div 
          style={{ 
            backgroundImage: 'radial-gradient(color-mix(in srgb, var(--dyn-text) 15%, transparent) 1px, transparent 1px)', 
            backgroundSize: '16px 16px' 
          }}
          className="absolute inset-0 z-10"
        ></div>
        <div className="relative z-20 text-center px-12 max-w-lg">
          <h2 style={{ color: 'var(--dyn-text)' }} className="text-4xl font-bold mb-6">Join the Community</h2>
          <p style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }} className="text-lg">
            Start your journey to academic excellence today.
          </p>
        </div>
      </div>
    </div>
  );
}
