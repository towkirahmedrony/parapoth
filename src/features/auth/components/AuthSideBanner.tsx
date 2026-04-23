import { memo } from 'react';
import { GraduationCap, BookOpen, Trophy } from 'lucide-react';

const AuthSideBanner = memo(() => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-surface border-r border-border-color relative overflow-hidden flex-col justify-between p-12 xl:p-16">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary opacity-[0.03] rounded-full blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] bg-primary opacity-[0.04] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-16">
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-text-primary">
            ParaPoth
          </span>
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="text-4xl xl:text-5xl font-bold tracking-tight text-text-primary leading-[1.15]">
            Master your exams with confidence.
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Join thousands of students testing their knowledge, tracking progress, and achieving their academic goals.
          </p>
        </div>
      </div>

      {/* Trust Badges / Features list */}
      <div className="relative z-10 flex flex-col gap-5 mt-12">
        <div className="flex items-center gap-4 bg-surface-elevated w-fit px-5 py-3.5 rounded-2xl border border-border-color shadow-sm">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-text-primary">Comprehensive Q-Bank</p>
            <p className="text-xs text-text-secondary">Subject-wise mock tests</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-surface-elevated w-fit px-5 py-3.5 rounded-2xl border border-border-color shadow-sm ml-8">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-text-primary">National Leaderboard</p>
            <p className="text-xs text-text-secondary">Compete with peers</p>
          </div>
        </div>
      </div>

    </div>
  );
});

AuthSideBanner.displayName = 'AuthSideBanner';

export default AuthSideBanner;
