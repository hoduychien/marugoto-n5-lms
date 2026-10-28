'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { JapaneseText } from '@/components/text/JapaneseText';
import type { CustomVocabDeck, CustomVocabWord } from '@/store/useCustomVocabStore';
import { useCustomVocabStore } from '@/store/useCustomVocabStore';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/utils';

export interface CustomDeckFlashcardsProps {
  deck: CustomVocabDeck;
  onClose: () => void;
}

export function CustomDeckFlashcards({ deck, onClose }: CustomDeckFlashcardsProps) {
  const { toggleWordMastered } = useCustomVocabStore();
  const { addExp } = useProgressStore();

  const [cards, setCards] = useState<CustomVocabWord[]>(() => [...deck.words]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [needReviewCount, setNeedReviewCount] = useState(0);

  // Cập nhật thẻ khi bộ từ vựng thay đổi
  useEffect(() => {
    setCards([...deck.words]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setRememberedCount(0);
    setNeedReviewCount(0);
  }, [deck.id]);

  const currentCard: CustomVocabWord | undefined = cards[currentIndex];

  // Phát âm tiếng Nhật bằng Web Speech API
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    const copy = [...cards];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setCards(copy);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    toast.success('Đã xáo trộn thứ tự các thẻ');
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setRememberedCount(0);
    setNeedReviewCount(0);
  };

  const handleRate = (remembered: boolean) => {
    if (!currentCard) return;

    if (remembered) {
      setRememberedCount((prev) => prev + 1);
      if (!currentCard.isMastered) {
        toggleWordMastered(deck.id, currentCard.id);
      }
      addExp(10);
      toast.success('Đã ghi nhận nhớ từ (+10 EXP)', { duration: 1200 });
    } else {
      setNeedReviewCount((prev) => prev + 1);
      if (currentCard.isMastered) {
        toggleWordMastered(deck.id, currentCard.id);
      }
      toast.info('Sẽ ôn lại từ này trong phiên tới', { duration: 1200 });
    }

    handleNext();
  };

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <XCircle className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Bộ từ này chưa có từ vựng nào!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Hãy thêm một vài từ vựng vào bộ &ldquo;{deck.title}&rdquo; trước khi
            bắt đầu luyện Flashcard nhé.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại thêm từ</span>
        </button>
      </div>
    );
  }

  if (isFinished) {
    const percent = Math.round((rememberedCount / cards.length) * 100);
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Trophy className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hoàn thành phiên luyện tập</span>
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Xuất sắc! Bạn đã duyệt hết {cards.length} thẻ
          </h2>
          <p className="text-sm text-slate-600">
            Bộ từ vựng: <strong>{deck.title}</strong>
          </p>
        </div>

        {/* Thống kê phiên */}
        <div className="mx-auto max-w-sm grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 text-center">
            <p className="text-xs font-medium text-emerald-700">Đã nhớ tốt</p>
            <p className="text-2xl font-bold text-emerald-800">
              {rememberedCount}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 text-center">
            <p className="text-xs font-medium text-amber-700">Cần ôn lại</p>
            <p className="text-2xl font-bold text-amber-800">{needReviewCount}</p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Luyện lại từ đầu</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại danh sách từ</span>
          </button>
        </div>
      </div>
    );
  }

  const displayKanji = currentCard.kanji || currentCard.hiragana;
  const displayFurigana =
    currentCard.kanji && currentCard.kanji !== currentCard.hiragana
      ? currentCard.hiragana
      : undefined;

  return (
    <div className="space-y-4">
      {/* Top Controls: Thoát, Tiến độ, Xáo trộn */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Danh sách từ</span>
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-indigo-700">
            Thẻ {currentIndex + 1} / {cards.length}
          </span>
          <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
            {deck.title}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShuffle}
            title="Xáo trộn ngẫu nhiên"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRestart}
            title="Luyện lại từ đầu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Scene Container (Chuẩn hiệu ứng lật thẻ 3D như SRS Flashcard) */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          }
        }}
        className="perspective-1000 relative h-[25rem] w-full cursor-pointer focus:outline-none select-none"
      >
        <div
          className={cn(
            'preserve-3d relative h-full w-full rounded-xl transition-transform duration-500 ease-out',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* ================= MẶT TRƯỚC (FRONT) ================= */}
          <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors">
            {/* Header mặt trước */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                <Sparkles className="h-3 w-3" />
                Mặt trước • Từ vựng
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
                romaji={currentCard.romaji}
                size="xl"
                className="items-center"
              />
            </div>

            {/* Footer mặt trước: Nghe phát âm & Gợi ý */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">
                Nhớ lại nghĩa trước khi lật thẻ
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(currentCard.hiragana);
                }}
                title="Nghe phát âm tiếng Nhật"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-slate-50 transition-colors"
              >
                <Volume2 className="h-4 w-4" />
                <span>Phát âm</span>
              </button>
            </div>
          </div>

          {/* ================= MẶT SAU (BACK) ================= */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors">
            {/* Header mặt sau */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <JapaneseText
                kanji={displayKanji}
                furigana={displayFurigana}
                romaji={currentCard.romaji}
                size="md"
              />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <RotateCw className="h-3.5 w-3.5" />
                Lật lại mặt trước
              </span>
            </div>

            {/* Nghĩa tiếng Việt & Câu ví dụ */}
            <div className="my-auto flex flex-col gap-3 py-2 overflow-y-auto no-scrollbar">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  Nghĩa tiếng Việt
                </span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 font-vn leading-relaxed">
                  {currentCard.meaning_vn}
                </p>
              </div>

              {(currentCard.example_jp || currentCard.example_vn) && (
                <div className="rounded-lg bg-slate-50/80 border border-slate-100 p-3 text-sm space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Ví dụ ngữ cảnh</span>
                  </div>
                  {currentCard.example_jp && (
                    <p className="font-medium text-slate-800 font-jp">
                      {currentCard.example_jp}
                    </p>
                  )}
                  {currentCard.example_vn && (
                    <p className="text-xs text-slate-500 font-vn leading-relaxed">
                      {currentCard.example_vn}
                    </p>
                  )}
                </div>
              )}

              {currentCard.notes && (
                <p className="text-xs text-slate-500 italic">
                  💡 {currentCard.notes}
                </p>
              )}
            </div>

            {/* Footer mặt sau: Phát âm lại */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">
                Đánh giá mức độ ghi nhớ bên dưới
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(currentCard.hiragana);
                }}
                title="Nghe lại phát âm"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-slate-50 transition-colors"
              >
                <Volume2 className="h-4 w-4" />
                <span>Nghe lại</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons: Đánh giá nhớ / Chưa nhớ & Tiến lùi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Nút Lùi thẻ */}
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Thẻ trước</span>
        </button>

        {/* Cụm 2 nút đánh giá nhanh: Chưa nhớ vs Đã nhớ */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-center">
          <button
            type="button"
            onClick={() => handleRate(false)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            <span>Chưa nhớ (Học lại)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRate(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Đã nhớ vững (+10 EXP)</span>
          </button>
        </div>

        {/* Nút Bỏ qua / Thẻ tiếp theo */}
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
        >
          <span>Tiếp theo</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
