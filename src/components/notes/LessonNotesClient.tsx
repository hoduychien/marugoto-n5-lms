'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  GraduationCap,
  Languages,
  MessageSquare,
  NotebookPen,
  LogIn,
  Lock,
  Save,
  Check,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Bookmark,
  Plus,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  PanelRightClose,
  PanelRightOpen,
  HelpCircle,
  Clock,
  Send,
  Eye,
  Edit3,
  Columns,
} from 'lucide-react';
import { marked } from 'marked';
import { toast } from 'sonner';
import { LessonSelectSwitcher } from '@/components/layout/LessonSelectSwitcher';
import type { LessonInfo } from '@/lib/data/marugoto-seed';
import type { VocabularyItem } from '@/components/quiz/SRSFlashcard';
import type { GrammarPoint } from '@/lib/data/marugoto-grammar-kaiwa-seed';
import { useLessonNotesStore } from '@/store/useLessonNotesStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { AuthUserInfo } from '@/components/auth/LoginModal';

interface LessonNotesClientProps {
  lesson: LessonInfo;
  allLessons: LessonInfo[];
  vocabularies: VocabularyItem[];
  grammars: GrammarPoint[];
  dataSource: 'supabase' | 'seed';
}

export type EditorMode = 'edit' | 'preview' | 'split';

const PRESET_TAGS = [
  '📌 Lời dặn Sensei',
  '⚠️ Lỗi ngữ pháp',
  '💡 Mẹo phát âm',
  '❓ Cần hỏi lại',
  '🎯 Mẫu câu luyện tập',
  '📝 Bài tập về nhà',
];

export function LessonNotesClient({
  lesson,
  allLessons,
  vocabularies,
  grammars,
}: LessonNotesClientProps) {
  const [authUser, setAuthUser] = useState<AuthUserInfo | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showRefPanel, setShowRefPanel] = useState(true);
  const [activeRefTab, setActiveRefTab] = useState<'vocab' | 'grammar'>('vocab');
  const [customTagInput, setCustomTagInput] = useState('');
  const [isCustomTagOpen, setIsCustomTagOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');
  const [isPendingSave, setIsPendingSave] = useState(false);
  const [saveCountdown, setSaveCountdown] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    getNote,
    updateTitle,
    updateContent,
    toggleTag,
    addTag,
    saveNote,
    deleteNote,
    loadRemoteNote,
    resetNote,
    syncStatus,
    lastSavedAt,
  } = useLessonNotesStore();

  // 1. Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (typeof window === 'undefined') return;

      // 1. Kiểm tra Supabase
      if (isSupabaseConfigured) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const user = session.user;
            const info: AuthUserInfo = {
              email: user.email || '',
              displayName:
                (user.user_metadata?.full_name as string) ||
                user.email?.split('@')[0] ||
                'Học viên',
              role:
                user.user_metadata?.role === 'admin' ||
                user.app_metadata?.role === 'admin'
                  ? 'admin'
                  : 'user',
            };
            setAuthUser(info);
            setIsCheckingAuth(false);
            void loadRemoteNote(lesson.id, user.id);
            return;
          }
        } catch {
          // ignore
        }
      }

      // 2. Kiểm tra Local Storage cache
      try {
        const cached = localStorage.getItem('marugoto_n5_auth_user');
        if (cached && mounted) {
          const parsed = JSON.parse(cached);
          setAuthUser(parsed);
          setIsCheckingAuth(false);
          return;
        }

        const demo = localStorage.getItem('marugoto_n5_demo_user');
        if (demo && mounted) {
          const parsed = JSON.parse(demo);
          setAuthUser({
            email: parsed.email || 'hocvien@marugoto.jp',
            displayName: parsed.fullName || parsed.displayName || 'Học viên',
            role: parsed.role === 'admin' ? 'admin' : 'user',
          });
          setIsCheckingAuth(false);
          return;
        }
      } catch {
        // ignore
      }

      if (mounted) {
        setAuthUser(null);
        setIsCheckingAuth(false);
      }
    }

    void checkAuth();

    // Lắng nghe auth state change từ Supabase
    let authSub: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const info: AuthUserInfo = {
            email: session.user.email || '',
            displayName:
              (session.user.user_metadata?.full_name as string) ||
              session.user.email?.split('@')[0] ||
              'Học viên',
            role:
              session.user.user_metadata?.role === 'admin' ? 'admin' : 'user',
          };
          setAuthUser(info);
          void loadRemoteNote(lesson.id, session.user.id);
        } else {
          const localCached = localStorage.getItem('marugoto_n5_auth_user');
          if (!localCached) {
            setAuthUser(null);
          }
        }
      });
      authSub = subscription;
    }

    return () => {
      mounted = false;
      if (authSub) authSub.unsubscribe();
    };
  }, [lesson.id, loadRemoteNote]);

  // Lấy dữ liệu note hiện tại
  const currentNote = getNote(lesson.id, authUser?.email || 'guest');

  // Tự động lưu sau 5 giây ngừng gõ
  const trigger5sAutoSave = () => {
    setIsPendingSave(true);
    setSaveCountdown(5);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let remaining = 5;
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setSaveCountdown(remaining);
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    autoSaveTimerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setSaveCountdown(null);
      setIsPendingSave(false);
      void saveNote(lesson.id, authUser?.email);
    }, 5000);
  };

  // Hủy timers khi unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleSaveImmediately = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSaveCountdown(null);
    setIsPendingSave(false);
    await saveNote(lesson.id, authUser?.email);
    toast.success('Đã lưu ghi chú bài học thành công!');
  };

  // Debounced auto-save sau 5 giây ngừng gõ khi nội dung thay đổi
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    updateContent(lesson.id, val, authUser?.email);
    trigger5sAutoSave();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateTitle(lesson.id, val, authUser?.email);
    trigger5sAutoSave();
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (authUser) {
          void handleSaveImmediately();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authUser, lesson.id]);

  // Thao tác chèn nhanh vào vị trí con trỏ Textarea
  const insertTextAtCursor = (before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const oldText = currentNote.content;
    const selectedText = oldText.substring(start, end);

    const newText =
      oldText.substring(0, start) +
      before +
      selectedText +
      after +
      oldText.substring(end);

    updateContent(lesson.id, newText, authUser?.email);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);

    trigger5sAutoSave();
  };

  // Mở popup đăng nhập
  const handleTriggerLogin = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('marugoto:open-login'));
    }
  };

  // Sao chép toàn bộ ghi chú
  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(
        `# ${currentNote.title}\n\n${currentNote.content}`
      );
      toast.success('Đã sao chép toàn bộ nội dung ghi chú vào bộ nhớ tạm.');
    } catch {
      toast.error('Không thể sao chép, vui lòng thử lại.');
    }
  };

  // Tải file ghi chú .md
  const handleDownloadNote = () => {
    const markdownContent = `# ${currentNote.title}\n\nTags: ${currentNote.tags.join(
      ', '
    )}\nNgày ghi: ${new Date(currentNote.updatedAt).toLocaleDateString(
      'vi-VN'
    )}\n\n---\n\n${currentNote.content}`;

    const blob = new Blob([markdownContent], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghi-chep-marugoto-bai-${lesson.order_index}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Đã tải xuống file ghi chú (.md)!');
  };

  // Xóa trắng ghi chú
  const handleDeleteNote = async () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn xóa toàn bộ nội dung ghi chú của bài học này?'
      )
    ) {
      await deleteNote(lesson.id, authUser?.email);
      toast.info('Đã xóa nội dung ghi chú.');
    }
  };

  // Thêm tag tùy chỉnh
  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    addTag(lesson.id, customTagInput.trim(), authUser?.email);
    setCustomTagInput('');
    setIsCustomTagOpen(false);
    void saveNote(lesson.id, authUser?.email);
  };

  // Thống kê nhanh từ & ký tự
  const stats = useMemo(() => {
    const text = currentNote.content.trim();
    const chars = text.length;
    const words = text ? text.split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    return { chars, words, lines };
  }, [currentNote.content]);

  // Biên dịch Markdown phục vụ chức năng Xem trước (Preview MD)
  const renderedMarkdownHtml = useMemo(() => {
    try {
      const content = currentNote.content?.trim()
        ? currentNote.content
        : '*Chưa có nội dung ghi chép. Bạn có thể gõ nội dung hoặc bấm vào từ vựng & mẫu câu bên cạnh để chèn nhanh.*';
      return marked.parse(content, { gfm: true, breaks: true }) as string;
    } catch {
      return '<p class="text-rose-500 font-medium">Lỗi phân tích cú pháp Markdown.</p>';
    }
  }, [currentNote.content]);

  // Tabs phân khu trong bài học
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
      active: false,
    },
    {
      label: 'Ghi chép (Take Note)',
      href: `/lessons/${lesson.id}/notes`,
      icon: NotebookPen,
      active: true,
    },
  ];

  return (
    <main className="w-full max-w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 overflow-hidden">
      {/* ================= HEADER & LESSON SWITCHER ================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LessonSelectSwitcher
            currentLessonId={lesson.id}
            allLessons={allLessons}
            moduleSlug="notes"
          />

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/70">
              <NotebookPen className="h-3.5 w-3.5 text-amber-600" />
              Sổ tay ghi chép trên lớp
            </span>
          </div>
        </div>

        {/* Tiêu đề & Thông tin bài học */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Bài {lesson.order_index}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {lesson.topic_name}
              </h1>
            </div>
            {lesson.description && (
              <p className="mt-1 text-sm text-slate-500">
                {lesson.description}
              </p>
            )}
          </div>
        </div>

        {/* Thanh chuyển đổi phân khu trong bài học (Module Tabs) */}
        <div className="border-t border-slate-100 pt-2 -mb-1">
          <nav
            className="-mb-px flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar border-b border-slate-200"
            aria-label="Tabs bài học"
          >
            {moduleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'group inline-flex items-center gap-1.5 border-b-2 pb-3 pt-2 px-1 text-xs sm:text-sm whitespace-nowrap transition-all shrink-0',
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

      {/* ================= KHỐI KIỂM TRA ĐĂNG NHẬP (AUTH GATE) ================= */}
      {isCheckingAuth ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-500">
            Đang kiểm tra phiên học viên...
          </p>
        </div>
      ) : !authUser ? (
        /* Màn hình yêu cầu đăng nhập thân thiện & chuyên nghiệp */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Yêu cầu đăng nhập để sử dụng Take Note
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mục Ghi chép trên lớp cho phép bạn ghi lại trực tiếp lời giảng của
                giáo viên, các mẫu câu và thắc mắc trong giờ học. Để đảm bảo dữ
                liệu được{' '}
                <strong className="text-indigo-600">
                  bảo mật và đồng bộ cá nhân
                </strong>{' '}
                trên máy tính, máy tính bảng hay điện thoại, bạn cần đăng nhập tài
                khoản học viên.
              </p>
            </div>

            {/* Danh sách lợi ích */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
                  <Save className="h-4 w-4" />
                  <span>Tự động lưu đám mây</span>
                </div>
                <p className="text-xs text-slate-500">
                  Gõ đến đâu tự lưu đến đó, không sợ mất chữ khi đổi mạng hay tắt
                  trình duyệt.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs mb-1">
                  <Bookmark className="h-4 w-4" />
                  <span>Gắn thẻ bài giảng</span>
                </div>
                <p className="text-xs text-slate-500">
                  Phân loại: Lời dặn Sensei, Lỗi sai hay gặp, Mẹo phát âm, Thắc mắc
                  cần hỏi.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Tra cứu nhanh tại chỗ</span>
                </div>
                <p className="text-xs text-slate-500">
                  Xem ngay danh sách từ vựng & ngữ pháp bài học để chèn vào ghi chú
                  mà không cần chuyển tab.
                </p>
              </div>
            </div>

            {/* Nút hành động Đăng nhập */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerLogin}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập tài khoản để bắt đầu ghi chép</span>
              </button>
              <p className="mt-2 text-[11px] text-slate-400">
                Chưa có tài khoản? Bạn có thể đăng ký tài khoản miễn phí chỉ trong
                30 giây.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VÙNG SOẠN THẢO TAKE NOTE KHI ĐÃ ĐĂNG NHẬP ================= */
        <div className="space-y-4">
          {/* Thanh công cụ trạng thái & hành động */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Badge trạng thái lưu */}
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {syncStatus === 'saving' ? (
                  <span className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                    Đang lưu...
                  </span>
                ) : isPendingSave && saveCountdown !== null ? (
                  <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                    Lưu sau {saveCountdown}s...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Đã lưu {lastSavedAt ? `lúc ${new Date(lastSavedAt).toLocaleTimeString('vi-VN')}` : 'tự động'}
                  </span>
                )}
              </div>

              {/* Thống kê từ */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-200 pl-3">
                <span>{stats.words} từ</span>
                <span>•</span>
                <span>{stats.chars} ký tự</span>
                <span>•</span>
                <span>{stats.lines} dòng</span>
              </div>
            </div>

            {/* Các nút hành động: Sao chép, Tải về, Đặt lại mẫu, Tra cứu */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => resetNote(lesson.id)}
                title="Chèn khung ghi chú chuẩn của buổi học"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden md:inline">Mẫu buổi học</span>
              </button>

              <button
                type="button"
                onClick={handleCopyNote}
                title="Sao chép toàn bộ ghi chú"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden md:inline">Sao chép</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadNote}
                title="Tải về máy định dạng Markdown"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden md:inline">Tải về</span>
              </button>

              <button
                type="button"
                onClick={handleSaveImmediately}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Lưu ngay</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRefPanel(!showRefPanel)}
                title={showRefPanel ? 'Ẩn bảng tra cứu' : 'Mở bảng tra cứu từ vựng & ngữ pháp'}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  showRefPanel
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {showRefPanel ? (
                  <PanelRightClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelRightOpen className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {showRefPanel ? 'Đóng tra cứu' : 'Tra cứu bài học'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDeleteNote}
                title="Xóa trắng ghi chú"
                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* VÙNG GẮN TAGS (CHỦ ĐỀ GHI CHÚ) */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-indigo-600" />
                Thẻ phân loại bài giảng:
              </span>
              <button
                type="button"
                onClick={() => setIsCustomTagOpen(!isCustomTagOpen)}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Thêm thẻ tự tạo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const isActive = currentNote.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(lesson.id, tag, authUser.email)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    )}
                  >
                    <span>{tag}</span>
                    {isActive && <Check className="h-3 w-3" />}
                  </button>
                );
              })}

              {/* Các tag tùy chỉnh do người dùng thêm */}
              {currentNote.tags
                .filter((t) => !PRESET_TAGS.includes(t))
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700"
                  >
                    <span>🏷️ {tag}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(lesson.id, tag, authUser.email)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
            </div>

            {/* Form thêm thẻ tự tạo */}
            {isCustomTagOpen && (
              <form
                onSubmit={handleAddCustomTag}
                className="flex items-center gap-2 pt-2 border-t border-slate-100"
              >
                <input
                  type="text"
                  placeholder="Nhập tên nhãn (VD: Nghe hiểu, Kanji khó...)"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  Thêm
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomTagOpen(false)}
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
              </form>
            )}
          </div>

          {/* ================= KHUNG SOẠN THẢO CHÍNH + THANH TRA CỨU BÊN PHẢI ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Cột chính: Soạn thảo Note */}
            <div
              className={cn(
                'rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col transition-all duration-200',
                showRefPanel ? 'lg:col-span-8' : 'lg:col-span-12'
              )}
            >
              {/* Tiêu đề ghi chú & Bộ chọn chế độ Xem trước / Soạn thảo */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[220px]">
                  <input
                    type="text"
                    value={currentNote.title}
                    onChange={handleTitleChange}
                    placeholder="Nhập tiêu đề ghi chú buổi học..."
                    className="w-full text-lg sm:text-xl font-bold text-slate-900 border-none outline-none focus:ring-0 placeholder:text-slate-300 bg-transparent"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Mẹo: Tự động lưu sau 5s ngừng gõ • Nhấn Ctrl + S để lưu tức thời
                  </p>
                </div>

                {/* Option chuyển chế độ: Soạn thảo / Xem trước (Preview MD) / Chia đôi */}
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50/90 p-0.5 text-xs font-medium shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditorMode('edit')}
                    title="Chế độ nhập văn bản Markdown"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all cursor-pointer',
                      editorMode === 'edit'
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Soạn thảo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    title="Xem trước kết quả hiển thị định dạng Markdown"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all cursor-pointer',
                      editorMode === 'preview'
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Xem trước (Preview MD)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('split')}
                    title="Xem song song soạn thảo & kết quả Markdown"
                    className={cn(
                      'hidden sm:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all cursor-pointer',
                      editorMode === 'split'
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Columns className="h-3.5 w-3.5" />
                    <span>Chia đôi</span>
                  </button>
                </div>
              </div>

              {/* Thanh định dạng nhanh (Formatting Toolbar - hiển thị khi đang soạn thảo hoặc chia đôi) */}
              {editorMode !== 'preview' ? (
                <div className="flex items-center gap-1 px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex-wrap text-slate-600">
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('**', '**')}
                    title="In đậm (Bold)"
                    className="rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('*', '*')}
                    title="In nghiêng (Italic)"
                    className="rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-[1px] bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('\n- ')}
                    title="Danh sách gạch đầu dòng"
                    className="rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('\n1. ')}
                    title="Danh sách đánh số"
                    className="rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('\n- [ ] ')}
                    title="Danh sách việc cần làm (Task list)"
                    className="rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <CheckSquare className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('\n> ')}
                    title="Khối trích dẫn (Quote)"
                    className="rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Quote className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-[1px] bg-slate-300 mx-1" />
                  {/* Nút chèn dấu ngoặc kép tiếng Nhật「」 */}
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('「', '」')}
                    title="Ngoặc kép tiếng Nhật「 」"
                    className="rounded px-2 py-1 text-xs font-jp font-bold bg-white border border-slate-200 hover:bg-slate-100 text-indigo-700 transition-colors cursor-pointer"
                  >
                    「」
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('〜')}
                    title="Dấu lượn sóng tiếng Nhật 〜"
                    className="rounded px-2 py-1 text-xs font-jp font-bold bg-white border border-slate-200 hover:bg-slate-100 text-indigo-700 transition-colors cursor-pointer"
                  >
                    〜
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('【Lưu ý của Sensei】\n- ')}
                    title="Chèn khối lời dặn của Sensei"
                    className="rounded px-2 py-1 text-[11px] font-medium bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                  >
                    📌 Sensei dặn
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-2 bg-indigo-50/50 border-b border-indigo-100 text-xs text-indigo-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Đang ở chế độ Xem trước Markdown (Preview MD)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditorMode('edit')}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Chuyển sang soạn thảo
                  </button>
                </div>
              )}

              {/* VÙNG NỘI DUNG: HỖ TRỢ 3 CHẾ ĐỘ (SOẠN THẢO / XEM TRƯỚC / CHIA ĐÔI) */}
              {editorMode === 'edit' && (
                <div className="p-4 flex-1">
                  <textarea
                    ref={textareaRef}
                    value={currentNote.content}
                    onChange={handleContentChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        insertTextAtCursor('  ');
                      }
                    }}
                    placeholder="Gõ ghi chép bài học trên lớp ở đây... (Hỗ trợ Markdown, gõ Kanji, Hiragana, bullet points)"
                    rows={18}
                    className="w-full resize-y font-mono text-sm leading-relaxed text-slate-800 placeholder:text-slate-300 border-none outline-none focus:ring-0 bg-transparent min-h-[380px]"
                  />
                </div>
              )}

              {editorMode === 'preview' && (
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto max-h-[650px] min-h-[380px] bg-slate-50/20">
                  <div
                    className="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: renderedMarkdownHtml }}
                  />
                </div>
              )}

              {editorMode === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 flex-1 min-h-[380px]">
                  <div className="p-4 flex flex-col">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Edit3 className="h-3 w-3 text-slate-400" />
                      Mã nguồn Markdown
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={currentNote.content}
                      onChange={handleContentChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          insertTextAtCursor('  ');
                        }
                      }}
                      placeholder="Gõ ghi chép bài học ở đây..."
                      rows={18}
                      className="w-full flex-1 resize-none font-mono text-xs sm:text-sm leading-relaxed text-slate-800 placeholder:text-slate-300 border-none outline-none focus:ring-0 bg-transparent min-h-[360px]"
                    />
                  </div>
                  <div className="p-4 sm:p-5 overflow-y-auto max-h-[650px] bg-slate-50/30">
                    <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Eye className="h-3 w-3 text-indigo-500" />
                      Xem trước trực tiếp (Live Preview)
                    </div>
                    <div
                      className="markdown-preview"
                      dangerouslySetInnerHTML={{ __html: renderedMarkdownHtml }}
                    />
                  </div>
                </div>
              )}

              {/* Footer thanh trạng thái */}
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 text-[11px] text-slate-500 rounded-b-xl">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>
                    Cập nhật:{' '}
                    {new Date(currentNote.updatedAt).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Học viên: {authUser.displayName}</span>
                  <span className="text-emerald-600 font-medium">● Đang kết nối</span>
                </div>
              </div>
            </div>

            {/* Cột phụ: Bảng tra cứu từ vựng & ngữ pháp bài học để chèn nhanh */}
            {showRefPanel && (
              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[580px]">
                {/* Header Tra cứu */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Tra cứu nhanh Bài {lesson.order_index}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Bấm vào để chèn
                  </span>
                </div>

                {/* Sub-tabs: Từ vựng / Ngữ pháp */}
                <div className="flex border-b border-slate-100 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveRefTab('vocab')}
                    className={cn(
                      'flex-1 py-2 text-center transition-colors border-b-2',
                      activeRefTab === 'vocab'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Từ vựng ({vocabularies.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRefTab('grammar')}
                    className={cn(
                      'flex-1 py-2 text-center transition-colors border-b-2',
                      activeRefTab === 'grammar'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Ngữ pháp ({grammars.length})
                  </button>
                </div>

                {/* Danh sách nội dung tra cứu cuộn được */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                  {activeRefTab === 'vocab' ? (
                    vocabularies.length > 0 ? (
                      vocabularies.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => {
                            const snippet = `\n- **${v.kanji ? `${v.kanji} (${v.hiragana})` : v.hiragana}**: ${v.meaning_vn}`;
                            insertTextAtCursor(snippet);
                            toast.success(`Đã chèn từ 「${v.hiragana}」`);
                          }}
                          className="group p-2.5 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer"
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="font-semibold text-slate-800 group-hover:text-indigo-700">
                              {v.kanji ? (
                                <>
                                  <span className="font-jp text-sm mr-1">{v.kanji}</span>
                                  <span className="text-slate-400 font-normal">
                                    ({v.hiragana})
                                  </span>
                                </>
                              ) : (
                                <span className="font-jp text-sm">{v.hiragana}</span>
                              )}
                            </span>
                            <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              + Chèn
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5 line-clamp-1">
                            {v.meaning_vn}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-6">
                        Chưa có từ vựng cho bài học này.
                      </p>
                    )
                  ) : grammars.length > 0 ? (
                    grammars.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          const snippet = `\n- Mẫu câu: **${g.pattern}**\n  - Nghĩa: ${g.meaning_vn}\n  - Lưu ý: `;
                          insertTextAtCursor(snippet);
                          toast.success(`Đã chèn mẫu ngữ pháp 「${g.pattern}」`);
                        }}
                        className="group p-2.5 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="font-semibold font-jp text-slate-900 group-hover:text-indigo-700">
                            {g.pattern}
                          </span>
                          <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            + Chèn
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5 font-medium line-clamp-1">
                          {g.meaning_vn}
                        </p>
                        {g.explanation_vn && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {g.explanation_vn}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-6">
                      Chưa có ngữ pháp cho bài học này.
                    </p>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center rounded-b-xl">
                  Bấm vào từ vựng hoặc mẫu câu để chèn ngay vào vị trí con trỏ
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
