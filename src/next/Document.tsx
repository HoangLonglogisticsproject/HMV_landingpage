// Next.js-only: the <html> document shared by the root layouts (app/(en), app/(vi), app/(zh)), which differ in `lang`.
// Mirrors index.html: global CSS in the same order as src/main.jsx, the same web fonts, the skip link from App.jsx.
import type { ReactNode } from 'react';
import type { PageLang } from '@/next/seo';
import '@/styles/index.css';
import '@/styles/hmv.css';

export function Document({ lang, children }: { lang: PageLang; children: ReactNode }) {
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
