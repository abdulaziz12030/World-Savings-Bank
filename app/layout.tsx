
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "محفظة الادخار العالمية",
  description: "تطبيق إدخار بسيط للأطفال بأسلوب يشبه مصرف الراجحي",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="text-gray-900">
        <header className="bg-wblue-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold">محفظة الادخار العالمية</h1>
            <span className="text-sm opacity-90">نسخة تجريبية</span>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="py-10 text-center text-sm text-gray-500">© {new Date().getFullYear()} محفظة الادخار العالمية</footer>
      </body>
    </html>
  );
}
