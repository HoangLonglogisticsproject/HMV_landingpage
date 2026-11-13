// Content of the product pages that go beyond the generic product page: buyer-facing sections, SEO and the RFQ fields.
// Claims are limited to verified evidence. Passion fruit: fresh whole fruit, HMV-supplied photographs of a growing area,
// cut-fruit samples and field sample inspection; Brix, capacity, certification, farm or factory ownership and lab results
// are not asserted. Dried cassava chips: the HMV cassava dossier (network capacity, one Intertek-analysed sample) and
// one HMV-supplied product photograph, whose location and lot are not asserted.
// Rendered by views/products/ProductLanding.jsx; titles and descriptions by productMeta() in views/meta.js.
//
// One content tree per product. Only text leaves are localized, `t(en, vi)`; figures, sample results and the report are
// written once and formatted per language. definePage() resolves the tree into `seo.en`, `seo.vi`, `en` and `vi`.
import { photos, photoCopy } from './hmv.js';
import { productPhotos } from './productPhotos.js';

const LOCALES = { en: 'en-US', vi: 'vi-VN' };

/** A localized leaf: resolved to its text in the page language. */
const t = (en, vi) => lang => (lang === 'vi' ? vi : en);

/** A card or step: [title, text] in each language. */
const card = (en, vi) => ({ title: t(en[0], vi[0]), text: t(en[1], vi[1]) });

// RFQ requirement fields (features/inquiries/ProductRfq.jsx), as [en, vi] pairs. The English label is the one written
// into the email draft, like the other inquiry fields.
const pair = ([en, vi]) => ({ en, vi });
const field = (name, label, placeholder) => ({ name, label: pair(label), placeholder: pair(placeholder) });
const choice = (name, label, options) => ({ name, label: pair(label), options: options.map(pair) });

// Fact labels shared by the product pages.
const FACT = { product: t('Product', 'Sản phẩm'), origin: t('Origin', 'Xuất xứ') };

/** A number written once, formatted per language (50000 → "50,000" / "50.000"), with a prefix and a unit. */
const quantity = (n, unit, prefix = '') => lang =>
  `${prefix}${n.toLocaleString(LOCALES[lang])}${typeof unit === 'function' ? unit(lang) : unit}`;

/** Resolves the localized leaves of a content tree; everything else is shared as is. */
const resolve = (node, lang) => {
  if (typeof node === 'function') return node(lang);
  if (Array.isArray(node)) return node.map(n => resolve(n, lang));
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolve(v, lang)]));
  return node;
};

const definePage = ({ seo, content, ...shared }) => ({
  ...shared,
  seo: { en: resolve(seo, 'en'), vi: resolve(seo, 'vi') },
  en: resolve(content, 'en'),
  vi: resolve(content, 'vi'),
});

// An HMV photograph from data/hmv.js with its real size and its existing caption.
const photo = (src, width, height, caption) => ({
  src,
  width,
  height,
  caption: { en: photoCopy.en[caption], vi: photoCopy.vi[caption] },
});

// Dried cassava chips facts from the HMV cassava dossier.
const PER_MONTH = { tons: t(' MT/month', ' tấn/tháng'), containers: t(' containers/month', ' container/tháng') };
const INTERTEK = { report: 'AGRIVIETNAM2026-1700', date: new Date(Date.UTC(2026, 9, 5)) };
const reportDate = lang =>
  INTERTEK.date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB',
    { day: '2-digit', month: lang === 'vi' ? '2-digit' : 'short', year: 'numeric', timeZone: 'UTC' });
const percent = n => quantity(n, '%');
const mgPerKg = (n, prefix) => quantity(n, ' mg/kg', prefix);
// The two results the hero quotes, shared with the full results table.
const STARCH = [t('Starch', 'Tinh bột'), percent(71.1)];
const MOISTURE = [t('Moisture', 'Độ ẩm'), percent(11.55)];
const CASSAVA_PHOTO = productPhotos['dried-cassava-chips'];

export const productPages = {
  'passion-fruit': definePage({
    seo: {
      title: t('Vietnam Passion Fruit Supplier for Wholesale Buyers', 'Nguồn chanh dây Việt Nam cho nhà nhập khẩu & B2B'),
      description: t(
        'Fresh passion fruit from Vietnam for importers, distributors and wholesale buyers. Variety, size, Brix, packaging and season agreed for your destination.',
        'Nhà cung cấp chanh dây tươi Việt Nam cho nhà nhập khẩu, nhà phân phối và khách hàng B2B. Giống, kích cỡ, Brix, đóng gói và mùa vụ theo thị trường đích.',
      ),
    },
    // The growing area leads the hero, with the cut-fruit product photo (data/productPhotos.js) as its detail.
    heroPhoto: photo(photos.farm, 1280, 960, 'farm'),
    evidencePhoto: photo(photos.fruitWeighing, 960, 1280, 'weighing'),
    gallery: [
      photo(photos.grower, 960, 1280, 'grower'),
      photo(photos.farmTeam, 1308, 1600, 'farmTeam'),
    ],
    content: {
      h1: t('Fresh Passion Fruit from Vietnam', 'Chanh dây tươi từ Việt Nam'),
      lead: t(
        'HMV Global is a passion fruit supplier in Vietnam for importers, distributors and wholesale buyers, coordinating fresh-fruit sourcing, field sample inspection and delivery planning for your destination.',
        'HMV Global cung cấp nguồn chanh dây tươi Việt Nam cho nhà nhập khẩu, nhà phân phối và khách hàng B2B, điều phối nguồn hàng, kiểm tra mẫu tại vườn và kế hoạch giao hàng đến thị trường đích.',
      ),
      hero: {
        eyebrow: t('VIETNAM PASSION FRUIT · B2B SOURCING', 'CHANH DÂY VIỆT NAM · NGUỒN HÀNG B2B'),
        secondary: { target: 'requirements', label: t('View Product Requirements', 'Xem yêu cầu sản phẩm') },
        trust: [
          t('Fresh whole fruit', 'Trái tươi nguyên quả'),
          t('Vietnam origin', 'Xuất xứ Việt Nam'),
          t('Field sample inspection', 'Kiểm tra mẫu tại vườn'),
          t('Buyer-defined specification', 'Quy cách theo yêu cầu người mua'),
        ],
      },
      facts: [
        [FACT.product, t('Fresh whole passion fruit', 'Chanh dây tươi nguyên quả')],
        [FACT.origin, t('Vietnam', 'Việt Nam')],
        [t('Quality model', 'Mô hình chất lượng'), t('Buyer-defined specification', 'Quy cách theo yêu cầu người mua')],
        [t('Requirements', 'Yêu cầu'), t('Variety · Size · Brix · Packaging · Season', 'Giống · Kích cỡ · Brix · Đóng gói · Mùa vụ')],
      ],
      audience: {
        eyebrow: t('FOR WHOLESALE BUYERS', 'DÀNH CHO KHÁCH HÀNG B2B'),
        title: t('Built around your buyer brief', 'Xây dựng theo nhu cầu thu mua của bạn'),
        text: t(
          'For importers, distributors, wholesale buyers and procurement teams sourcing fresh passion fruit from Vietnam.',
          'Dành cho nhà nhập khẩu, nhà phân phối, khách hàng mua số lượng lớn và bộ phận thu mua tìm nguồn chanh dây xuất khẩu từ Việt Nam.',
        ),
        items: [
          card(['Sourcing coordination', 'Growing areas and sourcing partners are matched to the variety, season and volume in your brief.'],
            ['Điều phối nguồn hàng', 'Vùng trồng và đối tác nguồn hàng được kết nối theo giống, mùa vụ và sản lượng bạn yêu cầu.']),
          card(['Field sample inspection', 'Fruit samples are inspected in the field against the requirements you define.'],
            ['Kiểm tra mẫu tại vườn', 'Mẫu trái được kiểm tra tại vùng trồng theo các yêu cầu bạn đưa ra.']),
          card(['Trade & delivery planning', 'Quotation terms, documentation and delivery planning follow your agreed requirements and destination.'],
            ['Thương mại & kế hoạch giao hàng', 'Điều kiện báo giá, chứng từ và kế hoạch giao hàng theo yêu cầu và thị trường đích đã thống nhất.']),
        ],
      },
      evidence: {
        eyebrow: t('PRODUCT & FIELD EVIDENCE', 'BẰNG CHỨNG SẢN PHẨM & HIỆN TRƯỜNG'),
        title: t('What we can show today', 'Những gì chúng tôi có thể cho bạn thấy'),
        items: [
          t('Fresh whole passion fruit', 'Chanh dây tươi nguyên quả'),
          t('Photographs of a real growing area', 'Hình ảnh thực tế tại vùng trồng'),
          t('Cut-fruit samples showing pulp and seeds', 'Mẫu trái bổ đôi thấy rõ ruột và hạt'),
          t('Field sample inspection', 'Kiểm tra mẫu tại vườn'),
        ],
        note: t(
          'Photographs supplied by HMV. Farm ownership, certifications and laboratory results are not asserted here; where they apply, they are confirmed for each proposal.',
          'Ảnh do HMV cung cấp. Trang này không khẳng định quyền sở hữu vùng trồng, chứng nhận hay kết quả kiểm nghiệm; khi cần, các nội dung này được xác nhận cho từng đề xuất.',
        ),
      },
      requirements: {
        eyebrow: t('REQUIREMENTS TO DEFINE', 'YÊU CẦU CẦN THỐNG NHẤT'),
        title: t('What we agree with you', 'Những gì chúng tôi thống nhất với bạn'),
        items: [
          card(['Variety', 'The variety your market and customers expect.'], ['Giống', 'Giống chanh dây phù hợp với thị trường và khách hàng của bạn.']),
          card(['Size / weight', 'Fruit size or weight bands for your grading.'], ['Kích cỡ / khối lượng', 'Khoảng kích cỡ hoặc khối lượng trái theo cách phân loại của bạn.']),
          card(['Brix', 'Your Brix requirement, agreed before quotation. No fixed Brix is promised.'], ['Brix', 'Yêu cầu Brix của bạn, thống nhất trước khi báo giá. Không cam kết một mức Brix cố định.']),
          card(['Packaging', 'Carton type, net weight and labelling for your channel.'], ['Đóng gói', 'Loại thùng, khối lượng tịnh và nhãn mác theo kênh phân phối.']),
          card(['Season', 'A shipment window aligned with the harvest season.'], ['Mùa vụ', 'Thời điểm giao hàng phù hợp với mùa thu hoạch.']),
          card(['Destination requirements', 'The import, plant-health and documentation requirements of your market.'], ['Yêu cầu thị trường đích', 'Yêu cầu nhập khẩu, kiểm dịch thực vật và chứng từ của thị trường bạn.']),
        ],
        note: t(
          'Specifications are agreed in the commercial proposal and the contract, not fixed on this page.',
          'Thông số được thống nhất trong đề xuất thương mại và hợp đồng, không cố định trên trang này.',
        ),
      },
      workflow: {
        eyebrow: t('ORIGIN TO MARKET', 'TỪ VÙNG TRỒNG ĐẾN THỊ TRƯỜNG'),
        title: t('From your brief to delivery', 'Từ yêu cầu của bạn đến khi giao hàng'),
        steps: [
          card(['Buyer brief', 'Volume, destination and requirements.'], ['Yêu cầu thu mua', 'Sản lượng, thị trường đích và các yêu cầu.']),
          card(['Origin & season', 'Growing areas and timing matched to the brief.'], ['Vùng trồng & mùa vụ', 'Vùng trồng và thời điểm phù hợp với yêu cầu.']),
          card(['Field sample inspection', 'Samples checked against your requirements.'], ['Kiểm tra mẫu tại vườn', 'Mẫu được kiểm tra theo yêu cầu của bạn.']),
          card(['Requirement confirmation', 'Variety, size, Brix and packaging agreed.'], ['Xác nhận yêu cầu', 'Thống nhất giống, kích cỡ, Brix và đóng gói.']),
          card(['Packaging & documents', 'Packing and trade documents coordinated.'], ['Đóng gói & chứng từ', 'Điều phối đóng gói và chứng từ thương mại.']),
          card(['Delivery planning', 'Shipment to the agreed destination and terms.'], ['Kế hoạch giao hàng', 'Giao đến điểm đến và theo điều kiện đã thống nhất.']),
        ],
      },
      gallery: {
        eyebrow: t('FROM THE FIELD', 'TỪ VÙNG TRỒNG'),
        title: t('Real images from the growing area', 'Hình ảnh thực tế tại vùng trồng'),
        note: t('Photos supplied by HMV.', 'Ảnh do HMV cung cấp.'),
      },
      rfq: {
        eyebrow: t('RFQ · PASSION FRUIT', 'RFQ · CHANH DÂY'),
        title: t('Discuss Your Passion Fruit Requirements', 'Trao đổi yêu cầu chanh dây'),
        lead: t(
          'Share your volume, destination and requirements so HMV Global can review the sourcing and trade brief.',
          'Chia sẻ sản lượng, thị trường đích và các yêu cầu để HMV Global xem xét nhu cầu nguồn hàng và giao thương.',
        ),
        volume: t('Estimated volume', 'Sản lượng dự kiến'),
        volumePlaceholder: t('e.g. containers per month', 'VD: số container mỗi tháng'),
      },
    },
    rfqFields: [
      field('form', ['Product form', 'Dạng hàng'], ['e.g. fresh whole fruit', 'VD: trái tươi nguyên quả']),
      field('grade', ['Brix / grade requirement', 'Yêu cầu Brix / phân hạng'], ['Your minimum Brix or size grade', 'Brix tối thiểu hoặc phân hạng kích cỡ']),
      field('packaging', ['Packaging', 'Quy cách đóng gói'], ['e.g. carton type and net weight', 'VD: loại thùng và khối lượng tịnh']),
      field('certification', ['Certification requirement', 'Yêu cầu chứng nhận'], ['Certificates your market requires', 'Chứng nhận thị trường của bạn yêu cầu']),
    ],
  }),

  'dried-cassava-chips': definePage({
    seo: {
      title: t('Dried Cassava Chips Supplier in Vietnam', 'Nhà cung cấp sắn lát khô B2B tại Việt Nam'),
      description: t(
        'HMV Global manages recurring bulk dried cassava chip supply for feed, starch and bioethanol buyers, coordinating sourcing, quality requirements, consolidation and delivery.',
        'HMV Global điều phối nguồn cung sắn lát khô số lượng lớn cho nhà máy thức ăn chăn nuôi, tinh bột và bioethanol, từ nguồn hàng, chất lượng đến giao hàng.',
      ),
    },
    // The product photograph of the overview cards (data/productPhotos.js): one verified image for the product.
    gallery: [{ ...CASSAVA_PHOTO, caption: { en: CASSAVA_PHOTO.altEn, vi: CASSAVA_PHOTO.altVi } }],
    content: {
      h1: t('Bulk Dried Cassava Chips Supply by HMV Global', 'Nguồn cung sắn lát khô số lượng lớn từ HMV Global'),
      lead: [
        t(
          'HMV Global coordinates recurring dried cassava chip supply for feed, starch and bioethanol manufacturers, importers and distributors through a managed regional sourcing network.',
          'HMV Global điều phối nguồn cung sắn lát khô định kỳ cho nhà máy thức ăn chăn nuôi, tinh bột, bioethanol, nhà nhập khẩu và nhà phân phối thông qua mạng lưới cung ứng khu vực do HMV quản lý.',
        ),
        t(
          'Depending on buyer requirements, season and availability, supply may be sourced across Vietnam and Cambodia. HMV coordinates the commercial brief, quality requirements, sampling, consolidation, documentation and delivery plan for each supply proposal.',
          'Tùy theo yêu cầu người mua, mùa vụ và khả năng cung ứng, nguồn hàng có thể được huy động từ Việt Nam và Campuchia. HMV điều phối xuyên suốt yêu cầu thương mại, tiêu chí chất lượng, lấy mẫu, gom hàng, chứng từ và kế hoạch giao hàng cho từng phương án cung ứng.',
        ),
      ],
      hero: {
        eyebrow: t('HMV GLOBAL · MANAGED BULK SUPPLY', 'HMV GLOBAL · QUẢN LÝ NGUỒN CUNG SỐ LƯỢNG LỚN'),
        secondary: { target: 'quality', label: t('View Quality Reference', 'Xem tham chiếu chất lượng') },
        intertek: {
          title: t('Intertek reference', 'Tham chiếu Intertek'),
          results: [STARCH, MOISTURE],
          report: `Intertek ${INTERTEK.report}`,
          caption: t('Analyzed sample · not a fixed shipment specification', 'Mẫu đã phân tích · không phải thông số cố định cho lô hàng'),
        },
      },
      facts: [
        [FACT.product, t('Dried cassava chips', 'Sắn lát khô')],
        [FACT.origin, t('Vietnam · Cambodia', 'Việt Nam · Campuchia')],
        [t('Applications', 'Ứng dụng'), t('Animal feed · Starch processing · Bioethanol', 'Thức ăn chăn nuôi · Chế biến tinh bột · Bioethanol')],
        [t('Quality reference', 'Tham chiếu chất lượng'), t('Intertek-analysed sample, results below', 'Mẫu do Intertek phân tích, kết quả bên dưới')],
      ],
      seeAlso: { id: 'tapioca-starch', text: t('Looking for tapioca starch? It is a separate product.', 'Bạn cần tinh bột sắn? Đó là một sản phẩm riêng.') },
      audience: {
        eyebrow: t('WHY BUYERS WORK WITH HMV', 'VÌ SAO NGƯỜI MUA CHỌN HMV'),
        title: t('More than access to an origin. A managed supply program.', 'Không chỉ kết nối nguồn hàng. HMV quản lý cả phương án cung ứng.'),
        // The supply network.
        text: t(
          "HMV's supply network includes sourcing capabilities in Vietnam and Cambodia. The applicable origin, specification, availability and commercial terms are confirmed for each proposal and shipment.",
          'Mạng lưới cung ứng của HMV bao gồm khả năng huy động nguồn hàng tại Việt Nam và Campuchia. Xuất xứ áp dụng, thông số, khả năng cung ứng và điều kiện thương mại được xác nhận theo từng phương án và lô hàng.',
        ),
        items: [
          card(['Supply Network', 'HMV coordinates sourcing across multiple supply points to support the volume and delivery schedule defined in the buyer brief.'],
            ['Mạng lưới cung ứng', 'HMV điều phối nguồn hàng từ nhiều điểm cung ứng để đáp ứng sản lượng và lịch giao hàng trong yêu cầu thu mua của bạn.']),
          card(['Quality Alignment', 'Quality requirements are agreed before commitment, with sampling and analysis coordinated according to the requirements of each proposal.'],
            ['Thống nhất chất lượng', 'Tiêu chí chất lượng được thống nhất trước khi cam kết; việc lấy mẫu và phân tích được điều phối theo yêu cầu của từng phương án.']),
          card(['Consolidation', 'Lots can be consolidated around the required shipment volume instead of relying on a single source to fulfil the entire program.'],
            ['Gom hàng', 'Các lô hàng có thể được gom theo sản lượng cần xuất, thay vì phụ thuộc vào một nguồn duy nhất cho toàn bộ chương trình.']),
          card(['Commercial Execution', 'HMV coordinates the commercial proposal, documentation and delivery plan through one supply process from RFQ to execution.'],
            ['Thực thi thương mại', 'HMV điều phối đề xuất thương mại, chứng từ và kế hoạch giao hàng trong một quy trình cung ứng xuyên suốt, từ RFQ đến khi thực hiện.']),
        ],
      },
      figures: {
        eyebrow: t('HMV GLOBAL NETWORK CAPACITY', 'NĂNG LỰC MẠNG LƯỚI HMV GLOBAL'),
        title: t('Capacity across our network', 'Năng lực trong mạng lưới của chúng tôi'),
        items: [
          { value: quantity(50000, PER_MONTH.tons), label: t('Consolidation capacity at the Cambodia warehouse', 'Năng lực gom hàng tại kho Campuchia') },
          { value: quantity(10000, PER_MONTH.tons), label: t('Supply to a factory in Long An', 'Cung ứng cho nhà máy tại Long An') },
          { value: quantity(150, PER_MONTH.containers), label: t('Delivery to an importer in Guangxi', 'Giao cho nhà nhập khẩu tại Quảng Tây') },
          { value: quantity(250, PER_MONTH.containers), label: t('Transit-export capacity', 'Năng lực xuất khẩu quá cảnh') },
        ],
        note: t(
          'HMV Global network and capability figures, not a guaranteed output for every buyer. The volume for your order is confirmed in the supply proposal and contract.',
          'Số liệu năng lực của mạng lưới HMV Global, không phải sản lượng cam kết cho mọi khách hàng. Sản lượng cho đơn hàng của bạn được xác nhận trong phương án cung ứng và hợp đồng.',
        ),
      },
      quality: {
        eyebrow: t('INTERTEK SAMPLE RESULTS', 'KẾT QUẢ MẪU INTERTEK'),
        title: t('Quality reference: an analysed sample', 'Tham chiếu chất lượng: một mẫu đã phân tích'),
        head: [t('Parameter', 'Chỉ tiêu'), t('Result', 'Kết quả')],
        rows: [
          STARCH,
          MOISTURE,
          [t('Raw fiber', 'Xơ thô'), percent(2.99)],
          [t('Ash', 'Tro'), percent(1.86)],
          [t('Sand & silica', 'Cát sạn (sand & silica)'), percent(0.45)],
          [t('Foreign matter', 'Tạp chất'), t('Not detected', 'Không phát hiện')],
          [t('Lead (Pb)', 'Chì (Pb)'), mgPerKg(0.17)],
          [t('Cadmium (Cd)', 'Cadimi (Cd)'), mgPerKg(0.28)],
          [t('Mercury (Hg)', 'Thủy ngân (Hg)'), mgPerKg(0.02, '<')],
        ],
        source: lang => t(
          `Source: Intertek Vietnam analysis report ${INTERTEK.report}, dated ${reportDate(lang)}. The reported values apply to the analyzed sample.`,
          `Nguồn: Báo cáo phân tích Intertek Việt Nam ${INTERTEK.report} ngày ${reportDate(lang)}. Các giá trị áp dụng cho mẫu được phân tích.`,
        )(lang),
        note: t(
          'These values are results from the analyzed Intertek sample, not fixed specifications for every shipment. Final lot specifications are agreed in the contract.',
          'Các giá trị trên là kết quả của mẫu được Intertek phân tích, không phải thông số cố định cho mọi lô hàng. Chỉ tiêu từng lô được thống nhất trong hợp đồng.',
        ),
      },
      applications: {
        eyebrow: t('APPLICATIONS', 'ỨNG DỤNG'),
        title: t('Cassava chips for feed, starch and bioethanol', 'Sắn lát cho thức ăn chăn nuôi, tinh bột và bioethanol'),
        items: [
          card(['Animal feed', 'For feed manufacturers and their formulations.'], ['Thức ăn chăn nuôi', 'Cho nhà sản xuất thức ăn chăn nuôi và công thức phối trộn.']),
          card(['Starch processing', 'For starch processors.'], ['Chế biến tinh bột', 'Cho nhà chế biến tinh bột.']),
          card(['Bioethanol', 'For ethanol producers.'], ['Bioethanol', 'Cho nhà sản xuất ethanol.']),
        ],
      },
      workflow: {
        eyebrow: t('SUPPLY WORKFLOW', 'QUY TRÌNH CUNG ỨNG'),
        title: t('From origin to your port', 'Từ vùng nguyên liệu đến cảng của bạn'),
        steps: [
          card(['Origin selection', 'Origin areas chosen for your application.'], ['Chọn vùng nguyên liệu', 'Vùng nguyên liệu phù hợp mục đích sử dụng.']),
          card(['Field inspection', 'Material checked at origin.'], ['Kiểm tra hiện trường', 'Kiểm tra nguyên liệu tại nguồn.']),
          card(['Sampling & analysis', 'Samples taken and analysed as agreed.'], ['Lấy mẫu & phân tích', 'Lấy mẫu và phân tích theo yêu cầu đã thống nhất.']),
          card(['Consolidation', 'Lots consolidated for shipment.'], ['Gom hàng', 'Gom các lô để xuất hàng.']),
          card(['Container loading', 'Loaded to your requirement.'], ['Đóng container', 'Đóng hàng theo yêu cầu của bạn.']),
          card(['Documentation & delivery', 'Documents and delivery on the agreed terms.'], ['Chứng từ & giao hàng', 'Chứng từ và giao hàng theo điều kiện đã thống nhất.']),
        ],
      },
      rfq: {
        eyebrow: t('RFQ · DRIED CASSAVA CHIPS', 'RFQ · SẮN LÁT KHÔ'),
        title: t('Build Your Cassava Supply Plan with HMV', 'Xây dựng phương án cung ứng sắn lát cùng HMV'),
        lead: t(
          'Tell HMV your destination and expected monthly volume. Our team will structure the appropriate sourcing, quality and delivery proposal around your requirement.',
          'Chia sẻ điểm đến và sản lượng dự kiến mỗi tháng. HMV sẽ xây dựng phương án nguồn hàng, chất lượng và giao hàng phù hợp với nhu cầu thu mua của bạn.',
        ),
        volume: t('Monthly volume (MT)', 'Sản lượng hằng tháng (tấn)'),
        volumePlaceholder: t('Metric tons per month', 'Số tấn mỗi tháng'),
      },
      gallery: {
        eyebrow: t('THE PRODUCT', 'SẢN PHẨM'),
        title: t('Dried cassava chips', 'Sắn lát khô'),
        note: t('Photo supplied by HMV.', 'Ảnh do HMV cung cấp.'),
      },
    },
    rfqFields: [
      choice('application', ['Application', 'Mục đích sử dụng'], [
        ['Animal feed', 'Thức ăn chăn nuôi'],
        ['Bioethanol', 'Bioethanol'],
        ['Starch processing', 'Chế biến tinh bột'],
      ]),
      field('starch', ['Required starch %', 'Hàm lượng tinh bột yêu cầu (%)'], ['Minimum %', 'Tối thiểu (%)']),
      field('moisture', ['Maximum moisture %', 'Độ ẩm tối đa (%)'], ['Maximum %', 'Tối đa (%)']),
      field('packaging', ['Loading / packaging requirement', 'Yêu cầu đóng hàng / quy cách'], ['e.g. bulk or bagged, container size', 'VD: hàng rời hoặc đóng bao, loại container']),
    ],
  }),
};
