import type { Locale } from './i18n';

const chapters = {
  en: [
    { id: 'origin', label: 'Rooted in Vietnam', title: 'HMV Global.', accent: 'A world of agricultural opportunity.', description: 'Discover tropical commodities at origin. Connect your buying requirements with a coordinated supply chain, built around the trade.', cta: 'Explore our commodities', step: 'Origin', caption: 'Vietnam · Agricultural origins' },
    { id: 'harvest', label: 'Selected for your market', title: 'The harvest.', accent: 'The heart of every trade.', description: 'Passion fruit. Cavendish bananas. Dragon fruit. Spices, cashews and tapioca starch. Start with the product, the specification and your market.', cta: 'Find your next commodity', step: 'Harvest', caption: 'Tropical commodities · International trade' },
    { id: 'world', label: 'Connected to your business', title: 'Your market.', accent: 'Our shared opportunity.', description: 'From Vietnam to international buyers. HMV aligns sourcing, quality requirements and commercial terms — with logistics supporting the trading solution.', cta: 'Discuss your sourcing needs', step: 'World', caption: 'Vietnam → Your market' },
  ],
  vi: [
    { id: 'origin', label: 'Bắt nguồn từ Việt Nam', title: 'HMV Global.', accent: 'Thế giới cơ hội nông sản.', description: 'Khám phá nông sản nhiệt đới ngay tại vùng gốc. Kết nối nhu cầu mua hàng của bạn với chuỗi cung ứng được điều phối xoay quanh giao dịch.', cta: 'Khám phá nông sản', step: 'Vùng gốc', caption: 'Việt Nam · Vùng nông nghiệp' },
    { id: 'harvest', label: 'Chọn lọc cho thị trường của bạn', title: 'Mùa vụ.', accent: 'Trái tim của mọi giao dịch.', description: 'Chanh dây. Chuối Cavendish. Thanh long. Gia vị, hạt điều và tinh bột sắn. Bắt đầu từ sản phẩm, quy cách và thị trường của bạn.', cta: 'Tìm mặt hàng tiếp theo', step: 'Mùa vụ', caption: 'Nông sản nhiệt đới · Thương mại quốc tế' },
    { id: 'world', label: 'Kết nối với doanh nghiệp của bạn', title: 'Thị trường của bạn.', accent: 'Cơ hội chung của chúng ta.', description: 'Từ Việt Nam đến khách hàng quốc tế. HMV thống nhất nguồn cung, yêu cầu chất lượng và điều khoản thương mại — với logistics hỗ trợ giải pháp thương mại.', cta: 'Trao đổi nhu cầu nguồn cung', step: 'Thế giới', caption: 'Việt Nam → Thị trường của bạn' },
  ],
};
export function getJourneyChapters(locale: Locale = 'en') { return chapters[locale]; }
export const journeyChapters = chapters.en;
export const journeyExtras = {
  en: { aria: 'From Vietnamese farms to global agricultural trade', partner: 'Partner with HMV', note: 'Illustrative world · Supply terms confirmed per quotation', scroll: 'From origin to opportunity', alt: 'Agricultural origins in Vietnam' },
  vi: { aria: 'Từ nông trại Việt Nam đến thương mại nông sản toàn cầu', partner: 'Hợp tác cùng HMV', note: 'Thế giới minh họa · Điều khoản cung ứng xác nhận theo báo giá', scroll: 'Từ vùng gốc đến cơ hội', alt: 'Vùng nông nghiệp tại Việt Nam' },
};

export function journeyStage(progress: number) {
  return Math.min(2, Math.max(0, Math.floor(progress * 3)));
}
