import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import RegisterSuccess from '../components/RegisterSuccess';

export default function Register() {
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref'); // URL থেকে রেফারেল কোড নেওয়া

  if (successEmail) {
    return <RegisterSuccess email={successEmail} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 bg-[var(--dyn-bg)]">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Logo and Title */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img 
            src="https://res.cloudinary.com/dqpv45947/image/upload/v1774883011/parapoth_media/gdjup0cu4ilba6uoqgcr.webp" 
            alt="App Logo" 
            className="h-16 w-auto object-contain drop-shadow-sm"
          />
          <h1 className="text-2xl font-bold text-[var(--dyn-text)]">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </h1>
          {refCode && (
            <p className="text-sm font-medium text-green-600 bg-green-500/10 px-3 py-1 rounded-full">
              রেফারেল কোড অ্যাক্টিভ আছে: {refCode}
            </p>
          )}
        </div>

        {/* Minimal Form */}
        <RegisterForm onSuccess={setSuccessEmail} defaultRefCode={refCode} />

        {/* Links */}
        <div className="w-full mt-6 flex flex-col items-center gap-5">
          <div className="w-full h-px my-1 bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)]" />

          <Link 
            to="/auth/login" 
            className="w-fit px-5 py-2.5 font-bold rounded-full border transition-colors border-[color-mix(in_srgb,var(--dyn-text)_20%,transparent)] text-[var(--dyn-text)] bg-transparent hover:bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
          >
            আগে থেকে অ্যাকাউন্ট আছে? লগ ইন করুন
          </Link>
        </div>

      </div>
    </div>
  );
}
