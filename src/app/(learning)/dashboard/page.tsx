'use client';

import React, { useEffect, useMemo, useId } from 'react';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  Layers,
  Flame,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Languages,
  MessageSquare,
  PenTool,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import {
  MARUGOTO_LESSONS_SEED,
  MARUGOTO_VOCAB_SEED,
} from '@/lib/data/marugoto-seed';
import { useProgressStore } from '@/store/useProgressStore';
import { isDueForReview } from '@/lib/srs-algorithm';

export default function DashboardPage() {
  const tooltipId = useId();
  const { hydrate, hydrated, records, totalExp, currentStreak } =
    useProgressStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const stats = useMemo(() => {
    const allVocabs = Object.values(MARUGOTO_VOCAB_SEED).flat();
    const totalVocabCount = allVocabs.length;

    let learnedCount = 0;
    let masteredCount = 0;
    let dueCount = 0;
    const levelCounts = [0, 0, 0, 0, 0, 0];

    for (const vocab of allVocabs) {
      const rec = records[`vocab:${vocab.id}`];
      const level = rec?.srsLevel ?? 0;
      levelCounts[level] = (levelCounts[level] || 0) + 1;

      if (rec && level > 0) {
        learnedCount++;
      }
      if (level >= 4) {
        masteredCount++;
      }
      if (!rec || isDueForReview(rec.nextReviewDate)) {
        dueCount++;
      }
    }

    return {
      totalVocabCount,
      learnedCount,
      masteredCount,
      dueCount,
      levelCounts,
    };
  }, [records, hydrated]);

  return (
    <main className="mx-auto max-w-6xl p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* ================= HERO BANNER ================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            Marugoto A1 (JLPT N5)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            Bảng điều khiển học tập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
            Theo dõi tiến độ ghi nhớ từ vựng 18 bài học và lịch ôn tập ngắt quãng
            (SRS) hàng ngày.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
          <Link
            href="/alphabet"
            className="inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          >
            <PenTool className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Bảng chữ cái & Tập viết</span>
          </Link>

          <Link
            href="/flashcards"
            className="inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Layers className="h-4 w-4 shrink-0" />
            <span>Ôn tập Flashcards ngay</span>
          </Link>
        </div>
      </div>

      {/* ================= 4 KPI STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Đã học */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 transition-colors flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              Từ vựng đã học
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.learnedCount}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {stats.totalVocabCount}
              </span>
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              Thành thạo (Lv.4-5): {stats.masteredCount} từ
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Cần ôn hôm nay */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 transition-colors flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              Đến hạn ôn tập (SRS)
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.dueCount}{' '}
              <span className="text-sm font-normal text-slate-400">thẻ</span>
            </p>
            <Link
              href="/flashcards"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              <span>Bắt đầu ôn tập</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Chuỗi ngày học */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 transition-colors flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              Chuỗi ngày học (Streak)
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {currentStreak}{' '}
              <span className="text-sm font-normal text-slate-400">ngày</span>
            </p>
            <p className="text-[11px] text-amber-600 font-medium">
              Duy trì ôn tập mỗi ngày
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <Flame className="h-5 w-5 fill-amber-500" />
          </div>
        </div>

        {/* Card 4: Điểm EXP */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 transition-colors flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              Tổng điểm tích lũy
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {totalExp}{' '}
              <span className="text-sm font-normal text-slate-400">EXP</span>
            </p>
            <p className="text-[11px] text-indigo-600 font-medium">
              +5 ~ +15 EXP mỗi lượt lật thẻ
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ================= DANH SÁCH 18 BÀI HỌC MARUGOTO A1 ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Lộ trình 18 Bài học Marugoto A1
          </h2>
          <span className="text-xs text-slate-500">
            9 Chủ đề • {stats.totalVocabCount} Từ vựng chuẩn Wordbook
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {MARUGOTO_LESSONS_SEED.map((lesson) => {
            const lessonVocabs = MARUGOTO_VOCAB_SEED[lesson.id] || [];
            const totalInLesson = lessonVocabs.length;
            const learnedInLesson = lessonVocabs.filter(
              (v) => (records[`vocab:${v.id}`]?.srsLevel ?? 0) > 0
            ).length;
            const progressPercent =
              totalInLesson > 0
                ? Math.round((learnedInLesson / totalInLesson) * 100)
                : 0;

            return (
              <article
                key={lesson.id}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 sm:p-5 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                      Bài {lesson.order_index}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {learnedInLesson} / {totalInLesson} từ
                    </span>
                  </div>

                  <h3 className="text-[15px] sm:text-base font-bold text-slate-900 leading-snug font-jp">
                    {lesson.topic_name.replace(/^Bài \d+:\s*/, '')}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  {/* Thanh tiến độ từng bài */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                      <span>Tiến độ ghi nhớ</span>
                      <span className="text-indigo-600 font-semibold">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Các nút vào nhanh phân khu của bài học */}
                  <div className="flex items-center justify-between gap-1.5">
                    <Link
                      href={`/lessons/${lesson.id}/overview`}
                      className="inline-flex h-8 flex-1 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Lý thuyết</span>
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={`/lessons/${lesson.id}/vocab`}
                        data-tooltip-id={tooltipId}
                        data-tooltip-content="Từ vựng (Vocab)"
                        aria-label="Vocabulary"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                      </Link>

                      <Link
                        href={`/lessons/${lesson.id}/grammar`}
                        data-tooltip-id={tooltipId}
                        data-tooltip-content="Ngữ pháp (Grammar)"
                        aria-label="Grammar"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                      </Link>

                      <Link
                        href={`/lessons/${lesson.id}/kanji`}
                        data-tooltip-id={tooltipId}
                        data-tooltip-content="Hán tự (Kanji)"
                        aria-label="Kanji"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                      >
                        <Languages className="h-3.5 w-3.5" />
                      </Link>

                      <Link
                        href={`/lessons/${lesson.id}/kaiwa`}
                        data-tooltip-id={tooltipId}
                        data-tooltip-content="Hội thoại (Kaiwa)"
                        aria-label="Kaiwa"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Link>

                      <Link
                        href={`/flashcards?lesson=${lesson.id}`}
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={`Luyện Flashcard Bài ${lesson.order_index}`}
                        aria-label="Practice flashcards"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                      >
                        <Layers className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

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
