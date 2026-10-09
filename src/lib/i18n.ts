// Active locales are indexable. Add future locales (zh, ja, ko, de) here only when full reviewed content exists.
export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const localeNames: Record<Locale, string> = { en: 'English', vi: 'Tiếng Việt' };
export const ogLocale: Record<Locale, string> = { en: 'en_US', vi: 'vi_VN' };

export function isLocale(value: string | undefined): value is Locale {
  return (locales as readonly string[]).includes(value ?? '');
}
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1];
  return isLocale(first) ? first : defaultLocale;
}
/** Swap the locale prefix while keeping the language-independent rest of the path (product IDs, article slugs). */
export function switchLocalePath(pathname: string, target: Locale) {
  const parts = pathname.split('/');
  if (isLocale(parts[1])) parts[1] = target; else parts.splice(1, 0, target);
  return parts.join('/').replace(/\/$/, '') || `/${target}`;
}
export function localizedPath(locale: Locale, path = '') {
  return `/${locale}${path}`;
}
/** Self-referencing canonical plus reciprocal hreflang alternates for every available locale. */
export function seoHead(o: { locale: Locale; path: string; title: string; description: string; type?: string; available?: readonly Locale[]; noindex?: boolean }) {
  const available = o.available ?? locales;
  const url = localizedPath(o.locale, o.path);
  return {
    meta: [
      { title: o.title },
      { name: 'description', content: o.description },
      { property: 'og:title', content: o.title },
      { property: 'og:description', content: o.description },
      { property: 'og:type', content: o.type ?? 'website' },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: ogLocale[o.locale] },
      { name: 'twitter:card', content: 'summary_large_image' },
      ...(o.noindex ? [{ name: 'robots', content: 'noindex' }] : []),
    ],
    links: o.noindex ? [] : [
      { rel: 'canonical', href: url },
      ...available.map(l => ({ rel: 'alternate', hrefLang: l, href: localizedPath(l, o.path) })),
      ...(available.includes(defaultLocale) ? [{ rel: 'alternate', hrefLang: 'x-default', href: localizedPath(defaultLocale, o.path) }] : []),
    ],
  };
}

export const ui = {
  en: {
    tagline: 'Connecting the world',
    nav: { products: 'Commodities', supply: 'Supply Chain', insights: 'Perspectives', about: 'About HMV', contact: 'Contact', trade: "Let's Trade", home: 'HMV Global home', open: 'Open navigation', close: 'Close navigation', language: 'Language' },
    focus: [['Agri-Commodity Trading', 'Purpose-led sourcing'], ['Integrated Supply Chain', 'Origin to destination'], ['Quality Coordination', 'Aligned with your requirements'], ['International Markets', 'Europe · Americas · Beyond']],
    focusLabel: 'Our focus',
    catalog: { eyebrow: 'Our commodity portfolio', title: ['Rooted in Vietnam.', 'Ready for the world.'], intro: 'Tropical produce and agricultural ingredients, sourced around your specifications and your market.', view: 'View specifications', details: 'Product page', other: 'Looking for another tropical commodity?', talk: 'Talk to our trading team', sheet: 'PRODUCT SPECIFICATION REVIEW', disclaimer: 'Final numerical specifications, availability and documents are confirmed per quotation. This review sheet is not a certificate of analysis or a binding offer.', download: 'Download review sheet', quote: 'Request a quotation', sheetTitle: 'Product specification review sheet' },
    supply: { eyebrow: 'A connected supply chain', title: ['From the source.', 'To your market.'], intro: 'Trading is at our core. Supply-chain coordination brings it all together — aligning product, quality, documentation and delivery around your business.', steps: [['Origin sourcing', 'Commodity selection & specification alignment'], ['Quality & preparation', 'Packing, quality review & trade documentation'], ['Global coordination', 'Customs, cold-chain & shipment coordination']], cta: 'Build your sourcing solution', note: 'Illustrative trade connections · Routes confirmed per inquiry' },
    capabilities: { eyebrow: 'How HMV works', title: 'Clear roles. Clear commitments.', items: [['Direct HMV role', 'Commercial trading, buyer communication, specification alignment and quotation management.'], ['Coordinated with partners', 'Growers, processors, packers, inspection providers, carriers and customs agents, selected per order.'], ['In development', 'Additional commodities, origins and market-specific programmes — discussed case by case, never assumed.']] },
    about: { eyebrow: 'Your partner in Vietnam', title: ['HMV Global.', 'Connecting the world.'], p1: 'We bring agricultural trading and practical supply-chain coordination together. Based in Ho Chi Minh City, HMV Global works around the commodity, route and operating requirements of each international buyer.', p2: 'Our approach is straightforward: understand your needs, align the right solution and keep communication clear from sourcing through shipment.', leadership: 'Meet our leadership', email: 'Email' },
    roles: { Chairman: 'Chairman', 'Managing Director': 'Managing Director', 'General Manager': 'General Manager' } as Record<string, string>,
    insights: { eyebrow: 'The HMV perspective', title: 'A world beyond the harvest.', all: 'All perspectives', read: 'Read perspective', perspective: 'Perspective', topics: 'Article topics', pageTitle: 'Trade, considered.', pageIntro: 'Agricultural markets. Connected supply chains. A changing world. Concise perspectives on the decisions behind international trade.', bring: 'Bring your next trade into focus.', talk: 'Talk to HMV', sources: 'Sources & further reading', disclaimer: 'General commercial information, not certification, investment or regulatory advice. Product specifications, supporting documentation and supply arrangements are confirmed per quotation.', more: 'More perspectives', notFound: 'Perspective not found', published: 'Published', updated: 'Updated' },
    faq: { eyebrow: 'Buyer information', title: ['Clarity before', 'every commitment.'] },
    rfq: { eyebrow: "Let's trade together", title: ['Your next sourcing', 'opportunity starts here.'], intro: 'Tell us what you need. Our trading team will review your commodity requirements and discuss a solution for your market.', contact: 'Your direct trading contact', form: 'Request for Quotation', name: 'Full name', namePh: 'Your full name', company: 'Company', companyPh: 'Company name', email: 'Business email', product: 'Product of interest', select: 'Select a commodity', otherProduct: 'Other tropical commodities', quantity: 'Estimated quantity', quantityPh: 'e.g. 20 metric tonnes', destination: 'Destination country / port', destinationPh: 'e.g. Rotterdam, Netherlands', incoterm: 'Preferred Incoterm', tba: 'To be agreed', requirements: 'Specifications & requirements', requirementsPh: 'Product grade, packaging, target delivery date and quality requirements…', consent: 'I agree that HMV Global may use these details to respond to my sourcing inquiry. Details are stored privately and are not displayed publicly.', submit: 'Submit Request for Quotation', sending: 'Sending inquiry…', prefer: 'Prefer email?', invalid: 'Please review the required fields.', limit: 'Submission limit reached. Please email our team.', failed: 'Your inquiry could not be saved. Please try again or email our team.', doneTitle: 'Your inquiry has been received.', doneText: 'Thank you for contacting HMV Global. Your request has been saved for review by our trading team.', again: 'Send another inquiry' },
    footer: { lines: ['Agri-commodity trading.', 'Integrated supply-chain coordination.', 'Vietnam origins. International opportunities.'], explore: 'Explore HMV', city: 'Ho Chi Minh City, Vietnam', rights: 'All rights reserved.', terms: 'Product availability, specifications and terms confirmed per quotation.' },
    product: { back: 'All commodities', overview: 'Overview', specs: 'Specification review fields', related: 'Related commodities', articles: 'Related perspectives', ctaTitle: 'Request a quotation for this commodity', ctaText: 'Share your grade, format, volume and destination. Our trading team confirms availability, documentation and terms per quotation.', notFound: 'Commodity not found' },
    pages: { productsTitle: 'Agricultural commodities from Vietnam', productsIntro: 'Each commodity page lists the specification fields we align with buyers. Numbers, origin, certification and terms are confirmed per quotation.', contactTitle: 'Request for Quotation', aboutTitle: 'About HMV Global', supplyTitle: 'Integrated supply chain' },
  },
  vi: {
    tagline: 'Kết nối thế giới',
    nav: { products: 'Nông sản', supply: 'Chuỗi cung ứng', insights: 'Góc nhìn', about: 'Về HMV', contact: 'Liên hệ', trade: 'Hợp tác ngay', home: 'Trang chủ HMV Global', open: 'Mở menu', close: 'Đóng menu', language: 'Ngôn ngữ' },
    focus: [['Thương mại nông sản', 'Tìm nguồn cung có định hướng'], ['Chuỗi cung ứng tích hợp', 'Từ vùng nguyên liệu đến điểm đến'], ['Phối hợp chất lượng', 'Theo đúng yêu cầu của bạn'], ['Thị trường quốc tế', 'Châu Âu · Châu Mỹ · Toàn cầu']],
    focusLabel: 'Trọng tâm của chúng tôi',
    catalog: { eyebrow: 'Danh mục nông sản', title: ['Bắt nguồn từ Việt Nam.', 'Sẵn sàng cho thế giới.'], intro: 'Trái cây nhiệt đới và nguyên liệu nông sản, tìm nguồn theo quy cách và thị trường của bạn.', view: 'Xem quy cách', details: 'Trang sản phẩm', other: 'Bạn cần một loại nông sản nhiệt đới khác?', talk: 'Trao đổi với bộ phận thương mại', sheet: 'BẢNG RÀ SOÁT QUY CÁCH SẢN PHẨM', disclaimer: 'Thông số cuối cùng, khả năng cung ứng và chứng từ được xác nhận theo từng báo giá. Bảng rà soát này không phải chứng nhận phân tích hay chào hàng ràng buộc.', download: 'Tải bảng rà soát', quote: 'Yêu cầu báo giá', sheetTitle: 'Bảng rà soát quy cách sản phẩm' },
    supply: { eyebrow: 'Chuỗi cung ứng kết nối', title: ['Từ vùng nguyên liệu.', 'Đến thị trường của bạn.'], intro: 'Thương mại là cốt lõi. Năng lực điều phối chuỗi cung ứng kết nối mọi khâu — sản phẩm, chất lượng, chứng từ và giao hàng — xoay quanh hoạt động kinh doanh của bạn.', steps: [['Tìm nguồn tại vùng gốc', 'Lựa chọn hàng hóa & thống nhất quy cách'], ['Chất lượng & chuẩn bị', 'Đóng gói, rà soát chất lượng & chứng từ thương mại'], ['Điều phối toàn cầu', 'Hải quan, chuỗi lạnh & điều phối lô hàng']], cta: 'Xây dựng giải pháp nguồn cung', note: 'Kết nối thương mại minh họa · Tuyến được xác nhận theo yêu cầu' },
    capabilities: { eyebrow: 'Cách HMV vận hành', title: 'Vai trò rõ ràng. Cam kết rõ ràng.', items: [['Vai trò trực tiếp của HMV', 'Giao dịch thương mại, làm việc với khách hàng, thống nhất quy cách và quản lý báo giá.'], ['Phối hợp cùng đối tác', 'Nhà vườn, nhà chế biến, đóng gói, giám định, hãng vận chuyển và đại lý hải quan, lựa chọn theo từng đơn hàng.'], ['Đang phát triển', 'Thêm nhóm hàng, vùng nguyên liệu và chương trình theo thị trường — trao đổi theo từng trường hợp, không mặc định.']] },
    about: { eyebrow: 'Đối tác của bạn tại Việt Nam', title: ['HMV Global.', 'Kết nối thế giới.'], p1: 'Chúng tôi kết hợp thương mại nông sản với năng lực điều phối chuỗi cung ứng thực tế. Có trụ sở tại TP. Hồ Chí Minh, HMV Global làm việc xoay quanh hàng hóa, tuyến vận chuyển và yêu cầu vận hành của từng khách hàng quốc tế.', p2: 'Cách tiếp cận của chúng tôi đơn giản: hiểu nhu cầu, thống nhất giải pháp phù hợp và giữ thông tin minh bạch từ khâu tìm nguồn đến khi giao hàng.', leadership: 'Ban lãnh đạo', email: 'Gửi email cho' },
    roles: { Chairman: 'Chủ tịch', 'Managing Director': 'Giám đốc điều hành', 'General Manager': 'Tổng giám đốc' } as Record<string, string>,
    insights: { eyebrow: 'Góc nhìn HMV', title: 'Một thế giới vượt ra ngoài mùa vụ.', all: 'Tất cả bài viết', read: 'Đọc bài viết', perspective: 'Góc nhìn', topics: 'Chủ đề bài viết', pageTitle: 'Thương mại, có cân nhắc.', pageIntro: 'Thị trường nông sản. Chuỗi cung ứng kết nối. Một thế giới đang thay đổi. Những góc nhìn tinh gọn về các quyết định phía sau thương mại quốc tế.', bring: 'Cùng định hình giao dịch tiếp theo của bạn.', talk: 'Trao đổi với HMV', sources: 'Nguồn & tài liệu tham khảo', disclaimer: 'Thông tin thương mại tổng quát, không phải chứng nhận, tư vấn đầu tư hay pháp lý. Quy cách sản phẩm, chứng từ hỗ trợ và phương án cung ứng được xác nhận theo từng báo giá.', more: 'Bài viết khác', notFound: 'Không tìm thấy bài viết', published: 'Ngày đăng', updated: 'Cập nhật' },
    faq: { eyebrow: 'Thông tin cho khách hàng', title: ['Minh bạch trước', 'mọi cam kết.'] },
    rfq: { eyebrow: 'Cùng giao thương', title: ['Cơ hội nguồn cung', 'tiếp theo bắt đầu tại đây.'], intro: 'Hãy cho chúng tôi biết nhu cầu của bạn. Bộ phận thương mại sẽ xem xét yêu cầu hàng hóa và trao đổi giải pháp cho thị trường của bạn.', contact: 'Đầu mối thương mại trực tiếp', form: 'Yêu cầu báo giá', name: 'Họ và tên', namePh: 'Họ tên của bạn', company: 'Công ty', companyPh: 'Tên công ty', email: 'Email công việc', product: 'Sản phẩm quan tâm', select: 'Chọn mặt hàng', otherProduct: 'Nông sản nhiệt đới khác', quantity: 'Sản lượng dự kiến', quantityPh: 'VD: 20 tấn', destination: 'Quốc gia / cảng đến', destinationPh: 'VD: Rotterdam, Hà Lan', incoterm: 'Điều kiện Incoterm mong muốn', tba: 'Thỏa thuận sau', requirements: 'Quy cách & yêu cầu', requirementsPh: 'Phân loại, đóng gói, thời gian giao hàng mong muốn và yêu cầu chất lượng…', consent: 'Tôi đồng ý để HMV Global sử dụng thông tin này nhằm phản hồi yêu cầu nguồn cung. Thông tin được lưu riêng tư và không hiển thị công khai.', submit: 'Gửi yêu cầu báo giá', sending: 'Đang gửi…', prefer: 'Muốn gửi email?', invalid: 'Vui lòng kiểm tra các trường bắt buộc.', limit: 'Đã đạt giới hạn gửi. Vui lòng gửi email cho chúng tôi.', failed: 'Không thể lưu yêu cầu. Vui lòng thử lại hoặc gửi email cho chúng tôi.', doneTitle: 'Chúng tôi đã nhận được yêu cầu.', doneText: 'Cảm ơn bạn đã liên hệ HMV Global. Yêu cầu đã được lưu để bộ phận thương mại xem xét.', again: 'Gửi yêu cầu khác' },
    footer: { lines: ['Thương mại nông sản.', 'Điều phối chuỗi cung ứng tích hợp.', 'Nguồn gốc Việt Nam. Cơ hội quốc tế.'], explore: 'Khám phá HMV', city: 'TP. Hồ Chí Minh, Việt Nam', rights: 'Bảo lưu mọi quyền.', terms: 'Khả năng cung ứng, quy cách và điều khoản được xác nhận theo từng báo giá.' },
    product: { back: 'Tất cả nông sản', overview: 'Tổng quan', specs: 'Các trường quy cách cần thống nhất', related: 'Nông sản liên quan', articles: 'Bài viết liên quan', ctaTitle: 'Yêu cầu báo giá mặt hàng này', ctaText: 'Chia sẻ phân loại, dạng hàng, sản lượng và điểm đến. Bộ phận thương mại sẽ xác nhận khả năng cung ứng, chứng từ và điều khoản theo từng báo giá.', notFound: 'Không tìm thấy mặt hàng' },
    pages: { productsTitle: 'Nông sản xuất khẩu từ Việt Nam', productsIntro: 'Mỗi trang sản phẩm liệt kê các trường quy cách chúng tôi thống nhất với khách hàng. Thông số, nguồn gốc, chứng nhận và điều khoản được xác nhận theo từng báo giá.', contactTitle: 'Yêu cầu báo giá', aboutTitle: 'Về HMV Global', supplyTitle: 'Chuỗi cung ứng tích hợp' },
  },
} as const;
export type Dict = (typeof ui)[Locale];
