import { BookOpen, Cpu, HeartPulse, Landmark, type LucideIcon } from 'lucide-react';
import type { AppMessageKey } from '@/shared/i18n/messages';

export const MODEL_TRACKS = ['hsc', 'medical', 'engineering', 'varsity'] as const;

export type ModelTrack = (typeof MODEL_TRACKS)[number];

export const DEFAULT_MODEL_TRACK: ModelTrack = 'hsc';

export interface ModelTrackConfig {
  value: ModelTrack;
  labelKey: AppMessageKey;
  icon: LucideIcon;
}

export const MODEL_TRACK_CONFIGS: ModelTrackConfig[] = [
  { value: 'hsc', labelKey: 'exam.track.hsc', icon: BookOpen },
  { value: 'medical', labelKey: 'exam.track.medical', icon: HeartPulse },
  { value: 'engineering', labelKey: 'exam.track.engineering', icon: Cpu },
  { value: 'varsity', labelKey: 'exam.track.varsity', icon: Landmark },
];

export const isModelTrack = (value: string | null | undefined): value is ModelTrack =>
  (MODEL_TRACKS as readonly string[]).includes(value ?? '');

export type ModelPaperScope = 'full' | 'subject';
