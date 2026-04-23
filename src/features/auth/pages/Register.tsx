import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import RegisterSuccess from '../components/RegisterSuccess';

export default function Register() {
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  if (successEmail) {
    return <RegisterSuccess email={successEmail} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 bg-app">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Logo, Title and Subtitle */}
        <div className="mb-8 flex flex-col items-center">
          <img 
            src="https://res.cloudinary.com/dqpv45947/image/upload/v1776608021/parapoth_media/hzigvwfcfbfb1schkd3r.webp" 
            alt="App Logo" 
            className="h-12 w-auto object-contain drop-shadow-sm mb-2"
          />
          <h1 className="text-2xl font-bold tracking-tight mb-0.5 text-text-primary">
            প্যারাপথ
          </h1>
          <p className="text-[13px] font-medium tracking-[0.08em] uppercase text-text-secondary">
            সফলতার পথে, তোমার সাথে
          </p>
          
          {refCode && (
            <div className="mt-3 px-4 py-1.5 rounded-full bg-badge-bg border border-border-color">
              <p className="text-xs font-bold text-badge-text">
                রেফারেল কোড অ্যাক্টিভ: {refCode}
              </p>
            </div>
          )}
        </div>

        {/* Registration Form */}
        <RegisterForm onSuccess={setSuccessEmail} defaultRefCode={refCode} />

        {/* Bottom Login Link (Text Only) */}
        <div className="w-full mt-6 flex justify-center items-center text-[15px]">
          <span className="text-text-secondary">
            আগে থেকে অ্যাকাউন্ট আছে?
          </span>
          <Link 
            to="/auth/login" 
            className="font-bold ml-1.5 text-text-primary hover:text-text-secondary hover:underline transition-colors"
          >
            লগ ইন করুন
          </Link>
        </div>

      </div>
    </div>
  );
}
