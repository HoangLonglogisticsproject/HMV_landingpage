import type { Locale } from './i18n';

type Chapter = { id: string; label: string; title: string; accent: string; description: string; cta: string; href: string; step: string; caption: string };
// Six chapters: Market (globe) → Origin → Transformation → Quality → Intelligence → World (globe from Vietnam).
const chapters: Record<Locale, Chapter[]> = {
  en: [
    { id: 'market', label: 'Chapter 01 · Your market, our starting point', title: 'Your Market Defines the Need.', accent: 'The Supply Chain Begins at the Origin.', description: 'HMV starts from your required product, specification and timing — then organises the chain back to Vietnamese origins.', cta: 'Discuss your requirements', href: '#rfq', step: 'Market', caption: 'International demand · Europe · Americas' },
    { id: 'origin', label: 'Chapter 02 · Rooted in Vietnam', title: 'Rooted in', accent: 'Vietnamese agriculture.', description: 'Raw-material planning, supply coordination and input requirements aligned with growing areas, harvest and collection points.', cta: 'Explore agricultural products', href: '#commodities', step: 'Origin', caption: 'Vietnam · Raw-material origins' },
    { id: 'processing', label: 'Chapter 03 · The transformation', title: 'From raw material', accent: 'to market-ready product.', description: 'Fresh fruit → collection & inspection → sorting → fresh packing or processing → market-ready product. Each commodity follows its own route.', cta: 'Follow the material', href: '#follow-material', step: 'Transform', caption: 'Partner facilities · Illustrative process' },
    { id: 'quality', label: 'Chapter 04 · Science behind quality', title: 'Science Behind', accent: 'Every Standard.', description: 'Maturity, size, moisture, Brix or temperature — the parameters that matter are agreed per product, checked per lot and documented.', cta: 'See quality management', href: '#quality', step: 'Quality', caption: 'Parameters agreed per specification' },
    { id: 'tower', label: 'Chapter 05 · Connected intelligence', title: 'One Connected Chain.', accent: 'Clearer Decisions.', description: 'Demand, raw-material planning, supply, processing, quality checkpoints, documents and handover — coordinated as one operating model.', cta: 'Explore the operating model', href: '#intelligence', step: 'Connect', caption: 'HMV Supply Chain Intelligence' },
    { id: 'start', label: 'Chapter 06 · Connecting to the world', title: "From Vietnam's Origins", accent: 'to Global Markets.', description: 'Export, customs, cold chain where needed and delivery complete the chain. Build your supply chain with HMV.', cta: 'Discuss your requirements', href: '#rfq', step: 'World', caption: 'Vietnam → Europe · Americas · Beyond (conceptual routes)' },
  ],
  vi: [
    { id: 'market', label: 'Chương 01 · Thị trường của bạn là điểm khởi đầu', title: 'Thị trường xác định nhu cầu.', accent: 'Chuỗi cung ứng bắt đầu từ nguồn nguyên liệu.', description: 'HMV bắt đầu từ sản phẩm, quy cách và thời gian bạn cần — rồi tổ chức chuỗi ngược về vùng nguyên liệu Việt Nam.', cta: 'Trao đổi yêu cầu', href: '#rfq', step: 'Thị trường', caption: 'Nhu cầu quốc tế · Châu Âu · Châu Mỹ' },
    { id: 'origin', label: 'Chương 02 · Gốc rễ Việt Nam', title: 'Bắt nguồn từ', accent: 'nông nghiệp Việt Nam.', description: 'Kế hoạch nguyên liệu, phối hợp nguồn cung và yêu cầu đầu vào gắn với vùng trồng, thu hoạch và điểm tập kết.', cta: 'Khám phá nông sản', href: '#commodities', step: 'Vùng gốc', caption: 'Việt Nam · Vùng nguyên liệu' },
    { id: 'processing', label: 'Chương 03 · Chuyển hóa', title: 'Từ nguyên liệu', accent: 'đến sản phẩm sẵn sàng ra thị trường.', description: 'Quả tươi → thu gom & kiểm tra → phân loại → đóng gói tươi hoặc chế biến → thành phẩm. Mỗi mặt hàng có lộ trình riêng.', cta: 'Theo dấu nguyên liệu', href: '#follow-material', step: 'Chuyển hóa', caption: 'Cơ sở đối tác · Quy trình minh họa' },
    { id: 'quality', label: 'Chương 04 · Khoa học phía sau chất lượng', title: 'Khoa học phía sau', accent: 'từng tiêu chuẩn.', description: 'Độ chín, kích cỡ, độ ẩm, Brix hay nhiệt độ — chỉ tiêu được thống nhất theo sản phẩm, kiểm tra theo lô và lưu hồ sơ.', cta: 'Xem quản lý chất lượng', href: '#quality', step: 'Chất lượng', caption: 'Chỉ tiêu theo quy cách đã thống nhất' },
    { id: 'tower', label: 'Chương 05 · Trí tuệ kết nối', title: 'Một chuỗi kết nối.', accent: 'Quyết định rõ ràng hơn.', description: 'Nhu cầu, kế hoạch nguyên liệu, nguồn cung, chế biến, kiểm soát chất lượng, chứng từ và bàn giao — điều phối như một mô hình vận hành.', cta: 'Khám phá mô hình vận hành', href: '#intelligence', step: 'Kết nối', caption: 'HMV Supply Chain Intelligence' },
    { id: 'start', label: 'Chương 06 · Kết nối thế giới', title: 'Từ vùng nguyên liệu Việt Nam', accent: 'đến thị trường toàn cầu.', description: 'Xuất khẩu, hải quan, chuỗi lạnh khi cần và giao hàng hoàn thiện chuỗi. Kiến tạo chuỗi cung ứng cùng HMV.', cta: 'Trao đổi yêu cầu', href: '#rfq', step: 'Thế giới', caption: 'Việt Nam → Châu Âu · Châu Mỹ · Toàn cầu (tuyến minh họa)' },
  ],
};
export function getJourneyChapters(locale: Locale = 'en') { return chapters[locale]; }
export const journeyChapters = chapters.en;
export const journeyExtras = {
  en: { aria: "From Vietnam's farms to global markets", partner: 'Request a Trade Proposal', explore: 'Explore agricultural products', build: 'Build Your Supply Chain With HMV.', note: 'Illustrative world · Facilities and terms confirmed per quotation', scroll: 'Farm → Raw material → Processing → Quality → Trade → World', alt: 'Agricultural origins in Vietnam' },
  vi: { aria: 'Từ vùng nguyên liệu Việt Nam đến thị trường toàn cầu', partner: 'Yêu cầu đề xuất thương mại', explore: 'Khám phá nông sản', build: 'Kiến tạo chuỗi cung ứng cùng HMV.', note: 'Thế giới minh họa · Cơ sở và điều khoản xác nhận theo báo giá', scroll: 'Nông trại → Nguyên liệu → Chế biến → Chất lượng → Thương mại → Thế giới', alt: 'Vùng nguyên liệu tại Việt Nam' },
};
export const journeyCount = 6;
export function journeyStage(progress: number) {
  return Math.min(journeyCount - 1, Math.max(0, Math.floor(progress * journeyCount)));
}
/** Globe weight: globe opens (chapter 1) and closes (chapters 5–6); the farm/factory diorama carries the middle. */
export function globeWeight(p: number) {
  const ramp = (a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  return 1 - ramp(0.1, 0.2) + ramp(0.75, 0.85);
}
