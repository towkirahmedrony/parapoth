import React from 'react';

const HomeSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-app pb-24">
      <div className="mx-auto w-full max-w-6xl px-3 pt-3 space-y-3">
        
        {/* Greeting Section Skeleton */}
        <section className="rounded-[20px] border border-card-border bg-card-bg px-4 py-3 h-[68px] flex justify-between items-center animate-pulse">
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-lg bg-surface-elevated" />
            <div className="h-3 w-24 rounded-lg bg-surface-elevated" />
          </div>
          <div className="h-7 w-20 rounded-full bg-surface-elevated" />
        </section>

        {/* Dynamic Banner Skeleton */}
        <section className="w-full rounded-[20px] border border-card-border bg-card-bg px-3 py-3 animate-pulse h-[74px]">
          <div className="flex items-center gap-3 h-full">
            <div className="h-12 w-12 rounded-[16px] bg-surface-elevated shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded-md bg-surface-elevated" />
              <div className="h-3 w-1/2 rounded-md bg-surface-elevated" />
            </div>
            <div className="h-8 w-16 rounded-full bg-surface-elevated shrink-0" />
          </div>
        </section>

        {/* Daily Goal Skeleton */}
        <section className="rounded-[20px] border border-card-border bg-card-bg px-3 py-3 h-[74px] flex items-center gap-3 animate-pulse">
          <div className="h-12 w-12 rounded-[16px] bg-surface-elevated shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="flex justify-between">
              <div className="h-5 w-24 rounded-md bg-surface-elevated" />
              <div className="h-4 w-4 rounded-full bg-surface-elevated" />
            </div>
            <div className="h-2 w-full rounded-full bg-surface-elevated" />
          </div>
        </section>

        {/* Feature Grid Skeleton */}
        <section className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[148px] rounded-[22px] bg-surface-elevated animate-pulse" />
          ))}
        </section>
        
      </div>
    </div>
  );
};

export default HomeSkeleton;
