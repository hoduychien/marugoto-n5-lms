import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marugoto N5 LMS - Học tiếng Nhật A1',
  description: 'Hệ thống tự học tiếng Nhật N5 theo giáo trình Marugoto A1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-vn antialiased">
        {children}
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            className: 'font-vn text-xs',
          }}
        />
      </body>
    </html>
  );
}
