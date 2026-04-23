import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { getIconByName } from '@/shared/utils/iconMapper';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import type { GridItem } from '../hooks/useHomeGrids';

const SKELETON_COUNT = 4;

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
  features: GridItem[];
  loading?: boolean;
  themeConfig?: ThemeConfig;
}

const isHexColor = (value: string | null | undefined): value is string => {
  if (!value) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '').trim();

  const normalized =
    clean.length === 3
      ? clean
          .split('')
          .map(char => char + char)
          .join('')
      : clean;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isImageSource = (value: string) => {
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
};

const getAccentColor = (themeConfig?: ThemeConfig): string | null => {
  const accent = themeConfig?.colors?.accentColor;
  const button = themeConfig?.colors?.buttonColor;

  if (isHexColor(accent)) return accent;
  if (isHexColor(button)) return button;

  return null;
};

const FeatureGrid: React.FC<FeatureGridProps> = memo(
  ({ features, loading = false, themeConfig }) => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 gap-4 p-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Skeleton
              key={`feature-skeleton-${index}`}
              className="h-[130px] rounded-[24px] bg-surface-elevated"
            />
          ))}
        </div>
      );
    }

    if (!features.length) return null;

    const accentColor = getAccentColor(themeConfig);

    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {features.map(item => {
          const iconName = item.icon_name.trim();
          const renderAsImage = isImageSource(iconName);
          const IconComponent = renderAsImage ? null : getIconByName(iconName);

          const rawBgColor = item.bg_color?.trim() || '';
          const rawTextColor = item.color?.trim() || '';

          const allowCustomBg =
            isHexColor(rawBgColor) &&
            rawBgColor.toLowerCase() !== '#ffffff';

          const allowCustomText =
            isHexColor(rawTextColor) &&
            rawTextColor.toLowerCase() !== '#000000' &&
            rawTextColor.toLowerCase() !== '#0f172a';

          const iconBoxStyle =
            accentColor !== null
              ? {
                  backgroundColor: hexToRgba(accentColor, 0.12),
                  color: accentColor,
                }
              : undefined;

          const glowStyle =
            accentColor !== null
              ? {
                  backgroundColor: hexToRgba(accentColor, 0.14),
                }
              : undefined;

          const cardStyle = {
            backgroundColor: allowCustomBg ? rawBgColor : undefined,
            color: allowCustomText ? rawTextColor : undefined,
          };

          const content = (
            <>
              <div
                aria-hidden="true"
                className="absolute -top-4 w-28 h-28 rounded-full opacity-[0.08] blur-2xl transition-opacity group-hover:opacity-20 pointer-events-none"
                style={glowStyle}
              />

              <div
                className="relative w-14 h-14 rounded-[18px] flex items-center justify-center mb-3 z-10 bg-surface"
                style={iconBoxStyle}
              >
                {renderAsImage ? (
                  <img
                    src={iconName}
                    alt={item.title}
                    className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                ) : IconComponent ? (
                  <IconComponent
                    className="w-7 h-7 transition-transform group-hover:scale-110"
                    strokeWidth={2.5}
                  />
                ) : null}
              </div>

              <span className="relative font-bold text-[15px] tracking-tight line-clamp-2 z-10">
                {item.title}
              </span>
            </>
          );

          const baseClassName =
            'group relative flex flex-col items-center justify-center p-5 rounded-[24px] overflow-hidden transition-transform duration-200 text-center border border-card-border bg-card-bg text-text-primary active:scale-[0.98]';

          const hasValidLink = typeof item.link === 'string' && item.link.trim().length > 0;

          if (!hasValidLink) {
            return (
              <div
                key={item.id}
                className={baseClassName}
                style={cardStyle}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.link as string}
              className={baseClassName}
              style={cardStyle}
            >
              {content}
            </Link>
          );
        })}
      </div>
    );
  }
);

FeatureGrid.displayName = 'FeatureGrid';
export default FeatureGrid;
