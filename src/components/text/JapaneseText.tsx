'use client';

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

export interface JapaneseTextProps {
  kanji: string;
  furigana?: string;
  romaji?: string;
  meaning?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<
  NonNullable<JapaneseTextProps['size']>,
  { kanji: string; furigana: string; romaji: string; meaning: string }
> = {
  sm: {
    kanji: 'text-base font-medium leading-none',
    furigana: 'text-[11px] font-medium leading-none mb-1',
    romaji: 'text-xs mt-1',
    meaning: 'text-xs mt-1',
  },
  md: {
    kanji: 'text-xl font-semibold leading-tight',
    furigana: 'text-xs font-medium leading-none mb-1.5',
    romaji: 'text-xs mt-1.5',
    meaning: 'text-sm mt-1',
  },
  lg: {
    kanji: 'text-2xl sm:text-3xl font-bold leading-tight tracking-tight',
    furigana: 'text-xs sm:text-sm font-medium leading-none mb-1.5',
    romaji: 'text-xs sm:text-sm mt-1.5',
    meaning: 'text-base mt-1.5',
  },
  xl: {
    kanji: 'text-3xl sm:text-4xl font-bold leading-tight tracking-tight',
    furigana: 'text-sm sm:text-base font-medium leading-none mb-2',
    romaji: 'text-sm sm:text-base mt-2',
    meaning: 'text-lg mt-2',
  },
};

export function JapaneseText({
  kanji,
  furigana,
  romaji,
  meaning,
  size = 'md',
  className,
}: JapaneseTextProps) {
  const { showFurigana, showRomaji } = useSettingsStore();
  const styles = sizeClasses[size];

  // Nếu từ chỉ có Hiragana (không có Kanji riêng) hoặc furigana trùng với kanji
  const hasDistinctFurigana = Boolean(furigana && furigana !== kanji);

  return (
    <div className={cn('inline-flex flex-col items-start', className)}>
      <ruby className="inline-flex flex-col-reverse items-start font-jp">
        <span className={cn('text-slate-900 font-jp', styles.kanji)}>{kanji}</span>
        <rp>(</rp>
        <rt
          className={cn(
            'font-jp font-normal text-indigo-600 transition-opacity duration-200 select-none tracking-wide',
            styles.furigana,
            showFurigana && hasDistinctFurigana ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={!showFurigana || !hasDistinctFurigana}
        >
          {hasDistinctFurigana ? furigana : '\u00A0'}
        </rt>
        <rp>)</rp>
      </ruby>

      {showRomaji && romaji && (
        <span
          className={cn(
            'font-vn tracking-wide text-slate-400 italic leading-none',
            styles.romaji
          )}
        >
          {romaji}
        </span>
      )}

      {meaning && (
        <span className={cn('text-slate-700 font-vn font-medium', styles.meaning)}>
          {meaning}
        </span>
      )}
    </div>
  );
}
