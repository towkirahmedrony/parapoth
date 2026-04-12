import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useHomeGrids, GridItem } from '../hooks/useHomeGrids';
import { getIconByName } from '@/shared/utils/iconMapper';
import { Skeleton } from '@/shared/components/ui/Skeleton';

const SKELETON_COUNT = 4;
const FALLBACK_ACCENT = '#3B82F6';

export interface ThemeConfig {
  active_theme?: string;
  colors?: {
    primaryBackground?: string;
    cardColor?: string;
    accentColor?: string;
    buttonColor?: string;
    textColor?: string;
  };
}

interface FeatureGridProps {
  themeConfig?: ThemeConfig;
}

const FeatureGrid: React.FC<FeatureGridProps> = memo(({ themeConfig }) => {
  const { features, loading } = useHomeGrids();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-[130px] rounded-[24px] bg-slate-200/60 dark:bg-slate-800/60" />
        ))}
      </div>
    );
  }

  if (!features || features.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {features.map((item: GridItem) => {
        if (!item) return null;

        const isUrl = !!item.icon_name && (item.icon_name.startsWith('http') || item.icon_name.startsWith('/'));
        const IconComponent = !isUrl && item.icon_name ? getIconByName(item.icon_name) : null;
        
        // ডাইনামিক ব্যাকগ্রাউন্ড: API থেকে আসা কালার যদি ডিফল্ট (সাদা) হয়, তবে গ্লোবাল CSS ভেরিয়েবল ব্যবহার হবে।
        const rawBgColor = item.bg_color?.trim() || '';
        const isDefaultBg = !rawBgColor || rawBgColor.toLowerCase() === '#ffffff' || rawBgColor === 'transparent';
        const finalCardBg = isDefaultBg ? 'var(--dyn-card)' : rawBgColor;

        // ডাইনামিক টেক্সট কালার: API থেকে আসা কালার যদি ডিফল্ট (কালো/ডার্ক) হয়, তবে গ্লোবাল CSS ভেরিয়েবল ব্যবহার হবে।
        const rawColor = item.color?.trim() || '';
        const isDefaultText = !rawColor || rawColor.toLowerCase() === '#000000' || rawColor.toLowerCase() === '#0f172a';
        const finalTextColor = isDefaultText ? 'var(--dyn-text)' : rawColor;

        // আইকন ও শ্যাডোর জন্য বেস কালার
        const baseColor = themeConfig?.colors?.accentColor || themeConfig?.colors?.buttonColor || item.color || FALLBACK_ACCENT;

        return (
          <Link 
            key={item.id} 
            to={item.link || '#'}
            className="group relative flex flex-col items-center justify-center p-5 rounded-[24px] overflow-hidden transition-all duration-300 shadow-sm text-center border border-black/5 dark:border-white/5 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
            style={{ 
              backgroundColor: finalCardBg,
              color: finalTextColor
            }}
          >
            <div 
              className="absolute -top-4 w-28 h-28 rounded-full opacity-[0.08] blur-2xl transition-opacity group-hover:opacity-20 pointer-events-none" 
              style={{ backgroundColor: baseColor }}
            />

            <div 
              className="relative w-14 h-14 rounded-[18px] flex items-center justify-center mb-3 shadow-sm z-10"
              style={{ backgroundColor: `${baseColor}15`, color: baseColor }}
            >
              {isUrl ? (
                <img 
                  src={item.icon_name} 
                  alt={item.title} 
                  className="w-8 h-8 object-contain drop-shadow-sm transition-transform group-hover:scale-110" 
                  loading="lazy"
                />
              ) : (
                IconComponent ? <IconComponent className="w-7 h-7 transition-transform group-hover:scale-110" strokeWidth={2.5} /> : null
              )}
            </div>
            
            <span 
              className="relative font-bold text-[15px] tracking-tight line-clamp-2 z-10"
              style={{ color: finalTextColor }}
            >
              {item.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
});

FeatureGrid.displayName = 'FeatureGrid';
export default FeatureGrid;
