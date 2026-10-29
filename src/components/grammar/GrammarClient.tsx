'use client';

import React, { useState, useMemo, useEffect, useId } from 'react';
import Link from 'next/link';
import {
  Search,
  FileText,
  BookOpen,
  Layers,
  GraduationCap,
  Languages,
  MessageSquare,
  Database,
  CheckCircle2,
  Lightbulb,
  NotebookPen,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'sonner';
import { AdvancedAudioPlayer } from '@/components/audio/AdvancedAudioPlayer';
import { LessonSelectSwitcher } from '@/components/layout/LessonSelectSwitcher';
import type { LessonInfo } from '@/lib/data/marugoto-seed';
import type { GrammarPoint } from '@/lib/data/marugoto-grammar-kaiwa-seed';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/utils';

interface GrammarClientProps {
  lesson: LessonInfo;
  grammars: GrammarPoint[];
  allLessons: LessonInfo[];
  dataSource: 'supabase' | 'seed';
}

export function GrammarClient({
  lesson,
  grammars,
  allLessons,
  dataSource,
}: GrammarClientProps) {
  const tooltipId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const { showRomaji } = useSettingsStore();
  const { hydrate, hydrated, getItemLevel, rateItem } = useProgressStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const filteredGrammars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return grammars;

    return grammars.filter(
      (item) =>
        item.pattern.toLowerCase().includes(q) ||
        item.meaning_vn.toLowerCase().includes(q) ||
        item.explanation_vn.toLowerCase().includes(q) ||
        item.examples.some(
          (ex) =>
            ex.jp.toLowerCase().includes(q) ||
            ex.romaji.toLowerCase().includes(q) ||
            ex.vn.toLowerCase().includes(q)
        )
    );
  }, [grammars, searchQuery]);

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
      active: true,
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
    {
      label: 'Ghi chép (Take Note)',
      href: `/lessons/${lesson.id}/notes`,
      icon: NotebookPen,
      active: false,
    },
  ];

  const handleMarkUnderstood = (item: GrammarPoint) => {
    rateItem('grammar', item.id, 'easy');
    toast.success(`Đã nắm vững mẫu câu 「${item.pattern}」`, {
      description: '+15 EXP • Đã lưu tiến độ ngữ pháp của bạn.',
    });
  };

  return (
    <main className="w-full max-w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 overflow-hidden">
      {/* ================= LESSON SWITCHER & HEADER ================= */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Bộ chọn bài học (Select dropdown & quick prev/next) */}
          <LessonSelectSwitcher
            currentLessonId={lesson.id}
            allLessons={allLessons}
            moduleSlug="grammar"
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
                : 'Marugoto A1 Grammar (18 Bài)'}
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

        {/* Tiêu đề bài học */}
        <div className="space-y-1 pt-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {lesson.topic_name}
          </h1>
          <p className="text-sm text-slate-600">
            Tổng hợp các mẫu ngữ pháp trọng tâm và ví dụ giao tiếp thực tế trong Bài{' '}
            {lesson.order_index}.
          </p>
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

      {/* ================= TOOLBAR: SEARCH & STATS ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mẫu câu, giải thích hoặc câu ví dụ..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>
            Hiển thị{' '}
            <strong className="text-slate-900">{filteredGrammars.length}</strong>{' '}
            / {grammars.length} chủ điểm ngữ pháp
          </span>
        </div>
      </div>

      {/* ================= GRAMMAR LIST ================= */}
      {filteredGrammars.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-medium text-slate-700">
            Không tìm thấy mẫu ngữ pháp nào khớp với &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 rounded-lg bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredGrammars.map((item, index) => {
            const srsLevel = hydrated ? getItemLevel('grammar', item.id) : 0;
            const isMastered = srsLevel >= 3;

            return (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 transition-colors space-y-4"
              >
                {/* Header: Số thứ tự, Cấu trúc ngữ pháp & Nút đánh dấu đã hiểu */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex shrink-0 whitespace-nowrap items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                        Mẫu #{index + 1}
                      </span>
                      {isMastered && (
                        <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Đã nắm vững</span>
                        </span>
                      )}
                    </div>
                    <h2 className="font-jp text-xl sm:text-2xl font-bold text-indigo-950 tracking-tight">
                      {item.pattern}
                    </h2>
                    <p className="font-vn text-base font-semibold text-indigo-700">
                      {item.meaning_vn}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMarkUnderstood(item)}
                    data-tooltip-id={tooltipId}
                    data-tooltip-content={
                      isMastered
                        ? 'Ôn lại mẫu câu này (+15 EXP)'
                        : 'Đánh dấu đã hiểu mẫu ngữ pháp này (+15 EXP)'
                    }
                    className={cn(
                      'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer',
                      isMastered
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{isMastered ? 'Đã hiểu' : 'Đánh dấu đã hiểu'}</span>
                  </button>
                </div>

                {/* Giải thích chi tiết */}
                <div className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 border border-amber-200/70 p-3.5 text-sm text-slate-700">
                  <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="font-vn leading-relaxed">{item.explanation_vn}</p>
                </div>

                {/* Danh sách câu ví dụ */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Ví dụ minh họa ({item.examples.length})
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.examples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="flex items-start justify-between gap-3 rounded-lg bg-slate-50/90 border border-slate-100 p-3.5"
                      >
                        <div className="space-y-1 min-w-0">
                          <p className="font-jp text-base font-medium text-slate-900 leading-relaxed">
                            {ex.jp}
                          </p>
                          {showRomaji && (
                            <p className="text-xs italic text-slate-500">
                              {ex.romaji}
                            </p>
                          )}
                          <p className="font-vn text-sm text-slate-700 pt-0.5">
                            {ex.vn}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <AdvancedAudioPlayer
                            src=""
                            compact
                            ttsText={ex.jp}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Tooltip
        id={tooltipId}
        place="top"
        offset={6}
        className="!z-50 !rounded-[5px] !bg-slate-900 !px-2 !py-1 !text-[11px] !font-medium !leading-none !text-white"
      />
    </main>
  );
}
