import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useHomeGrids, GridItem } from '../hooks/useHomeGrids';
import { getIconByName } from '../../../shared/utils/iconMapper';
import { Skeleton } from '../../../shared/components/ui/Skeleton';

// --- Constants ---
const SKELETON_COUNT = 4;
const DEFAULT_BG_COLOR = '#ffffff';
const DEFAULT_TEXT_COLOR = '#0f172a';
const LIGHT_TEXT_COLOR = '#f8fafc';
const FALLBACK_DARK_BG = '#1e293b';
const FALLBACK_ACCENT = '#3B82F6';

// --- Types & Interfaces ---
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

/**
 * Calculates relative luminance to determine contrasting text color.
 * Safely handles invalid, 3-character, or 6-character hex codes.
 */
const getLuminance = (hex?: string | null): number => {
  if (!hex || hex === 'transparent') return 1;
  
  const color = hex.startsWith('#') ? hex.substring(1) : hex;
  
  if (color.length !== 6 && color.length !== 3) return 1;
  
  let r: number, g: number, b: number;
  
  if (color.length === 3) {
    r = parseInt(color[0] + color[0], 16);
    g = parseInt(color[1] + color[1], 16);
    b = parseInt(color[2] + color[2], 16);
  } else {
    r = parseInt(color.substring(0, 2), 16);
    g = parseInt(color.substring(2, 4), 16);
    b = parseInt(color.substring(4, 6), 16);
  }

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return 1;

  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
};

const FeatureGrid: React.FC<FeatureGridProps> = memo(({ themeConfig }) => {
  const { features, loading } = useHomeGrids();

  const { globalCardBg, activeTheme, themeAccent } = useMemo(() => {
    const bgLuminance = getLuminance(themeConfig?.colors?.primaryBackground || DEFAULT_BG_COLOR);
    const fallbackCardBg = bgLuminance < 0.2 ? FALLBACK_DARK_BG : DEFAULT_BG_COLOR;
    
    return {
      globalCardBg: themeConfig?.colors?.cardColor || fallbackCardBg,
      activeTheme: themeConfig?.active_theme || 'default',
      themeAccent: themeConfig?.colors?.accentColor || themeConfig?.colors?.buttonColor
    };
  }, [themeConfig]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-[130px] rounded-[24px] bg-slate-200/60" />
        ))}
      </div>
    );
  }

  if (!features || features.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {features.map((item: GridItem) => {
        const isUrl = !!item.icon_name && (item.icon_name.startsWith('http') || item.icon_name.startsWith('/'));
        const IconComponent = !isUrl && item.icon_name ? getIconByName(item.icon_name) : null;
        
        let finalCardBg: string;
        let finalTextColor: string;

        if (activeTheme === 'default') {
          const isDefaultBg = !item.bg_color || item.bg_color.toLowerCase() === DEFAULT_BG_COLOR || item.bg_color === 'transparent';
          finalCardBg = isDefaultBg ? globalCardBg : item.bg_color;

          const calculatedTextColor = getLuminance(finalCardBg) < 0.5 ? LIGHT_TEXT_COLOR : DEFAULT_TEXT_COLOR;
          const isDefaultText = !item.color || item.color.toLowerCase() === '#000000' || item.color.toLowerCase() === DEFAULT_BG_COLOR;
          finalTextColor = isDefaultText ? calculatedTextColor : item.color;
        } else {
          finalCardBg = globalCardBg;
          finalTextColor = themeConfig?.colors?.textColor || (getLuminance(finalCardBg) < 0.5 ? LIGHT_TEXT_COLOR : DEFAULT_TEXT_COLOR);
        }

        const baseColor = themeAccent || item.color || FALLBACK_ACCENT;

        return (
          <Link 
            key={item.id} 
            to={item.link || '#'}
            className="group relative flex flex-col items-center justify-center p-5 rounded-[24px] overflow-hidden transition-all duration-300 shadow-sm text-center border border-black/10 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
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
                IconComponent && <IconComponent className="w-7 h-7 transition-transform group-hover:scale-110" strokeWidth={2.5} />
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
