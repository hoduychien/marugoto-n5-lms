'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export interface AuthUserInfo {
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUserInfo) => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  // Chú ý: Tuyệt đối không điền sẵn pass hay tài khoản (để trống hoàn toàn)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form khi mở hoặc đóng popup
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setFullName('');
      setLoading(false);
      setMode('login');
    }
  }, [isOpen]);

  // Đóng bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: trimmedPassword,
          });
          if (error) throw error;

          let role: 'admin' | 'user' = 'user';
          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .maybeSingle();

            if (
              profile?.role === 'admin' ||
              data.user.user_metadata?.role === 'admin' ||
              data.user.app_metadata?.role === 'admin'
            ) {
              role = 'admin';
            }
          }

          const loggedInUser: AuthUserInfo = {
            email: data.user?.email || trimmedEmail,
            displayName:
              (data.user?.user_metadata?.full_name as string) ||
              data.user?.email?.split('@')[0] ||
              trimmedEmail.split('@')[0] ||
              'Học viên',
            role,
          };

          localStorage.setItem(
            'marugoto_n5_auth_user',
            JSON.stringify(loggedInUser)
          );

          toast.success('Đăng nhập thành công!', {
            description: `Chào mừng ${loggedInUser.displayName} quay trở lại.`,
          });

          onSuccess(loggedInUser);
          onClose();
        } else {
          // Mode register
          const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password: trimmedPassword,
            options: {
              data: {
                full_name: fullName.trim() || 'Học viên Marugoto',
                role: 'user',
              },
            },
          });
          if (error) throw error;

          if (data.session && data.user) {
            const newUser: AuthUserInfo = {
              email: data.user.email || trimmedEmail,
              displayName: fullName.trim() || trimmedEmail.split('@')[0],
              role: 'user',
            };
            localStorage.setItem(
              'marugoto_n5_auth_user',
              JSON.stringify(newUser)
            );
            toast.success('Đăng ký tài khoản học viên thành công!');
            onSuccess(newUser);
            onClose();
          } else {
            toast.success('Đăng ký tài khoản thành công!', {
              description:
                'Vui lòng kiểm tra hộp thư email hoặc đăng nhập để tiếp tục.',
            });
            setMode('login');
          }
        }
      } else {
        // Chế độ Local Storage (khi chưa kết nối Supabase)
        const displayName =
          fullName.trim() || trimmedEmail.split('@')[0] || 'Học viên';
        const demoUser: AuthUserInfo = {
          email: trimmedEmail,
          displayName,
          role: 'user',
        };

        localStorage.setItem(
          'marugoto_n5_demo_user',
          JSON.stringify({
            ...demoUser,
            loggedInAt: new Date().toISOString(),
          })
        );
        localStorage.setItem(
          'marugoto_n5_auth_user',
          JSON.stringify(demoUser)
        );

        toast.success('Đăng nhập thành công!', {
          description: `Chào mừng ${displayName} đến với Marugoto N5.`,
        });

        onSuccess(demoUser);
        onClose();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi xác thực.';
      toast.error('Không thể xác thực tài khoản', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
      >
        {/* Nút đóng modal */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng popup"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Thương hiệu Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl font-jp shadow-sm">
            あ
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Marugoto N5 LMS
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống học & ôn tập tiếng Nhật Sơ cấp A1
            </p>
          </div>
        </div>

        {/* Chuyển đổi Đăng nhập / Đăng ký */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer',
              mode === 'login'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={cn(
              'rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer',
              mode === 'register'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Đăng ký học viên
          </button>
        </div>

        {/* Form đăng nhập / đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Họ và tên hiển thị
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoComplete="off"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@example.com"
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? 'Đăng nhập hệ thống'
                    : 'Đăng ký tài khoản học viên'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Trạng thái kết nối */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            {isSupabaseConfigured
              ? 'Xác thực an toàn qua Supabase Auth'
              : 'Chế độ lưu trữ thiết bị cục bộ (Local)'}
          </span>
        </div>
      </div>
    </div>
  );
}
