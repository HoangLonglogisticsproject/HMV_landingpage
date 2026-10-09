import type { Locale } from './i18n';

// "Supply Chain World 2.0" content: navigation, intelligence capability tags, quality science and blueprint logic.
// Business data only — animation components read from here. No KPIs, results or certifications are implied.

export type Capability = 'hmv' | 'partner' | 'proposed';
export const capabilityLabels: Record<Locale, Record<Capability, string>> = {
  en: { hmv: 'HMV-led scope · pending verification', partner: 'Partner-coordinated', proposed: 'Proposed workflow' },
  vi: { hmv: 'Phạm vi HMV chủ trì · chờ xác minh', partner: 'Phối hợp cùng đối tác', proposed: 'Quy trình đề xuất' },
};
export const nodeCapability: Record<string, Capability> = { demand: 'hmv', planning: 'hmv', origin: 'partner', processing: 'partner', quality: 'partner', packaging: 'hmv', export: 'partner' };

export const demandNode = {
  en: { id: 'demand', title: 'Buyer Demand', role: 'Start from the importer’s market, product format, specification and timing.', problem: 'Prevents offering what is available instead of what the market actually needs.', parties: 'International buyer, HMV trading team', scope: 'HMV reviews the requirement and the commercial basis before sourcing.', evidence: 'Buyer requirement brief or RFQ.' },
  vi: { id: 'demand', title: 'Nhu cầu người mua', role: 'Bắt đầu từ thị trường, dạng sản phẩm, quy cách và thời gian của nhà nhập khẩu.', problem: 'Tránh chào hàng có sẵn thay vì đáp ứng đúng nhu cầu thị trường.', parties: 'Người mua quốc tế, đội thương mại HMV', scope: 'HMV rà soát yêu cầu và cơ sở thương mại trước khi tìm nguồn.', evidence: 'Bản yêu cầu của người mua hoặc RFQ.' },
};

export const intelligenceLabels = {
  en: { eyebrow: 'HMV Supply Chain Intelligence', title: 'One Connected Chain. Clearer Decisions.', intro: 'An interactive explanation of the operating model HMV uses to coordinate a trade — not live order tracking or deployed software.', progress: 'Position in the chain', legend: 'Capability type', role: 'Role', problem: 'Problem solved', parties: 'Parties involved', scope: 'HMV scope', evidence: 'Documents / evidence' },
  vi: { eyebrow: 'HMV Supply Chain Intelligence', title: 'Một chuỗi kết nối. Quyết định rõ ràng hơn.', intro: 'Phần giải thích tương tác về mô hình vận hành HMV dùng để điều phối giao dịch — không phải theo dõi đơn hàng trực tiếp hay phần mềm đã triển khai.', progress: 'Vị trí trong chuỗi', legend: 'Loại năng lực', role: 'Vai trò', problem: 'Vấn đề giải quyết', parties: 'Các bên tham gia', scope: 'Phạm vi của HMV', evidence: 'Chứng từ / bằng chứng' },
};

/** Supply Chain mega menu: section anchors on the Supply Chain hub. */
export const supplyMenu: Record<Locale, { products: string; items: { hash: string; label: string; text: string }[] }> = {
  en: { products: 'Agricultural Products & Raw Materials', items: [
    { hash: 'sourcing', label: 'Raw Material Sourcing', text: 'Origins, growers and supply planning' },
    { hash: 'follow-material', label: 'Processing & Manufacturing Coordination', text: 'Fresh packing or processing pathways' },
    { hash: 'quality', label: 'Science & Quality Management', text: 'Parameters, lots and documentation' },
    { hash: 'intelligence', label: 'Integrated Supply Chain Operations', text: 'One connected operating model' },
    { hash: 'export', label: 'Export & Global Delivery', text: 'Customs, cold chain and handover' },
  ] },
  vi: { products: 'Nông sản & nguyên liệu', items: [
    { hash: 'sourcing', label: 'Tổ chức nguồn nguyên liệu', text: 'Vùng trồng, nhà vườn và kế hoạch nguồn cung' },
    { hash: 'follow-material', label: 'Điều phối sơ chế & chế biến', text: 'Hướng đóng gói tươi hoặc chế biến' },
    { hash: 'quality', label: 'Khoa học & quản lý chất lượng', text: 'Chỉ tiêu, lô hàng và hồ sơ' },
    { hash: 'intelligence', label: 'Vận hành chuỗi cung ứng tích hợp', text: 'Một mô hình vận hành kết nối' },
    { hash: 'export', label: 'Xuất khẩu & giao hàng toàn cầu', text: 'Hải quan, chuỗi lạnh và bàn giao' },
  ] },
};
export const navExtra = {
  en: { home: 'Home', related: 'Explore the Supply Chain Hub', qualityLink: 'Science & quality management', intelLink: 'Integrated operating model', solutions: 'Trade Solutions', partner: 'Partner With Us', hub: 'Supply Chain Hub' },
  vi: { home: 'Trang chủ', related: 'Khám phá trung tâm chuỗi cung ứng', qualityLink: 'Khoa học & quản lý chất lượng', intelLink: 'Mô hình vận hành tích hợp', solutions: 'Giải pháp thương mại', partner: 'Hợp tác ngay', hub: 'Trung tâm chuỗi cung ứng' },
};

// Science behind quality: which parameters are typically agreed per product. Not HMV test results.
type QualityStage = { id: string; title: string; text: string };
export const quality: Record<Locale, { eyebrow: string; title: string; intro: string; note: string; paramsTitle: string; related: string; stages: QualityStage[]; params: Record<string, string[]> }> = {
  en: { eyebrow: 'Science & quality', title: 'Science Behind Every Standard.', intro: 'Quality is agreed before it is shipped. Each product has its own parameters, checkpoints and documents, aligned with the buyer’s specification.', note: 'Parameters shown are typical items buyers specify — not HMV laboratory results. Certifications are linked to a company, origin or facility only when documented.', paramsTitle: 'Typical parameters by product', related: 'Related reading', stages: [
    { id: 'input', title: 'Raw-material inspection', text: 'Incoming lots are checked against the agreed input requirement before they enter packing or processing.' },
    { id: 'grade', title: 'Maturity, size & grading', text: 'Ripeness, size classes and defect tolerances are defined per market and per format.' },
    { id: 'lab', title: 'Product-specific testing', text: 'Moisture, Brix, temperature or other parameters are tested where relevant, by facilities or third-party labs.' },
    { id: 'process', title: 'In-process control', text: 'Partner facilities apply their process controls; HMV aligns checkpoints with the specification.' },
    { id: 'lot', title: 'Packing & lot traceability', text: 'Lots are packed and labelled so each shipment can be traced back to its documents.' },
    { id: 'dossier', title: 'Standards dossier', text: 'Test reports, inspection documents and certificates are compiled when provided for the specific lot or facility.' },
  ], params: { 'passion-fruit': ['Brix', 'Acidity', 'Size class', 'Skin condition'], bananas: ['Finger length', 'Caliper', 'Pulp temperature', 'Defects'], 'dragon-fruit': ['Weight class', 'Bract condition', 'Brix', 'Pulp temperature'], spices: ['Moisture', 'Volatile oil', 'Admixture', 'Microbiology'], cashews: ['Grade (W240/W320…)', 'Moisture', 'Broken ratio', 'Foreign matter'], tapioca: ['Moisture', 'Starch content', 'Whiteness', 'pH'] } },
  vi: { eyebrow: 'Khoa học & chất lượng', title: 'Khoa học phía sau từng tiêu chuẩn.', intro: 'Chất lượng được thống nhất trước khi xuất hàng. Mỗi sản phẩm có chỉ tiêu, điểm kiểm soát và hồ sơ riêng, theo quy cách của người mua.', note: 'Các chỉ tiêu là hạng mục người mua thường yêu cầu — không phải kết quả kiểm nghiệm của HMV. Chứng nhận chỉ gắn với doanh nghiệp, vùng trồng hoặc cơ sở khi có tài liệu.', paramsTitle: 'Chỉ tiêu thường gặp theo sản phẩm', related: 'Bài viết liên quan', stages: [
    { id: 'input', title: 'Kiểm tra nguyên liệu đầu vào', text: 'Lô nguyên liệu được đối chiếu với yêu cầu đầu vào trước khi đóng gói hoặc chế biến.' },
    { id: 'grade', title: 'Độ chín, kích thước & phân loại', text: 'Độ chín, cỡ và dung sai khuyết tật được xác định theo thị trường và dạng hàng.' },
    { id: 'lab', title: 'Kiểm nghiệm theo sản phẩm', text: 'Độ ẩm, Brix, nhiệt độ hoặc chỉ tiêu khác được kiểm tra khi phù hợp, bởi cơ sở hoặc phòng thí nghiệm độc lập.' },
    { id: 'process', title: 'Kiểm soát trong chế biến', text: 'Cơ sở đối tác áp dụng kiểm soát quy trình; HMV thống nhất điểm kiểm soát với quy cách.' },
    { id: 'lot', title: 'Đóng gói & truy xuất lô', text: 'Lô hàng được đóng gói, ghi nhãn để truy ngược về hồ sơ của từng chuyến.' },
    { id: 'dossier', title: 'Hồ sơ tiêu chuẩn', text: 'Phiếu kiểm nghiệm, biên bản giám định và chứng nhận được tập hợp khi có cho lô hoặc cơ sở cụ thể.' },
  ], params: { 'passion-fruit': ['Brix', 'Độ axit', 'Cỡ quả', 'Tình trạng vỏ'], bananas: ['Chiều dài nải', 'Đường kính quả', 'Nhiệt độ thịt quả', 'Khuyết tật'], 'dragon-fruit': ['Cỡ trọng lượng', 'Tai quả', 'Brix', 'Nhiệt độ thịt quả'], spices: ['Độ ẩm', 'Tinh dầu', 'Tạp chất', 'Vi sinh'], cashews: ['Cấp hạt (W240/W320…)', 'Độ ẩm', 'Tỷ lệ vỡ', 'Tạp chất lạ'], tapioca: ['Độ ẩm', 'Hàm lượng tinh bột', 'Độ trắng', 'pH'] } },
};
export const qualityArticles = ['globalgap-fruit-buyers', 'cold-chain-critical-handoffs'];

// Supply Chain Blueprint: a proposed list of stages to review. Never a commitment, price or lead time.
export type BlueprintInput = { product: string; format: string; market: string; season: string; documents: string };
export const blueprintLabels = {
  en: { eyebrow: 'Supply Chain Blueprint', title: 'Configure your requirement. See the chain to review.', intro: 'Set out what you need. We draft the stages HMV would review with you — a starting point for discussion, not a committed plan.', material: 'Raw material', format: 'Output format', spec: 'Technical specification', qty: 'Estimated volume', season: 'Monthly / seasonal demand', market: 'Import market', docs: 'Quality & documents', incoterm: 'Delivery term (if known)', build: 'Draft blueprint', send: 'Send blueprint to HMV', result: 'Proposed stages to review', disclaimer: 'Proposed blueprint only. Sourcing, facilities, pricing and timing are confirmed by HMV after review.', formats: { Fresh: 'Fresh', 'Semi-processed': 'Semi-processed', Processed: 'Processed', 'Raw material': 'Raw material', 'To be discussed': 'To be discussed' } },
  vi: { eyebrow: 'Bản thiết kế chuỗi cung ứng', title: 'Thiết lập yêu cầu. Xem chuỗi cần rà soát.', intro: 'Nêu nhu cầu của bạn. Chúng tôi phác thảo các công đoạn HMV sẽ cùng rà soát — điểm khởi đầu để trao đổi, không phải kế hoạch đã cam kết.', material: 'Nguyên liệu', format: 'Dạng thành phẩm', spec: 'Quy cách kỹ thuật', qty: 'Sản lượng dự kiến', season: 'Nhu cầu theo tháng / mùa', market: 'Thị trường nhập khẩu', docs: 'Yêu cầu chất lượng & chứng từ', incoterm: 'Điều kiện giao hàng (nếu có)', build: 'Phác thảo blueprint', send: 'Gửi blueprint đến HMV', result: 'Các công đoạn đề xuất cần rà soát', disclaimer: 'Chỉ là blueprint đề xuất. Nguồn cung, cơ sở, giá và thời gian do HMV xác nhận sau khi thẩm định.', formats: { Fresh: 'Tươi', 'Semi-processed': 'Sơ chế', Processed: 'Chế biến', 'Raw material': 'Nguyên liệu thô', 'To be discussed': 'Cần trao đổi' } },
};

const stageText = {
  en: { demand: 'Requirement & specification review', planning: 'Raw-material planning by season', origin: 'Origin & supplier identification', pack: 'Packhouse sorting & fresh packing', process: 'Partner processing route', raw: 'Collection & bulk preparation', quality: 'Quality checkpoints & testing plan', docs: 'Document set for destination', cold: 'Cold-chain handoffs', export: 'Export & delivery coordination', review: 'Format review with HMV' },
  vi: { demand: 'Rà soát yêu cầu & quy cách', planning: 'Kế hoạch nguyên liệu theo mùa vụ', origin: 'Xác định vùng nguyên liệu & nhà cung cấp', pack: 'Phân loại & đóng gói tươi tại cơ sở', process: 'Lộ trình chế biến tại đối tác', raw: 'Thu gom & chuẩn bị hàng rời', quality: 'Điểm kiểm soát & kế hoạch kiểm nghiệm', docs: 'Bộ chứng từ theo thị trường', cold: 'Các điểm giao nhận chuỗi lạnh', export: 'Điều phối xuất khẩu & giao hàng', review: 'Rà soát dạng hàng cùng HMV' },
};
const fresh = ['passion-fruit', 'bananas', 'dragon-fruit'];
export function buildBlueprint(input: BlueprintInput, locale: Locale): string[] {
  const s = stageText[locale];
  const transform = input.format === 'Fresh' ? s.pack : input.format === 'Processed' || input.format === 'Semi-processed' ? s.process : input.format === 'Raw material' ? s.raw : s.review;
  const out = [s.demand, s.planning, s.origin, transform, s.quality, s.docs];
  if (input.format === 'Fresh' && fresh.includes(input.product)) out.push(s.cold);
  out.push(s.export);
  return out;
}
