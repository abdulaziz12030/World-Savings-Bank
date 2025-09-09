import './globals.css';

export const metadata = {
  title: 'محفظة الادخار العالمية',
  description: 'World Savings Bank',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header>
          <div className="bar container">
            <div className="row">
              <img src="https://i.postimg.cc/tTSfNWkn/image.jpg" alt="عبدالعزيز" className="avatar"/>
              <strong style={{fontSize:18}}>محفظة الادخار العالمية</strong>
              <span className="badge">Next.js + Supabase</span>
            </div>
            <nav className="row" style={{gap:12}}>
              <a className="btn ghost" href="/">الرئيسية</a>
              <a className="btn ghost" href="/admin">لوحة الآدمن</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer>© {new Date().getFullYear()} محفظة الادخار العالمية</footer>
      </body>
    </html>
  )
}
