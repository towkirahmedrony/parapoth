import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 bg-[var(--dyn-bg)]">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <img 
            src="https://res.cloudinary.com/dqpv45947/image/upload/v1774883011/parapoth_media/gdjup0cu4ilba6uoqgcr.webp" 
            alt="App Logo" 
            className="h-16 w-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* Minimal Form */}
        <LoginForm />

        {/* Links */}
        <div className="w-full mt-4 flex flex-col items-center gap-5">
          <Link 
            to="/auth/forgot-password" 
            className="font-medium hover:underline text-[var(--dyn-text)]"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>

          <div className="w-full h-px my-2 bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)]" />

          <Link 
            to="/auth/register" 
            className="w-fit px-5 py-2.5 font-bold rounded-full border transition-colors border-[color-mix(in_srgb,var(--dyn-text)_20%,transparent)] text-[var(--dyn-text)] bg-transparent hover:bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
          >
            নতুন অ্যাকাউন্ট তৈরি করুন
          </Link>
        </div>
        
      </div>
    </div>
  );
}
