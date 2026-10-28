'use client';

import React, { useEffect, useId } from 'react';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  Layers,
  GraduationCap,
  Languages,
  MessageSquare,
  Database,
  CheckCircle2,
  Target,
  Sparkles,
  Compass,
  ArrowRight,
  Globe2,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'sonner';
import { JapaneseText } from '@/components/text/JapaneseText';
import { AdvancedAudioPlayer } from '@/components/audio/AdvancedAudioPlayer';
import { LessonSelectSwitcher } from '@/components/layout/LessonSelectSwitcher';
import type { LessonInfo } from '@/lib/data/marugoto-seed';
import type { GrammarPoint } from '@/lib/data/marugoto-grammar-kaiwa-seed';
import type { KanjiItem } from '@/lib/data/marugoto-kanji-seed';
import type { LessonOverview } from '@/lib/data/marugoto-overview-seed';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/utils';

interface OverviewClientProps {
  lesson: LessonInfo;
  overview: LessonOverview;
  vocabCount: number;
  grammars: GrammarPoint[];
  kanjis: KanjiItem[];
  kaiwaLinesCount: number;
  allLessons: LessonInfo[];
  dataSource: 'supabase' | 'seed';
}

export function OverviewClient({
  lesson,
  overview,
  vocabCount,
  grammars,
  kanjis,
  kaiwaLinesCount,
  allLessons,
  dataSource,
}: OverviewClientProps) {
  const tooltipId = useId();
  const { hydrate, hydrated, getItemLevel, rateItem } = useProgressStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const srsLevel = hydrated ? getItemLevel('grammar', lesson.id * 1000) : 0;
  const isCompleted = srsLevel >= 3;

  const handleMarkOverviewRead = () => {
    rateItem('grammar', lesson.id * 1000, 'easy');
    toast.success(`Đã nắm tổng quan lý thuyết Bài ${lesson.order_index}!`, {
      description: '+15 EXP • Bạn đã sẵn sàng đi sâu vào Từ vựng & Ngữ pháp.',
    });
  };

  const moduleTabs = [
    {
      label: 'Lý thuyết',
      href: `/lessons/${lesson.id}/overview`,
      icon: FileText,
      active: true,
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
      active: false,
    },
  ];

  const quickStats = [
    {
      label: 'Từ vựng',
      value: `${vocabCount} từ`,
      href: `/lessons/${lesson.id}/vocab`,
      icon: BookOpen,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Ngữ pháp',
      value: `${grammars.length} mẫu câu`,
      href: `/lessons/${lesson.id}/grammar`,
      icon: GraduationCap,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Chữ Hán',
      value: `${kanjis.length} chữ`,
      href: `/lessons/${lesson.id}/kanji`,
      icon: Languages,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Hội thoại',
      value: `${kaiwaLinesCount} lượt thoại`,
      href: `/lessons/${lesson.id}/kaiwa`,
      icon: MessageSquare,
      color: 'text-violet-600 bg-violet-50 border-violet-100',
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
            moduleSlug="overview"
          />

          {/* Trạng thái nguồn dữ liệu & nút ôn Flashcard */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span
              className={cn(
                'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                dataSource === 'supabase'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              )}
            >
              <Database className="h-3 w-3 shrink-0" />
              <span>
                {dataSource === 'supabase'
                  ? 'Supabase Live DB'
                  : 'Marugoto A1 Theory Blueprint'}
              </span>
            </span>

            <Link
              href={`/flashcards?lesson=${lesson.id}`}
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span>Luyện Flashcard bài {lesson.order_index}</span>
            </Link>
          </div>
        </div>

        {/* Tiêu đề & Tóm tắt bức tranh tổng quan */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                <Compass className="h-3.5 w-3.5 shrink-0" />
                <span>Tổng hợp lý thuyết Bài {lesson.order_index}</span>
              </span>
              {isCompleted && (
                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Đã đọc hiểu</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {lesson.topic_name}
            </h1>
            <p className="font-vn text-sm text-slate-600 leading-relaxed">
              {overview.summary_vn}
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleMarkOverviewRead}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Xác nhận đã nắm tổng quan lý thuyết bài học (+15 EXP)"
              className={cn(
                'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer',
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
              )}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                {isCompleted
                  ? 'Đã nắm tổng quan bài học'
                  : 'Đánh dấu đã hiểu lý thuyết (+15 EXP)'}
              </span>
            </button>
          </div>
        </div>

        {/* Thanh chuyển đổi 5 phân khu trong bài học (Dạng Tabs chuẩn) */}
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

      {/* ================= QUICK STATS & MODULE NAVIGATION ================= */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.href}
              href={stat.href}
              className="group rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3 transition-colors flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div
                  className={cn(
                    'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border',
                    stat.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    {stat.label}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                    {stat.value}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 hidden xl:block" />
            </Link>
          );
        })}
      </div>

      {/* ================= 1. MỤC TIÊU GIAO TIẾP CAN-DO ================= */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Mục tiêu giao tiếp cần đạt (Can-do Objectives)
            </h2>
            <p className="text-xs text-slate-500">
              Sau khi hoàn thành Bài {lesson.order_index}, bạn sẽ có thể tự tin
              thực hiện các kỹ năng sau:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {overview.can_do_objectives.map((objective, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white mt-0.5">
                {idx + 1}
              </span>
              <p className="font-vn text-sm text-slate-800 leading-relaxed">
                {objective}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 2. TRỌNG TÂM LÝ THUYẾT & QUY TẮC CỐT LÕI ================= */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Trọng tâm lý thuyết & Hệ thống kiến thức cốt lõi
            </h2>
            <p className="text-xs text-slate-500">
              Nắm vững các quy tắc nền tảng trước khi làm bài tập và luyện hội
              thoại
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {overview.core_theory_points.map((point, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-4 space-y-2.5"
            >
              <h3 className="font-vn text-sm sm:text-base font-bold text-indigo-950">
                {point.title}
              </h3>
              <p className="font-vn text-sm text-slate-700 leading-relaxed">
                {point.explanation_vn}
              </p>
              {point.highlight_jp && (
                <div className="inline-flex items-center gap-2 rounded-md border border-indigo-100 bg-white px-3 py-1.5 font-jp text-sm font-semibold text-indigo-700">
                  <span>Ví dụ / Công thức:</span>
                  <span className="text-slate-900">{point.highlight_jp}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3. MẪU CÂU GIAO TIẾP CHÌA KHÓA (KEY EXPRESSIONS) ================= */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Cụm câu giao tiếp chìa khóa cần thuộc lòng
              </h2>
              <p className="text-xs text-slate-500">
                Bấm nút loa bên cạnh từng câu để nghe phát âm chuẩn và nhại theo
              </p>
            </div>
          </div>

          <Link
            href={`/lessons/${lesson.id}/kaiwa`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Mở Hội thoại Kaiwa</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {overview.key_expressions.map((expr, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-slate-200/80 bg-white p-4"
            >
              <div className="space-y-1.5 min-w-0">
                <JapaneseText
                  kanji={expr.jp}
                  furigana={expr.furigana}
                  romaji={expr.romaji}
                  size="md"
                />
                <p className="font-vn text-sm font-semibold text-slate-800">
                  {expr.vn}
                </p>
                <p className="font-vn text-xs text-slate-500">
                  💡 {expr.usage_note}
                </p>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <AdvancedAudioPlayer
                  src=""
                  compact
                  ttsText={expr.furigana || expr.jp}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. TÓM TẮT CÔNG THỨC NGỮ PHÁP & HÁN TỰ TRONG BÀI ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Tóm tắt nhanh các mẫu ngữ pháp */}
        <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 space-y-3.5 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate min-w-0">
              Mẫu Ngữ pháp Bài {lesson.order_index}
            </h2>
            <Link
              href={`/lessons/${lesson.id}/grammar`}
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {grammars.map((g, idx) => (
              <div
                key={g.id}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 sm:p-3 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                    #{idx + 1}
                  </span>
                  <span className="font-jp text-xs sm:text-sm font-bold text-indigo-950">
                    {g.pattern}
                  </span>
                </div>
                <p className="font-vn text-xs font-medium text-slate-700">
                  → {g.meaning_vn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tóm tắt chữ Kanji & Góc Văn hóa */}
        <div className="space-y-4 sm:space-y-5 min-w-0">
          {/* Danh sách Kanji trong bài */}
          <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate min-w-0">
                Hán tự (Kanji) trong bài
              </h2>
              <Link
                href={`/lessons/${lesson.id}/kanji`}
                className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>Luyện viết Kanji</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {kanjis.map((k) => (
                <Link
                  key={k.id}
                  href={`/lessons/${lesson.id}/kanji`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 sm:px-3 sm:py-1.5 hover:bg-indigo-50/50 hover:text-indigo-700 transition-colors"
                >
                  <span className="font-jp text-lg sm:text-xl font-bold text-indigo-950">
                    {k.character}
                  </span>
                  <div className="text-left">
                    {k.han_viet && (
                      <p className="text-[10px] font-bold uppercase text-indigo-600 leading-none">
                        {k.han_viet}
                      </p>
                    )}
                    <p className="font-vn text-xs text-slate-600">
                      {k.meaning_vn}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Góc Văn hóa Nhật Bản (Bunka Notes) */}
          <section className="rounded-lg border border-amber-200 bg-amber-50/50 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-800">
              <Globe2 className="h-4 w-4 shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Góc Văn hóa & Lưu ý thực tế tại Nhật
              </h2>
            </div>
            <ul className="space-y-2">
              {overview.cultural_notes.map((note, idx) => (
                <li
                  key={idx}
                  className="font-vn text-sm text-slate-700 leading-relaxed flex items-start gap-2"
                >
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
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
