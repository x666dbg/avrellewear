import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Avrellewear",
  description: "Avrellewear | Catalog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var ls = localStorage.getItem('theme');
                // PRIORITAS localStorage; kalau belum ada, default 'light'
                var theme = ls ? ls : 'light';
                var root = document.documentElement;
                if (theme === 'dark') root.classList.add('dark');
                else root.classList.remove('dark');
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className={inter.className + " min-h-screen"}>
        <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/70 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition">Avrellewear</a>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="/" className="hover:opacity-70">Beranda</a>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

        <footer className="border-t border-slate-200/70 dark:border-slate-800 mt-12">
          <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>© {new Date().getFullYear()} Avrellewear | Catalog</span>
            <span className="hidden md:block">Built with Next.js & Tailwind</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
