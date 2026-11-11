// Content of the product pages that go beyond the generic product page: buyer-facing sections, SEO and the RFQ fields.
// Claims are limited to verified evidence. Passion fruit: fresh whole fruit, HMV-supplied photographs of a growing area,
// cut-fruit samples and field sample inspection; Brix, capacity, certification, farm or factory ownership and lab results
// are not asserted. Dried cassava chips: the HMV cassava dossier (network capacity, one Intertek-analysed sample:
// report AGRIVIETNAM2026-1700, 05/10/2026).
// Rendered by views/products/ProductLanding.jsx; titles and descriptions by productMeta() in views/meta.js.
import { photos, photoCopy } from './hmv.js';

// An HMV photograph from data/hmv.js with its real size and its existing caption.
const photo = (src, width, height, caption) => ({
  src,
  width,
  height,
  caption: { en: photoCopy.en[caption], vi: photoCopy.vi[caption] },
});

export const productPages = {
  'passion-fruit': {
    seo: {
      en: {
        title: 'Vietnam Passion Fruit Sourcing for Wholesale Buyers',
        description: 'Fresh passion fruit sourcing from Vietnam for wholesale buyers. Discuss variety, size, Brix, packaging, season and destination requirements with HMV Global.',
      },
      vi: {
        title: 'Chanh dây Việt Nam cho nhu cầu thu mua B2B',
        description: 'Nguồn chanh dây tươi Việt Nam cho khách hàng B2B. Trao đổi giống, kích cỡ, Brix, đóng gói, mùa vụ và yêu cầu thị trường đích với HMV Global.',
      },
    },
    evidencePhoto: photo(photos.fruitWeighing, 960, 1280, 'weighing'),
    gallery: [
      photo(photos.farm, 1280, 960, 'farm'),
      photo(photos.grower, 960, 1280, 'grower'),
      photo(photos.farmTeam, 1308, 1600, 'farmTeam'),
    ],
    rfqFields: [
      { name: 'form', label: { en: 'Product form', vi: 'Dạng hàng' }, placeholder: { en: 'e.g. fresh whole fruit', vi: 'VD: trái tươi nguyên quả' } },
      { name: 'grade', label: { en: 'Brix / grade requirement', vi: 'Yêu cầu Brix / phân hạng' }, placeholder: { en: 'Your minimum Brix or size grade', vi: 'Brix tối thiểu hoặc phân hạng kích cỡ' } },
      { name: 'packaging', label: { en: 'Packaging', vi: 'Quy cách đóng gói' }, placeholder: { en: 'e.g. carton type and net weight', vi: 'VD: loại thùng và khối lượng tịnh' } },
      { name: 'certification', label: { en: 'Certification requirement', vi: 'Yêu cầu chứng nhận' }, placeholder: { en: 'Certificates your market requires', vi: 'Chứng nhận thị trường của bạn yêu cầu' } },
    ],
    en: {
      h1: 'Fresh Passion Fruit from Vietnam',
      lead: 'HMV Global coordinates fresh passion-fruit sourcing and supply-chain execution for international wholesale buyers, importers and distributors.',
      facts: [
        ['Product', 'Fresh whole passion fruit'],
        ['Origin', 'Vietnam'],
        ['Specifications', 'Defined with each buyer: variety, size, Brix, packaging and season'],
      ],
      audience: {
        eyebrow: 'FOR WHOLESALE BUYERS',
        title: 'Built around your buyer brief',
        text: 'For importers, distributors, wholesale buyers and procurement teams sourcing fresh passion fruit from Vietnam.',
        items: [
          { title: 'Sourcing coordination', text: 'Growing areas and sourcing partners are matched to the variety, season and volume in your brief.' },
          { title: 'Field sample inspection', text: 'Fruit samples are inspected in the field against the requirements you define.' },
          { title: 'Trade & delivery planning', text: 'Quotation terms, documentation and delivery planning follow your agreed requirements and destination.' },
        ],
      },
      evidence: {
        eyebrow: 'PRODUCT & FIELD EVIDENCE',
        title: 'What we can show today',
        items: ['Fresh whole passion fruit', 'Photographs of a real growing area', 'Cut-fruit samples showing pulp and seeds', 'Field sample inspection'],
        note: 'Photographs supplied by HMV. Farm ownership, certifications and laboratory results are not asserted here; where they apply, they are confirmed for each proposal.',
      },
      requirements: {
        eyebrow: 'REQUIREMENTS TO DEFINE',
        title: 'What we agree with you',
        items: [
          { title: 'Variety', text: 'The variety your market and customers expect.' },
          { title: 'Size / weight', text: 'Fruit size or weight bands for your grading.' },
          { title: 'Brix', text: 'Your Brix requirement, agreed before quotation. No fixed Brix is promised.' },
          { title: 'Packaging', text: 'Carton type, net weight and labelling for your channel.' },
          { title: 'Season', text: 'A shipment window aligned with the harvest season.' },
          { title: 'Destination requirements', text: 'The import, plant-health and documentation requirements of your market.' },
        ],
        note: 'Specifications are agreed in the commercial proposal and the contract, not fixed on this page.',
      },
      workflow: {
        eyebrow: 'ORIGIN TO MARKET',
        title: 'From your brief to delivery',
        steps: [
          { title: 'Buyer brief', text: 'Volume, destination and requirements.' },
          { title: 'Origin & season', text: 'Growing areas and timing matched to the brief.' },
          { title: 'Field sample inspection', text: 'Samples checked against your requirements.' },
          { title: 'Requirement confirmation', text: 'Variety, size, Brix and packaging agreed.' },
          { title: 'Packaging & documents', text: 'Packing and trade documents coordinated.' },
          { title: 'Delivery planning', text: 'Shipment to the agreed destination and terms.' },
        ],
      },
      gallery: { eyebrow: 'FROM THE FIELD', title: 'Real images from the growing area', note: 'Photos supplied by HMV.' },
      rfq: {
        eyebrow: 'RFQ · PASSION FRUIT',
        title: 'Discuss Your Passion Fruit Requirements',
        lead: 'Share your volume, destination and requirements so HMV Global can review the sourcing and trade brief.',
        volume: 'Estimated volume',
        volumePlaceholder: 'e.g. containers per month',
      },
    },
    vi: {
      h1: 'Chanh dây tươi từ Việt Nam',
      lead: 'HMV Global điều phối nguồn hàng chanh dây tươi và thực thi chuỗi cung ứng cho khách hàng B2B, nhà nhập khẩu và nhà phân phối quốc tế.',
      facts: [
        ['Sản phẩm', 'Chanh dây tươi nguyên quả'],
        ['Xuất xứ', 'Việt Nam'],
        ['Thông số', 'Thống nhất với từng khách hàng: giống, kích cỡ, Brix, đóng gói và mùa vụ'],
      ],
      audience: {
        eyebrow: 'DÀNH CHO KHÁCH HÀNG B2B',
        title: 'Xây dựng theo nhu cầu thu mua của bạn',
        text: 'Dành cho nhà nhập khẩu, nhà phân phối, khách hàng bán buôn và bộ phận thu mua tìm nguồn chanh dây tươi từ Việt Nam.',
        items: [
          { title: 'Điều phối nguồn hàng', text: 'Vùng trồng và đối tác nguồn hàng được kết nối theo giống, mùa vụ và sản lượng bạn yêu cầu.' },
          { title: 'Kiểm tra mẫu tại vườn', text: 'Mẫu trái được kiểm tra tại vùng trồng theo các yêu cầu bạn đưa ra.' },
          { title: 'Thương mại & kế hoạch giao hàng', text: 'Điều kiện báo giá, chứng từ và kế hoạch giao hàng theo yêu cầu và thị trường đích đã thống nhất.' },
        ],
      },
      evidence: {
        eyebrow: 'BẰNG CHỨNG SẢN PHẨM & HIỆN TRƯỜNG',
        title: 'Những gì chúng tôi có thể cho bạn thấy',
        items: ['Chanh dây tươi nguyên quả', 'Hình ảnh thực tế tại vùng trồng', 'Mẫu trái bổ đôi thấy rõ ruột và hạt', 'Kiểm tra mẫu tại vườn'],
        note: 'Ảnh do HMV cung cấp. Trang này không khẳng định quyền sở hữu vùng trồng, chứng nhận hay kết quả kiểm nghiệm; khi cần, các nội dung này được xác nhận cho từng đề xuất.',
      },
      requirements: {
        eyebrow: 'YÊU CẦU CẦN THỐNG NHẤT',
        title: 'Những gì chúng tôi thống nhất với bạn',
        items: [
          { title: 'Giống', text: 'Giống chanh dây phù hợp với thị trường và khách hàng của bạn.' },
          { title: 'Kích cỡ / khối lượng', text: 'Khoảng kích cỡ hoặc khối lượng trái theo cách phân loại của bạn.' },
          { title: 'Brix', text: 'Yêu cầu Brix của bạn, thống nhất trước khi báo giá. Không cam kết một mức Brix cố định.' },
          { title: 'Đóng gói', text: 'Loại thùng, khối lượng tịnh và nhãn mác theo kênh phân phối.' },
          { title: 'Mùa vụ', text: 'Thời điểm giao hàng phù hợp với mùa thu hoạch.' },
          { title: 'Yêu cầu thị trường đích', text: 'Yêu cầu nhập khẩu, kiểm dịch thực vật và chứng từ của thị trường bạn.' },
        ],
        note: 'Thông số được thống nhất trong đề xuất thương mại và hợp đồng, không cố định trên trang này.',
      },
      workflow: {
        eyebrow: 'TỪ VÙNG TRỒNG ĐẾN THỊ TRƯỜNG',
        title: 'Từ yêu cầu của bạn đến khi giao hàng',
        steps: [
          { title: 'Yêu cầu thu mua', text: 'Sản lượng, thị trường đích và các yêu cầu.' },
          { title: 'Vùng trồng & mùa vụ', text: 'Vùng trồng và thời điểm phù hợp với yêu cầu.' },
          { title: 'Kiểm tra mẫu tại vườn', text: 'Mẫu được kiểm tra theo yêu cầu của bạn.' },
          { title: 'Xác nhận yêu cầu', text: 'Thống nhất giống, kích cỡ, Brix và đóng gói.' },
          { title: 'Đóng gói & chứng từ', text: 'Điều phối đóng gói và chứng từ thương mại.' },
          { title: 'Kế hoạch giao hàng', text: 'Giao đến điểm đến và theo điều kiện đã thống nhất.' },
        ],
      },
      gallery: { eyebrow: 'TỪ VÙNG TRỒNG', title: 'Hình ảnh thực tế tại vùng trồng', note: 'Ảnh do HMV cung cấp.' },
      rfq: {
        eyebrow: 'RFQ · CHANH DÂY',
        title: 'Trao đổi yêu cầu chanh dây',
        lead: 'Chia sẻ sản lượng, thị trường đích và các yêu cầu để HMV Global xem xét nhu cầu nguồn hàng và giao thương.',
        volume: 'Sản lượng dự kiến',
        volumePlaceholder: 'VD: số container mỗi tháng',
      },
    },
  },

  'dried-cassava-chips': {
    seo: {
      en: {
        title: 'Vietnam Dried Cassava Chips for Industrial Buyers',
        description: 'Dried cassava chips from Vietnam and Cambodia for feed, starch-processing and bioethanol buyers: HMV Global network capacity, Intertek sample results and container supply coordination.',
      },
      vi: {
        title: 'Sắn lát khô Việt Nam cho khách hàng công nghiệp & B2B',
        description: 'Sắn lát khô từ Việt Nam và Campuchia cho khách hàng thức ăn chăn nuôi, chế biến tinh bột và bioethanol: năng lực mạng lưới HMV Global, kết quả mẫu Intertek và điều phối cung ứng container.',
      },
    },
    // ponytail: no cassava photographs are in the repository yet; `gallery` stays empty until first-party images are
    // added (a field image may name Tân Biên, Tây Ninh only where the dossier identifies that material).
    gallery: [],
    // Each page's own requirement fields, after the shared ones (features/inquiries/ProductRfq.jsx). The English label
    // is the one written into the email draft, like the other inquiry fields.
    rfqFields: [
      {
        name: 'application',
        label: { en: 'Application', vi: 'Mục đích sử dụng' },
        options: [
          { en: 'Animal feed', vi: 'Thức ăn chăn nuôi' },
          { en: 'Bioethanol', vi: 'Bioethanol' },
          { en: 'Starch processing', vi: 'Chế biến tinh bột' },
        ],
      },
      { name: 'starch', label: { en: 'Required starch %', vi: 'Hàm lượng tinh bột yêu cầu (%)' }, placeholder: { en: 'Minimum %', vi: 'Tối thiểu (%)' } },
      { name: 'moisture', label: { en: 'Maximum moisture %', vi: 'Độ ẩm tối đa (%)' }, placeholder: { en: 'Maximum %', vi: 'Tối đa (%)' } },
      { name: 'packaging', label: { en: 'Loading / packaging requirement', vi: 'Yêu cầu đóng hàng / quy cách' }, placeholder: { en: 'e.g. bulk or bagged, container size', vi: 'VD: hàng rời hoặc đóng bao, loại container' } },
    ],
    en: {
      h1: 'Dried Cassava Chips for Industrial Buyers',
      lead: 'HMV Global coordinates dried cassava chip supply from Vietnam and Cambodia for importers, feed manufacturers, starch processors and bioethanol producers, from origin selection to container delivery.',
      facts: [
        ['Product', 'Dried cassava chips'],
        ['Origin', 'Vietnam · Cambodia'],
        ['Applications', 'Animal feed · Starch processing · Bioethanol'],
        ['Quality reference', 'Intertek-analysed sample, results below'],
      ],
      seeAlso: { id: 'tapioca-starch', text: 'Looking for tapioca starch? It is a separate product.' },
      audience: {
        eyebrow: 'FOR INDUSTRIAL BUYERS',
        title: 'Supply planned around your plant',
        text: 'For importers, feed manufacturers, starch processors and bioethanol producers buying dried cassava chips by the container.',
        items: [
          { title: 'Origin & sampling', text: 'Origin areas are selected for your application and inspected in the field. Samples are taken and analysed according to the agreed requirements.' },
          { title: 'Consolidation & loading', text: 'Lots are consolidated and loaded into containers to your loading and packaging requirement.' },
          { title: 'Documentation & delivery', text: 'Trade documents and delivery follow the agreed Incoterm and destination.' },
        ],
      },
      figures: {
        eyebrow: 'HMV GLOBAL NETWORK CAPACITY',
        title: 'Capacity across our network',
        items: [
          { value: '50,000 MT/month', label: 'Consolidation capacity at the Cambodia warehouse' },
          { value: '10,000 MT/month', label: 'Supply to a factory in Long An' },
          { value: '150 containers/month', label: 'Delivery to an importer in Guangxi' },
          { value: '250 containers/month', label: 'Transit-export capacity' },
        ],
        note: 'HMV Global network and capability figures, not a guaranteed output for every buyer. The volume for your order is confirmed in the supply proposal and contract.',
      },
      quality: {
        eyebrow: 'INTERTEK SAMPLE RESULTS',
        title: 'Quality reference: an analysed sample',
        head: ['Parameter', 'Result'],
        rows: [
          ['Starch', '71.1%'],
          ['Moisture', '11.55%'],
          ['Raw fiber', '2.99%'],
          ['Ash', '1.86%'],
          ['Sand & silica', '0.45%'],
          ['Foreign matter', 'Not detected'],
          ['Lead (Pb)', '0.17 mg/kg'],
          ['Cadmium (Cd)', '0.28 mg/kg'],
          ['Mercury (Hg)', '<0.02 mg/kg'],
        ],
        source: 'Source: Intertek Vietnam analysis report AGRIVIETNAM2026-1700, dated 05 Oct 2026. The reported values apply to the analyzed sample.',
        note: 'These values are results from the analyzed Intertek sample, not fixed specifications for every shipment. Final lot specifications are agreed in the contract.',
      },
      applications: {
        eyebrow: 'APPLICATIONS',
        title: 'Where the chips are used',
        items: [
          { title: 'Animal feed', text: 'For feed manufacturers and their formulations.' },
          { title: 'Starch processing', text: 'For starch processors.' },
          { title: 'Bioethanol', text: 'For ethanol producers.' },
        ],
      },
      workflow: {
        eyebrow: 'SUPPLY WORKFLOW',
        title: 'From origin to your port',
        steps: [
          { title: 'Origin selection', text: 'Origin areas chosen for your application.' },
          { title: 'Field inspection', text: 'Material checked at origin.' },
          { title: 'Sampling & analysis', text: 'Samples taken and analysed as agreed.' },
          { title: 'Consolidation', text: 'Lots consolidated for shipment.' },
          { title: 'Container loading', text: 'Loaded to your requirement.' },
          { title: 'Documentation & delivery', text: 'Documents and delivery on the agreed terms.' },
        ],
      },
      rfq: {
        eyebrow: 'RFQ · DRIED CASSAVA CHIPS',
        title: 'Request a Cassava Supply Proposal',
        lead: 'Share your monthly volume, application and quality requirements so HMV Global can prepare a supply proposal.',
        volume: 'Monthly volume (MT)',
        volumePlaceholder: 'Metric tons per month',
      },
    },
    vi: {
      h1: 'Sắn lát khô cho khách hàng công nghiệp',
      lead: 'HMV Global điều phối nguồn cung sắn lát khô từ Việt Nam và Campuchia cho nhà nhập khẩu, nhà sản xuất thức ăn chăn nuôi, nhà chế biến tinh bột và nhà sản xuất bioethanol, từ chọn vùng nguyên liệu đến giao container.',
      facts: [
        ['Sản phẩm', 'Sắn lát khô'],
        ['Xuất xứ', 'Việt Nam · Campuchia'],
        ['Ứng dụng', 'Thức ăn chăn nuôi · Chế biến tinh bột · Bioethanol'],
        ['Tham chiếu chất lượng', 'Mẫu do Intertek phân tích, kết quả bên dưới'],
      ],
      seeAlso: { id: 'tapioca-starch', text: 'Bạn cần tinh bột sắn? Đó là một sản phẩm riêng.' },
      audience: {
        eyebrow: 'DÀNH CHO KHÁCH HÀNG CÔNG NGHIỆP',
        title: 'Nguồn cung theo kế hoạch nhà máy của bạn',
        text: 'Dành cho nhà nhập khẩu, nhà sản xuất thức ăn chăn nuôi, nhà chế biến tinh bột và nhà sản xuất bioethanol mua sắn lát khô theo container.',
        items: [
          { title: 'Vùng nguyên liệu & lấy mẫu', text: 'Vùng nguyên liệu được chọn theo mục đích sử dụng và kiểm tra tại hiện trường. Việc lấy mẫu và phân tích thực hiện theo các chỉ tiêu đã thống nhất.' },
          { title: 'Gom hàng & đóng container', text: 'Các lô hàng được gom và đóng container theo yêu cầu đóng hàng và quy cách của bạn.' },
          { title: 'Chứng từ & giao hàng', text: 'Chứng từ thương mại và giao hàng theo Incoterm và điểm đến đã thống nhất.' },
        ],
      },
      figures: {
        eyebrow: 'NĂNG LỰC MẠNG LƯỚI HMV GLOBAL',
        title: 'Năng lực trong mạng lưới của chúng tôi',
        items: [
          { value: '50.000 tấn/tháng', label: 'Năng lực gom hàng tại kho Campuchia' },
          { value: '10.000 tấn/tháng', label: 'Cung ứng cho nhà máy tại Long An' },
          { value: '150 container/tháng', label: 'Giao cho nhà nhập khẩu tại Quảng Tây' },
          { value: '250 container/tháng', label: 'Năng lực xuất khẩu quá cảnh' },
        ],
        note: 'Số liệu năng lực của mạng lưới HMV Global, không phải sản lượng cam kết cho mọi khách hàng. Sản lượng cho đơn hàng của bạn được xác nhận trong phương án cung ứng và hợp đồng.',
      },
      quality: {
        eyebrow: 'KẾT QUẢ MẪU INTERTEK',
        title: 'Tham chiếu chất lượng: một mẫu đã phân tích',
        head: ['Chỉ tiêu', 'Kết quả'],
        rows: [
          ['Tinh bột', '71,1%'],
          ['Độ ẩm', '11,55%'],
          ['Xơ thô', '2,99%'],
          ['Tro', '1,86%'],
          ['Cát sạn (sand & silica)', '0,45%'],
          ['Tạp chất', 'Không phát hiện'],
          ['Chì (Pb)', '0,17 mg/kg'],
          ['Cadimi (Cd)', '0,28 mg/kg'],
          ['Thủy ngân (Hg)', '<0,02 mg/kg'],
        ],
        source: 'Nguồn: Báo cáo phân tích Intertek Việt Nam AGRIVIETNAM2026-1700 ngày 05/10/2026. Các giá trị áp dụng cho mẫu được phân tích.',
        note: 'Các giá trị trên là kết quả của mẫu được Intertek phân tích, không phải thông số cố định cho mọi lô hàng. Chỉ tiêu từng lô được thống nhất trong hợp đồng.',
      },
      applications: {
        eyebrow: 'ỨNG DỤNG',
        title: 'Sắn lát khô được dùng ở đâu',
        items: [
          { title: 'Thức ăn chăn nuôi', text: 'Cho nhà sản xuất thức ăn chăn nuôi và công thức phối trộn.' },
          { title: 'Chế biến tinh bột', text: 'Cho nhà chế biến tinh bột.' },
          { title: 'Bioethanol', text: 'Cho nhà sản xuất ethanol.' },
        ],
      },
      workflow: {
        eyebrow: 'QUY TRÌNH CUNG ỨNG',
        title: 'Từ vùng nguyên liệu đến cảng của bạn',
        steps: [
          { title: 'Chọn vùng nguyên liệu', text: 'Vùng nguyên liệu phù hợp mục đích sử dụng.' },
          { title: 'Kiểm tra hiện trường', text: 'Kiểm tra nguyên liệu tại nguồn.' },
          { title: 'Lấy mẫu & phân tích', text: 'Lấy mẫu và phân tích theo yêu cầu đã thống nhất.' },
          { title: 'Gom hàng', text: 'Gom các lô để xuất hàng.' },
          { title: 'Đóng container', text: 'Đóng hàng theo yêu cầu của bạn.' },
          { title: 'Chứng từ & giao hàng', text: 'Chứng từ và giao hàng theo điều kiện đã thống nhất.' },
        ],
      },
      rfq: {
        eyebrow: 'RFQ · SẮN LÁT KHÔ',
        title: 'Yêu cầu phương án cung ứng sắn lát',
        lead: 'Chia sẻ sản lượng hằng tháng, mục đích sử dụng và yêu cầu chất lượng để HMV Global chuẩn bị phương án cung ứng.',
        volume: 'Sản lượng hằng tháng (tấn)',
        volumePlaceholder: 'Số tấn mỗi tháng',
      },
    },
  },
};
