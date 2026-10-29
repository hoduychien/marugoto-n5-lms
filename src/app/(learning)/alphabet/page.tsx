'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import Select, {
  components,
  type DropdownIndicatorProps,
} from 'react-select';
import {
  PenTool,
  Layers,
  Eraser,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shuffle,
  Eye,
  EyeOff,
  RotateCw,
  Search,
  Volume2,
  Sparkles,
  Database,
  Undo2,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'sonner';
import {
  HIRAGANA_ITEMS,
  KATAKANA_ITEMS,
  type KanaItem,
  type KanaGroup,
} from '@/lib/data/kana-seed';
import {
  MARUGOTO_KANJI_SEED,
  type KanjiItem,
} from '@/lib/data/marugoto-kanji-seed';
import { MARUGOTO_LESSONS_SEED } from '@/lib/data/marugoto-seed';
import { AdvancedAudioPlayer } from '@/components/audio/AdvancedAudioPlayer';
import { useProgressStore } from '@/store/useProgressStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type WritingTab = 'hiragana' | 'katakana' | 'kanji';
type StudyMode = 'write' | 'flashcard';

interface UnifiedCharItem {
  uid: string;
  numericId: number;
  tab: WritingTab;
  kanaGroup?: KanaGroup;
  rowLabel?: string;
  character: string;
  reading: string; // Romaji cho Kana, hoặc Hán Việt + Yomikata cho Kanji
  subReading?: string; // On/Kun cho Kanji, hoặc Hàng cho Kana
  meaning_vn: string;
  example_jp: string;
  example_vn: string;
  tts_char: string;
  tts_example: string;
  stroke_count?: number;
}

// Xác định cột chuẩn (0..4 tương ứng a, i, u, e, o) trong bảng Ngũ thập âm (Gojuon / Dakuon)
function getGojuonColIndex(romaji: string, character: string): number {
  if (character === 'ん' || character === 'ン') return 0;
  if (character === 'を' || character === 'ヲ') return 4;
  const clean = romaji.replace(/\s*\(.*?\)/g, '').trim().toLowerCase();
  const lastChar = clean.slice(-1);
  if (lastChar === 'a') return 0;
  if (lastChar === 'i') return 1;
  if (lastChar === 'u') return 2;
  if (lastChar === 'e') return 3;
  if (lastChar === 'o') return 4;
  return 0;
}

// Xác định cột chuẩn (0..2 tương ứng -ya, -yu, -yo) trong bảng Âm ghép (Yoon)
function getYoonColIndex(romaji: string): number {
  const clean = romaji.trim().toLowerCase();
  const lastChar = clean.slice(-1);
  if (lastChar === 'a') return 0;
  if (lastChar === 'u') return 1;
  if (lastChar === 'o') return 2;
  return 0;
}

interface LessonFilterOption {
  value: number;
  label: string;
}

const CustomDropdownIndicator = (
  props: DropdownIndicatorProps<LessonFilterOption, false>
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

export default function AlphabetWritingPage() {
  const tooltipId = useId();

  // Tab hệ thống chữ & Chế độ học
  const [activeTab, setActiveTab] = useState<WritingTab>('hiragana');
  const [studyMode, setStudyMode] = useState<StudyMode>('write');

  // Bộ lọc nhóm Kana hoặc Bài học Kanji
  const [kanaGroup, setKanaGroup] = useState<KanaGroup | 'all'>('basic');
  const [kanjiLessonFilter, setKanjiLessonFilter] = useState<number>(0); // 0 = Tất cả 18 bài
  const [searchQuery, setSearchQuery] = useState('');

  // Chữ đang chọn để tập viết hoặc đang hiển thị trên Flashcard
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);

  // Tuỳ chọn bảng Canvas luyện viết (Hỗ trợ Apple Pencil & Undo từng nét trên iPad)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokeHistoryRef = useRef<ImageData[]>([]);
  const [strokeCountOnCanvas, setStrokeCountOnCanvas] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuideChar, setShowGuideChar] = useState(true);
  const [brushSize, setBrushSize] = useState<number>(7);

  const { hydrate, hydrated, getItemLevel, rateItem } = useProgressStore();

  // State dữ liệu đồng bộ từ Supabase (nếu đã cấu hình)
  const [remoteKanjis, setRemoteKanjis] = useState<KanjiItem[] | null>(null);
  const [remoteKanas, setRemoteKanas] = useState<KanaItem[] | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'seed'>('seed');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;

    async function fetchAlphabetFromSupabase() {
      try {
        const [kanjiRes, kanaRes] = await Promise.all([
          supabase
            .from('kanjis')
            .select('*')
            .order('id', { ascending: true }),
          supabase
            .from('kanas')
            .select('*')
            .order('order_index', { ascending: true }),
        ]);

        if (!mounted) return;

        if (!kanjiRes.error && kanjiRes.data && kanjiRes.data.length > 0) {
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
          setRemoteKanjis(mappedKanjis);
          setDataSource('supabase');
        }

        if (!kanaRes.error && kanaRes.data && kanaRes.data.length > 0) {
          setRemoteKanas(kanaRes.data as KanaItem[]);
          setDataSource('supabase');
        }
      } catch {
        // Fallback dữ liệu chuẩn tích hợp sẵn
      }
    }

    fetchAlphabetFromSupabase();
    return () => {
      mounted = false;
    };
  }, []);

  const lessonOptions = useMemo<LessonFilterOption[]>(
    () => [
      { value: 0, label: 'Tất cả 18 bài học (Toàn bộ Kanji N5)' },
      ...MARUGOTO_LESSONS_SEED.map((l) => ({
        value: l.id,
        label: l.topic_name,
      })),
    ],
    []
  );

  const selectedLessonOption = useMemo(
    () =>
      lessonOptions.find((o) => o.value === kanjiLessonFilter) ||
      lessonOptions[0],
    [lessonOptions, kanjiLessonFilter]
  );

  // Chuẩn hóa danh sách ký tự theo Tab & Bộ lọc hiện tại
  const baseItems = useMemo<UnifiedCharItem[]>(() => {
    if (activeTab === 'hiragana' || activeTab === 'katakana') {
      const canonicalSeed =
        activeTab === 'hiragana' ? HIRAGANA_ITEMS : KATAKANA_ITEMS;
      const remoteMap = new Map<string, KanaItem>();
      if (remoteKanas) {
        remoteKanas
          .filter((k) => k.system === activeTab)
          .forEach((k) => remoteMap.set(k.character, k));
      }

      // Luôn giữ đúng thứ tự hàng - cột chuẩn Gojuon từ seed, kết hợp dữ liệu từ Supabase nếu có
      const source: KanaItem[] = canonicalSeed.map((seedItem) => {
        const remoteItem = remoteMap.get(seedItem.character);
        if (!remoteItem) return seedItem;
        return {
          ...seedItem,
          ...remoteItem,
          // Giữ tên hàng chuẩn để phân tách đúng Hàng WA và Phụ âm mũi N (ん/ン)
          row: seedItem.row,
          group: seedItem.group,
        };
      });

      const filteredByGroup =
        kanaGroup === 'all'
          ? source
          : source.filter((item) => item.group === kanaGroup);

      return filteredByGroup.map((item, idx) => ({
        uid: item.id,
        numericId:
          (activeTab === 'hiragana' ? 10000 : 20000) + idx + 1,
        tab: activeTab,
        kanaGroup: item.group,
        rowLabel: item.row,
        character: item.character,
        reading: item.romaji,
        subReading: item.row,
        meaning_vn: `Từ mẫu: ${item.example_word} (${item.example_vn})`,
        example_jp: item.example_word,
        example_vn: `${item.example_reading} — ${item.example_vn}`,
        tts_char: item.character,
        tts_example: item.example_word.replace(/→.*$/, '').trim(),
      }));
    }

    // Tab Kanji
    const allKanjiSource: KanjiItem[] =
      remoteKanjis || Object.values(MARUGOTO_KANJI_SEED).flat();
    const allKanji: KanjiItem[] =
      kanjiLessonFilter === 0
        ? allKanjiSource
        : allKanjiSource.filter((k) => k.lesson_id === kanjiLessonFilter);

    return allKanji.map((k) => ({
      uid: `kanji-${k.id}`,
      numericId: k.id,
      tab: 'kanji',
      character: k.character,
      reading: k.han_viet ? `${k.han_viet} (${k.yomikata})` : k.yomikata,
      subReading: `On: ${k.onyomi || '-'} • Kun: ${k.kunyomi || '-'}`,
      meaning_vn: k.meaning_vn,
      example_jp: k.example_jp || k.yomikata,
      example_vn: k.example_vn || k.meaning_vn,
      tts_char: k.yomikata,
      tts_example: (k.example_jp || k.yomikata).replace(/（.*?）/g, ''),
      stroke_count: k.stroke_count,
    }));
  }, [activeTab, kanaGroup, kanjiLessonFilter, remoteKanas, remoteKanjis]);

  // Lọc theo ô tìm kiếm
  const filteredItems = useMemo<UnifiedCharItem[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = !q
      ? baseItems
      : baseItems.filter(
          (item) =>
            item.character.toLowerCase().includes(q) ||
            item.reading.toLowerCase().includes(q) ||
            item.meaning_vn.toLowerCase().includes(q) ||
            item.example_jp.toLowerCase().includes(q)
        );

    if (shuffledOrder && shuffledOrder.length === list.length) {
      return shuffledOrder.map((i) => list[i]).filter(Boolean);
    }
    return list;
  }, [baseItems, searchQuery, shuffledOrder]);

  // Reset vị trí chọn khi đổi tab hoặc bộ lọc
  useEffect(() => {
    setSelectedIndex(0);
    setIsFlipped(false);
    setShuffledOrder(null);
  }, [activeTab, kanaGroup, kanjiLessonFilter, searchQuery]);

  const currentItem =
    filteredItems[selectedIndex] || filteredItems[0] || null;

  // Cấu trúc bảng chữ cái Kana chuẩn theo từng Nhóm -> từng Hàng -> từng Cột (không bao giờ trộn chữ khác hàng vào nhau)
  const structuredKanaSections = useMemo(() => {
    if (activeTab === 'kanji' || searchQuery.trim() !== '') return [];

    const groupMeta: Record<
      KanaGroup,
      {
        title: string;
        subtitle: string;
        cols: number;
        colHeaders: string[];
      }
    > = {
      basic: {
        title: '1. Bảng 46 Chữ cơ bản (Ngũ thập âm • Gojūon)',
        subtitle: 'Xếp theo 5 cột nguyên âm chuẩn: A - I - U - E - O',
        cols: 5,
        colHeaders: ['Cột A (-a)', 'Cột I (-i)', 'Cột U (-u)', 'Cột E (-e)', 'Cột O (-o)'],
      },
      dakuon: {
        title: '2. Bảng 25 Âm đục & Bán đục (Dakuon & Handakuon)',
        subtitle: 'Biến âm thêm dấu Tenten (゛) và Maru (゜) theo 5 cột A - I - U - E - O',
        cols: 5,
        colHeaders: ['Cột A (-a)', 'Cột I (-i)', 'Cột U (-u)', 'Cột E (-e)', 'Cột O (-o)'],
      },
      yoon: {
        title: '3. Bảng 33 Âm ghép (Yōon • Ghép với ゃ, ゅ, ょ nhỏ)',
        subtitle: 'Xếp chuẩn theo 3 cột âm ghép: YA (-ya) - YU (-yu) - YO (-yo)',
        cols: 3,
        colHeaders: ['Cột YA (-ya)', 'Cột YU (-yu)', 'Cột YO (-yo)'],
      },
    };

    const groupsOrder: KanaGroup[] =
      kanaGroup === 'all' ? ['basic', 'dakuon', 'yoon'] : [kanaGroup];

    return groupsOrder
      .map((grp) => {
        const meta = groupMeta[grp];
        const rowsMap = new Map<
          string,
          Array<{ item: UnifiedCharItem; index: number } | null>
        >();

        filteredItems.forEach((item, index) => {
          if (item.kanaGroup !== grp) return;
          const rKey = item.rowLabel || item.subReading || 'Khác';
          if (!rowsMap.has(rKey)) {
            rowsMap.set(rKey, Array(meta.cols).fill(null));
          }
          const slots = rowsMap.get(rKey)!;
          const colIdx =
            grp === 'yoon'
              ? getYoonColIndex(item.reading)
              : getGojuonColIndex(item.reading, item.character);

          if (colIdx >= 0 && colIdx < meta.cols && !slots[colIdx]) {
            slots[colIdx] = { item, index };
          } else {
            const emptyIdx = slots.findIndex((s) => s === null);
            if (emptyIdx !== -1) slots[emptyIdx] = { item, index };
          }
        });

        const rows = Array.from(rowsMap.entries()).map(([rowTitle, slots]) => {
          // Rút gọn nhãn hàng để hiển thị gọn ở cột đầu tiên
          const shortLabel = rowTitle
            .replace(/^Hàng\s+/i, '')
            .replace(/^Phụ âm mũi\s+/i, 'Âm ');
          return {
            rowTitle,
            shortLabel,
            slots,
          };
        });

        return {
          group: grp,
          ...meta,
          rows,
        };
      })
      .filter((sec) => sec.rows.length > 0);
  }, [activeTab, kanaGroup, filteredItems, searchQuery]);

  // Xóa bảng Canvas mỗi khi chuyển sang chữ khác
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeHistoryRef.current = [];
    setStrokeCountOnCanvas(0);
  };

  // Hoàn tác (Undo) nét vừa viết trên iPad / Apple Pencil
  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistoryRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const previousSnapshot = strokeHistoryRef.current.pop();
    if (previousSnapshot) {
      ctx.putImageData(previousSnapshot, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStrokeCountOnCanvas(strokeHistoryRef.current.length);
  };

  useEffect(() => {
    clearCanvas();
    setIsFlipped(false);
  }, [selectedIndex, activeTab, kanaGroup, kanjiLessonFilter, studyMode]);

  // Xử lý vẽ trên Canvas bằng Pointer Events (Tối ưu độ nhạy lực nhấn Apple Pencil & cảm ứng đa điểm trên iPad 10.9")
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Lưu snapshot trước khi đặt nét mới để hỗ trợ Hoàn tác (Undo) từng nét
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    strokeHistoryRef.current.push(snapshot);
    if (strokeHistoryRef.current.length > 25) {
      strokeHistoryRef.current.shift();
    }
    setStrokeCountOnCanvas(strokeHistoryRef.current.length);

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Tự động nhận diện lực nhấn Apple Pencil (e.pointerType === 'pen')
    const pressureFactor =
      e.pointerType === 'pen' && e.pressure > 0
        ? Math.max(0.65, Math.min(1.45, e.pressure * 1.4))
        : 1;

    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = brushSize * pressureFactor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY
    );
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.pointerType === 'pen' && e.pressure > 0) {
      const pressureFactor = Math.max(0.65, Math.min(1.45, e.pressure * 1.4));
      ctx.lineWidth = brushSize * pressureFactor;
    }

    ctx.lineTo(
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY
    );
    ctx.stroke();
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e && isDrawing) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    setIsDrawing(false);
  };

  // Trộn ngẫu nhiên danh sách thẻ
  const handleShuffle = () => {
    const indices = filteredItems.map((_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);
    setSelectedIndex(0);
    setIsFlipped(false);
    toast.success('Đã trộn ngẫu nhiên danh sách chữ!', {
      description: `${filteredItems.length} thẻ đã sẵn sàng để kiểm tra phản xạ.`,
    });
  };

  // Đánh dấu mức độ thuộc chữ (dùng chung cho cả Chế độ Tập viết & Flashcard)
  const handleRateCharacter = (
    item: UnifiedCharItem,
    feedback: 'hard' | 'good' | 'easy',
    autoAdvance = false
  ) => {
    rateItem('kanji', item.numericId, feedback);
    const expMap = { hard: 5, good: 10, easy: 15 };
    const labelMap = {
      hard: 'Cần ôn lại',
      good: 'Đã nhớ tốt',
      easy: 'Đã thuộc lòng',
    };

    toast.success(
      `${labelMap[feedback]}: 「${item.character}」 (${item.reading})`,
      {
        description: `+${expMap[feedback]} EXP • Đã lưu tiến độ vào bộ nhớ SRS.`,
      }
    );

    if (autoAdvance && filteredItems.length > 1) {
      setTimeout(() => {
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      }, 220);
    }
  };

  // Phát âm nhanh bằng Web Speech API
  const speakJapanese = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="w-full max-w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 overflow-hidden">
      {/* ================= HEADER & CHUYỂN CHẾ ĐỘ HỌC ================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3.5">
        {/* Hàng 1: Tiêu đề & Thông tin (Chiếm trọn bề ngang, không bị bóp nghẹt) */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              <PenTool className="h-3.5 w-3.5 shrink-0" />
              <span>Luyện viết mặt chữ</span>
            </span>
            <span
              className={cn(
                'inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                dataSource === 'supabase'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              )}
            >
              <Database className="h-3 w-3 shrink-0" />
              <span>
                {dataSource === 'supabase'
                  ? 'Supabase Live'
                  : 'Local Seed'}
              </span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            Bảng chữ cái & Luyện viết Tiếng Nhật
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
            Tra cứu bảng chữ cái, tập viết trực tiếp trên ô kẻ chuẩn Nhật Bản
            và lật thẻ Flashcard ghi nhớ toàn bộ mặt chữ.
          </p>
        </div>

        {/* Khối điều khiển: Phân tách rõ ràng 2 tầng chức năng (Hệ thống chữ + Chế độ học / Bộ lọc + Tìm kiếm) */}
        <div className="border-t border-slate-100 pt-3.5 space-y-3">
          {/* Tầng 1: 3 Tab hệ thống chữ cái (Trái) & 2 Chế độ học (Phải) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* 3 Tab hệ thống chữ: Luôn đi cùng nhau, nằm gọn trong pill bar, không bao giờ bị xé lẻ */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('hiragana')}
                className={cn(
                  'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  activeTab === 'hiragana'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span className="font-jp text-sm leading-none">あ</span>
                <span>Hiragana ({HIRAGANA_ITEMS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('katakana')}
                className={cn(
                  'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  activeTab === 'katakana'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span className="font-jp text-sm leading-none">ア</span>
                <span>Katakana ({KATAKANA_ITEMS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kanji')}
                className={cn(
                  'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  activeTab === 'kanji'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span className="font-jp text-sm leading-none">漢</span>
                <span>
                  Kanji N5 ({Object.values(MARUGOTO_KANJI_SEED).flat().length})
                </span>
              </button>
            </div>

            {/* Công tắc chuyển 2 chế độ: Tập viết tay vs Luyện Flashcard */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setStudyMode('write')}
                className={cn(
                  'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  studyMode === 'write'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <PenTool className="h-3.5 w-3.5 shrink-0" />
                <span>Bảng chữ & Tập viết</span>
              </button>

              <button
                type="button"
                onClick={() => setStudyMode('flashcard')}
                className={cn(
                  'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  studyMode === 'flashcard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span>Luyện Flashcards ({filteredItems.length})</span>
              </button>
            </div>
          </div>

          {/* Tầng 2: Phân loại chi tiết (Cơ bản / Âm đục / Âm ghép) hoặc Chọn bài Kanji + Ô tìm kiếm */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {activeTab !== 'kanji' ? (
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                {(
                  [
                    { key: 'basic', label: 'Cơ bản (46)' },
                    { key: 'dakuon', label: 'Âm đục (25)' },
                    { key: 'yoon', label: 'Âm ghép (33)' },
                    { key: 'all', label: 'Tất cả (104)' },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setKanaGroup(g.key)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap',
                      kanaGroup === g.key
                        ? 'bg-white text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="w-full sm:w-64">
                <Select<LessonFilterOption, false>
                  instanceId="alphabet-kanji-lesson-select"
                  classNamePrefix="react-select"
                  options={lessonOptions}
                  value={selectedLessonOption}
                  onChange={(opt) => {
                    if (opt) setKanjiLessonFilter(opt.value);
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
                      minHeight: '34px',
                      height: '34px',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
                      boxShadow: 'none',
                      cursor: 'pointer',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      height: '32px',
                      padding: '0 8px',
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      height: '32px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      fontSize: '11px',
                      padding: '5px 8px',
                      borderRadius: '0.375rem',
                      backgroundColor: state.isSelected
                        ? '#4f46e5'
                        : state.isFocused
                        ? '#eef2ff'
                        : 'transparent',
                      color: state.isSelected ? 'white' : '#1e293b',
                      cursor: 'pointer',
                    }),
                  }}
                />
              </div>
            )}

            {/* Ô tìm kiếm chữ cái & Romaji */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chữ, romaji..."
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= NỘI DUNG CHÍNH THEO CHẾ ĐỘ ================= */}
      {!currentItem ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-medium text-slate-600">
            Không tìm thấy chữ cái nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;.
          </p>
        </div>
      ) : studyMode === 'write' ? (
        /* ================= CHẾ ĐỘ 1: BẢNG CHỮ CÁI & BẢNG TẬP VIẾT TAY (Tối ưu tuyệt đối cho iPad 820px và 1180px) ================= */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 lg:gap-5 items-start w-full max-w-full">
          {/* Cột trái (7/12): Bảng lưới chữ cái chuẩn Gojuon */}
          <div className="md:col-span-7 rounded-lg border border-slate-200/90 bg-white p-3 sm:p-4 space-y-3.5 min-w-0">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {activeTab === 'hiragana'
                    ? 'Bảng chữ mềm Hiragana (ひらがな)'
                    : activeTab === 'katakana'
                    ? 'Bảng chữ cứng Katakana (カタカナ)'
                    : 'Danh sách Hán tự Kanji N5 (漢字)'}
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  Bấm vào ô chữ bất kỳ để phát âm và tập viết bên phải
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 shrink-0">
                {selectedIndex + 1} / {filteredItems.length}
              </span>
            </div>

            {activeTab !== 'kanji' && structuredKanaSections.length > 0 ? (
              /* Bảng chữ cái Kana chuẩn theo từng Hàng - Cột (Gojūon / Dakuon / Yōon) */
              <div className="space-y-4">
                {structuredKanaSections.map((section) => (
                  <div
                    key={section.group}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-2.5 sm:p-3 space-y-2.5"
                  >
                    {/* Tiêu đề từng phân nhóm bảng chữ */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200/70 pb-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-indigo-950">
                          {section.title}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          {section.subtitle}
                        </p>
                      </div>
                      <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 shrink-0 whitespace-nowrap">
                        {section.rows.length} hàng • {section.cols} cột
                      </span>
                    </div>

                    {/* Hàng tiêu đề cột (A - I - U - E - O hoặc YA - YU - YO) */}
                    <div className="flex items-center gap-1 sm:gap-1.5 px-0.5 text-[10px] sm:text-[11px] font-bold">
                      <div className="w-12 sm:w-14 shrink-0 uppercase text-slate-400 text-center">
                        Hàng
                      </div>
                      <div
                        className={cn(
                          'flex-1 grid gap-1 sm:gap-1.5',
                          section.cols === 5 ? 'grid-cols-5' : 'grid-cols-3'
                        )}
                      >
                        {section.colHeaders.map((colName) => (
                          <div
                            key={colName}
                            className="rounded-md bg-indigo-50/80 border border-indigo-100 py-1 text-center font-bold text-indigo-700 whitespace-nowrap text-[10px]"
                          >
                            {colName}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Danh sách từng Hàng (không trộn các chữ khác hàng vào nhau) */}
                    <div className="space-y-1 sm:space-y-1.5">
                      {section.rows.map((row) => (
                        <div
                          key={row.rowTitle}
                          className="flex items-stretch gap-1 sm:gap-1.5 rounded-lg bg-white p-1 border border-slate-100"
                        >
                          {/* Nhãn tên Hàng bên trái */}
                          <div className="w-12 sm:w-14 shrink-0 flex flex-col justify-center items-center rounded-md bg-slate-100/90 px-0.5 py-1 text-center select-none">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight truncate max-w-full">
                              {row.shortLabel.split('(')[0].trim()}
                            </span>
                            {row.shortLabel.includes('(') && (
                              <span className="font-jp text-[9px] text-slate-500 leading-none truncate max-w-full">
                                ({row.shortLabel.split('(')[1]}
                              </span>
                            )}
                          </div>

                          {/* Các ô chữ trong cùng một Hàng (giữ đúng vị trí cột trống cho Hàng YA, WA, N) */}
                          <div
                            className={cn(
                              'flex-1 grid gap-1 sm:gap-1.5',
                              section.cols === 5 ? 'grid-cols-5' : 'grid-cols-3'
                            )}
                          >
                            {row.slots.map((slot, slotIdx) => {
                              if (!slot) {
                                return (
                                  <div
                                    key={`empty-${row.rowTitle}-${slotIdx}`}
                                    aria-hidden="true"
                                    className="flex min-h-[3.25rem] sm:min-h-[3.75rem] items-center justify-center rounded-lg border border-dashed border-slate-200/70 bg-slate-50/40 text-xs text-slate-300 select-none"
                                  >
                                    —
                                  </div>
                                );
                              }

                              const { item, index: idx } = slot;
                              const isSelected = idx === selectedIndex;
                              const isMastered =
                                hydrated &&
                                getItemLevel('kanji', item.numericId) >= 3;

                              return (
                                <button
                                  key={item.uid}
                                  type="button"
                                  onClick={() => {
                                    setSelectedIndex(idx);
                                    speakJapanese(item.tts_char);
                                  }}
                                  className={cn(
                                    'group relative flex min-h-[3.25rem] sm:min-h-[3.75rem] flex-col items-center justify-center rounded-lg border p-1 transition-all cursor-pointer select-none',
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-600/20'
                                      : isMastered
                                      ? 'border-emerald-200 bg-emerald-50/40'
                                      : 'border-slate-200/90 bg-white hover:bg-slate-50/80'
                                  )}
                                >
                                  {isMastered && (
                                    <CheckCircle2 className="absolute right-0.5 top-0.5 h-3 w-3 text-emerald-600" />
                                  )}
                                  <span
                                    className={cn(
                                      'font-jp font-bold leading-none whitespace-nowrap',
                                      item.character.length > 1
                                        ? 'text-lg sm:text-xl tracking-tighter'
                                        : 'text-xl sm:text-2xl',
                                      isSelected
                                        ? 'text-indigo-700'
                                        : 'text-slate-900'
                                    )}
                                  >
                                    {item.character}
                                  </span>
                                  <span className="mt-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-500 truncate max-w-full">
                                    {item.reading}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Lưới hiển thị cho Hán tự Kanji N5 hoặc khi đang tìm kiếm theo từ khóa */
              <div
                className={cn(
                  'grid gap-2 sm:gap-2.5',
                  activeTab === 'kanji'
                    ? 'grid-cols-3 sm:grid-cols-4'
                    : 'grid-cols-5'
                )}
              >
                {filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isMastered =
                    hydrated && getItemLevel('kanji', item.numericId) >= 3;

                  return (
                    <button
                      key={item.uid}
                      type="button"
                      onClick={() => {
                        setSelectedIndex(idx);
                        speakJapanese(item.tts_char);
                      }}
                      className={cn(
                        'group relative flex min-h-[3.5rem] flex-col items-center justify-center rounded-lg border p-1.5 sm:p-2 transition-all cursor-pointer select-none',
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/20'
                          : isMastered
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-slate-200/90 bg-white hover:bg-slate-50/70'
                      )}
                    >
                      {isMastered && (
                        <CheckCircle2 className="absolute right-1 top-1 h-3 w-3 text-emerald-600" />
                      )}
                      <span
                        className={cn(
                          'font-jp font-bold leading-tight whitespace-nowrap',
                          item.character.length > 1
                            ? 'text-xl sm:text-2xl tracking-tighter'
                            : 'text-2xl sm:text-3xl',
                          isSelected ? 'text-indigo-700' : 'text-slate-900'
                        )}
                      >
                        {item.character}
                      </span>
                      <span className="mt-0.5 text-[10px] font-semibold text-slate-500 truncate max-w-full">
                        {item.reading}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cột phải (5/12 trên iPad & Desktop): Bảng tập viết tay cố định (Sticky Writing Studio) */}
          <div className="md:col-span-5 md:sticky md:top-20 rounded-lg border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-3.5 min-w-0">
            {/* Thông tin chữ đang chọn & Điều hướng Trước/Sau */}
            <div className="flex items-start justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => speakJapanese(currentItem.tts_char)}
                  data-tooltip-id={tooltipId}
                  data-tooltip-content="Bấm để nghe phát âm"
                  className={cn(
                    'flex h-12 min-w-[3rem] px-2 shrink-0 whitespace-nowrap items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/70 font-jp font-bold text-indigo-950 hover:bg-indigo-100 transition-colors cursor-pointer',
                    currentItem.character.length > 1
                      ? 'text-xl tracking-tighter'
                      : 'text-2xl'
                  )}
                >
                  {currentItem.character}
                </button>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-bold text-indigo-700 truncate">
                      {currentItem.reading}
                    </span>
                    {currentItem.stroke_count && (
                      <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-semibold text-slate-600 shrink-0">
                        {currentItem.stroke_count} nét
                      </span>
                    )}
                  </div>
                  {currentItem.subReading && (
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentItem.subReading}
                    </p>
                  )}
                  <p className="text-[11px] font-medium text-slate-700 truncate">
                    {currentItem.meaning_vn}
                  </p>
                </div>
              </div>

              {/* Nút chuyển nhanh chữ Trước / Tiếp */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev > 0 ? prev - 1 : filteredItems.length - 1
                    )
                  }
                  data-tooltip-id={tooltipId}
                  data-tooltip-content="Chữ trước đó"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      (prev) => (prev + 1) % filteredItems.length
                    )
                  }
                  data-tooltip-id={tooltipId}
                  data-tooltip-content="Chữ tiếp theo"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Thanh công cụ của bảng vẽ: Hiện/Ẩn chữ mẫu, Cỡ bút, Undo, Xóa */}
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowGuideChar((prev) => !prev)}
                  className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {showGuideChar ? (
                    <>
                      <EyeOff className="h-3 w-3 text-slate-500" />
                      <span>Ẩn mẫu</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 text-indigo-600" />
                      <span>Hiện mẫu</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setBrushSize((prev) => (prev === 7 ? 11 : prev === 11 ? 5 : 7))
                  }
                  className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <PenTool className="h-3 w-3 text-indigo-600" />
                  <span>
                    Nét: {brushSize === 5 ? 'Mảnh' : brushSize === 7 ? 'Vừa' : 'Đậm'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={strokeCountOnCanvas === 0}
                  onClick={undoLastStroke}
                  data-tooltip-id={tooltipId}
                  data-tooltip-content="Hoàn tác (xóa) 1 nét vừa viết"
                  className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Undo2 className="h-3 w-3" />
                  <span>Hoàn tác</span>
                </button>

                <button
                  type="button"
                  onClick={clearCanvas}
                  className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Eraser className="h-3 w-3" />
                  <span>Xóa hết</span>
                </button>
              </div>
            </div>

            {/* Khung Canvas 4 ô vuông chuẩn Nhật Bản (Tối ưu Apple Pencil & Touch trên iPad 10.9") */}
            <div className="canvas-writing-surface relative mx-auto flex h-56 w-56 sm:h-60 sm:w-60 lg:h-72 lg:w-72 items-center justify-center rounded-xl border-2 border-indigo-200 bg-slate-50 overflow-hidden select-none max-w-full">
              {/* Đường gióng tâm ngang & dọc */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-full w-px border-l border-dashed border-indigo-300/80" />
                <div className="absolute h-px w-full border-t border-dashed border-indigo-300/80" />
              </div>

              {/* Chữ mẫu mờ phía dưới để tô theo */}
              {showGuideChar && (
                <span
                  className={cn(
                    'pointer-events-none select-none whitespace-nowrap font-jp font-normal text-slate-200/85 leading-none',
                    currentItem.character.length > 1
                      ? 'text-[90px] sm:text-[100px] lg:text-[120px] tracking-tighter'
                      : 'text-[130px] sm:text-[140px] lg:text-[170px]'
                  )}
                >
                  {currentItem.character}
                </span>
              )}

              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                onPointerCancel={stopDrawing}
                className="canvas-writing-surface absolute inset-0 h-full w-full cursor-crosshair touch-none"
              />
            </div>

            {/* Hộp từ vựng mẫu & Phát âm */}
            <div className="flex items-center justify-between gap-2.5 rounded-lg border border-slate-100 bg-slate-50/90 p-2.5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Từ vựng mẫu chứa chữ 「{currentItem.character}」
                </p>
                <p className="font-jp text-xs sm:text-sm font-semibold text-slate-900 truncate mt-0.5">
                  {currentItem.example_jp}
                </p>
                <p className="text-[11px] text-slate-600 truncate">
                  {currentItem.example_vn}
                </p>
              </div>
              <div className="shrink-0">
                <AdvancedAudioPlayer
                  src=""
                  compact
                  ttsText={currentItem.tts_char}
                  exampleTtsText={currentItem.tts_example}
                />
              </div>
            </div>

            {/* Nút đánh dấu đã thuộc & chuyển sang chữ tiếp theo */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleRateCharacter(currentItem, 'good', false)}
                className="inline-flex shrink-0 whitespace-nowrap items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Đã thuộc</span>
              </button>

              <button
                type="button"
                onClick={() => handleRateCharacter(currentItem, 'easy', true)}
                className="inline-flex shrink-0 whitespace-nowrap items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <span>Thuộc & Tiếp</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CHẾ ĐỘ 2: LUYỆN FLASHCARD 3D + BẢNG NHÁP (Tối ưu cho iPad 820px và 1180px) ================= */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 lg:gap-5 items-start w-full max-w-full">
          {/* Cột trái (7/12): Thẻ Flashcard 3D lật mặt trước / mặt sau */}
          <div className="md:col-span-7 space-y-3.5 min-w-0">
            {/* Thanh điều khiển tiến độ bộ thẻ & Trộn thẻ */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200/90 bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 shrink-0">
                  Thẻ {selectedIndex + 1} / {filteredItems.length}
                </span>
                <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                  Bấm vào thẻ để lật xem cách đọc & từ vựng
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  <Shuffle className="h-3 w-3" />
                  <span>Trộn</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev > 0 ? prev - 1 : filteredItems.length - 1
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      (prev) => (prev + 1) % filteredItems.length
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Khung thẻ Flashcard */}
            <div
              onClick={() => setIsFlipped((prev) => !prev)}
              className="group relative min-h-[19rem] sm:min-h-[21rem] rounded-xl border border-slate-200 bg-white p-5 sm:p-7 transition-colors cursor-pointer flex flex-col justify-between select-none"
            >
              {/* Top bar trên thẻ */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {isFlipped ? 'Mặt sau • Đáp án' : 'Mặt trước • Mặt chữ'}
                </span>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => speakJapanese(currentItem.tts_char)}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Nghe âm</span>
                  </button>
                </div>
              </div>

              {/* Nội dung giữa thẻ */}
              {!isFlipped ? (
                <div className="my-6 text-center space-y-2">
                  <p className="font-jp text-6xl sm:text-7xl font-bold text-slate-900 leading-none whitespace-nowrap">
                    {currentItem.character}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Hãy thử viết ra bảng nháp bên phải hoặc bấm để lật đáp án
                  </p>
                </div>
              ) : (
                <div className="my-3 text-center space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-jp text-4xl sm:text-5xl font-bold text-indigo-600 whitespace-nowrap">
                      {currentItem.character}
                    </span>
                    <div className="text-left">
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">
                        {currentItem.reading}
                      </p>
                      {currentItem.subReading && (
                        <p className="text-[11px] text-slate-500">
                          {currentItem.subReading}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mx-auto max-w-sm rounded-lg border border-slate-100 bg-slate-50 p-2.5 space-y-0.5">
                    <p className="font-jp text-sm font-semibold text-slate-900">
                      {currentItem.example_jp}
                    </p>
                    <p className="text-[11px] font-medium text-slate-600">
                      {currentItem.example_vn}
                    </p>
                  </div>
                </div>
              )}

              {/* Chân thẻ: Nút lật hoặc 3 nút đánh giá SRS */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2"
              >
                <button
                  type="button"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>{isFlipped ? 'Lật mặt chữ' : 'Xem đáp án'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleRateCharacter(currentItem, 'hard', true)
                    }
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                  >
                    Khó (+5)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleRateCharacter(currentItem, 'good', true)
                    }
                    className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer"
                  >
                    Nhớ (+10)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleRateCharacter(currentItem, 'easy', true)
                    }
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                  >
                    Thuộc (+15)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải (5/12): Bảng viết nháp đi kèm khi ôn Flashcard */}
          <div className="md:col-span-5 md:sticky md:top-20 rounded-lg border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-3.5 min-w-0">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 truncate">
                  Bảng viết nháp phản xạ
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  Thử viết tay chữ trên Flashcard
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowGuideChar((prev) => !prev)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {showGuideChar ? 'Ẩn' : 'Hiện'}
                </button>
                <button
                  type="button"
                  disabled={strokeCountOnCanvas === 0}
                  onClick={undoLastStroke}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  Hoàn tác
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>

            <div className="canvas-writing-surface relative mx-auto flex h-52 w-52 sm:h-56 sm:w-56 items-center justify-center rounded-xl border-2 border-indigo-200 bg-slate-50 overflow-hidden select-none max-w-full">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-full w-px border-l border-dashed border-indigo-300/80" />
                <div className="absolute h-px w-full border-t border-dashed border-indigo-300/80" />
              </div>

              {showGuideChar && (
                <span
                  className={cn(
                    'pointer-events-none select-none whitespace-nowrap font-jp font-normal text-slate-200/85 leading-none',
                    currentItem.character.length > 1
                      ? 'text-[80px] sm:text-[95px] tracking-tighter'
                      : 'text-[120px] sm:text-[140px]'
                  )}
                >
                  {currentItem.character}
                </span>
              )}

              <canvas
                ref={canvasRef}
                width={240}
                height={240}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                onPointerCancel={stopDrawing}
                className="canvas-writing-surface absolute inset-0 h-full w-full cursor-crosshair touch-none"
              />
            </div>
          </div>
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
