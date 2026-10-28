'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Select, { components, type DropdownIndicatorProps } from 'react-select';
import {
  Search,
  FileText,
  BookOpen,
  Layers,
  GraduationCap,
  Languages,
  MessageSquare,
  Database,
  Sparkles,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import { JapaneseText } from '@/components/text/JapaneseText';
import { AdvancedAudioPlayer } from '@/components/audio/AdvancedAudioPlayer';
import { LessonSelectSwitcher } from '@/components/layout/LessonSelectSwitcher';
import type { VocabularyItem } from '@/components/quiz/SRSFlashcard';
import type { LessonInfo, LessonAudioTrack } from '@/lib/data/marugoto-seed';
import { cn } from '@/lib/utils';

interface TrackOption {
  value: string;
  label: string;
}

function CustomDropdownIndicator(
  props: DropdownIndicatorProps<TrackOption, false>
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

interface VocabGridClientProps {
  lesson: LessonInfo;
  vocabularies: VocabularyItem[];
  allLessons: LessonInfo[];
  audioTracks: LessonAudioTrack[];
  dataSource: 'supabase' | 'seed';
}

export function VocabGridClient({
  lesson,
  vocabularies,
  allLessons,
  audioTracks,
  dataSource,
}: VocabGridClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackUrl, setSelectedTrackUrl] = useState<string>(
    audioTracks[0]?.url || lesson.lesson_audio_url || ''
  );

  const trackOptions = useMemo(
    () =>
      audioTracks.map((track) => ({
        value: track.url,
        label: track.label,
      })),
    [audioTracks]
  );

  const selectedTrackOption = useMemo(
    () =>
      trackOptions.find((opt) => opt.value === selectedTrackUrl) ||
      trackOptions[0] ||
      null,
    [trackOptions, selectedTrackUrl]
  );

  const filteredVocabs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return vocabularies;

    return vocabularies.filter(
      (item) =>
        (item.kanji && item.kanji.toLowerCase().includes(q)) ||
        item.hiragana.toLowerCase().includes(q) ||
        item.romaji.toLowerCase().includes(q) ||
        item.meaning_vn.toLowerCase().includes(q)
    );
  }, [vocabularies, searchQuery]);

  const moduleTabs = [
    {
      label: 'Lý thuyết',
      href: `/lessons/${lesson.id}/overview`,
      icon: FileText,
      active: false,
    },
    {
      label: 'Từ vựng',
      href: `/lessons/${lesson.id}/vocab`,
      icon: BookOpen,
      active: true,
    },
    {
      label: 'Ngữ pháp',
      href: `/lessons/${lesson.id}/grammar`,
      icon: GraduationCap,
      active: false,
    },
    {
      label: 'Hán tự (Kanji)',
      href: `/lessons/${lesson.id}/kanji`,
      icon: Languages,
      active: false,
    },
    {
      label: 'Hội thoại (Kaiwa)',
      href: `/lessons/${lesson.id}/kaiwa`,
      icon: MessageSquare,
      active: false,
    },
  ];

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ================= LESSON SWITCHER & HEADER ================= */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Bộ chọn bài học (Select dropdown & quick prev/next) */}
          <LessonSelectSwitcher
            currentLessonId={lesson.id}
            allLessons={allLessons}
            moduleSlug="vocab"
          />

          {/* Trạng thái nguồn dữ liệu & nút ôn Flashcard */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                dataSource === 'supabase'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              )}
            >
              <Database className="h-3 w-3" />
              {dataSource === 'supabase'
                ? 'Supabase Live DB'
                : 'Marugoto A1 Wordbook (Chuẩn PDF)'}
            </span>

            <Link
              href={`/flashcards?lesson=${lesson.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Luyện Flashcard bài {lesson.order_index}</span>
            </Link>
          </div>
        </div>

        {/* Tiêu đề & Trình nghe MP3 gốc của bài học */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {lesson.topic_name}
            </h1>
            {lesson.description && (
              <p className="text-sm text-slate-600 max-w-2xl">
                {lesson.description}
              </p>
            )}
          </div>

          {/* Cụm chọn và nghe các file MP3 gốc của bài học từ thư mục docs */}
          {audioTracks.length > 0 && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 lg:w-[26rem] shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
                  <Headphones className="h-3.5 w-3.5 text-indigo-600" />
                  Audio gốc ({audioTracks.length})
                </span>
                <div className="w-56">
                  <Select<TrackOption, false>
                    instanceId="lesson-audio-track-select"
                    classNamePrefix="react-select"
                    options={trackOptions}
                    value={selectedTrackOption}
                    onChange={(opt) => {
                      if (opt?.value) setSelectedTrackUrl(opt.value);
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
                        minHeight: '32px',
                        height: '32px',
                        borderRadius: '0.625rem',
                        fontSize: '12px',
                        borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        '&:hover': {
                          borderColor: state.isFocused ? '#6366f1' : '#818cf8',
                        },
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        height: '30px',
                        padding: '0 10px',
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: '30px',
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        padding: '0 8px 0 4px',
                      }),
                      menuList: (base) => ({
                        ...base,
                        padding: '4px',
                        maxHeight: '220px',
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: '12px',
                        padding: '6px 10px',
                        borderRadius: '0.5rem',
                        marginBottom: '2px',
                        backgroundColor: state.isSelected
                          ? '#4f46e5'
                          : state.isFocused
                          ? '#eef2ff'
                          : 'transparent',
                        color: state.isSelected ? 'white' : '#1e293b',
                        cursor: 'pointer',
                        transition: 'background-color 120ms ease',
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        border: '1px solid #cbd5e1',
                        boxShadow: 'none',
                      }),
                    }}
                  />
                </div>
              </div>
              <AdvancedAudioPlayer
                src={selectedTrackUrl}
                className="max-w-none border-slate-200/80 shadow-none"
              />
            </div>
          )}
        </div>

        {/* Thanh chuyển đổi phân khu trong bài học (Dạng Tabs chuẩn) */}
        <div className="border-t border-slate-100 pt-2 -mb-1">
          <nav className="-mb-px flex items-center gap-[10px] overflow-x-auto no-scrollbar border-b border-slate-200" aria-label="Tabs bài học">
            {moduleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'group inline-flex items-center gap-1.5 border-b-2 pb-3 pt-2 px-1 text-[12px] whitespace-nowrap transition-all shrink-0',
                    tab.active
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      tab.active
                        ? 'text-indigo-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ================= SEARCH BAR & STATS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm từ vựng theo Kanji, Hiragana, Romaji hoặc nghĩa..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>
            Hiển thị{' '}
            <strong className="text-slate-900">{filteredVocabs.length}</strong> /{' '}
            {vocabularies.length} từ vựng (Mỗi từ có phát âm chuẩn riêng + đọc câu ví dụ)
          </span>
        </div>
      </div>

      {/* ================= VOCABULARY GRID ================= */}
      {filteredVocabs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-700">
            Không tìm thấy từ vựng phù hợp với &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVocabs.map((vocab, index) => {
            const displayKanji = vocab.kanji?.trim() || vocab.hiragana;
            const displayFurigana =
              vocab.kanji?.trim() && vocab.kanji.trim() !== vocab.hiragana
                ? vocab.hiragana
                : undefined;

            return (
              <article
                key={vocab.id}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 transition-colors"
              >
                <div className="space-y-3.5">
                  {/* Số thứ tự & Từ vựng tiếng Nhật */}
                  <div className="flex items-start justify-between gap-3">
                    <JapaneseText
                      kanji={displayKanji}
                      furigana={displayFurigana}
                      romaji={vocab.romaji}
                      size="lg"
                    />
                    <span className="inline-flex h-6 min-w-[1.75rem] shrink-0 items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-500">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Nghĩa tiếng Việt */}
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-base font-semibold text-slate-900 leading-relaxed font-vn">
                      {vocab.meaning_vn}
                    </p>
                  </div>

                  {/* Câu ví dụ */}
                  {(vocab.example_jp || vocab.example_vn) && (
                    <div className="rounded-lg bg-slate-50/80 p-3 text-xs space-y-1.5 border border-slate-100">
                      {vocab.example_jp && (
                        <p className="font-medium text-slate-800 leading-relaxed font-jp text-sm">
                          {vocab.example_jp}
                        </p>
                      )}
                      {vocab.example_vn && (
                        <p className="text-slate-500 leading-relaxed font-vn">
                          {vocab.example_vn}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Thanh Icon điều khiển âm thanh tinh gọn */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <AdvancedAudioPlayer
                    src={vocab.audio_url || `tts:${vocab.hiragana}`}
                    ttsText={vocab.hiragana}
                    exampleTtsText={vocab.example_jp || undefined}
                    compact
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
