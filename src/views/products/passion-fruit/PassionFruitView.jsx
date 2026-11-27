import { own } from '@/lib/own';
import { ExportSegment } from './ExportSegment';
import { FoodserviceSegment } from './FoodserviceSegment';
import { RetailSegment } from './RetailSegment';

const PAGES = {
  export: lang => <ExportSegment lang={lang} />,
  foodservice: lang => <FoodserviceSegment lang={lang} />,
  retail: lang => <RetailSegment lang={lang} />,
};

// The golden passion fruit page of a buyer segment (data/passionFruitPages.js), inside the site's chrome. Each segment is
// its own URL and its own page, not a tab over shared copy; they share the product, the photographs and the inquiry desk.
export function PassionFruitView({ lang, segment = 'export' }) {
  const page = own(PAGES, segment);
  return page ? page(lang) : null;
}
