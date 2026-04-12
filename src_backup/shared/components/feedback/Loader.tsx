import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text }) => {
  const content = (
    <div className="w-full flex flex-col p-4 space-y-4 animate-pulse">
      {/* Skeleton Effect - স্পিনারের বদলে স্কেলেটন ব্লক */}
      <div className="h-8 rounded-md w-1/2 md:w-1/3 mb-4" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)' }}></div>
      <div className="h-24 rounded-lg w-full" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 8%, transparent)' }}></div>
      <div className="h-24 rounded-lg w-full" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 8%, transparent)' }}></div>
      <div className="h-24 rounded-lg w-full hidden md:block" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 8%, transparent)' }}></div>
      
      {text && (
        <div className="flex justify-center mt-6">
          <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)' }}></div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4 transition-colors duration-500"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-bg) 95%, transparent)' }}
      >
        <div className="w-full max-w-4xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loader;
