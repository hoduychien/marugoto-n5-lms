'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FolderHeart,
  Plus,
  Play,
  RotateCcw,
  Download,
  Upload,
  Search,
  Volume2,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Info,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCustomVocabStore,
  type CustomVocabDeck,
  type CustomVocabWord,
} from '@/store/useCustomVocabStore';
import { CustomDeckFlashcards } from '@/components/custom-vocab/CustomDeckFlashcards';
import { JapaneseText } from '@/components/text/JapaneseText';
import { kanaToRomaji } from '@/lib/romaji-helper';
import { cn } from '@/lib/utils';

// Bảng màu sắc nhận diện cho từng bộ
const COLOR_VARIANTS: Record<
  CustomVocabDeck['color'],
  {
    badge: string;
    border: string;
    accentBg: string;
    text: string;
    radioBg: string;
    label: string;
  }
> = {
  indigo: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    border: 'border-slate-200',
    accentBg: 'bg-indigo-600',
    text: 'text-indigo-600',
    radioBg: 'bg-indigo-500',
    label: 'Chàm (Indigo)',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-slate-200',
    accentBg: 'bg-emerald-600',
    text: 'text-emerald-600',
    radioBg: 'bg-emerald-500',
    label: 'Ngọc bích (Emerald)',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-slate-200',
    accentBg: 'bg-amber-600',
    text: 'text-amber-600',
    radioBg: 'bg-amber-500',
    label: 'Hổ phách (Amber)',
  },
  rose: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    border: 'border-slate-200',
    accentBg: 'bg-rose-600',
    text: 'text-rose-600',
    radioBg: 'bg-rose-500',
    label: 'Hồng sen (Rose)',
  },
  sky: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    border: 'border-slate-200',
    accentBg: 'bg-sky-600',
    text: 'text-sky-600',
    radioBg: 'bg-sky-500',
    label: 'Xanh da trời (Sky)',
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    border: 'border-slate-200',
    accentBg: 'bg-purple-600',
    text: 'text-purple-600',
    radioBg: 'bg-purple-500',
    label: 'Tím hoa cà (Purple)',
  },
};

function MyVocabContent() {
  const searchParams = useSearchParams();
  const urlDeckId = searchParams.get('deckId');

  const {
    decks,
    activeDeckId,
    hydrated,
    hydrate,
    setActiveDeckId,
    createDeck,
    updateDeck,
    deleteDeck,
    addWordToDeck,
    updateWordInDeck,
    deleteWordFromDeck,
    toggleWordMastered,
    importDecks,
    resetToSample,
    syncStatus,
    syncWithCloud,
    lastSyncedAt,
  } = useCustomVocabStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // View state: 'list' (danh sách các bộ) | 'detail' (quản lý từ trong bộ) | 'flashcards' (luyện thẻ flashcard)
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'flashcards'>('list');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'mastered' | 'learning'>('all');

  // Modals state
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<CustomVocabDeck | null>(null);
  const [deckFormTitle, setDeckFormTitle] = useState('');
  const [deckFormDesc, setDeckFormDesc] = useState('');
  const [deckFormColor, setDeckFormColor] = useState<CustomVocabDeck['color']>('indigo');

  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<CustomVocabWord | null>(null);
  const [wordFormKanji, setWordFormKanji] = useState('');
  const [wordFormHiragana, setWordFormHiragana] = useState('');
  const [wordFormRomaji, setWordFormRomaji] = useState('');
  const [wordFormMeaning, setWordFormMeaning] = useState('');
  const [wordFormExampleJp, setWordFormExampleJp] = useState('');
  const [wordFormExampleVn, setWordFormExampleVn] = useState('');
  const [wordFormNotes, setWordFormNotes] = useState('');
  const [isAutoRomajiEnabled, setIsAutoRomajiEnabled] = useState(true);

  // Import / Export JSON modal
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [jsonBackupText, setJsonBackupText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo deck từ URL query param nếu có
  useEffect(() => {
    if (urlDeckId && decks.some((d) => d.id === urlDeckId)) {
      setSelectedDeckId(urlDeckId);
      setViewMode('detail');
    }
  }, [urlDeckId, decks]);

  // Tìm bộ từ vựng đang chọn
  const activeDeck = useMemo(() => {
    return decks.find((d) => d.id === selectedDeckId) || null;
  }, [decks, selectedDeckId]);

  // Bộ lọc từ vựng trong bộ đang chọn
  const filteredWords = useMemo(() => {
    if (!activeDeck) return [];
    let list = [...activeDeck.words];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (w) =>
          (w.kanji && w.kanji.toLowerCase().includes(q)) ||
          w.hiragana.toLowerCase().includes(q) ||
          w.romaji.toLowerCase().includes(q) ||
          w.meaning_vn.toLowerCase().includes(q) ||
          (w.example_jp && w.example_jp.toLowerCase().includes(q))
      );
    }

    if (filterStatus === 'mastered') {
      list = list.filter((w) => w.isMastered);
    } else if (filterStatus === 'learning') {
      list = list.filter((w) => !w.isMastered);
    }

    return list;
  }, [activeDeck, searchQuery, filterStatus]);

  // Phát âm từ vựng bằng Web Speech API
  const speakWord = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Trình duyệt chưa hỗ trợ phát âm Web Speech.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Mở modal tạo bộ mới
  const handleOpenCreateDeck = () => {
    setEditingDeck(null);
    setDeckFormTitle('');
    setDeckFormDesc('');
    setDeckFormColor('indigo');
    setIsDeckModalOpen(true);
  };

  // Mở modal sửa bộ
  const handleOpenEditDeck = (deck: CustomVocabDeck) => {
    setEditingDeck(deck);
    setDeckFormTitle(deck.title);
    setDeckFormDesc(deck.description || '');
    setDeckFormColor(deck.color || 'indigo');
    setIsDeckModalOpen(true);
  };

  // Lưu thông tin bộ từ vựng
  const handleSaveDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckFormTitle.trim()) {
      toast.error('Vui lòng nhập tên bộ từ vựng.');
      return;
    }

    if (editingDeck) {
      updateDeck(editingDeck.id, {
        title: deckFormTitle.trim(),
        description: deckFormDesc.trim(),
        color: deckFormColor,
      });
      toast.success('Đã cập nhật bộ từ vựng!');
    } else {
      const newId = createDeck({
        title: deckFormTitle.trim(),
        description: deckFormDesc.trim(),
        color: deckFormColor,
      });
      toast.success('Đã tạo bộ từ vựng mới!');
      setSelectedDeckId(newId);
      setViewMode('detail');
    }
    setIsDeckModalOpen(false);
  };

  // Xóa bộ từ vựng
  const handleDeleteDeck = (deck: CustomVocabDeck) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa bộ từ vựng "${deck.title}" cùng toàn bộ ${deck.words.length} từ bên trong?`
      )
    ) {
      deleteDeck(deck.id);
      toast.success(`Đã xóa bộ "${deck.title}".`);
      if (selectedDeckId === deck.id) {
        setSelectedDeckId(null);
        setViewMode('list');
      }
    }
  };

  // Mở modal thêm từ vựng mới
  const handleOpenAddWord = () => {
    setEditingWord(null);
    setWordFormKanji('');
    setWordFormHiragana('');
    setWordFormRomaji('');
    setWordFormMeaning('');
    setWordFormExampleJp('');
    setWordFormExampleVn('');
    setWordFormNotes('');
    setIsAutoRomajiEnabled(true);
    setIsWordModalOpen(true);
  };

  // Mở modal sửa từ vựng
  const handleOpenEditWord = (word: CustomVocabWord) => {
    setEditingWord(word);
    setWordFormKanji(word.kanji || '');
    setWordFormHiragana(word.hiragana);
    setWordFormRomaji(word.romaji);
    setWordFormMeaning(word.meaning_vn);
    setWordFormExampleJp(word.example_jp || '');
    setWordFormExampleVn(word.example_vn || '');
    setWordFormNotes(word.notes || '');
    setIsAutoRomajiEnabled(false);
    setIsWordModalOpen(true);
  };

  // Xử lý tự động điền Romaji khi nhập Hiragana/Katakana
  const handleHiraganaChange = (val: string) => {
    setWordFormHiragana(val);
    if (isAutoRomajiEnabled) {
      const autoRomaji = kanaToRomaji(val);
      setWordFormRomaji(autoRomaji);
    }
  };

  // Lưu từ vựng
  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeckId) return;

    if (!wordFormHiragana.trim()) {
      toast.error('Vui lòng nhập cách đọc Hiragana / Katakana.');
      return;
    }
    if (!wordFormMeaning.trim()) {
      toast.error('Vui lòng nhập nghĩa tiếng Việt.');
      return;
    }

    const payload = {
      kanji: wordFormKanji.trim() || undefined,
      hiragana: wordFormHiragana.trim(),
      romaji: wordFormRomaji.trim() || kanaToRomaji(wordFormHiragana.trim()),
      meaning_vn: wordFormMeaning.trim(),
      example_jp: wordFormExampleJp.trim() || undefined,
      example_vn: wordFormExampleVn.trim() || undefined,
      notes: wordFormNotes.trim() || undefined,
    };

    if (editingWord) {
      updateWordInDeck(selectedDeckId, editingWord.id, payload);
      toast.success('Đã cập nhật từ vựng!');
    } else {
      addWordToDeck(selectedDeckId, payload);
      toast.success('Đã thêm từ vựng mới vào bộ!');
    }
    setIsWordModalOpen(false);
  };

  // Xóa từ vựng
  const handleDeleteWord = (word: CustomVocabWord) => {
    if (!selectedDeckId) return;
    if (confirm(`Bạn muốn xóa từ "${word.kanji || word.hiragana}"?`)) {
      deleteWordFromDeck(selectedDeckId, word.id);
      toast.success('Đã xóa từ vựng.');
    }
  };

  // Xuất file JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(decks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `marugoto-custom-vocab-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Đã tải xuống file sao lưu JSON thành công!');
  };

  // Nhập từ file JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('Dữ liệu JSON không đúng định dạng danh sách bộ từ vựng.');
        }
        const count = importDecks(parsed);
        toast.success(`Đã nhập thành công ${count} bộ từ vựng!`);
        setIsBackupModalOpen(false);
      } catch (err: any) {
        toast.error(`Lỗi khi đọc file JSON: ${err?.message || 'Không hợp lệ'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Nhập từ Textarea
  const handleImportJsonText = () => {
    try {
      const parsed = JSON.parse(jsonBackupText);
      if (!Array.isArray(parsed)) {
        throw new Error('Dữ liệu JSON phải là mảng danh sách bộ từ vựng.');
      }
      const count = importDecks(parsed);
      toast.success(`Đã nhập thành công ${count} bộ từ vựng!`);
      setJsonBackupText('');
      setIsBackupModalOpen(false);
    } catch (err: any) {
      toast.error(`JSON không hợp lệ: ${err?.message}`);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Chế độ Luyện Flashcards
  if (viewMode === 'flashcards' && activeDeck) {
    return (
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6">
        <CustomDeckFlashcards
          deck={activeDeck}
          onClose={() => setViewMode('detail')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      {/* ========================================================
          TRƯỜNG HỢP 1: CHI TIẾT BỘ TỪ VỰNG (QUẢN LÝ TỪ VỰNG)
         ======================================================== */}
      {viewMode === 'detail' && activeDeck ? (
        <div className="space-y-5">
          {/* Top Bar Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <button
              onClick={() => {
                setSelectedDeckId(null);
                setViewMode('list');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Về danh sách tất cả các bộ</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode('flashcards')}
                disabled={activeDeck.words.length === 0}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                  activeDeck.words.length > 0
                    ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Luyện thẻ Flashcard ({activeDeck.words.length})</span>
              </button>

              <button
                onClick={handleOpenAddWord}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-indigo-600" />
                <span>Thêm từ mới</span>
              </button>

              <button
                onClick={() => handleOpenEditDeck(activeDeck)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                title="Chỉnh sửa tên và màu bộ từ vựng"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sửa bộ</span>
              </button>

              <button
                onClick={() => handleDeleteDeck(activeDeck)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                title="Xóa bộ từ vựng"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Xóa bộ</span>
              </button>
            </div>
          </div>

          {/* Deck Header Summary Card (Zero Shadow) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block h-3 w-3 rounded-full',
                      COLOR_VARIANTS[activeDeck.color || 'indigo'].accentBg
                    )}
                  />
                  <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                    {activeDeck.title}
                  </h1>
                </div>
                {activeDeck.description && (
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    {activeDeck.description}
                  </p>
                )}
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                  Tổng:{' '}
                  <strong className="text-slate-900">
                    {activeDeck.words.length}
                  </strong>{' '}
                  từ
                </span>
                <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Đã thuộc:{' '}
                  <strong>
                    {activeDeck.words.filter((w) => w.isMastered).length}
                  </strong>
                </span>
              </div>
            </div>

            {/* Tiến độ ghi nhớ */}
            {activeDeck.words.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Mức độ hoàn thành</span>
                  <span>
                    {Math.round(
                      (activeDeck.words.filter((w) => w.isMastered).length /
                        activeDeck.words.length) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${
                        (activeDeck.words.filter((w) => w.isMastered).length /
                          activeDeck.words.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo chữ Hán, Hiragana, Romaji hoặc nghĩa..."
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                  filterStatus === 'all'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                Tất cả ({activeDeck.words.length})
              </button>
              <button
                onClick={() => setFilterStatus('learning')}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                  filterStatus === 'learning'
                    ? 'border-amber-600 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                Đang học ({activeDeck.words.filter((w) => !w.isMastered).length})
              </button>
              <button
                onClick={() => setFilterStatus('mastered')}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                  filterStatus === 'mastered'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                Đã thuộc ({activeDeck.words.filter((w) => w.isMastered).length})
              </button>
            </div>
          </div>

          {/* Danh sách Từ vựng */}
          {filteredWords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-medium text-slate-600">
                {searchQuery || filterStatus !== 'all'
                  ? 'Không tìm thấy từ vựng nào khớp với bộ lọc'
                  : 'Bộ từ vựng này chưa có từ nào'}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Hãy thêm từ mới để bắt đầu học và luyện flashcard ngay.
              </p>
              <button
                onClick={handleOpenAddWord}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Thêm từ vựng đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className={cn(
                    'group relative flex flex-col justify-between rounded-xl border bg-white p-3.5 transition-colors',
                    word.isMastered
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200'
                  )}
                >
                  <div>
                    {/* Header: Pronunciation & Mastered badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => speakWord(word.kanji || word.hiragana)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[11px] font-mono text-slate-400">
                          {word.romaji}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          toggleWordMastered(activeDeck.id, word.id)
                        }
                        className={cn(
                          'flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors',
                          word.isMastered
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        )}
                        title={
                          word.isMastered
                            ? 'Đã thuộc (Bấm để chuyển sang cần ôn)'
                            : 'Đang học (Bấm để đánh dấu đã thuộc)'
                        }
                      >
                        {word.isMastered ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Đã thuộc</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-3 w-3 text-slate-400" />
                            <span>Đang học</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Word main content */}
                    <div className="mt-2.5">
                      <div className="flex items-baseline gap-2">
                        {word.kanji ? (
                          <>
                            <span className="text-xl font-bold text-slate-900">
                              {word.kanji}
                            </span>
                            <span className="text-xs text-indigo-600">
                              {word.hiragana}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-slate-900">
                            {word.hiragana}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {word.meaning_vn}
                      </p>

                      {/* Example sentence */}
                      {word.example_jp && (
                        <div className="mt-2 rounded-md border border-slate-100 bg-slate-50 p-2 text-[11px]">
                          <p className="text-slate-800 font-medium">
                            {word.example_jp}
                          </p>
                          {word.example_vn && (
                            <p className="mt-0.5 text-slate-500 italic">
                              {word.example_vn}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {word.notes && (
                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {word.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2">
                    <button
                      onClick={() => handleOpenEditWord(word)}
                      className="rounded p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                      title="Sửa từ"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWord(word)}
                      className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                      title="Xóa từ"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
            TRƯỜNG HỢP 2: DANH SÁCH BỘ TỪ VỰNG CÁ NHÂN (GRID DECKS)
           ======================================================== */
        <div className="space-y-6">
          {/* Header Banner (Zero-Shadow) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3.5">
            {/* Top: Icon, Title & Cloud Sync status badge + Mô tả đầy đủ không bị bóp nghẹt */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600">
                  <FolderHeart className="h-4 w-4" />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Bộ từ vựng của tôi & Thẻ Flashcards
                </h1>

                {/* Trạng thái đồng bộ Supabase Cloud (Status Pill) */}
                {syncStatus === 'synced' ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.promise(syncWithCloud(), {
                        loading: 'Đang đồng bộ với Supabase Cloud...',
                        success: 'Đã đồng bộ mới nhất với Supabase Cloud!',
                        error: 'Lỗi khi đồng bộ dữ liệu.',
                      });
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    title="Đã đồng bộ lên Supabase Cloud. Bấm để đồng bộ lại ngay."
                  >
                    <Cloud className="h-3 w-3 text-emerald-600" />
                    <span>Supabase Cloud Sync</span>
                  </button>
                ) : syncStatus === 'syncing' ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-600" />
                    <span>Đang đồng bộ...</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500"
                    title="Đang lưu bộ nhớ thiết bị. Đăng nhập để tự động đồng bộ sang Supabase Cloud."
                  >
                    <CloudOff className="h-3 w-3 text-slate-400" />
                    <span>Lưu trên máy (Local)</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                Tự tạo các bộ từ vựng cá nhân hoá theo chủ đề (giao tiếp, chuyên ngành, thi JLPT) và chuyển hóa thành các bộ Flashcards tương tác kèm phát âm tức thì.
              </p>
            </div>

            {/* Bottom: Action Buttons Toolbar (Nằm ngay ngắn ở hàng dưới, không bị kéo lệch lên trên bên phải) */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={handleOpenCreateDeck}
                className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                  <Plus className="h-4 w-4" />
                  <span>Tạo bộ từ vựng mới</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBackupModalOpen(true)}
                  className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Sao lưu hoặc nhập dữ liệu từ vựng JSON"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Sao lưu / Nhập JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Bạn có muốn nạp lại bộ từ vựng giao tiếp mẫu mặc định?'
                      )
                    ) {
                      resetToSample();
                      toast.success('Đã nạp lại bộ mẫu thành công!');
                    }
                  }}
                  className="inline-flex shrink-0 h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Khôi phục bộ mẫu mặc định"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
          </div>

          {/* Danh sách các bộ từ vựng */}
          {decks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <FolderHeart className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-3 text-sm font-semibold text-slate-700">
                Bạn chưa có bộ từ vựng nào
              </h2>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Bắt đầu bằng việc tạo một bộ từ vựng theo chủ đề để lưu lại các từ cần học, sau đó ôn luyện với Flashcards 3D.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={handleOpenCreateDeck}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tạo bộ từ vựng đầu tiên</span>
                </button>
                <button
                  onClick={resetToSample}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Tải bộ giao tiếp mẫu</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {decks.map((deck) => {
                const colorConfig = COLOR_VARIANTS[deck.color || 'indigo'];
                const masteredCount = deck.words.filter(
                  (w) => w.isMastered
                ).length;
                const progressPct =
                  deck.words.length > 0
                    ? Math.round((masteredCount / deck.words.length) * 100)
                    : 0;

                return (
                  <div
                    key={deck.id}
                    className={cn(
                      'group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors',
                      colorConfig.border
                    )}
                  >
                    <div>
                      {/* Top Bar: Color pill & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold',
                            colorConfig.badge
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              colorConfig.accentBg
                            )}
                          />
                          <span>{deck.words.length} từ vựng</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditDeck(deck)}
                            className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Sửa tên & màu"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeck(deck)}
                            className="rounded p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Xóa bộ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h2 className="mt-2.5 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {deck.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {deck.description || 'Chưa có mô tả cho bộ này.'}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>
                            Thuộc:{' '}
                            <strong className="text-slate-800">
                              {masteredCount}/{deck.words.length}
                            </strong>
                          </span>
                          <span className="font-semibold text-slate-700">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              colorConfig.accentBg
                            )}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => {
                          setSelectedDeckId(deck.id);
                          setViewMode('flashcards');
                        }}
                        disabled={deck.words.length === 0}
                        className={cn(
                          'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold transition-colors',
                          deck.words.length > 0
                            ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                        )}
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>Flashcard</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDeckId(deck.id);
                          setViewMode('detail');
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      >
                        <span>Quản lý từ</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: TẠO / CHỈNH SỬA BỘ TỪ VỰNG (ZERO SHADOW)
         ======================================================== */}
      {isDeckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDeck ? 'Chỉnh sửa bộ từ vựng' : 'Tạo bộ từ vựng mới'}
              </h3>
              <button
                onClick={() => setIsDeckModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeck} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên bộ từ vựng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giao tiếp nhà hàng, Từ vựng N5 bài 5..."
                  value={deckFormTitle}
                  onChange={(e) => setDeckFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mô tả / Ghi chú ngắn
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả mục tiêu của bộ từ vựng này..."
                  value={deckFormDesc}
                  onChange={(e) => setDeckFormDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Chọn màu sắc đại diện */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Màu sắc chủ đạo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(COLOR_VARIANTS) as Array<CustomVocabDeck['color']>).map(
                    (colorKey) => {
                      const c = COLOR_VARIANTS[colorKey];
                      const isSelected = deckFormColor === colorKey;
                      return (
                        <button
                          key={colorKey}
                          type="button"
                          onClick={() => setDeckFormColor(colorKey)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                            isSelected
                              ? 'border-indigo-600 bg-slate-50 text-slate-900 font-semibold'
                              : 'border-slate-200 text-slate-600 hover:text-slate-900'
                          )}
                        >
                          <span
                            className={cn('h-2.5 w-2.5 rounded-full', c.radioBg)}
                          />
                          <span>{c.label.split(' ')[0]}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeckModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  {editingDeck ? 'Cập nhật' : 'Tạo bộ ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: THÊM / CHỈNH SỬA TỪ VỰNG (ZERO SHADOW)
         ======================================================== */}
      {isWordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingWord ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới vào bộ'}
              </h3>
              <button
                onClick={() => setIsWordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWord} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Chữ Hán (Kanji) <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 先生, 日本, 友達"
                    value={wordFormKanji}
                    onChange={(e) => setWordFormKanji(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Hiragana / Katakana <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: せんせい, にほん"
                    value={wordFormHiragana}
                    onChange={(e) => handleHiraganaChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700">
                      Romaji
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const romaji = kanaToRomaji(wordFormHiragana);
                        setWordFormRomaji(romaji);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      Tự tạo từ Kana
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="sensei, nihon"
                    value={wordFormRomaji}
                    onChange={(e) => {
                      setIsAutoRomajiEnabled(false);
                      setWordFormRomaji(e.target.value);
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nghĩa tiếng Việt <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Giáo viên, thầy cô giáo"
                    value={wordFormMeaning}
                    onChange={(e) => setWordFormMeaning(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Câu ví dụ tiếng Nhật <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 田中先生は日本語を教えます。"
                  value={wordFormExampleJp}
                  onChange={(e) => setWordFormExampleJp(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dịch nghĩa câu ví dụ <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thầy Tanaka dạy tiếng Nhật."
                  value={wordFormExampleVn}
                  onChange={(e) => setWordFormExampleVn(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ghi chú ngữ cảnh / Từ loại <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Danh từ lịch sự, thường dùng xưng hô..."
                  value={wordFormNotes}
                  onChange={(e) => setWordFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWordModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  {editingWord ? 'Cập nhật từ' : 'Thêm từ vào bộ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SAO LƯU & NHẬP / XUẤT JSON (ZERO SHADOW)
         ======================================================== */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Sao lưu & Nhập / Xuất dữ liệu từ vựng JSON
              </h3>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Xuất file */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <h4 className="text-xs font-semibold text-slate-800">
                  1. Tải về file sao lưu (Export JSON)
                </h4>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Lưu trữ toàn bộ các bộ từ vựng và tiến độ của bạn thành file .json về máy tính hoặc iPad để không bao giờ bị mất dữ liệu.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Tải file JSON sao lưu ({decks.length} bộ)</span>
                </button>
              </div>

              {/* Nhập file */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <h4 className="text-xs font-semibold text-slate-800">
                  2. Khôi phục từ file hoặc dán JSON (Import)
                </h4>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Chọn file .json từ thiết bị hoặc dán trực tiếp đoạn mã JSON vào ô bên dưới.
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Chọn file .json từ thiết bị</span>
                  </button>
                </div>

                <div className="mt-3">
                  <textarea
                    rows={4}
                    placeholder="Hoặc dán chuỗi JSON vào đây..."
                    value={jsonBackupText}
                    onChange={(e) => setJsonBackupText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 font-mono text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  {jsonBackupText.trim() && (
                    <button
                      onClick={handleImportJsonText}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                    >
                      <span>Nhập từ nội dung vừa dán</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsBackupModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyVocabPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <MyVocabContent />
    </Suspense>
  );
}
