import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="text-4xl font-bold text-indigo-600 font-jp">404</div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Không tìm thấy trang yêu cầu
          </h2>
          <p className="text-xs text-slate-500">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Về Bảng điều khiển</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
