import { ClipboardList } from 'lucide-react';
import { ScopedFooter, ScopedHeader } from '@/features/scoped-chrome/ScopedChrome';
import { ScopedLanguages } from '@/features/scoped-chrome/ScopedLanguages';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { TradeDeskHost } from '@/features/trade-desk/TradeDeskHost';
import { localizePath } from '@/i18n/routes';

// The dried cassava chips page in a page-scoped locale (i18n/routes.js PAGE_LOCALES), Next.js only: the chrome of
// CassavaChinaView (zh-CN) and CassavaKoreaView (ko), around their sections (CassavaProcurement). `c` is the page copy
// (data/cassavaChina.js, data/cassavaKorea.js); `source` prefixes the analytics source of its calls to action.
// Its own chrome instead of SiteShell (features/scoped-chrome): the header links to sections of this page and to this
// page in its other languages. The HMV Trade Desk opens in English (it has no Chinese or Korean copy; each page says so
// next to its calls to action).
export const PRODUCT = 'dried-cassava-chips';
const LANGUAGES = [['en', 'English'], ['vi', 'Tiếng Việt'], ['zh-CN', '简体中文'], ['ko', '한국어']];

/** The page in `locale`: its header, the sections (children), its footer and the HMV Trade Desk (English). */
export function ScopedPage({ c, locale, source, children }) {
  const languages = LANGUAGES.map(([code, label]) => ({ code, label, href: localizePath(`/products/${PRODUCT}`, code), current: code === locale }));
  return (
    <>
      <ScopedHeader nav={c.nav} languages={<ScopedLanguages items={languages} />}>
        <TradeDeskButton variant="brand" className="nav-support-btn" product={PRODUCT} source={`${source}_nav`} title={c.tradeDesk}>
          <ClipboardList size={15} />
          <span>HMV Trade Desk</span>
        </TradeDeskButton>
      </ScopedHeader>
      <main id="main-content">{children}</main>
      <ScopedFooter addressLabel={c.footer.address} />
      <TradeDeskHost lang="en" />
    </>
  );
}
