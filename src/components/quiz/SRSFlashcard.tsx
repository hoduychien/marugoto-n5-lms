'use client';

import React, { useState, useEffect } from 'react';
import { RotateCw, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { JapaneseText } from '@/components/text/JapaneseText';
import { AdvancedAudioPlayer } from '@/components/audio/AdvancedAudioPlayer';
import {
  calculateNextReview,
  getSRSLevelBadge,
  type SRSFeedback,
  type SRSResult,
} from '@/lib/srs-algorithm';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/utils';

export interface VocabularyItem {
  id: number;
  lesson_id?: number;
  kanji?: string | null;
  hiragana: string;
  romaji: string;
  meaning_vn: string;
  audio_url?: string | null;
  example_jp?: string | null;
  example_vn?: string | null;
}

export interface SRSFlashcardProps {
  vocabularyItem: VocabularyItem;
  initialSrsLevel?: number;
  userId?: string | null;
  onRated?: (
    itemId: number,
    feedback: SRSFeedback,
    srsResult: SRSResult
  ) => void;
  className?: string;
}

export function SRSFlashcard({
  vocabularyItem,
  initialSrsLevel,
  userId,
  onRated,
  className,
}: SRSFlashcardProps) {
  const { hydrate, hydrated, getItemLevel, rateItem } = useProgressStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const storedLevel = hydrated
    ? getItemLevel('vocab', vocabularyItem.id)
    : initialSrsLevel ?? 0;

  const [isFlipped, setIsFlipped] = useState(false);
  const [srsLevel, setSrsLevel] = useState<number>(
    initialSrsLevel ?? storedLevel
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đồng bộ lại trạng thái khi chuyển sang thẻ từ vựng khác
  useEffect(() => {
    setIsFlipped(false);
    setSrsLevel(
      initialSrsLevel !== undefined
        ? initialSrsLevel
        : getItemLevel('vocab', vocabularyItem.id)
    );
  }, [vocabularyItem.id, initialSrsLevel, hydrated, getItemLevel]);

  const displayKanji = vocabularyItem.kanji?.trim() || vocabularyItem.hiragana;
  const displayFurigana =
    vocabularyItem.kanji?.trim() &&
    vocabularyItem.kanji.trim() !== vocabularyItem.hiragana
      ? vocabularyItem.hiragana
      : undefined;

  const badge = getSRSLevelBadge(srsLevel);

  const hardPreview = calculateNextReview(srsLevel, 'hard');
  const goodPreview = calculateNextReview(srsLevel, 'good');
  const easyPreview = calculateNextReview(srsLevel, 'easy');

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleRate = async (
    e: React.MouseEvent<HTMLButtonElement>,
    feedback: SRSFeedback
  ) => {
    e.stopPropagation();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const result = rateItem('vocab', vocabularyItem.id, feedback);

    try {
      if (userId && isSupabaseConfigured) {
        const { error } = await supabase.from('user_progress').upsert(
          {
            user_id: userId,
            module_type: 'vocab',
            item_id: vocabularyItem.id,
            srs_level: result.nextLevel,
            next_review_date: result.nextReviewDate.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,module_type,item_id' }
        );
        if (error) throw error;
      }

      setSrsLevel(result.nextLevel);
      toast.success(
        `Đã lưu "${displayKanji}" (Lv.${result.nextLevel}) — Hẹn ôn lại sau ${result.intervalLabel}`
      );

      if (onRated) {
        onRated(vocabularyItem.id, feedback, result);
      }
    } catch {
      toast.error('Không thể đồng bộ tiến độ lên máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('w-full max-w-lg mx-auto select-none', className)}>
      {/* 3D Scene Container */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
        className="perspective-1000 relative h-[25rem] w-full cursor-pointer focus:outline-none"
      >
        <div
          className={cn(
            'preserve-3d relative h-full w-full rounded-lg transition-transform duration-500 ease-out',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* ================= MẶT TRƯỚC (FRONT) ================= */}
          <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 transition-colors">
            {/* Header mặt trước */}
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                  badge.colorClass
                )}
              >
                <Sparkles className="h-3 w-3" />
                {badge.label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <RotateCw className="h-3.5 w-3.5" />
                Chạm hoặc nhấn Space để lật
              </span>
            </div>

            {/* Nội dung chính mặt trước: Kanji / Hiragana / Romaji */}
            <div className="my-auto flex flex-col items-center justify-center text-center py-6">
              <JapaneseText
                kanji={displayKanji}
                furigana={displayFurigana}
                romaji={vocabularyItem.romaji}
                size="xl"
                className="items-center"
              />
            </div>

            {/* Footer mặt trước: Nghe phát âm nhanh hoặc lật thẻ */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">
                Nhớ lại nghĩa trước khi lật thẻ
              </span>
              <AdvancedAudioPlayer
                src={
                  vocabularyItem.audio_url || `tts:${vocabularyItem.hiragana}`
                }
                ttsText={vocabularyItem.hiragana}
                compact
                className="w-auto"
              />
            </div>
          </div>

          {/* ================= MẶT SAU (BACK) ================= */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 transition-colors">
            {/* Header mặt sau */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <JapaneseText
                kanji={displayKanji}
                furigana={displayFurigana}
                romaji={vocabularyItem.romaji}
                size="md"
              />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <RotateCw className="h-3.5 w-3.5" />
                Lật lại mặt trước
              </span>
            </div>

            {/* Nghĩa tiếng Việt & Câu ví dụ & Audio */}
            <div className="my-auto flex flex-col gap-3 py-2">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  Nghĩa tiếng Việt
                </span>
                <p className="text-xl font-bold text-slate-900 mt-0.5 font-vn leading-relaxed">
                  {vocabularyItem.meaning_vn}
                </p>
              </div>

              {(vocabularyItem.example_jp || vocabularyItem.example_vn) && (
                <div className="rounded-lg bg-slate-50/80 border border-slate-100 p-3 text-sm space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Ví dụ ngữ cảnh</span>
                  </div>
                  {vocabularyItem.example_jp && (
                    <p className="font-medium text-slate-800 font-jp">
                      {vocabularyItem.example_jp}
                    </p>
                  )}
                  {vocabularyItem.example_vn && (
                    <p className="text-xs text-slate-500 font-vn leading-relaxed">
                      {vocabularyItem.example_vn}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-1">
                <AdvancedAudioPlayer
                  src={
                    vocabularyItem.audio_url ||
                    `tts:${vocabularyItem.hiragana}`
                  }
                  ttsText={vocabularyItem.hiragana}
                  exampleTtsText={vocabularyItem.example_jp || undefined}
                  compact
                />
              </div>
            </div>

            {/* Cụm 3 nút chấm điểm SRS: Hard / Good / Easy (không bị tràn thẻ) */}
            <div className="pt-3 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => handleRate(e, 'hard')}
                  className="flex flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50 py-2 px-3 text-rose-700 transition-colors hover:bg-rose-100 active:bg-rose-200 focus:outline-none disabled:opacity-50"
                >
                  <span className="text-xs font-bold">Hard (Khó)</span>
                  <span className="text-[10px] text-rose-600/80">
                    {hardPreview.intervalLabel}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => handleRate(e, 'good')}
                  className="flex flex-col items-center justify-center rounded-lg border border-sky-200 bg-sky-50 py-2 px-3 text-sky-700 transition-colors hover:bg-sky-100 active:bg-sky-200 focus:outline-none disabled:opacity-50"
                >
                  <span className="text-xs font-bold">Good (Nhớ)</span>
                  <span className="text-[10px] text-sky-600/80">
                    {goodPreview.intervalLabel}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => handleRate(e, 'easy')}
                  className="flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 py-2 px-3 text-emerald-700 transition-colors hover:bg-emerald-100 active:bg-emerald-200 focus:outline-none disabled:opacity-50"
                >
                  <span className="text-xs font-bold">Easy (Dễ)</span>
                  <span className="text-[10px] text-emerald-600/80">
                    {easyPreview.intervalLabel}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
