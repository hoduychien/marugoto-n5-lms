'use client';

import React, { useState, useMemo, useEffect, useId, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Select, { components, type DropdownIndicatorProps } from 'react-select';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  BookOpen,
  Trophy,
  Flame,
  Sparkles,
  ChevronDown,
  Clock,
  FolderHeart,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'sonner';
import {
  MARUGOTO_LESSONS_SEED,
  MARUGOTO_VOCAB_SEED,
} from '@/lib/data/marugoto-seed';
import { SRSFlashcard, type VocabularyItem } from '@/components/quiz/SRSFlashcard';
import { useProgressStore } from '@/store/useProgressStore';
import type { SRSFeedback } from '@/lib/srs-algorithm';
import { cn } from '@/lib/utils';

interface LessonOption {
  value: number; // 0 = Tất cả bài học, 1..18 = Bài 1..18
  label: string;
}

function CustomDropdownIndicator(
  props: DropdownIndicatorProps<LessonOption, false>
) {
  const isOpen = props.selectProps.menuIsOpen;
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown
        className={cn(
          'h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ease-out',
          isOpen && 'rotate-180 text-indigo-600'
        )}
      />
    </components.DropdownIndicator>
  );
}

function FlashcardsReviewContent() {
  const searchParams = useSearchParams();
  const initialLessonParam = Number(searchParams.get('lesson')) || 1;
  const tooltipId = useId();

  const { hydrate, hydrated, isItemDue, totalExp, currentStreak } =
    useProgressStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const [selectedLessonId, setSelectedLessonId] = useState<number>(
    initialLessonParam >= 1 && initialLessonParam <= 18 ? initialLessonParam : 1
  );
  const [filterMode, setFilterMode] = useState<'all' | 'due'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const lessonOptions: LessonOption[] = useMemo(
    () => [
      { value: 0, label: 'Tất cả 18 bài học (Toàn bộ N5 A1)' },
      ...MARUGOTO_LESSONS_SEED.map((l) => ({
        value: l.id,
        label: l.topic_name,
      })),
    ],
    []
  );

  const selectedLessonOption = useMemo(
    () =>
      lessonOptions.find((o) => o.value === selectedLessonId) ||
      lessonOptions[1],
    [lessonOptions, selectedLessonId]
  );

  // Tập hợp danh sách từ vựng theo bài học và chế độ lọc
  const deck: VocabularyItem[] = useMemo(() => {
    const baseItems: VocabularyItem[] =
      selectedLessonId === 0
        ? Object.values(MARUGOTO_VOCAB_SEED).flat()
        : MARUGOTO_VOCAB_SEED[selectedLessonId] || MARUGOTO_VOCAB_SEED[1];

    const filtered =
      filterMode === 'due' && hydrated
        ? baseItems.filter((item) => isItemDue('vocab', item.id))
        : baseItems;

    if (shuffleSeed === 0) return filtered;

    // Trộn ngẫu nhiên khi người dùng bấm Shuffle
    const copy = [...filtered];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [selectedLessonId, filterMode, hydrated, isItemDue, shuffleSeed]);

  // Reset vị trí thẻ khi đổi bài hoặc đổi bộ lọc
  useEffect(() => {
    setCurrentIndex(0);
    setIsSessionFinished(false);
  }, [selectedLessonId, filterMode, shuffleSeed]);

  const currentCard = deck[currentIndex] || null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsSessionFinished(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionFinished(true);
    }
  };

  const handleShuffle = () => {
    setShuffleSeed((prev) => prev + 1);
    toast.success('Đã trộn ngẫu nhiên bộ thẻ');
  };

  const handleResetSession = () => {
    setCurrentIndex(0);
    setSessionCompletedCount(0);
    setIsSessionFinished(false);
    toast.info('Đã đặt lại phiên ôn tập về thẻ đầu tiên');
  };

  const handleCardRated = (_itemId: number, _feedback: SRSFeedback) => {
    setSessionCompletedCount((prev) => prev + 1);
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsSessionFinished(true);
      }
    }, 550);
  };

  return (
    <main className="mx-auto max-w-4xl p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* ================= TOP HEADER & CONTROLS ================= */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Ôn tập SRS Flashcards
              </h1>
              <p className="text-xs text-slate-500">
                Lặp lại ngắt quãng thông minh giúp nhớ từ vựng lâu dài
              </p>
            </div>
          </div>

          {/* Điểm EXP & Streak & Nút chuyển sang Bộ từ vựng tự tạo */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/my-vocab"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <FolderHeart className="h-3.5 w-3.5 text-indigo-600" />
              <span>Bộ từ vựng của tôi</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              Streak: {currentStreak} ngày
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              {totalExp} EXP
            </span>
          </div>
        </div>

        {/* Bộ lọc Bài học (react-select) & Chế độ ôn tập */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="w-full sm:w-80">
            <Select<LessonOption, false>
              instanceId="flashcard-lesson-select"
              classNamePrefix="react-select"
              options={lessonOptions}
              value={selectedLessonOption}
              onChange={(opt) => {
                if (opt) setSelectedLessonId(opt.value);
              }}
              isSearchable={false}
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: CustomDropdownIndicator,
              }}
              menuPortalTarget={
                typeof document !== 'undefined' ? document.body : null
              }
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 50 }),
                control: (base, state) => ({
                  ...base,
                  minHeight: '36px',
                  height: '36px',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: state.isFocused ? '#6366f1' : '#818cf8',
                  },
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: '34px',
                  padding: '0 10px',
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: '34px',
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: '0 8px 0 4px',
                }),
                menuList: (base) => ({
                  ...base,
                  padding: '4px',
                  maxHeight: '240px',
                }),
                option: (base, state) => ({
                  ...base,
                  fontSize: '12px',
                  padding: '6px 10px',
                  borderRadius: '0.375rem',
                  marginBottom: '2px',
                  backgroundColor: state.isSelected
                    ? '#4f46e5'
                    : state.isFocused
                    ? '#eef2ff'
                    : 'transparent',
                  color: state.isSelected ? 'white' : '#1e293b',
                  cursor: 'pointer',
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Chuyển chế độ: Tất cả vs Cần ôn hôm nay */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none',
                  filterMode === 'all'
                    ? 'bg-white text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Tất cả thẻ
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('due')}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none',
                  filterMode === 'due'
                    ? 'bg-white text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Clock className="h-3 w-3" />
                <span>Cần ôn hôm nay</span>
              </button>
            </div>

            {/* Nút Trộn thẻ (Shuffle) & Học lại từ đầu */}
            <button
              type="button"
              onClick={handleShuffle}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Trộn ngẫu nhiên bộ thẻ"
              aria-label="Shuffle flashcards"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 focus:outline-none active:scale-95 transition-all"
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleResetSession}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Quay về thẻ đầu tiên"
              aria-label="Reset session"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 focus:outline-none active:scale-95 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= FLASHCARD STAGE ================= */}
      {deck.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Trophy className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Tuyệt vời! Bạn đã ôn hết các thẻ đến hạn của bài này
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Chưa có thẻ nào cần ôn lại ngay lúc này. Bạn có thể chuyển sang chế
            độ &ldquo;Tất cả thẻ&rdquo; để luyện tập thêm.
          </p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Xem tất cả thẻ trong bài
          </button>
        </div>
      ) : isSessionFinished ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Trophy className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              Hoàn thành phiên ôn tập!
            </h2>
            <p className="text-sm text-slate-600">
              Bạn đã duyệt qua toàn bộ <strong>{deck.length}</strong> thẻ và
              đánh giá SRS cho <strong>{sessionCompletedCount}</strong> lượt.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetSession}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Ôn lại bộ thẻ này</span>
            </button>
            <Link
              href={`/lessons/${selectedLessonId || 1}/vocab`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Xem bảng từ vựng</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Thanh tiến độ bộ thẻ */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>
                Thẻ <strong className="text-slate-900">{currentIndex + 1}</strong> /{' '}
                {deck.length}
              </span>
              <span>
                Đã chấm điểm phiên này:{' '}
                <strong className="text-indigo-600">
                  {sessionCompletedCount}
                </strong>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${Math.round(((currentIndex + 1) / deck.length) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Thẻ SRS Flashcard 3D */}
          {currentCard && (
            <SRSFlashcard
              key={currentCard.id}
              vocabularyItem={currentCard}
              onRated={handleCardRated}
            />
          )}

          {/* Cụm điều hướng Thẻ trước / Thẻ tiếp theo */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Thẻ trước đó"
              aria-label="Previous card"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Trước</span>
            </button>

            <Link
              href={`/lessons/${currentCard?.lesson_id || selectedLessonId || 1}/vocab`}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Mở danh sách từ vựng của bài học này"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Bài {currentCard?.lesson_id || selectedLessonId || 1}</span>
            </Link>

            <button
              type="button"
              onClick={handleNext}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Thẻ tiếp theo"
              aria-label="Next card"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none"
            >
              <span>Tiếp theo</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Tooltip
        id={tooltipId}
        place="top"
        offset={5}
        style={{
          padding: 0,
          fontSize: '11px',
          lineHeight: '1.3',
          borderRadius: '5px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          zIndex: 50,
        }}
      />
    </main>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl p-8 text-center text-sm text-slate-500">
          Đang tải bộ thẻ SRS Flashcards...
        </main>
      }
    >
      <FlashcardsReviewContent />
    </Suspense>
  );
}
