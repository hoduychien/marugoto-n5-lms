'use client';

import React, { useState, useMemo, useEffect, useId } from 'react';
import Link from 'next/link';
import Select, {
  components,
  type DropdownIndicatorProps,
} from 'react-select';
import {
  FileText,
  BookOpen,
  Layers,
  GraduationCap,
  Languages,
  MessageSquare,
  Database,
  Headphones,
  ChevronDown,
  Eye,
  EyeOff,
  CheckCircle2,
  NotebookPen,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'sonner';
import { JapaneseText } from '@/components/text/JapaneseText';
import { AdvancedAudioPlayer } from '@/components/audio/AdvancedAudioPlayer';
import { LessonSelectSwitcher } from '@/components/layout/LessonSelectSwitcher';
import type { LessonInfo, LessonAudioTrack } from '@/lib/data/marugoto-seed';
import type { KaiwaDialogue } from '@/lib/data/marugoto-grammar-kaiwa-seed';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/utils';

interface TrackOption {
  value: string;
  label: string;
}

const CustomDropdownIndicator = (
  props: DropdownIndicatorProps<TrackOption, false>
) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown
        className={cn(
          'h-3.5 w-3.5 text-slate-500 transition-transform duration-200',
          props.selectProps.menuIsOpen && 'rotate-180 text-indigo-600'
        )}
      />
    </components.DropdownIndicator>
  );
};

interface KaiwaClientProps {
  lesson: LessonInfo;
  dialogue: KaiwaDialogue;
  audioTracks: LessonAudioTrack[];
  allLessons: LessonInfo[];
  dataSource: 'supabase' | 'seed';
}

export function KaiwaClient({
  lesson,
  dialogue,
  audioTracks,
  allLessons,
  dataSource,
}: KaiwaClientProps) {
  const tooltipId = useId();
  const [showTranslation, setShowTranslation] = useState(true);
  const [selectedTrackUrl, setSelectedTrackUrl] = useState<string>(
    audioTracks[0]?.url || ''
  );

  const { hydrate, hydrated, getItemLevel, rateItem } = useProgressStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setSelectedTrackUrl(audioTracks[0]?.url || '');
  }, [audioTracks]);

  const trackOptions = useMemo<TrackOption[]>(
    () =>
      audioTracks.map((track) => ({
        value: track.url,
        label: track.label,
      })),
    [audioTracks]
  );

  const selectedTrackOption = useMemo<TrackOption | null>(
    () =>
      trackOptions.find((opt) => opt.value === selectedTrackUrl) ||
      trackOptions[0] ||
      null,
    [trackOptions, selectedTrackUrl]
  );

  const srsLevel = hydrated ? getItemLevel('kaiwa', dialogue.id) : 0;
  const isCompleted = srsLevel >= 3;

  const handleCompleteKaiwa = () => {
    rateItem('kaiwa', dialogue.id, 'easy');
    toast.success(`Đã hoàn thành hội thoại Bài ${lesson.order_index}!`, {
      description: '+15 EXP • Kỹ năng nghe & phản xạ Kaiwa đã được ghi nhận.',
    });
  };

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
      active: false,
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
      active: true,
    },
    {
      label: 'Ghi chép (Take Note)',
      href: `/lessons/${lesson.id}/notes`,
      icon: NotebookPen,
      active: false,
    },
  ];

  return (
    <main className="w-full max-w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 overflow-hidden">
      {/* ================= LESSON SWITCHER & HEADER ================= */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Bộ chọn bài học (Select dropdown & quick prev/next) */}
          <LessonSelectSwitcher
            currentLessonId={lesson.id}
            allLessons={allLessons}
            moduleSlug="kaiwa"
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
                : 'Marugoto A1 Kaiwa & MP3'}
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
            <p className="text-sm text-slate-600 max-w-2xl">
              Luyện nghe hiểu và đọc nhại (Shadowing) hội thoại thực tế kèm file
              MP3 gốc của giáo trình Marugoto A1.
            </p>
          </div>

          {/* Cụm chọn và nghe các file MP3 gốc của bài học */}
          {audioTracks.length > 0 && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 lg:w-[26rem] shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
                  <Headphones className="h-3.5 w-3.5 text-indigo-600" />
                  Audio gốc ({audioTracks.length})
                </span>
                <div className="w-56">
                  <Select<TrackOption, false>
                    instanceId="kaiwa-audio-track-select"
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

      {/* ================= KAIWA DIALOGUE CONTAINER ================= */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-6">
        {/* Header tình huống hội thoại & Nút điều khiển */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                Kịch bản Kaiwa Bài {lesson.order_index}
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã hoàn thành
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {dialogue.title}
            </h2>
            <p className="font-vn text-sm text-slate-600">
              <strong className="font-semibold text-slate-700">
                Tình huống:
              </strong>{' '}
              {dialogue.situation_vn}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowTranslation((prev) => !prev)}
              data-tooltip-id={tooltipId}
              data-tooltip-content={
                showTranslation
                  ? 'Ẩn nghĩa tiếng Việt để luyện nghe hiểu'
                  : 'Hiện nghĩa tiếng Việt của từng câu thoại'
              }
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {showTranslation ? (
                <>
                  <EyeOff className="h-4 w-4 shrink-0 text-slate-500" />
                  <span>Ẩn dịch Tiếng Việt</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span>Hiện dịch Tiếng Việt</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCompleteKaiwa}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Đánh dấu hoàn thành bài luyện hội thoại (+25 EXP)"
              className={cn(
                'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
              )}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                {isCompleted ? 'Đã luyện xong' : 'Hoàn thành Kaiwa (+25 EXP)'}
              </span>
            </button>
          </div>
        </div>

        {/* Danh sách từng lượt lời thoại (Không viền, Không màu nền, Không icon người, Lượt chẵn 2, 4, 6... lệch hẳn sang phải) */}
        <div className="space-y-8 pt-3">
          {dialogue.lines.map((line, index) => {
            // Lượt 1, 3, 5... (index 0, 2, 4...) -> Nằm bên TRÁI
            // Lượt 2, 4, 6... (index 1, 3, 5...) -> Nằm nghiêng hoàn toàn về phía TAY PHẢI
            const isRightSide = index % 2 === 1;

            return (
              <div
                key={index}
                className={cn(
                  'flex w-full',
                  isRightSide ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Khung nội dung lời thoại: Không viền, Không màu nền, Tối giản hoàn toàn */}
                <div
                  className={cn(
                    'flex flex-col space-y-2 max-w-[88%] sm:max-w-[76%] md:max-w-[68%]',
                    isRightSide ? 'items-end text-right' : 'items-start text-left'
                  )}
                >
                  {/* Tên người nói & Lượt thoại */}
                  <div
                    className={cn(
                      'flex items-center gap-2',
                      isRightSide ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <span className="text-xs font-bold text-slate-800">
                      {line.speaker}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      Lượt #{index + 1}
                    </span>
                  </div>

                  {/* Câu tiếng Nhật */}
                  <div className={cn('py-0.5', isRightSide ? 'flex justify-end' : 'flex justify-start')}>
                    <JapaneseText
                      kanji={line.kanji}
                      furigana={line.furigana}
                      romaji={line.romaji}
                      size="md"
                      className={isRightSide ? 'items-end' : 'items-start'}
                    />
                  </div>

                  {/* Nghĩa tiếng Việt */}
                  {showTranslation && (
                    <p className="font-vn text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {line.meaning_vn}
                    </p>
                  )}

                  {/* Nút thao tác nằm ngay dưới câu thoại */}
                  <div
                    className={cn(
                      'flex items-center gap-2 pt-1',
                      isRightSide ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <AdvancedAudioPlayer
                      src=""
                      compact
                      ttsText={line.furigana || line.kanji}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Tooltip
        id={tooltipId}
        place="top"
        offset={6}
        className="!z-50 !rounded-[5px] !bg-slate-900 !px-2 !py-1 !text-[11px] !font-medium !leading-none !text-white"
      />
    </main>
  );
}
