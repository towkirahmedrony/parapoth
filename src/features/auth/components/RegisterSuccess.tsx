import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function RegisterSuccess({ email }: { email: string }) {
  return (
    <div className="bg-app min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto text-center">
          <div className="bg-surface-elevated mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-text-primary" />
          </div>

          <h2 className="text-text-primary text-3xl font-bold mb-4">
            ইমেইল চেক করো
          </h2>

          <p className="text-text-secondary mb-6 leading-relaxed">
            <strong className="text-text-primary">{email}</strong> এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে।
            লিংকে ক্লিক করে অ্যাকাউন্ট ভেরিফাই করো।
          </p>

          <div className="bg-secondary text-text-secondary mb-8 p-3 rounded-lg text-sm">
            মেইল না পেলে <strong className="text-text-primary">Spam</strong> বা <strong className="text-text-primary">Junk</strong> ফোল্ডার দেখো।
          </div>

          <Link
            to="/auth/login"
            className="bg-primary text-primary-foreground inline-block w-full py-3 font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
          >
            লগ ইন পেজে যাও
          </Link>
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden items-center justify-center border-l border-border-color bg-surface">
        <div className="relative z-20 text-center px-12 max-w-lg">
          <h2 className="text-text-primary text-4xl font-bold mb-6">
            প্যারাপথে স্বাগতম
          </h2>

          <p className="text-text-secondary text-lg">
            সফলতার পথে, তোমার সাথে।
          </p>
        </div>
      </div>
    </div>
  );
}
