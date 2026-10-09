import type { Locale } from './i18n';

type Chapter = { id: string; label: string; title: string; accent: string; description: string; cta: string; href: string; step: string; caption: string };
// Six chapters: Globe → Origin → Processing → Control tower → Global markets → Globe/CTA.
const chapters: Record<Locale, Chapter[]> = {
  en: [
    { id: 'world', label: 'Integrated Agricultural Supply Chain & Global Trading', title: "From Vietnam's Farms", accent: 'to Global Markets.', description: 'Connecting raw materials, processing and international trade in one coordinated supply chain.', cta: 'Explore our commodities', href: '#commodities', step: 'World', caption: 'The world needs reliable supply' },
    { id: 'origin', label: 'Chapter 02 · Origin', title: 'Everything begins', accent: 'at the origin.', description: 'A supply chain starts with raw-material planning and market requirements — not when the product is already finished. HMV aligns input needs, supply plans and quality expectations with growing areas and producers.', cta: 'See how we plan supply', href: '#control-tower', step: 'Origin', caption: 'Vietnam · Raw-material origins' },
    { id: 'processing', label: 'Chapter 03 · Processing', title: 'From raw material', accent: 'to product.', description: 'Raw material moves to suitable packhouses or partner processing plants. Passion fruit, for example, can be sorted and packed fresh — or processed into puree and concentrate.', cta: 'Follow the product', href: '#follow-product', step: 'Process', caption: 'Partner facilities · Illustrative process' },
    { id: 'tower', label: 'Chapter 04 · Coordination', title: 'The intelligence', accent: 'behind the chain.', description: 'Planning, suppliers, processing partners, quality, documentation and export — connected and coordinated by HMV’s trading team.', cta: 'Open the control tower', href: '#control-tower', step: 'Control', caption: 'HMV Supply Chain Control Tower' },
    { id: 'markets', label: 'Chapter 05 · Global markets', title: 'Ready for', accent: 'global markets.', description: 'Export coordination, customs documentation, ocean, air, cross-border and cold-chain options support the trade — chosen around the product and destination.', cta: 'Explore our commodities', href: '#commodities', step: 'Markets', caption: 'Vietnam → Europe · Americas · Beyond' },
    { id: 'start', label: 'Chapter 06 · Partnership', title: 'Your next supply chain', accent: 'starts at the origin.', description: 'Share your product, format, specification and destination. HMV will review your requirements and prepare a trade proposal.', cta: 'Discuss your sourcing requirements', href: '#rfq', step: 'Start', caption: 'Your market · Our shared opportunity' },
  ],
  vi: [
    { id: 'world', label: 'Chuỗi cung ứng nông nghiệp tích hợp & Thương mại toàn cầu', title: 'Từ vùng nguyên liệu Việt Nam', accent: 'đến thị trường toàn cầu.', description: 'Kết nối nguồn nguyên liệu, chế biến và thương mại quốc tế trong một chuỗi cung ứng xuyên suốt.', cta: 'Khám phá nông sản', href: '#commodities', step: 'Thế giới', caption: 'Thế giới cần nguồn cung tin cậy' },
    { id: 'origin', label: 'Chương 02 · Vùng nguyên liệu', title: 'Mọi thứ bắt đầu', accent: 'từ nguồn nguyên liệu.', description: 'Chuỗi cung ứng bắt đầu từ kế hoạch nguyên liệu và yêu cầu thị trường — không phải khi hàng hóa đã thành phẩm. HMV thống nhất nhu cầu đầu vào, kế hoạch nguồn cung và yêu cầu chất lượng với vùng trồng và đơn vị sản xuất.', cta: 'Xem cách lập kế hoạch', href: '#control-tower', step: 'Vùng gốc', caption: 'Việt Nam · Vùng nguyên liệu' },
    { id: 'processing', label: 'Chương 03 · Chế biến', title: 'Từ nguyên liệu', accent: 'đến sản phẩm.', description: 'Nguyên liệu được đưa đến cơ sở sơ chế hoặc nhà máy chế biến đối tác phù hợp. Ví dụ chanh dây có thể được phân loại, đóng gói tươi — hoặc chế biến thành puree và cô đặc.', cta: 'Theo dấu sản phẩm', href: '#follow-product', step: 'Chế biến', caption: 'Cơ sở đối tác · Quy trình minh họa' },
    { id: 'tower', label: 'Chương 04 · Điều phối', title: 'Trí tuệ phía sau', accent: 'chuỗi cung ứng.', description: 'Kế hoạch, nhà cung cấp, đối tác chế biến, chất lượng, chứng từ và xuất khẩu — được kết nối và điều phối bởi đội ngũ thương mại HMV.', cta: 'Mở trung tâm điều phối', href: '#control-tower', step: 'Điều phối', caption: 'Trung tâm điều phối chuỗi cung ứng HMV' },
    { id: 'markets', label: 'Chương 05 · Thị trường toàn cầu', title: 'Sẵn sàng cho', accent: 'thị trường toàn cầu.', description: 'Điều phối xuất khẩu, chứng từ hải quan, đường biển, hàng không, qua biên giới và chuỗi lạnh hỗ trợ giao thương — lựa chọn theo sản phẩm và điểm đến.', cta: 'Khám phá nông sản', href: '#commodities', step: 'Thị trường', caption: 'Việt Nam → Châu Âu · Châu Mỹ · Toàn cầu' },
    { id: 'start', label: 'Chương 06 · Hợp tác', title: 'Chuỗi cung ứng tiếp theo của bạn', accent: 'bắt đầu từ nguồn nguyên liệu.', description: 'Chia sẻ sản phẩm, dạng hàng, quy cách và điểm đến. HMV sẽ xem xét yêu cầu và chuẩn bị đề xuất thương mại.', cta: 'Trao đổi yêu cầu nguồn cung', href: '#rfq', step: 'Bắt đầu', caption: 'Thị trường của bạn · Cơ hội chung' },
  ],
};
export function getJourneyChapters(locale: Locale = 'en') { return chapters[locale]; }
export const journeyChapters = chapters.en;
export const journeyExtras = {
  en: { aria: "From Vietnam's farms to global markets", partner: 'Request a Trade Proposal', note: 'Illustrative world · Facilities and terms confirmed per quotation', scroll: 'Farm → Raw material → Processing → Quality → Trade → World', alt: 'Agricultural origins in Vietnam' },
  vi: { aria: 'Từ vùng nguyên liệu Việt Nam đến thị trường toàn cầu', partner: 'Yêu cầu đề xuất thương mại', note: 'Thế giới minh họa · Cơ sở và điều khoản xác nhận theo báo giá', scroll: 'Nông trại → Nguyên liệu → Chế biến → Chất lượng → Thương mại → Thế giới', alt: 'Vùng nguyên liệu tại Việt Nam' },
};
export const journeyCount = 6;
export function journeyStage(progress: number) {
  return Math.min(journeyCount - 1, Math.max(0, Math.floor(progress * journeyCount)));
}
/** Globe weight: globe opens (chapter 1) and closes (chapters 5–6); the farm/factory diorama carries the middle. */
export function globeWeight(p: number) {
  const ramp = (a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  return 1 - ramp(0.1, 0.2) + ramp(0.6, 0.7);
}
