// Content of the product pages that go beyond the generic product page: buyer-facing sections and SEO. Golden passion
// fruit has its own pages, one per buyer segment (data/passionFruitPages.js).
// Claims are limited to verified evidence. Dried cassava chips: the HMV cassava dossier (network capacity, one Intertek-analysed sample) and
// HMV-supplied photographs of the product, stock and container loading (data/cassavaEvidence.js), whose location,
// facilities and lots are not asserted.
// Rendered by the cassava procurement page (views/products/CassavaProcurement, `procurement`); titles and descriptions by productMeta() in views/meta.js.
//
// One content tree per product. Only text leaves are localized, `t(en, vi)`; figures, sample results and the report are
// written once and formatted per language. definePage() resolves the tree into `seo.en`, `seo.vi`, `en` and `vi`.
// The cassava figures and sample results also carry Simplified Chinese and Korean, `t(en, vi, zh, ko)`, for the
// page-scoped pages (data/cassavaChina.js, data/cassavaKorea.js), which show the same evidence.
import { localizePath } from '../i18n/routes.js';
import { articles } from './articles.js';
import { resolve } from './localized.js';

const LOCALES = { en: 'en-US', vi: 'vi-VN', zh: 'zh-CN', ko: 'ko-KR' };

/** A localized leaf: resolved to its text in the page language. */
const t = (en, vi, zh, ko) => lang => ({ en, vi, zh, ko })[lang];

/** A card or step: [title, text] in each language; `key` names what it is where its icon depends on it. */
const card = (en, vi, key) => ({ key, title: t(en[0], vi[0]), text: t(en[1], vi[1]) });

/** A number written once, formatted per language (50000 → "50,000" / "50.000"), with a prefix and a unit. */
const quantity = (n, unit, prefix = '') => lang =>
  `${prefix}${n.toLocaleString(LOCALES[lang])}${typeof unit === 'function' ? unit(lang) : unit}`;

const definePage = ({ seo, content, ...shared }) => ({
  ...shared,
  seo: { en: resolve(seo, 'en'), vi: resolve(seo, 'vi') },
  en: resolve(content, 'en'),
  vi: resolve(content, 'vi'),
});

// Dried cassava chips facts from the HMV cassava dossier.
const PER_MONTH = {
  tons: t(' MT/month', ' tấn/tháng', ' 吨/月', ' 톤/월'),
  containers: t(' containers/month', ' container/tháng', ' 集装箱/月', ' 컨테이너/월'),
};
const INTERTEK = { report: 'AGRIVIETNAM2026-1700', date: new Date(Date.UTC(2026, 9, 5)) };
const reportDate = lang =>
  INTERTEK.date.toLocaleDateString({ en: 'en-GB', vi: 'vi-VN', zh: 'zh-CN', ko: 'ko-KR' }[lang], {
    day: ['zh', 'ko'].includes(lang) ? 'numeric' : '2-digit',
    month: { en: 'short', vi: '2-digit', zh: 'long', ko: 'long' }[lang],
    year: 'numeric',
    timeZone: 'UTC',
  });
const percent = n => quantity(n, '%');
const mgPerKg = (n, prefix) => quantity(n, ' mg/kg', prefix);
// The two results the hero quotes, shared with the full results table.
const STARCH = [t('Starch', 'Tinh bột', '淀粉', '전분'), percent(71.1)];
const MOISTURE = [t('Moisture', 'Độ ẩm', '水分', '수분'), percent(11.55)];
// HMV network figures and the full Intertek results: shared by the EN/VI page and the page-scoped pages.
const CASSAVA_FIGURES = [
  { value: quantity(50000, PER_MONTH.tons), label: t('Consolidation capacity at the Cambodia warehouse', 'Năng lực gom hàng tại kho Campuchia', '柬埔寨仓库集货能力', '캄보디아 창고 집하 역량') },
  { value: quantity(10000, PER_MONTH.tons), label: t('Supply to a factory in Long An', 'Cung ứng cho nhà máy tại Long An', '供应越南隆安省一家工厂', '베트남 롱안성 소재 공장 공급') },
  { value: quantity(150, PER_MONTH.containers), label: t('Delivery to an importer in Guangxi', 'Giao cho nhà nhập khẩu tại Quảng Tây', '交付广西一家进口商', '중국 광시 소재 수입업체 납품') },
  { value: quantity(250, PER_MONTH.containers), label: t('Transit-export capacity', 'Năng lực xuất khẩu quá cảnh', '过境出口组织能力', '경유 수출 조율 역량') },
];
const CASSAVA_RESULTS = [
  STARCH,
  MOISTURE,
  [t('Raw fiber', 'Xơ thô', '粗纤维', '조섬유'), percent(2.99)],
  [t('Ash', 'Tro', '灰分', '회분'), percent(1.86)],
  [t('Sand & silica', 'Cát sạn (sand & silica)', '砂和二氧化硅（Sand & silica）', '모래 및 실리카 (Sand & silica)'), percent(0.45)],
  [t('Foreign matter', 'Tạp chất', '杂质', '이물질'), t('Not detected', 'Không phát hiện', '未检出', '불검출')],
  [t('Lead (Pb)', 'Chì (Pb)', '铅 (Pb)', '납 (Pb)'), mgPerKg(0.17)],
  [t('Cadmium (Cd)', 'Cadimi (Cd)', '镉 (Cd)', '카드뮴 (Cd)'), mgPerKg(0.28)],
  [t('Mercury (Hg)', 'Thủy ngân (Hg)', '汞 (Hg)', '수은 (Hg)'), mgPerKg(0.02, '<')],
];
const CASSAVA_SOURCE = lang => t(
  `Source: Intertek Vietnam analysis report ${INTERTEK.report}, dated ${reportDate(lang)}. The reported values apply to the analyzed sample.`,
  `Nguồn: Báo cáo phân tích Intertek Việt Nam ${INTERTEK.report} ngày ${reportDate(lang)}. Các giá trị áp dụng cho mẫu được phân tích.`,
  `来源：Intertek 越南分析报告 ${INTERTEK.report}，报告日期 ${reportDate(lang)}。所列数值仅适用于该送检样品。`,
  `출처: Intertek 베트남 분석 보고서 ${INTERTEK.report}, 보고일 ${reportDate(lang)}. 기재된 수치는 분석된 샘플에만 해당합니다.`,
)(lang);
// The four results buyers compare first (starch, moisture, raw fiber, sand and silica), for the quality cards: the
// name without its English gloss, the English name beside it (the Intertek report is in English) and the value.
const CASSAVA_HIGHLIGHTS = [0, 1, 2, 4].map(i => CASSAVA_RESULTS[i]).map(([name, value]) => ({
  label: lang => name(lang).split(/[（(]/)[0].trimEnd(),
  en: name('en'),
  value,
}));

export const productPages = {
  // The EN/VI dried cassava chips page: the cassava procurement page (views/products/CassavaProcurement) in the site's
  // chrome, in the content shape of the Chinese and Korean copy (data/cassavaChina.js, data/cassavaKorea.js).
  'dried-cassava-chips': definePage({
    // The procurement page (views/products/ProductView); its closing call to action is the
    // HMV Trade Desk, not the product RFQ.
    procurement: true,
    seo: {
      title: t('Dried Cassava Chips Supplier in Vietnam', 'Nhà cung cấp sắn lát khô B2B tại Việt Nam'),
      description: t(
        'HMV Global manages recurring bulk dried cassava chip supply for feed, starch and bioethanol buyers, coordinating sourcing, quality, consolidation and delivery.',
        'HMV Global điều phối nguồn cung sắn lát khô số lượng lớn cho nhà máy thức ăn chăn nuôi, tinh bột và bioethanol, từ nguồn hàng, chất lượng đến giao hàng.',
      ),
    },
    content: {
      // The strip below the hero: the page's sections, in page order; short labels, one row from 1024 px.
      sections: {
        label: t('On this page', 'Trên trang này'),
        items: [
          ['overview', t('Overview', 'Tổng quan')],
          ['applications', t('Applications', 'Ứng dụng')],
          ['supply-evidence', t('Supply evidence', 'Nguồn hàng')],
          ['quality', t('Quality reference', 'Chất lượng')],
          ['capability', t('Supply capacity', 'Năng lực')],
          ['workflow', t('Workflow', 'Quy trình')],
          ['faq', t('FAQ', 'Hỏi đáp')],
        ],
      },
      hero: {
        eyebrow: t('HMV GLOBAL · MANAGED BULK SUPPLY', 'HMV GLOBAL · ĐIỀU PHỐI NGUỒN CUNG SỐ LƯỢNG LỚN'),
        h1: t('Bulk Dried Cassava Chips Supply Managed by HMV Global', 'Nguồn cung sắn lát khô số lượng lớn do HMV Global điều phối'),
        lead: t(
          'HMV Global coordinates recurring dried cassava chip supply for feed, starch and bioethanol manufacturers, importers and distributors through a managed regional sourcing network.',
          'HMV Global điều phối nguồn cung sắn lát khô định kỳ cho nhà máy thức ăn chăn nuôi, tinh bột, bioethanol, nhà nhập khẩu và nhà phân phối thông qua mạng lưới cung ứng khu vực do HMV quản lý.',
        ),
        cta: t('Build Your Cassava Supply Plan with HMV', 'Xây dựng phương án cung ứng sắn lát cùng HMV'),
        secondary: t('View Quality Reference', 'Xem tham chiếu chất lượng'),
        // The lead's and the buyer section's own terms.
        trust: [
          t('Managed bulk supply', 'Điều phối nguồn cung số lượng lớn'),
          t('Recurring supply', 'Cung ứng định kỳ'),
          t('Quality agreed before commitment', 'Thống nhất chất lượng trước khi cam kết'),
          t('Regional sourcing network', 'Mạng lưới cung ứng khu vực'),
        ],
        seeAlso: { id: 'tapioca-starch', text: t('Looking for tapioca starch? It is a separate product.', 'Bạn cần tinh bột sắn? Đó là một sản phẩm riêng.') },
      },
      figures: {
        eyebrow: t('HMV GLOBAL NETWORK CAPACITY', 'NĂNG LỰC MẠNG LƯỚI HMV GLOBAL'),
        title: t('Capacity across our network', 'Năng lực trong mạng lưới của chúng tôi'),
        items: CASSAVA_FIGURES,
        // The hero panel's qualification; the full one is in the supply network section.
        short: t('A network capability reference, not a supply commitment to any single buyer.', 'Tham chiếu năng lực mạng lưới, không phải cam kết cung ứng cho từng khách hàng.'),
        note: t(
          'HMV Global network and capability figures, not a guaranteed output for every buyer. The volume for your order is confirmed in the supply proposal and contract.',
          'Số liệu năng lực của mạng lưới HMV Global, không phải sản lượng cam kết cho mọi khách hàng. Sản lượng cho đơn hàng của bạn được xác nhận trong phương án cung ứng và hợp đồng.',
        ),
      },
      intertek: {
        title: t('Intertek reference', 'Tham chiếu Intertek'),
        results: [STARCH, MOISTURE],
        report: `Intertek ${INTERTEK.report}`,
        caption: t('Analyzed sample · not a fixed shipment specification', 'Mẫu đã phân tích · không phải thông số cố định cho lô hàng'),
      },
      applications: {
        title: t('Cassava chips for feed, starch and bioethanol', 'Sắn lát cho thức ăn chăn nuôi, tinh bột và bioethanol'),
        items: [
          card(['Animal feed', 'For feed manufacturers and their formulations.'], ['Thức ăn chăn nuôi', 'Cho nhà sản xuất thức ăn chăn nuôi và công thức phối trộn.'], 'feed'),
          card(['Starch processing', 'For starch processors.'], ['Chế biến tinh bột', 'Cho nhà chế biến tinh bột.'], 'starch'),
          card(['Bioethanol', 'For ethanol producers.'], ['Bioethanol', 'Cho nhà sản xuất ethanol.'], 'bioethanol'),
        ],
      },
      why: {
        title: t('Why buyers work with HMV', 'Vì sao người mua chọn HMV'),
        text: t('More than access to an origin. A managed supply program.', 'Không chỉ kết nối nguồn hàng. HMV quản lý cả phương án cung ứng.'),
        items: [
          card(['Supply Network', 'HMV coordinates sourcing across multiple supply points to support the volume and delivery schedule defined in the buyer brief.'],
            ['Mạng lưới cung ứng', 'HMV điều phối nguồn hàng từ nhiều điểm cung ứng để đáp ứng sản lượng và lịch giao hàng trong yêu cầu thu mua của bạn.'], 'network'),
          card(['Quality Alignment', 'Quality requirements are agreed before commitment, with sampling and analysis coordinated according to the requirements of each proposal.'],
            ['Thống nhất chất lượng', 'Tiêu chí chất lượng được thống nhất trước khi cam kết; việc lấy mẫu và phân tích được điều phối theo yêu cầu của từng phương án.'], 'quality'),
          card(['Consolidation', 'Lots can be consolidated around the required shipment volume instead of relying on a single source to fulfil the entire program.'],
            ['Gom hàng', 'Các lô hàng có thể được gom theo sản lượng cần xuất, thay vì phụ thuộc vào một nguồn duy nhất cho toàn bộ chương trình.'], 'consolidation'),
          card(['Commercial Execution', 'HMV coordinates the commercial proposal, documentation and delivery plan through one supply process from RFQ to execution.'],
            ['Thực thi thương mại', 'HMV điều phối đề xuất thương mại, chứng từ và kế hoạch giao hàng trong một quy trình cung ứng xuyên suốt, từ RFQ đến khi thực hiện.'], 'delivery'),
        ],
      },
      quality: {
        title: t('Quality reference', 'Tham chiếu chất lượng'),
        note: t(
          'These values are results from the analyzed Intertek sample, not fixed specifications for every shipment. Final lot specifications are agreed in the contract.',
          'Các giá trị trên là kết quả của mẫu được Intertek phân tích, không phải thông số cố định cho mọi lô hàng. Chỉ tiêu từng lô được thống nhất trong hợp đồng.',
        ),
        highlights: CASSAVA_HIGHLIGHTS,
        head: [t('Parameter', 'Chỉ tiêu'), t('Result', 'Kết quả')],
        rows: CASSAVA_RESULTS,
        source: CASSAVA_SOURCE,
        // The laboratory analysis behind the results: one submitted sample, not a certification of the product, the
        // supplier or any shipment. Its report pages, once committed: data/cassavaQualityReport.js.
        evidence: {
          title: t('Third-party laboratory analysis', 'Phân tích phòng thí nghiệm bên thứ ba'),
          // The report's English term beside the Vietnamese title; the English title is that term already.
          en: t(undefined, 'Third-party laboratory analysis'),
          name: t(`Intertek Vietnam analysis report ${INTERTEK.report}`, `Báo cáo phân tích Intertek Việt Nam ${INTERTEK.report}`),
          details: [
            [t('Laboratory', 'Phòng thí nghiệm'), t('Intertek Vietnam', 'Intertek Việt Nam')],
            [t('Report number', 'Số báo cáo'), INTERTEK.report],
            [t('Report date', 'Ngày báo cáo'), reportDate],
            [t('Analysed', 'Đối tượng phân tích'), t('Submitted sample', 'Mẫu gửi phân tích')],
          ],
          explain: {
            title: t('How to read this sample result', 'Cách hiểu kết quả mẫu này'),
            points: [
              t('The result of one submitted sample analysed by Intertek, a reference for procurement evaluation.', 'Kết quả của một mẫu gửi Intertek phân tích, dùng để tham khảo khi đánh giá thu mua.'),
              t('Not a fixed specification for every lot or shipment.', 'Không phải thông số cố định cho mọi lô hàng.'),
              t('Supply specifications are agreed between HMV and the buyer in the supply proposal and contract.', 'Chỉ tiêu cung ứng được HMV và người mua thống nhất trong phương án cung ứng và hợp đồng.'),
              t('HMV coordinates sourcing and sampling against the quality requirements agreed with the buyer.', 'HMV điều phối nguồn hàng và lấy mẫu theo tiêu chí chất lượng đã thống nhất với người mua.'),
            ],
          },
          view: t('View test analysis', 'Xem báo cáo phân tích'),
          close: t('Close the test analysis', 'Đóng báo cáo phân tích'),
          redacted: t('Shipper, consignee and other commercial details in the report are covered.', 'Thông tin người gửi hàng, người nhận hàng và các thông tin thương mại khác trong báo cáo đã được che.'),
        },
      },
      network: {
        title: t('Supply network and capacity', 'Mạng lưới và năng lực cung ứng'),
        text: t(
          "HMV's supply network includes sourcing capabilities in Vietnam and Cambodia. The applicable origin, specification, availability and commercial terms are confirmed for each proposal and shipment.",
          'Mạng lưới cung ứng của HMV bao gồm khả năng huy động nguồn hàng tại Việt Nam và Campuchia. Xuất xứ áp dụng, thông số, khả năng cung ứng và điều kiện thương mại được xác nhận theo từng phương án và lô hàng.',
        ),
        // Where each figure comes from, not a map: no route, distance or location beyond the figures' own labels.
        regions: {
          label: t('Supply network overview (not a map)', 'Sơ đồ mạng lưới cung ứng (không phải bản đồ)'),
          items: [
            [t('Cambodia', 'Campuchia'), t('Sourcing & consolidation', 'Nguồn hàng & gom hàng')],
            [t('Vietnam', 'Việt Nam'), t('Sourcing & factory supply', 'Nguồn hàng & cung ứng nhà máy')],
            [t('China · Guangxi', 'Trung Quốc · Quảng Tây'), t('Delivery reference', 'Tham chiếu giao hàng')],
          ],
        },
        role: {
          title: t("HMV's coordinating role", 'Vai trò điều phối của HMV'),
          points: [
            t('Regional sourcing coordination', 'Điều phối nguồn hàng khu vực'),
            t('Lot consolidation and container loading', 'Gom lô và đóng container'),
            t('Documentation and delivery follow-up', 'Theo dõi chứng từ và giao hàng'),
            t('Recurring supply programs', 'Chương trình cung ứng định kỳ'),
          ],
        },
      },
      workflow: {
        title: t('Supply workflow', 'Quy trình cung ứng'),
        text: t('From origin to your port', 'Từ vùng nguyên liệu đến cảng của bạn'),
        steps: [
          card(['Origin selection', 'Origin areas chosen for your application.'], ['Chọn vùng nguyên liệu', 'Vùng nguyên liệu phù hợp mục đích sử dụng.']),
          card(['Field inspection', 'Material checked at origin.'], ['Kiểm tra hiện trường', 'Kiểm tra nguyên liệu tại nguồn.']),
          card(['Sampling & analysis', 'Samples taken and analysed as agreed.'], ['Lấy mẫu & phân tích', 'Lấy mẫu và phân tích theo yêu cầu đã thống nhất.']),
          card(['Consolidation', 'Lots consolidated for shipment.'], ['Gom hàng', 'Gom các lô để xuất hàng.']),
          card(['Container loading', 'Loaded to your requirement.'], ['Đóng container', 'Đóng hàng theo yêu cầu của bạn.']),
          card(['Documentation & delivery', 'Documents and delivery on the agreed terms.'], ['Chứng từ & giao hàng', 'Chứng từ và giao hàng theo điều kiện đã thống nhất.']),
        ],
      },
      // What buyers ask before buying: answered from the page's own claims, nothing beyond them.
      faq: {
        title: t('Frequently asked questions', 'Câu hỏi thường gặp'),
        text: t('What industrial buyers ask before buying dried cassava chips.', 'Những câu hỏi người mua công nghiệp thường đặt ra trước khi mua sắn lát khô.'),
        items: [
          {
            q: t('What are dried cassava chips supplied for?', 'Sắn lát khô được cung ứng cho mục đích nào?'),
            a: t(
              "HMV supplies dried cassava chips for animal feed, starch processing and bioethanol production. Whether they suit a given process or formulation depends on the buyer's own requirements, confirmed in the commercial discussion.",
              'HMV cung ứng sắn lát khô cho thức ăn chăn nuôi, chế biến tinh bột và sản xuất bioethanol. Sắn lát có phù hợp với quy trình hoặc công thức cụ thể hay không phụ thuộc vào yêu cầu của người mua, được xác nhận trong quá trình trao đổi thương mại.',
            ),
          },
          {
            q: t('Which origins does HMV supply from?', 'HMV cung ứng từ những vùng nguyên liệu nào?'),
            a: t(
              "HMV's supply network includes sourcing capabilities in Vietnam and Cambodia. The applicable origin is confirmed for each proposal and shipment, according to the destination, application and quality requirements.",
              'Mạng lưới cung ứng của HMV bao gồm khả năng huy động nguồn hàng tại Việt Nam và Campuchia. Xuất xứ áp dụng được xác nhận theo từng phương án và lô hàng, dựa trên điểm đến, mục đích sử dụng và yêu cầu chất lượng.',
            ),
          },
          {
            q: t('Which quality parameters are agreed?', 'Những chỉ tiêu chất lượng nào được thống nhất?'),
            a: t(
              'Quality requirements are agreed before commitment, for example starch, moisture, raw fiber, ash, sand and silica, foreign matter and heavy metals, the parameters of the Intertek analysis on this page. What each application needs is set in the supply proposal and contract.',
              'Tiêu chí chất lượng được thống nhất trước khi cam kết, ví dụ tinh bột, độ ẩm, xơ thô, tro, cát sạn, tạp chất và kim loại nặng, các chỉ tiêu trong kết quả phân tích của Intertek trên trang này. Yêu cầu cho từng mục đích sử dụng được xác định trong phương án cung ứng và hợp đồng.',
            ),
            link: ['#quality', t('View the quality reference', 'Xem tham chiếu chất lượng')],
          },
          {
            q: t('Is the 71.1% starch result a fixed specification?', 'Kết quả tinh bột 71,1% có phải thông số cố định không?'),
            a: t(
              'No. 71.1% is the result of one sample analysed by Intertek, not a fixed specification for every shipment. Final lot specifications, sampling and analysis are agreed in the contract.',
              'Không. 71,1% là kết quả của một mẫu do Intertek phân tích, không phải thông số cố định cho mọi lô hàng. Chỉ tiêu, cách lấy mẫu và phân tích cho từng lô được thống nhất trong hợp đồng.',
            ),
          },
          {
            q: t('Can HMV support recurring monthly supply?', 'HMV có hỗ trợ cung ứng định kỳ hằng tháng không?'),
            a: t(
              'HMV coordinates recurring bulk supply around the destination and expected monthly volume in your requirement. The network figures on this page are a capability reference, not a supply commitment to any single buyer; the volume for your order is confirmed in the supply proposal and contract.',
              'HMV điều phối nguồn cung định kỳ số lượng lớn theo điểm đến và sản lượng dự kiến hằng tháng trong yêu cầu của bạn. Số liệu mạng lưới trên trang này là tham chiếu năng lực, không phải cam kết cung ứng cho từng khách hàng; sản lượng cho đơn hàng của bạn được xác nhận trong phương án cung ứng và hợp đồng.',
            ),
            link: ['#capability', t('View supply capacity', 'Xem năng lực cung ứng')],
          },
          {
            q: t('How does a quotation start?', 'Quy trình báo giá bắt đầu như thế nào?'),
            a: t(
              'Send HMV your destination and expected monthly volume through the HMV Trade Desk. HMV structures the sourcing, quality and delivery proposal around your requirement; quantity, specification, price and delivery terms are confirmed in the commercial discussion.',
              'Gửi điểm đến và sản lượng dự kiến hằng tháng cho HMV qua HMV Trade Desk. HMV xây dựng phương án nguồn hàng, chất lượng và giao hàng phù hợp với yêu cầu của bạn; số lượng, thông số, giá và điều kiện giao hàng được xác nhận trong quá trình trao đổi thương mại.',
            ),
          },
        ],
      },
      // The buyer guides: the EcoNews articles about this product (data/articles.js).
      guides: {
        title: t('Buyer guides', 'Hướng dẫn thu mua'),
        text: t('Procurement and quality points to read before an inquiry.', 'Những điểm về thu mua và chất lượng nên đọc trước khi gửi yêu cầu.'),
        more: t('Read the guide', 'Đọc hướng dẫn'),
        items: articles.filter(a => a.product === 'dried-cassava-chips').map(a => ({
          href: lang => localizePath(`/blog/${a.slug.en}`, lang),
          title: t(a.title.en, a.title.vi),
          text: t(a.description.en, a.description.vi),
        })),
      },
      // The closing call to action: the HMV Trade Desk with this product, in the site's language.
      rfq: {
        title: t('Build Your Cassava Supply Plan with HMV', 'Xây dựng phương án cung ứng sắn lát cùng HMV'),
        lead: t(
          'Tell HMV your destination and expected monthly volume. Our team will structure the appropriate sourcing, quality and delivery proposal around your requirement.',
          'Chia sẻ điểm đến và sản lượng dự kiến mỗi tháng. HMV sẽ xây dựng phương án nguồn hàng, chất lượng và giao hàng phù hợp với nhu cầu thu mua của bạn.',
        ),
        items: [
          { key: 'destination', label: t('Destination', 'Điểm đến'), hint: t('Port or city of delivery', 'Cảng hoặc thành phố giao hàng') },
          { key: 'volume', label: t('Monthly volume', 'Sản lượng hằng tháng'), hint: t('Metric tons per month', 'Số tấn mỗi tháng') },
          { key: 'application', label: t('Application', 'Mục đích sử dụng'), hint: t('Feed · Starch · Bioethanol', 'Thức ăn chăn nuôi · Tinh bột · Bioethanol') },
        ],
        cta: t('Send your requirement to HMV', 'Gửi yêu cầu thu mua cho HMV'),
        note: t('Starch, moisture and packaging requirements are confirmed with HMV in the follow-up.', 'Yêu cầu về tinh bột, độ ẩm và quy cách đóng hàng được xác nhận cùng HMV khi trao đổi tiếp theo.'),
      },
    },
  }),
};

// The cassava dossier in a page-scoped language ('zh', 'ko') for data/cassavaChina.js and data/cassavaKorea.js: the
// same figures, sample results and report as the EN/VI page.
export const cassavaDossier = lang => resolve({
  figures: CASSAVA_FIGURES,
  results: CASSAVA_RESULTS,
  highlights: CASSAVA_HIGHLIGHTS,
  report: `Intertek ${INTERTEK.report}`,
  reportNo: INTERTEK.report,
  reportDate,
  source: CASSAVA_SOURCE,
}, lang);
