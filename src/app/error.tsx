'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-5 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Đã có sự cố xảy ra
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống đang phục hồi. Bạn có thể nhấn thử lại hoặc quay về Bảng điều khiển.
          </p>
          {error?.message && (
            <p className="text-[11px] text-slate-400 font-mono bg-slate-50 p-2 rounded border border-slate-100 break-words mt-2">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Bảng điều khiển</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
