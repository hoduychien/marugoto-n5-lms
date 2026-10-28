'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
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
  Sparkles,
  PenTool,
  Eraser,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'sonner';
import { AdvancedAudioPlayer } from '@/components/audio/AdvancedAudioPlayer';
import { LessonSelectSwitcher } from '@/components/layout/LessonSelectSwitcher';
import type { LessonInfo } from '@/lib/data/marugoto-seed';
import type { KanjiItem } from '@/lib/data/marugoto-kanji-seed';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/utils';

interface KanjiGridClientProps {
  lesson: LessonInfo;
  kanjis: KanjiItem[];
  allLessons: LessonInfo[];
  dataSource: 'supabase' | 'seed';
}

export function KanjiGridClient({
  lesson,
  kanjis,
  allLessons,
  dataSource,
}: KanjiGridClientProps) {
  const tooltipId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [practiceKanji, setPracticeKanji] = useState<KanjiItem | null>(null);

  const { hydrate, hydrated, getItemLevel, rateItem } = useProgressStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Canvas luyện viết Kanji
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (practiceKanji) {
      setTimeout(clearCanvas, 50);
    }
  }, [practiceKanji]);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : e.nativeEvent.clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : e.nativeEvent.clientY;

    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : e.nativeEvent.clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : e.nativeEvent.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const filteredKanjis = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return kanjis;

    return kanjis.filter(
      (item) =>
        item.character.toLowerCase().includes(q) ||
        item.yomikata.toLowerCase().includes(q) ||
        (item.han_viet && item.han_viet.toLowerCase().includes(q)) ||
        (item.onyomi && item.onyomi.toLowerCase().includes(q)) ||
        (item.kunyomi && item.kunyomi.toLowerCase().includes(q)) ||
        item.meaning_vn.toLowerCase().includes(q)
    );
  }, [kanjis, searchQuery]);

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
      active: true,
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
            moduleSlug="kanji"
          />

          {/* Trạng thái nguồn dữ liệu */}
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
                : 'Marugoto A1 Kanji List (Chuẩn PDF)'}
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

        {/* Tiêu đề & mô tả bài học */}
        <div className="space-y-1 pt-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {lesson.topic_name}
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl">
            Hán tự trọng tâm của bài học (Âm Hán Việt, Onyomi, Kunyomi và luyện
            viết nét).
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

      {/* ================= SEARCH BAR & STATS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo chữ Hán, âm Hán Việt, cách đọc hoặc nghĩa..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>
            Hiển thị{' '}
            <strong className="text-slate-900">{filteredKanjis.length}</strong> /{' '}
            {kanjis.length} chữ Kanji
          </span>
        </div>
      </div>

      {/* ================= KANJI GRID (ĐỒNG BỘ TINH GỌN NHƯ CARD TỪ VỰNG) ================= */}
      {filteredKanjis.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-700">
            Không tìm thấy chữ Kanji phù hợp với &ldquo;{searchQuery}&rdquo;
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
          {filteredKanjis.map((kanjiItem, index) => {
            const isMastered =
              hydrated && getItemLevel('kanji', kanjiItem.id) >= 3;

            return (
              <article
                key={kanjiItem.id}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 transition-colors"
              >
                <div className="space-y-3.5">
                  {/* Dòng 1: Chữ Kanji đơn to rõ + Âm Hán Việt & Số thứ tự */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <span className="font-jp text-4xl font-bold text-slate-900 leading-none select-all">
                        {kanjiItem.character}
                      </span>
                      <div className="space-y-1">
                        {kanjiItem.han_viet && (
                          <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                            {kanjiItem.han_viet}
                          </span>
                        )}
                        <p className="text-xs text-slate-400 font-medium">
                          {kanjiItem.stroke_count} nét
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex h-6 min-w-[1.75rem] shrink-0 items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-500">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Dòng 2: Nghĩa tiếng Việt & Âm On / Kun trên 1 dòng gọn gàng */}
                  <div className="border-t border-slate-100 pt-3 space-y-1">
                    <p className="text-base font-semibold text-slate-900 font-vn leading-snug">
                      {kanjiItem.meaning_vn}
                    </p>
                    <p className="text-xs text-slate-500 font-jp">
                      <span className="text-slate-400 font-vn">On:</span>{' '}
                      {kanjiItem.onyomi || '-'}
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="text-slate-400 font-vn">Kun:</span>{' '}
                      {kanjiItem.kunyomi || '-'}
                    </p>
                  </div>

                  {/* Dòng 3: Từ vựng / Câu ví dụ */}
                  {(kanjiItem.example_jp || kanjiItem.example_vn) && (
                    <div className="rounded-lg bg-slate-50/80 p-3 text-xs space-y-1.5 border border-slate-100">
                      {kanjiItem.example_jp && (
                        <p className="font-medium text-slate-800 leading-relaxed font-jp text-sm">
                          {kanjiItem.example_jp}
                        </p>
                      )}
                      {kanjiItem.example_vn && (
                        <p className="text-slate-500 leading-relaxed font-vn">
                          {kanjiItem.example_vn}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Dòng 4: Thanh Icon điều khiển âm thanh + Nút Tập viết */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <AdvancedAudioPlayer
                      src={`tts:${kanjiItem.yomikata}`}
                      ttsText={kanjiItem.yomikata}
                      exampleTtsText={
                        kanjiItem.example_jp
                          ? kanjiItem.example_jp.replace(/（.*?）/g, '')
                          : undefined
                      }
                      compact
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setPracticeKanji(kanjiItem)}
                    data-tooltip-id={tooltipId}
                    data-tooltip-content="Tập viết chữ Kanji này"
                    aria-label="Practice writing kanji"
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all focus:outline-none active:scale-95',
                      isMastered
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                    )}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ================= MODAL TẬP VIẾT KANJI TRÊN Ô KẺ ================= */}
      {practiceKanji && (
        <div
          onClick={() => setPracticeKanji(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-jp text-2xl font-bold text-slate-900">
                    {practiceKanji.character}
                  </span>
                  {practiceKanji.han_viet && (
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                      {practiceKanji.han_viet}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {practiceKanji.meaning_vn} ({practiceKanji.stroke_count} nét)
                  — Dùng chuột hoặc cảm ứng viết theo nét mờ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPracticeKanji(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Ô kẻ luyện viết có chữ mẫu mờ bên dưới */}
            <div className="relative mx-auto h-64 w-64 rounded-lg border-2 border-slate-300 bg-slate-50 select-none overflow-hidden">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-full w-px border-l border-dashed border-slate-300" />
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px border-t border-dashed border-slate-300" />
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-jp text-[130px] font-bold text-slate-200/80 select-none">
                {practiceKanji.character}
              </div>

              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="relative z-10 h-full w-full cursor-crosshair touch-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <AdvancedAudioPlayer
                src={`tts:${practiceKanji.yomikata}`}
                ttsText={practiceKanji.yomikata}
                compact
                className="w-auto"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  <span>Xóa</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rateItem('kanji', practiceKanji.id, 'easy');
                    toast.success(
                      `Đã đánh dấu thuộc chữ "${practiceKanji.character}" (${practiceKanji.han_viet || practiceKanji.meaning_vn})`
                    );
                    setPracticeKanji(null);
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 focus:outline-none"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã thuộc</span>
                </button>
              </div>
            </div>
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
