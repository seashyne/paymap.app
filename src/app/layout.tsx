import { cookies } from "next/headers"
import { detectSiteLang } from "@/lib/i18n/site"
import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"

export const metadata: Metadata = {
  title: "PayMap",
  description:
    "PayMap is a private money dashboard for income, expenses, cash flow, and real profit. Financial data stays on your device by default unless you enable Cloud Backup.",
  manifest: "/manifest.webmanifest",
  applicationName: "PayMap",
  appleWebApp: {
    capable: true,
    title: "PayMap",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/logo-icon.svg",
    shortcut: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
  openGraph: {
    title: "PayMap",
    description: "Your private money dashboard. Your financial data stays on your device by default, and cloud backup is optional.",
    url: "https://paymap.app",
    siteName: "PayMap",
  },
}

function buildThemeScript(initialTheme: string) {
  return `(function(){
    try {
      var host = window.location.hostname;
      if ((host === 'localhost' || host === '127.0.0.1' || host === '::1') && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(regs){
          return Promise.all(regs.map(function(reg){ return reg.unregister(); }));
        }).then(function(){
          if ('caches' in window) {
            return caches.keys().then(function(keys){
              return Promise.all(keys.filter(function(key){ return key.indexOf('paymap-') === 0; }).map(function(key){ return caches.delete(key); }));
            });
          }
        }).then(function(){
          if (navigator.serviceWorker.controller && !sessionStorage.getItem('paymap-sw-reset')) {
            sessionStorage.setItem('paymap-sw-reset', '1');
            window.location.reload();
          }
        }).catch(function(){});
      }
      var serverTheme = ${JSON.stringify(initialTheme)};
      var localTheme = localStorage.getItem('paymap-theme');
      var t = localTheme || serverTheme || 'light';
      var root = document.documentElement;
      var resolved = t === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : t;
      root.classList.remove('dark', 'light');
      root.classList.add(resolved === 'dark' ? 'dark' : 'light');
      root.setAttribute('data-theme', resolved);
      root.setAttribute('data-theme-mode', t);
      if (!localTheme && serverTheme) localStorage.setItem('paymap-theme', t);
    } catch(e) {}
  })();`
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeFromCookie = cookies().get("paymap-theme")?.value ?? "system"
  const themeScript = buildThemeScript(themeFromCookie)
  return (
    <html lang={detectSiteLang()} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
