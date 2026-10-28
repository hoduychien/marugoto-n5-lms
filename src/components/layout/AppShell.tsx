'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Layers,
  Languages,
  MessageSquare,
  ShieldCheck,
  Menu,
  X,
  GraduationCap,
  Flame,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  User,
  PenTool,
  FolderHeart,
  Settings,
  ChevronDown,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useProgressStore } from '@/store/useProgressStore';
import {
  MARUGOTO_LESSONS_SEED,
  MARUGOTO_VOCAB_SEED,
} from '@/lib/data/marugoto-seed';
import { isDueForReview } from '@/lib/srs-algorithm';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { LoginModal, type AuthUserInfo } from '@/components/auth/LoginModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUserInfo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Tự động mở popup đăng nhập nếu có tham số ?login=1 trên URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === '1' || params.get('login') === 'true') {
        setIsLoginModalOpen(true);
      }
    }
  }, [pathname]);

  // Kích hoạt mounted sau render đầu tiên để chống lỗi Hydration Next.js
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('marugoto_n5_auth_user');
        if (cached) {
          setAuthUser(JSON.parse(cached));
          return;
        }
        const demo = localStorage.getItem('marugoto_n5_demo_user');
        if (demo) {
          const parsed = JSON.parse(demo);
          setAuthUser({
            email: parsed.email || 'hocvien@marugoto.jp',
            displayName: parsed.fullName || parsed.displayName || 'Học viên',
            role: parsed.role === 'admin' ? 'admin' : 'user',
          });
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Đóng dropdown khi chuyển trang
  useEffect(() => {
    setIsSettingsOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Khôi phục trạng thái thu gọn Sidebar trên iPad Landscape / Desktop
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('marugoto_n5_sidebar_collapsed');
    if (saved === '1') {
      setSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('marugoto_n5_sidebar_collapsed', next ? '1' : '0');
      }
      return next;
    });
  };

  const { showFurigana, showRomaji, toggleFurigana, toggleRomaji } =
    useSettingsStore();
  const { hydrate, hydrated, records, totalExp, currentStreak } =
    useProgressStore();

  // Tự động nhận diện Bài học đang xem từ URL (mặc định Bài 1)
  const lessonMatch = pathname?.match(/^\/lessons\/(\d+)/);
  const activeLessonId = lessonMatch
    ? Math.min(18, Math.max(1, Number(lessonMatch[1])))
    : 1;

  // Nhận diện phân khu hiện tại (overview | vocab | grammar | kanji | kaiwa)
  const activeModuleSlug = useMemo(() => {
    const modMatch = pathname?.match(
      /^\/lessons\/\d+\/(overview|vocab|grammar|kanji|kaiwa)/
    );
    return modMatch ? modMatch[1] : 'overview';
  }, [pathname]);

  const activeLessonInfo = useMemo(
    () =>
      MARUGOTO_LESSONS_SEED.find((l) => l.id === activeLessonId) ||
      MARUGOTO_LESSONS_SEED[0],
    [activeLessonId]
  );

  // Hydrate tiến độ SRS & kiểm tra trạng thái đăng nhập
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    let mounted = true;

    async function loadUserSession() {
      // 1. Kiểm tra session từ Supabase (dùng getSession đọc trực tiếp cache localStorage cực nhanh, không phụ thuộc mạng)
      if (isSupabaseConfigured) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!mounted) return;

          if (session?.user) {
            const user = session.user;
            const isAdmin =
              user.user_metadata?.role === 'admin' ||
              user.app_metadata?.role === 'admin';

            const initialInfo: AuthUserInfo = {
              email: user.email || '',
              displayName:
                (user.user_metadata?.full_name as string | undefined) ||
                user.email?.split('@')[0] ||
                'Học viên',
              role: isAdmin ? 'admin' : 'user',
            };
            setAuthUser(initialInfo);
            localStorage.setItem(
              'marugoto_n5_auth_user',
              JSON.stringify(initialInfo)
            );

            // Kiểm tra thêm profile admin trong database
            void supabase
              .from('profiles')
              .select('role, display_name')
              .eq('id', user.id)
              .maybeSingle()
              .then(({ data: profile }) => {
                if (profile && mounted) {
                  const updatedAdmin = profile.role === 'admin' || isAdmin;
                  const updatedInfo: AuthUserInfo = {
                    email: user.email || '',
                    displayName:
                      profile.display_name || initialInfo.displayName,
                    role: updatedAdmin ? 'admin' : 'user',
                  };
                  setAuthUser(updatedInfo);
                  localStorage.setItem(
                    'marugoto_n5_auth_user',
                    JSON.stringify(updatedInfo)
                  );
                }
              });
            return;
          }
        } catch {
          // Lỗi mạng hoặc Supabase tạm thời - không xóa cache ngay
        }
      }

      // 2. Fallback kiểm tra phiên Local Mode
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('marugoto_n5_demo_user');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const localInfo: AuthUserInfo = {
              email: parsed.email || 'hocvien@marugoto.jp',
              displayName: parsed.fullName || parsed.displayName || 'Học viên',
              role: parsed.role === 'admin' ? 'admin' : 'user',
            };
            setAuthUser(localInfo);
            localStorage.setItem(
              'marugoto_n5_auth_user',
              JSON.stringify(localInfo)
            );
            return;
          } catch {
            // ignore
          }
        }
      }

      // 3. Nếu thật sự không có session nào
      if (mounted) {
        setAuthUser(null);
        localStorage.removeItem('marugoto_n5_auth_user');
      }
    }

    loadUserSession();

    // 4. Lắng nghe thay đổi trạng thái Auth từ Supabase (Login / Logout / Token Refresh)
    let authSub: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const user = session.user;
          const isAdmin =
            user.user_metadata?.role === 'admin' ||
            user.app_metadata?.role === 'admin';
          const info: AuthUserInfo = {
            email: user.email || '',
            displayName:
              (user.user_metadata?.full_name as string | undefined) ||
              user.email?.split('@')[0] ||
              'Học viên',
            role: isAdmin ? 'admin' : 'user',
          };
          setAuthUser(info);
          localStorage.setItem(
            'marugoto_n5_auth_user',
            JSON.stringify(info)
          );
        } else {
          const demo = localStorage.getItem('marugoto_n5_demo_user');
          if (!demo) {
            setAuthUser(null);
            localStorage.removeItem('marugoto_n5_auth_user');
          }
        }
      });
      authSub = subscription;
    }

    return () => {
      mounted = false;
      if (authSub) authSub.unsubscribe();
    };
  }, []);

  // Tính số thẻ SRS đến hạn ôn tập hôm nay để hiển thị badge trên Sidebar
  const dueReviewCount = useMemo(() => {
    if (!hydrated) return 0;
    const allVocabs = Object.values(MARUGOTO_VOCAB_SEED).flat();
    let count = 0;
    for (const v of allVocabs) {
      const rec = records[`vocab:${v.id}`];
      if (rec && isDueForReview(rec.nextReviewDate)) {
        count += 1;
      }
    }
    return count;
  }, [hydrated, records]);

  // Chuyển nhanh Bài trước / Bài tiếp theo ngay từ Sidebar
  const handleJumpLesson = (targetId: number) => {
    const safeId = Math.min(18, Math.max(1, targetId));
    router.push(`/lessons/${safeId}/${activeModuleSlug}`);
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('marugoto_n5_demo_user');
    localStorage.removeItem('marugoto_n5_auth_user');
    setAuthUser(null);
    toast.success('Đã đăng xuất khỏi tài khoản.');
    if (pathname?.startsWith('/admin')) {
      router.push('/dashboard');
    }
  };

  const mainNavItems = [
    {
      label: 'Bảng điều khiển',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Bảng chữ cái & Tập viết',
      href: '/alphabet',
      icon: PenTool,
    },
    {
      label: 'Từ vựng của tôi',
      href: '/my-vocab',
      icon: FolderHeart,
    },
    {
      label: 'Ôn tập SRS Flashcards',
      href: '/flashcards',
      icon: Layers,
      badge: dueReviewCount > 0 ? `${dueReviewCount} cần ôn` : undefined,
    },
  ];

  const lessonModuleItems = [
    {
      label: 'Tổng hợp Lý thuyết',
      href: `/lessons/${activeLessonId}/overview`,
      icon: FileText,
    },
    {
      label: 'Từ vựng (Vocab)',
      href: `/lessons/${activeLessonId}/vocab`,
      icon: BookOpen,
    },
    {
      label: 'Ngữ pháp (Grammar)',
      href: `/lessons/${activeLessonId}/grammar`,
      icon: GraduationCap,
    },
    {
      label: 'Hán tự (Kanji)',
      href: `/lessons/${activeLessonId}/kanji`,
      icon: Languages,
    },
    {
      label: 'Hội thoại (Kaiwa)',
      href: `/lessons/${activeLessonId}/kaiwa`,
      icon: MessageSquare,
    },
  ];

  // Tiêu đề ngữ cảnh hiện tại trên Header
  const currentHeaderTitle = useMemo(() => {
    if (pathname === '/dashboard') return 'Bảng điều khiển học tập';
    if (pathname?.startsWith('/alphabet'))
      return 'Bảng chữ cái & Luyện viết (Hiragana • Katakana • Kanji)';
    if (pathname?.startsWith('/my-vocab'))
      return 'Bộ từ vựng của tôi & Thẻ Flashcards tự tạo';
    if (pathname?.startsWith('/flashcards'))
      return 'Ôn tập thẻ ghi nhớ ngắt quãng (SRS)';
    if (pathname?.startsWith('/admin')) return 'Cổng Quản trị Học liệu (CMS)';
    if (pathname?.startsWith('/lessons/')) {
      return activeLessonInfo.topic_name;
    }
    return 'Giáo trình Marugoto A1 (N5)';
  }, [pathname, activeLessonInfo]);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* ================= SIDEBAR (IPAD LANDSCAPE & DESKTOP) ================= */}
      <aside
        className={cn(
          'hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white z-30 transition-transform duration-200',
          sidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        )}
      >
        {/* 1. Brand Logo */}
        <Link
          href="/dashboard"
          className="flex h-16 items-center gap-3 px-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-jp text-lg">
            あ
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
              Marugoto N5
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              Japanese A1 Learning LMS
            </p>
          </div>
        </Link>

        {/* 2. Navigation Groups */}
        <nav className="flex-1 space-y-5 px-3 py-4 overflow-y-auto">
          {/* Nhóm 1: Tổng quan & Ôn tập SRS */}
          <div className="space-y-1">
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Tổng quan & Ôn tập
            </p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="inline-flex shrink-0 whitespace-nowrap items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Nhóm 2: 5 Phân khu của Bài học hiện tại + Nút chuyển nhanh Bài 1..18 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Bài học đang chọn
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={activeLessonId <= 1}
                  onClick={() => handleJumpLesson(activeLessonId - 1)}
                  className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  aria-label="Previous lesson"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <span className="min-w-[3.25rem] text-center text-[11px] font-semibold text-indigo-700">
                  Bài {activeLessonId}/18
                </span>
                <button
                  type="button"
                  disabled={activeLessonId >= 18}
                  onClick={() => handleJumpLesson(activeLessonId + 1)}
                  className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  aria-label="Next lesson"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Tên ngắn của chủ đề bài đang chọn */}
            <div className="mx-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5">
              <p className="font-jp text-[11px] text-slate-600 truncate">
                {activeLessonInfo.topic_name.replace(/^Bài \d+:\s*/, '')}
              </p>
            </div>

            <div className="space-y-0.5 pt-0.5">
              {lessonModuleItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Nhóm 3: Quản trị Hệ thống */}
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Hệ thống
            </p>
            <Link
              href="/admin"
              className={cn(
                'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                pathname?.startsWith('/admin')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <ShieldCheck
                  className={cn(
                    'h-4 w-4 shrink-0',
                    pathname?.startsWith('/admin')
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  )}
                />
                <span className="truncate">Quản trị Học liệu</span>
              </span>
              <span className="inline-flex shrink-0 whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                Admin
              </span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div
        className={cn(
          'flex flex-1 flex-col min-w-0 transition-[padding] duration-200',
          sidebarCollapsed ? 'lg:pl-0' : 'lg:pl-64'
        )}
      >
        {/* Top Persistent Navbar (Cố định vị trí chuẩn, không cuộn trôi) */}
        <header
          className={cn(
            'fixed top-0 right-0 z-30 flex h-16 items-center justify-between gap-2 sm:gap-3 border-b border-slate-200 bg-white/95 px-3 sm:px-5 backdrop-blur transition-[left] duration-200',
            sidebarCollapsed ? 'left-0' : 'left-0 lg:left-64'
          )}
        >
          {/* Left: Nút đóng/mở Sidebar (Menu icon tinh tế, chuẩn h-9 w-9) + Ngữ cảnh trang */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Nút đóng/mở Sidebar thống nhất mọi thiết bị */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setMobileMenuOpen((prev) => !prev);
                } else {
                  toggleSidebarCollapsed();
                }
              }}
              title={
                sidebarCollapsed
                  ? 'Mở thanh điều hướng bên trái'
                  : 'Thu gọn thanh điều hướng'
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
              aria-label="Thanh điều hướng"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate font-jp max-w-[140px] sm:max-w-xs md:max-w-sm">
                {currentHeaderTitle}
              </p>
            </div>
          </div>

          {/* Right: Chỉ hiển thị các nút có Icon (Cài đặt & Tài khoản), không hiển thị nút có chữ */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 1. NÚT CÀI ĐẶT (SETTINGS POPUP: BẬT/TẮT FURIGANA & ROMAJI) */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen((prev) => !prev);
                  setIsUserMenuOpen(false);
                }}
                title="Cài đặt hiển thị & cách đọc"
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-slate-600 transition-colors cursor-pointer',
                  isSettingsOpen
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:text-indigo-600'
                )}
                aria-label="Cài đặt hiển thị"
              >
                <Settings className="h-4 w-4" />
              </button>

              {/* POPUP CÀI ĐẶT HIỂN THỊ */}
              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-indigo-600" />
                      <h3 className="text-xs font-bold text-slate-900">
                        Cài đặt hiển thị
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {/* Furigana Toggle */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Furigana
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Chữ Hiragana nhỏ trên Kanji
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showFurigana}
                        onClick={toggleFurigana}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          showFurigana ? 'bg-indigo-600' : 'bg-slate-200'
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out',
                            showFurigana ? 'translate-x-4' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>

                    {/* Romaji Toggle */}
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Romaji
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Phiên âm bằng chữ Latinh
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showRomaji}
                        onClick={toggleRomaji}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          showRomaji ? 'bg-indigo-600' : 'bg-slate-200'
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out',
                            showRomaji ? 'translate-x-4' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 border-t border-slate-100 pt-2.5">
                    <p className="text-[10px] text-slate-400 text-center">
                      Thiết lập được lưu tự động cho mọi bài học
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. NÚT TÀI KHOẢN NGƯỜI DÙNG (KHI ĐÃ ĐĂNG NHẬP: CHỈ HIỆN ICON AVATAR; KHI CHƯA ĐĂNG NHẬP: HIỆN NÚT CÓ CHỮ ĐĂNG NHẬP) */}
            <div className="relative" ref={userMenuRef}>
              {mounted && authUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen((prev) => !prev);
                    setIsSettingsOpen(false);
                  }}
                  title={`Tài khoản: ${authUser.displayName}`}
                  aria-label={`Tài khoản: ${authUser.displayName}`}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer',
                    isUserMenuOpen
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  )}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                    {authUser.displayName.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsUserMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  title="Đăng nhập tài khoản"
                  className="inline-flex h-9 shrink-0 whitespace-nowrap items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors cursor-pointer"
                >
                  <LogIn className="h-4 w-4 text-indigo-600" />
                  <span>Đăng nhập</span>
                </button>
              )}

              {/* POPUP THÔNG TIN NGƯỜI DÙNG */}
              {isUserMenuOpen && authUser && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {/* User Profile Header */}
                  <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold">
                      {authUser.displayName.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {authUser.displayName}
                        </p>
                        {authUser.role === 'admin' && (
                          <span className="inline-flex shrink-0 whitespace-nowrap rounded bg-indigo-50 px-1.5 py-0.2 text-[9px] font-semibold uppercase text-indigo-700 border border-indigo-200">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {authUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Tiến độ học tập cá nhân */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-2 text-center">
                      <p className="text-[10px] font-medium text-amber-700">
                        Chuỗi Streak
                      </p>
                      <p className="text-sm font-bold text-amber-900">
                        {currentStreak} ngày
                      </p>
                    </div>
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-2 text-center">
                      <p className="text-[10px] font-medium text-indigo-700">
                        Điểm EXP
                      </p>
                      <p className="text-sm font-bold text-indigo-900">
                        {totalExp} EXP
                      </p>
                    </div>
                  </div>

                  {/* Lối tắt truy cập nhanh */}
                  <div className="space-y-1 border-t border-slate-100 pt-2.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                      <span>Bảng điều khiển học tập</span>
                    </Link>
                    <Link
                      href="/my-vocab"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <FolderHeart className="h-3.5 w-3.5 text-slate-400" />
                      <span>Bộ từ vựng của tôi</span>
                    </Link>
                    {authUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Quản trị Học liệu (CMS)</span>
                      </Link>
                    )}
                  </div>

                  {/* Nút Đăng xuất */}
                  <div className="border-t border-slate-100 pt-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Fixed Navbar Spacer: Giữ chỗ không để nội dung bị che khuất */}
        <div className="h-16 shrink-0" aria-hidden="true" />

        {/* Slide-Over Touch Drawer cho iPad Portrait & Mobile (< 1024px) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop mờ */}
            <div
              className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Ngăn kéo điều hướng cảm ứng bên trái */}
            <div className="relative z-10 flex w-72 max-w-[82vw] flex-col bg-white border-r border-slate-200 h-full overflow-y-auto">
              <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-jp text-lg font-bold">
                    あ
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      Marugoto N5
                    </p>
                    <p className="text-[11px] text-slate-500">
                      iPad & Touch Learning
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 p-3.5 space-y-5 overflow-y-auto">
                <div className="space-y-1">
                  <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Tổng quan & Ôn tập
                  </p>
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium',
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between px-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Bài học đang chọn
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={activeLessonId <= 1}
                        onClick={() => handleJumpLesson(activeLessonId - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="min-w-[3.5rem] text-center text-xs font-bold text-indigo-700">
                        Bài {activeLessonId}/18
                      </span>
                      <button
                        type="button"
                        disabled={activeLessonId >= 18}
                        onClick={() => handleJumpLesson(activeLessonId + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {lessonModuleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        pathname?.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium',
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-3.5 bg-slate-50/80 flex items-center justify-between">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Quản trị CMS</span>
                </Link>

                {authUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Đăng nhập</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Body */}
        <div className="flex-1">{children}</div>

        {/* Popup Đăng nhập / Đăng ký Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={(user) => {
            setAuthUser(user);
          }}
        />
      </div>
    </div>
  );
}
