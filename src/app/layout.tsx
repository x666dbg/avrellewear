import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Avrellewear",
  description: "Avrellewear — Catalog",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html lang="id" className={theme === "dark" ? "dark" : ""} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content={theme === "dark" ? "dark" : "light"} />
      </head>
      <body className={inter.className + " min-h-screen"}>
        <header className="fixed top-0 inset-x-0 z-50 ui-surface">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between text-black dark:text-white">
            <Link href="/" className="ui-brand">Avrellewear</Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 pt-20">{children}</main>

        <footer className="ui-footer ui-footer-inverse">
          <div className="ui-footer-grid">
            {/* Brand & tagline */}
            <div>
              <div className="text-xl font-bold tracking-tight">Avrellewear</div>
              <p className="ui-footer-text mt-2">
                Daily fits for Gen Z — minimal, clean, dan siap dipakai sehari-hari.
              </p>

              {/* Sosmed */}
              <div className="ui-social">
                <a href="https://instagram.com/avrellewear" aria-label="Instagram" target="_blank" rel="noreferrer">
                  {/* IG icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.5A5.5 5.5 0 1 1 6.5 13A5.5 5.5 0 0 1 12 7.5m0 2A3.5 3.5 0 1 0 15.5 13A3.5 3.5 0 0 0 12 9.5M18 6.25a.75.75 0 1 1-.75.75A.75.75 0 0 1 18 6.25"/></svg>
                </a>
                <a href="https://www.tiktok.com/@avrellewear" aria-label="TikTok" target="_blank" rel="noreferrer">
                  {/* TikTok icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M16 3a5.6 5.6 0 0 0 .1 1.1A5.4 5.4 0 0 0 20 6V8a7.7 7.7 0 0 1-4-1.2V14a5 5 0 1 1-5-5a5 5 0 0 1 1 .1V11a3 3 0 1 0 2 2V3z"/></svg>
                </a>
              </div>
            </div>

            {/* Menu cepat */}
            <div>
              <div className="ui-footer-title">Koleksi</div>
              <ul className="ui-footer-text mt-3 space-y-2">
                <li><Link href="/?cat=T-Shirts">T-Shirts</Link></li>
                <li><Link href="/?cat=Hoodies">Hoodies</Link></li>
                <li><Link href="/?cat=Jackets">Jackets</Link></li>
                <li><Link href="/?cat=Pants">Pants</Link></li>
              </ul>
            </div>

            {/* Bantuan */}
            <div>
              <div className="ui-footer-title">Bantuan</div>
              <ul className="ui-footer-text mt-3 space-y-2">
                <li><Link href="#">Panduan Ukuran</Link></li>
                <li><Link href="#">Kebijakan Pengembalian</Link></li>
                <li><Link href="#">FAQ</Link></li>
              </ul>
            </div>

            {/* Newsletter (dummy) */}
            <div>
              <div className="ui-footer-title">Tetap terhubung</div>
              <p className="ui-footer-text mt-3">Dapatkan update koleksi terbaru.</p>
              <form className="mt-3 flex gap-2">
                <input
                  type="email"
                  placeholder="Email kamu"
                  className="ui-input"
                />
                <button
                  type="button"
                  className="rounded-xl px-4 py-2 bg-black text-white dark:bg-white dark:text-neutral-900"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-neutral-200 dark:border-neutral-800">
            <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="ui-footer-meta">© {new Date().getFullYear()} Avrellewear. All rights reserved.</span>
              <div className="ui-footer-meta flex items-center gap-4">
                <Link href="#" className="hover:underline">Terms</Link>
                <Link href="#" className="hover:underline">Privacy</Link>
                <Link href="#" className="hover:underline">Cookies</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
