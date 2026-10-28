'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled global error:', error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-5 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Lỗi hệ thống toàn cục
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trang web gặp sự cố khi khởi tạo. Vui lòng nhấn vào nút bên dưới để tải lại.
            </p>
            {error?.message && (
              <p className="text-[11px] text-slate-400 font-mono bg-slate-50 p-2 rounded border border-slate-100 break-words mt-2">
                {error.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/dashboard';
                } else {
                  reset();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Tải lại Bảng điều khiển</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
