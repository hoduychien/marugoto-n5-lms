'use client';

import React, { useState, useMemo, useId, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Select, {
  components,
  type DropdownIndicatorProps,
} from 'react-select';
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  BookOpen,
  GraduationCap,
  Languages,
  FileText,
  Search,
  Download,
  UploadCloud,
  RotateCcw,
  ChevronDown,
  ExternalLink,
  Plus,
  X,
  LogOut,
  Lock,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import {
  MARUGOTO_LESSONS_SEED,
  MARUGOTO_VOCAB_SEED,
} from '@/lib/data/marugoto-seed';
import { MARUGOTO_KANJI_SEED } from '@/lib/data/marugoto-kanji-seed';
import { MARUGOTO_GRAMMAR_SEED } from '@/lib/data/marugoto-grammar-kaiwa-seed';
import { MARUGOTO_OVERVIEW_SEED } from '@/lib/data/marugoto-overview-seed';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface LessonOption {
  value: number;
  label: string;
}

const CustomDropdownIndicator = (
  props: DropdownIndicatorProps<LessonOption, false>
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

export default function AdminPage() {
  const router = useRouter();
  const tooltipId = useId();

  // Trạng thái xác thực quyền Admin
  const [authStatus, setAuthStatus] = useState<
    'checking' | 'unauthenticated' | 'forbidden' | 'authorized'
  >('checking');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    'vocab' | 'grammar' | 'kanji' | 'overview'
  >('vocab');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // State form thêm nhanh từ vựng mới
  const [newWordKanji, setNewWordKanji] = useState('');
  const [newWordFurigana, setNewWordFurigana] = useState('');
  const [newWordRomaji, setNewWordRomaji] = useState('');
  const [newWordMeaning, setNewWordMeaning] = useState('');

  // Kiểm tra phiên đăng nhập và role === 'admin'
  useEffect(() => {
    let mounted = true;

    async function verifyAdminAccess() {
      if (isSupabaseConfigured) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setAuthStatus('unauthenticated');
          toast.error('Yêu cầu đăng nhập tài khoản Quản trị viên (Admin)', {
            description: 'Đang chuyển hướng đến trang đăng nhập...',
          });
          router.replace('/dashboard?login=1');
          return;
        }

        setCurrentUserEmail(user.email || '');

        // Kiểm tra role trong bảng profiles hoặc user_metadata / app_metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        const isAdmin =
          profile?.role === 'admin' ||
          user.user_metadata?.role === 'admin' ||
          user.app_metadata?.role === 'admin';

        if (isAdmin) {
          // Đồng bộ lại bảng profiles nếu user_metadata đã là admin nhưng profiles.role vẫn là 'user'
          if (profile && profile.role !== 'admin') {
            await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id);
          }
          setAuthStatus('authorized');
        } else {
          setAuthStatus('forbidden');
        }
      } else {
        // Kiểm tra tài khoản ở Local Mode
        const raw = localStorage.getItem('marugoto_n5_demo_user');
        if (!raw) {
          setAuthStatus('unauthenticated');
          toast.error('Yêu cầu đăng nhập tài khoản Quản trị viên (Admin)', {
            description: 'Đang chuyển hướng đến trang đăng nhập...',
          });
          router.replace('/dashboard?login=1');
          return;
        }
        try {
          const parsed = JSON.parse(raw);
          setCurrentUserEmail(parsed.email || 'hocvien@marugoto.jp');
          if (parsed.role === 'admin') {
            setAuthStatus('authorized');
          } else {
            setAuthStatus('forbidden');
          }
        } catch {
          router.replace('/dashboard?login=1');
        }
      }
    }

    verifyAdminAccess();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Đăng xuất khỏi tài khoản hiện tại
  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('marugoto_n5_demo_user');
    toast.success('Đã đăng xuất khỏi phiên Quản trị viên.');
    router.push('/login?redirect=/admin');
  };

  const lessonOptions = useMemo<LessonOption[]>(
    () =>
      MARUGOTO_LESSONS_SEED.map((l) => ({
        value: l.id,
        label: l.topic_name,
      })),
    []
  );

  const selectedLessonOption = useMemo(
    () =>
      lessonOptions.find((o) => o.value === selectedLessonId) ||
      lessonOptions[0],
    [lessonOptions, selectedLessonId]
  );

  // Thống kê tổng số lượng toàn hệ thống 18 bài
  const systemTotals = useMemo(() => {
    const totalVocab = Object.values(MARUGOTO_VOCAB_SEED).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    const totalGrammar = Object.values(MARUGOTO_GRAMMAR_SEED).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    const totalKanji = Object.values(MARUGOTO_KANJI_SEED).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    return {
      lessons: MARUGOTO_LESSONS_SEED.length,
      vocab: totalVocab,
      grammar: totalGrammar,
      kanji: totalKanji,
    };
  }, []);

  const currentVocabs = useMemo(() => {
    const list = MARUGOTO_VOCAB_SEED[selectedLessonId] || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (v) =>
        (v.kanji && v.kanji.toLowerCase().includes(q)) ||
        v.hiragana.toLowerCase().includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.meaning_vn.toLowerCase().includes(q)
    );
  }, [selectedLessonId, searchQuery]);

  const currentGrammars = useMemo(() => {
    const list = MARUGOTO_GRAMMAR_SEED[selectedLessonId] || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (g) =>
        g.pattern.toLowerCase().includes(q) ||
        g.meaning_vn.toLowerCase().includes(q) ||
        g.explanation_vn.toLowerCase().includes(q)
    );
  }, [selectedLessonId, searchQuery]);

  const currentKanjis = useMemo(() => {
    const list = MARUGOTO_KANJI_SEED[selectedLessonId] || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (k) =>
        k.character.toLowerCase().includes(q) ||
        k.yomikata.toLowerCase().includes(q) ||
        (k.han_viet && k.han_viet.toLowerCase().includes(q)) ||
        k.meaning_vn.toLowerCase().includes(q)
    );
  }, [selectedLessonId, searchQuery]);

  const currentOverview = useMemo(
    () => MARUGOTO_OVERVIEW_SEED[selectedLessonId] || MARUGOTO_OVERVIEW_SEED[1],
    [selectedLessonId]
  );

  // Xuất dữ liệu bài học hiện tại ra file JSON
  const handleExportJson = () => {
    const payload = {
      lesson: MARUGOTO_LESSONS_SEED.find((l) => l.id === selectedLessonId),
      overview: MARUGOTO_OVERVIEW_SEED[selectedLessonId],
      vocabularies: MARUGOTO_VOCAB_SEED[selectedLessonId],
      grammars: MARUGOTO_GRAMMAR_SEED[selectedLessonId],
      kanjis: MARUGOTO_KANJI_SEED[selectedLessonId],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marugoto-a1-lesson-${selectedLessonId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Đã xuất dữ liệu Bài ${selectedLessonId} thành công!`, {
      description: `File marugoto-a1-lesson-${selectedLessonId}.json đã được tải về máy.`,
    });
  };

  // Đồng bộ toàn bộ dữ liệu 18 bài học (6 bảng) lên Supabase
  const handleSyncToSupabase = async () => {
    if (!isSupabaseConfigured) {
      toast.info('Chưa cấu hình biến môi trường Supabase (.env.local)', {
        description:
          'Vui lòng tạo file .env.local với NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY rồi khởi động lại server.',
      });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch('/api/seed-supabase', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Lỗi không xác định từ máy chủ.');
      }

      toast.success(
        'Đã đồng bộ trọn bộ 18 bài học lên Supabase thành công!',
        {
          description: `Đã nạp ${data.counts.lessons} bài, ${data.counts.vocabularies} từ vựng, ${data.counts.grammars} ngữ pháp, ${data.counts.kanjis} Kanji & ${data.counts.kaiwas} hội thoại.`,
        }
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu.';
      toast.error('Đồng bộ Supabase không thành công', {
        description: msg,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Xóa tiến độ SRS lưu trên trình duyệt
  const handleResetProgress = () => {
    localStorage.removeItem('marugoto_n5_srs_progress_v1');
    toast.success('Đã đặt lại toàn bộ tiến độ ôn tập SRS!', {
      description: 'Tải lại trang Dashboard hoặc Flashcards để bắt đầu lại từ đầu.',
    });
  };

  // Xử lý thêm từ vựng mới
  const handleAddVocabulary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordKanji.trim() || !newWordMeaning.trim()) {
      toast.error('Vui lòng nhập Từ tiếng Nhật và Nghĩa tiếng Việt.');
      return;
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('vocabularies').insert({
        lesson_id: selectedLessonId,
        kanji: newWordKanji.trim(),
        furigana: newWordFurigana.trim() || newWordKanji.trim(),
        romaji: newWordRomaji.trim(),
        meaning_vn: newWordMeaning.trim(),
      });
      if (error) {
        toast.error('Không thể lưu vào Supabase', {
          description: error.message,
        });
        return;
      }
    }

    toast.success(`Đã thêm từ vựng 「${newWordKanji.trim()}」 vào Bài ${selectedLessonId}!`, {
      description: `Nghĩa: ${newWordMeaning.trim()}`,
    });
    setNewWordKanji('');
    setNewWordFurigana('');
    setNewWordRomaji('');
    setNewWordMeaning('');
    setShowAddModal(false);
  };

  if (authStatus === 'checking' || authStatus === 'unauthenticated') {
    return (
      <AppShell>
        <main className="mx-auto max-w-lg p-8 pt-20 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Lock className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">
            Đang kiểm tra quyền truy cập Quản trị viên (Admin)...
          </h1>
          <p className="text-xs text-slate-500">
            Trang quản trị yêu cầu xác thực bằng tài khoản có quyền Admin.
          </p>
        </main>
      </AppShell>
    );
  }

  if (authStatus === 'forbidden') {
    return (
      <AppShell>
        <main className="mx-auto max-w-xl p-6 sm:p-8 pt-12">
          <div className="rounded-lg border border-rose-200 bg-white p-6 sm:p-8 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-slate-900">
                  Truy cập bị từ chối (Yêu cầu quyền Admin)
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tài khoản hiện tại{' '}
                  <strong className="text-slate-900">{currentUserEmail}</strong>{' '}
                  là tài khoản <strong>Học viên (user)</strong> nên không có
                  quyền truy cập Cổng Quản trị.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng nhập bằng tài khoản Admin</span>
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Quay về Bảng điều khiển</span>
              </Link>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ================= HEADER QUẢN TRỊ ================= */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Admin: {currentUserEmail}</span>
              </span>
              <span
                className={cn(
                  'inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border',
                  isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                )}
              >
                <Database className="h-3 w-3 shrink-0" />
                <span>
                  {isSupabaseConfigured ? 'Supabase Cloud' : 'Local Seed Mode'}
                </span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Quản trị Học liệu Marugoto A1 (N5)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
              Kiểm tra kho dữ liệu 18 bài học, xuất dữ liệu JSON, đồng bộ
              Supabase hoặc quản lý tiến độ học viên.
            </p>
          </div>

          {/* Cụm nút tác vụ quản trị: Nằm ngay ngắn ở hàng dưới */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Thêm nhanh từ vựng mới vào bài học đang chọn"
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Thêm từ vựng</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Tải xuống dữ liệu bài học hiện tại dưới dạng JSON"
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Xuất JSON</span>
            </button>

            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSyncToSupabase}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Đồng bộ dữ liệu bài học lên Supabase Database"
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4 shrink-0 text-indigo-600" />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetProgress}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Đặt lại toàn bộ tiến độ SRS & EXP trên trình duyệt"
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>Reset SRS</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Đăng xuất tài khoản Quản trị viên"
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* ================= THỐNG KÊ TOÀN HỆ THỐNG ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 transition-colors flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Tổng số Bài học
              </p>
              <p className="text-xl font-bold text-slate-900">
                {systemTotals.lessons} bài (9 Chủ đề)
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 transition-colors flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Tổng Từ vựng (Wordbook)
              </p>
              <p className="text-xl font-bold text-slate-900">
                {systemTotals.vocab} mục từ
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 transition-colors flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Tổng Mẫu Ngữ pháp
              </p>
              <p className="text-xl font-bold text-slate-900">
                {systemTotals.grammar} cấu trúc
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 transition-colors flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Tổng Chữ Hán (Kanji)
              </p>
              <p className="text-xl font-bold text-slate-900">
                {systemTotals.kanji} chữ Hán
              </p>
            </div>
          </div>
        </div>

        {/* ================= BỘ LỌC BÀI HỌC & BẢNG DỮ LIỆU ================= */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            {/* Chọn bài học bằng react-select */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-full sm:w-80">
                <Select<LessonOption, false>
                  instanceId="admin-lesson-select"
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
                      minHeight: '38px',
                      height: '38px',
                      borderRadius: '0.5rem',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
                      boxShadow: 'none',
                      cursor: 'pointer',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      height: '36px',
                      padding: '0 12px',
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      height: '36px',
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      padding: '0 10px 0 4px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      fontSize: '12px',
                      padding: '7px 10px',
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
                      borderRadius: '0.625rem',
                      padding: '4px',
                      border: '1px solid #e2e8f0',
                    }),
                  }}
                />
              </div>

              <Link
                href={`/lessons/${selectedLessonId}/overview`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <span>Mở trang học Bài {selectedLessonId}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Ô tìm kiếm */}
            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc nhanh trong bài đang chọn..."
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Chuyển tab dữ liệu */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('vocab')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'vocab'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Từ vựng ({currentVocabs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grammar')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'grammar'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Ngữ pháp ({currentGrammars.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kanji')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'kanji'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Languages className="h-3.5 w-3.5" />
              <span>Hán tự ({currentKanjis.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Lý thuyết tổng hợp</span>
            </button>
          </div>

          {/* Nội dung bảng theo Tab */}
          {activeTab === 'vocab' && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Từ vựng (Kanji/Kana)</th>
                    <th className="py-3 px-4">Furigana</th>
                    <th className="py-3 px-4">Romaji</th>
                    <th className="py-3 px-4">Nghĩa Tiếng Việt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentVocabs.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-xs font-mono text-slate-400">
                        #{v.id}
                      </td>
                      <td className="py-2.5 px-4 font-jp text-base font-semibold text-indigo-950">
                        {v.kanji || v.hiragana}
                      </td>
                      <td className="py-2.5 px-4 font-jp text-slate-600">
                        {v.hiragana}
                      </td>
                      <td className="py-2.5 px-4 text-xs italic text-slate-500">
                        {v.romaji}
                      </td>
                      <td className="py-2.5 px-4 font-vn font-medium text-slate-800">
                        {v.meaning_vn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'grammar' && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Mẫu cấu trúc</th>
                    <th className="py-3 px-4">Ý nghĩa</th>
                    <th className="py-3 px-4">Giải thích ngữ pháp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentGrammars.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-xs font-mono text-slate-400">
                        #{g.id}
                      </td>
                      <td className="py-2.5 px-4 font-jp text-base font-semibold text-indigo-950">
                        {g.pattern}
                      </td>
                      <td className="py-2.5 px-4 font-vn font-semibold text-indigo-700">
                        {g.meaning_vn}
                      </td>
                      <td className="py-2.5 px-4 font-vn text-xs text-slate-600 max-w-md">
                        {g.explanation_vn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'kanji' && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Chữ Hán</th>
                    <th className="py-3 px-4">Hán Việt</th>
                    <th className="py-3 px-4">Âm đọc (On / Kun)</th>
                    <th className="py-3 px-4">Nghĩa Tiếng Việt</th>
                    <th className="py-3 px-4">Số nét</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentKanjis.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-jp text-2xl font-bold text-indigo-950">
                        {k.character}
                      </td>
                      <td className="py-2.5 px-4 text-xs font-bold uppercase text-indigo-600">
                        {k.han_viet || '—'}
                      </td>
                      <td className="py-2.5 px-4 font-jp text-xs text-slate-600">
                        {k.yomikata}
                      </td>
                      <td className="py-2.5 px-4 font-vn font-medium text-slate-800">
                        {k.meaning_vn}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">
                        {k.stroke_count} nét
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Tóm tắt bài học
                </p>
                <p className="font-vn text-sm text-slate-800 mt-1">
                  {currentOverview.summary_vn}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Mục tiêu Can-do ({currentOverview.can_do_objectives.length})
                </p>
                <ul className="mt-1 space-y-1 text-sm text-slate-700 list-disc list-inside">
                  {currentOverview.can_do_objectives.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ================= MODAL THÊM TỪ VỰNG MỚI ================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Thêm từ vựng mới vào Bài {selectedLessonId}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddVocabulary} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Từ tiếng Nhật (Kanji / Kana) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWordKanji}
                    onChange={(e) => setNewWordKanji(e.target.value)}
                    placeholder="VD: 先生"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-jp focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Cách đọc Furigana (Hiragana)
                  </label>
                  <input
                    type="text"
                    value={newWordFurigana}
                    onChange={(e) => setNewWordFurigana(e.target.value)}
                    placeholder="VD: せんせい"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-jp focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Phiên âm Romaji
                  </label>
                  <input
                    type="text"
                    value={newWordRomaji}
                    onChange={(e) => setNewWordRomaji(e.target.value)}
                    placeholder="VD: sensee"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nghĩa Tiếng Việt *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWordMeaning}
                    onChange={(e) => setNewWordMeaning(e.target.value)}
                    placeholder="VD: Giáo viên"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-vn focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    Lưu từ vựng
                  </button>
                </div>
              </form>
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
    </AppShell>
  );
}
