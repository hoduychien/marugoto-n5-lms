import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { VocabularyItem } from '@/components/quiz/SRSFlashcard';
import {
  MARUGOTO_LESSONS_SEED,
  MARUGOTO_VOCAB_SEED,
  type LessonAudioTrack,
  type LessonInfo,
} from '@/lib/data/marugoto-seed';
import {
  MARUGOTO_KANJI_SEED,
  type KanjiItem,
} from '@/lib/data/marugoto-kanji-seed';
import {
  MARUGOTO_GRAMMAR_SEED,
  MARUGOTO_KAIWA_SEED,
  type GrammarPoint,
  type KaiwaDialogue,
} from '@/lib/data/marugoto-grammar-kaiwa-seed';
import {
  MARUGOTO_OVERVIEW_SEED,
  type LessonOverview,
} from '@/lib/data/marugoto-overview-seed';

/**
 * Quét danh sách các file MP3 gốc của bài học trong thư mục docs/MarugotoStarterCompetencesMp3 (Server-only)
 */
export function getLessonMp3Tracks(lessonId: number): LessonAudioTrack[] {
  const padded = lessonId < 10 ? `0${lessonId}` : `${lessonId}`;
  const folderName = `MarugotoStarterCompetencesMp3Lesson${padded}`;
  const folderPath = path.resolve(
    process.cwd(),
    'docs',
    'MarugotoStarterCompetencesMp3',
    folderName
  );

  try {
    if (!fs.existsSync(folderPath)) return [];
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => f.toLowerCase().endsWith('.mp3'))
      .sort();

    return files.map((filename) => ({
      filename,
      label: filename
        .replace(/\.mp3$/i, '')
        .replace(/ü`/g, '～')
        .replace(/\ufffd`/g, '～'),
      url: `/api/audio/${folderName}/${encodeURIComponent(filename)}`,
    }));
  } catch {
    return [];
  }
}

/**
 * Truy vấn thông tin bài học và danh sách từ vựng từ Supabase (Server-only).
 * Nếu chưa cấu hình biến môi trường hoặc bảng đang trống, tự động sử dụng dữ liệu chuẩn Marugoto A1 (18 bài).
 */
export async function getLessonWithVocabularies(lessonId: number): Promise<{
  lesson: LessonInfo;
  vocabularies: VocabularyItem[];
  allLessons: LessonInfo[];
  audioTracks: LessonAudioTrack[];
  source: 'supabase' | 'seed';
}> {
  const safeId =
    Number.isFinite(lessonId) && lessonId >= 1 && lessonId <= 18
      ? lessonId
      : 1;
  const audioTracks = getLessonMp3Tracks(safeId);

  if (isSupabaseConfigured) {
    try {
      const [lessonsRes, vocabRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('*')
          .order('order_index', { ascending: true }),
        supabase
          .from('vocabularies')
          .select('*')
          .eq('lesson_id', safeId)
          .order('id', { ascending: true }),
      ]);

      if (
        !lessonsRes.error &&
        lessonsRes.data &&
        lessonsRes.data.length > 0 &&
        !vocabRes.error &&
        vocabRes.data &&
        vocabRes.data.length > 0
      ) {
        const currentLesson =
          lessonsRes.data.find((l) => l.id === safeId) || lessonsRes.data[0];
        return {
          lesson: currentLesson as LessonInfo,
          vocabularies: vocabRes.data as VocabularyItem[],
          allLessons: lessonsRes.data as LessonInfo[],
          audioTracks,
          source: 'supabase',
        };
      }
    } catch {
      // Fallback sang bộ dữ liệu chuẩn Marugoto A1 bên dưới
    }
  }

  const fallbackLesson =
    MARUGOTO_LESSONS_SEED.find((l) => l.id === safeId) ||
    MARUGOTO_LESSONS_SEED[0];
  const fallbackVocab =
    MARUGOTO_VOCAB_SEED[fallbackLesson.id] || MARUGOTO_VOCAB_SEED[1];

  return {
    lesson: fallbackLesson,
    vocabularies: fallbackVocab,
    allLessons: MARUGOTO_LESSONS_SEED,
    audioTracks,
    source: 'seed',
  };
}

/**
 * Truy vấn thông tin bài học và danh sách Kanji từ Supabase (Server-only).
 * Tự động fallback về bộ 65 Kanji chuẩn Marugoto A1 Rikai + Kanji N5 theo bài.
 */
export async function getLessonWithKanjis(lessonId: number): Promise<{
  lesson: LessonInfo;
  kanjis: KanjiItem[];
  allLessons: LessonInfo[];
  source: 'supabase' | 'seed';
}> {
  const safeId =
    Number.isFinite(lessonId) && lessonId >= 1 && lessonId <= 18
      ? lessonId
      : 1;

  if (isSupabaseConfigured) {
    try {
      const [lessonsRes, kanjiRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('*')
          .order('order_index', { ascending: true }),
        supabase
          .from('kanjis')
          .select('*')
          .eq('lesson_id', safeId)
          .order('id', { ascending: true }),
      ]);

      if (
        !lessonsRes.error &&
        lessonsRes.data &&
        lessonsRes.data.length > 0 &&
        !kanjiRes.error &&
        kanjiRes.data &&
        kanjiRes.data.length > 0
      ) {
        const currentLesson =
          lessonsRes.data.find((l) => l.id === safeId) || lessonsRes.data[0];
        const mappedKanjis: KanjiItem[] = kanjiRes.data.map(
          (row: Record<string, unknown>) => {
            const exArr = Array.isArray(row.examples) ? row.examples : [];
            const firstEx = exArr[0] as
              | { jp?: string; vn?: string }
              | undefined;
            return {
              ...(row as unknown as KanjiItem),
              example_jp:
                (row.example_jp as string | undefined) || firstEx?.jp || '',
              example_vn:
                (row.example_vn as string | undefined) || firstEx?.vn || '',
            };
          }
        );
        return {
          lesson: currentLesson as LessonInfo,
          kanjis: mappedKanjis,
          allLessons: lessonsRes.data as LessonInfo[],
          source: 'supabase',
        };
      }
    } catch {
      // Fallback sang dữ liệu Marugoto Kanji Seed bên dưới
    }
  }

  const fallbackLesson =
    MARUGOTO_LESSONS_SEED.find((l) => l.id === safeId) ||
    MARUGOTO_LESSONS_SEED[0];
  const fallbackKanjis =
    MARUGOTO_KANJI_SEED[fallbackLesson.id] || MARUGOTO_KANJI_SEED[5];

  return {
    lesson: fallbackLesson,
    kanjis: fallbackKanjis,
    allLessons: MARUGOTO_LESSONS_SEED,
    source: 'seed',
  };
}

/**
 * Truy vấn thông tin bài học và danh sách chủ điểm Ngữ pháp (Server-only).
 */
export async function getLessonWithGrammar(lessonId: number): Promise<{
  lesson: LessonInfo;
  grammars: GrammarPoint[];
  allLessons: LessonInfo[];
  source: 'supabase' | 'seed';
}> {
  const safeId =
    Number.isFinite(lessonId) && lessonId >= 1 && lessonId <= 18
      ? lessonId
      : 1;

  if (isSupabaseConfigured) {
    try {
      const [lessonsRes, grammarRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('*')
          .order('order_index', { ascending: true }),
        supabase
          .from('grammars')
          .select('*')
          .eq('lesson_id', safeId)
          .order('id', { ascending: true }),
      ]);

      if (
        !lessonsRes.error &&
        lessonsRes.data &&
        lessonsRes.data.length > 0 &&
        !grammarRes.error &&
        grammarRes.data &&
        grammarRes.data.length > 0
      ) {
        const currentLesson =
          lessonsRes.data.find((l) => l.id === safeId) || lessonsRes.data[0];
        return {
          lesson: currentLesson as LessonInfo,
          grammars: grammarRes.data as GrammarPoint[],
          allLessons: lessonsRes.data as LessonInfo[],
          source: 'supabase',
        };
      }
    } catch {
      // Fallback sang dữ liệu Marugoto Grammar Seed bên dưới
    }
  }

  const fallbackLesson =
    MARUGOTO_LESSONS_SEED.find((l) => l.id === safeId) ||
    MARUGOTO_LESSONS_SEED[0];
  const fallbackGrammars =
    MARUGOTO_GRAMMAR_SEED[fallbackLesson.id] || MARUGOTO_GRAMMAR_SEED[1];

  return {
    lesson: fallbackLesson,
    grammars: fallbackGrammars,
    allLessons: MARUGOTO_LESSONS_SEED,
    source: 'seed',
  };
}

/**
 * Truy vấn thông tin bài học, kịch bản Hội thoại (Kaiwa) và danh sách file MP3 gốc của bài học (Server-only).
 */
export async function getLessonWithKaiwa(lessonId: number): Promise<{
  lesson: LessonInfo;
  dialogue: KaiwaDialogue;
  audioTracks: LessonAudioTrack[];
  allLessons: LessonInfo[];
  source: 'supabase' | 'seed';
}> {
  const safeId =
    Number.isFinite(lessonId) && lessonId >= 1 && lessonId <= 18
      ? lessonId
      : 1;
  const audioTracks = getLessonMp3Tracks(safeId);

  if (isSupabaseConfigured) {
    try {
      const [lessonsRes, kaiwaRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('*')
          .order('order_index', { ascending: true }),
        supabase
          .from('kaiwas')
          .select('*')
          .eq('lesson_id', safeId)
          .maybeSingle(),
      ]);

      if (
        !lessonsRes.error &&
        lessonsRes.data &&
        lessonsRes.data.length > 0 &&
        !kaiwaRes.error &&
        kaiwaRes.data
      ) {
        const currentLesson =
          lessonsRes.data.find((l) => l.id === safeId) || lessonsRes.data[0];
        return {
          lesson: currentLesson as LessonInfo,
          dialogue: kaiwaRes.data as KaiwaDialogue,
          audioTracks,
          allLessons: lessonsRes.data as LessonInfo[],
          source: 'supabase',
        };
      }
    } catch {
      // Fallback sang dữ liệu Marugoto Kaiwa Seed bên dưới
    }
  }

  const fallbackLesson =
    MARUGOTO_LESSONS_SEED.find((l) => l.id === safeId) ||
    MARUGOTO_LESSONS_SEED[0];
  const fallbackDialogue =
    MARUGOTO_KAIWA_SEED[fallbackLesson.id] || MARUGOTO_KAIWA_SEED[1];

  return {
    lesson: fallbackLesson,
    dialogue: fallbackDialogue,
    audioTracks,
    allLessons: MARUGOTO_LESSONS_SEED,
    source: 'seed',
  };
}

/**
 * Truy vấn trang Tổng hợp lý thuyết (Overview) của bài học (Server-only).
 */
export async function getLessonWithOverview(lessonId: number): Promise<{
  lesson: LessonInfo;
  overview: LessonOverview;
  vocabCount: number;
  grammars: GrammarPoint[];
  kanjis: KanjiItem[];
  kaiwaLinesCount: number;
  allLessons: LessonInfo[];
  source: 'supabase' | 'seed';
}> {
  const safeId =
    Number.isFinite(lessonId) && lessonId >= 1 && lessonId <= 18
      ? lessonId
      : 1;

  if (isSupabaseConfigured) {
    try {
      const [lessonsRes, overviewRes, vocabRes, grammarRes, kanjiRes, kaiwaRes] =
        await Promise.all([
          supabase
            .from('lessons')
            .select('*')
            .order('order_index', { ascending: true }),
          supabase
            .from('lesson_overviews')
            .select('*')
            .eq('lesson_id', safeId)
            .maybeSingle(),
          supabase
            .from('vocabularies')
            .select('id', { count: 'exact', head: true })
            .eq('lesson_id', safeId),
          supabase
            .from('grammars')
            .select('*')
            .eq('lesson_id', safeId)
            .order('id', { ascending: true }),
          supabase
            .from('kanjis')
            .select('*')
            .eq('lesson_id', safeId)
            .order('id', { ascending: true }),
          supabase
            .from('kaiwas')
            .select('*')
            .eq('lesson_id', safeId)
            .maybeSingle(),
        ]);

      if (
        !lessonsRes.error &&
        lessonsRes.data &&
        lessonsRes.data.length > 0 &&
        !overviewRes.error &&
        overviewRes.data
      ) {
        const currentLesson =
          lessonsRes.data.find((l) => l.id === safeId) || lessonsRes.data[0];
        const kaiwaData = kaiwaRes.data as KaiwaDialogue | null;
        return {
          lesson: currentLesson as LessonInfo,
          overview: overviewRes.data as LessonOverview,
          vocabCount:
            vocabRes.count ??
            (MARUGOTO_VOCAB_SEED[safeId] || MARUGOTO_VOCAB_SEED[1]).length,
          grammars:
            grammarRes.data && grammarRes.data.length > 0
              ? (grammarRes.data as GrammarPoint[])
              : MARUGOTO_GRAMMAR_SEED[safeId] || MARUGOTO_GRAMMAR_SEED[1],
          kanjis:
            kanjiRes.data && kanjiRes.data.length > 0
              ? (kanjiRes.data as KanjiItem[])
              : MARUGOTO_KANJI_SEED[safeId] || MARUGOTO_KANJI_SEED[1] || [],
          kaiwaLinesCount:
            kaiwaData?.lines?.length ??
            (MARUGOTO_KAIWA_SEED[safeId] || MARUGOTO_KAIWA_SEED[1]).lines
              .length,
          allLessons: lessonsRes.data as LessonInfo[],
          source: 'supabase',
        };
      }
    } catch {
      // Fallback sang dữ liệu Marugoto Seed bên dưới
    }
  }

  const fallbackLesson =
    MARUGOTO_LESSONS_SEED.find((l) => l.id === safeId) ||
    MARUGOTO_LESSONS_SEED[0];
  const overview =
    MARUGOTO_OVERVIEW_SEED[fallbackLesson.id] || MARUGOTO_OVERVIEW_SEED[1];
  const vocabList =
    MARUGOTO_VOCAB_SEED[fallbackLesson.id] || MARUGOTO_VOCAB_SEED[1];
  const grammars =
    MARUGOTO_GRAMMAR_SEED[fallbackLesson.id] || MARUGOTO_GRAMMAR_SEED[1];
  const kanjis =
    MARUGOTO_KANJI_SEED[fallbackLesson.id] || MARUGOTO_KANJI_SEED[1] || [];
  const kaiwa =
    MARUGOTO_KAIWA_SEED[fallbackLesson.id] || MARUGOTO_KAIWA_SEED[1];

  return {
    lesson: fallbackLesson,
    overview,
    vocabCount: vocabList.length,
    grammars,
    kanjis,
    kaiwaLinesCount: kaiwa.lines.length,
    allLessons: MARUGOTO_LESSONS_SEED,
    source: 'seed',
  };
}


