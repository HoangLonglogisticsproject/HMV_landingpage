// Content of the golden passion fruit pages, one per buyer segment (International Buyers, Foodservice, Retail Business),
// rendered by views/products/passion-fruit. They share the product, the photographs (data/passionFruitMedia.js), the
// Trade Desk and the Quick RFQ; each has its own message, order and calls to action.
//
// Claims are limited to verified evidence. Fresh whole golden passion fruit from Vietnam, HMV-supplied photographs of
// growing areas, hand sorting and packing examples. Not asserted: farm or facility ownership, certification (a grower's sign
// in a photograph is not one), Brix, size or grade ranges, shelf life, capacity, prices, minimum quantities, delivery
// times, customers or partners, or any HMV-branded packaging. Applications for hospitality and retail are possible uses of
// the fresh fruit, not products HMV makes or customers it serves. Missing facts are requested in the proposal.
//
// One content tree per segment. Only text leaves are localized, `t(en, vi)`; resolved into `passionFruitPages.en` and `.vi`.
import { isProductSegment } from '../i18n/routes.js';
import { own } from '../lib/own.js';
import { resolve } from './localized.js';

/** A localized leaf: resolved to its text in the page language. */
const t = (en, vi) => lang => ({ en, vi })[lang];
/** A card, step or question: the English title and text, then the Vietnamese title and text. */
const item = (enTitle, enText, viTitle, viText) => ({ title: t(enTitle, viTitle), text: t(enText, viText) });

export const PRODUCT_ID = 'passion-fruit';
/** The page's segments in navigation order; the first is the product's own, already indexed URL. */
export const SEGMENTS = ['export', 'foodservice', 'retail'];
/** English key path of a segment's page. */
export const segmentPath = segment => (segment === 'export' ? `/products/${PRODUCT_ID}` : `/products/${PRODUCT_ID}/${segment}`);
/** The segment a URL's last path part names; the product's own URL has none. */
export const isSegmentSlug = slug => isProductSegment(PRODUCT_ID, slug);

/** The short points under a segment's navigation: rows of [English title, English line, Vietnamese title, Vietnamese line]. */
const valueRows = rows => rows.map(([enTitle, enText, viTitle, viText]) => item(enTitle, enText, viTitle, viText));
// Four value points under the Foodservice navigation: what to discuss, never a promise of quality, sweetness, aroma or yield.
const foodserviceValues = valueRows([
  ['Tropical inspiration', 'Fresh ideas for your menu.', 'Cảm hứng nhiệt đới', 'Gợi mở những sáng tạo mới cho thực đơn.'],
  ['Specifications for your use', 'Discuss product requirements to suit your application.', 'Quy cách theo nhu cầu', 'Trao đổi thông số phù hợp với mục đích sử dụng.'],
  ['Versatile applications', 'From beverages and desserts to cuisine.', 'Ứng dụng đa dạng', 'Từ đồ uống, món tráng miệng đến ẩm thực.'],
  ['Supply partnership', 'Discuss volumes and purchasing plans with HMV.', 'Hợp tác cung ứng', 'Cùng HMV trao đổi sản lượng và kế hoạch nhập hàng.'],
]);
// Five commercial points under the Retail navigation: no promise of damage-free transport, grading, fixed supply, margins or private label.
const retailValues = valueRows([
  ['Appearance and origin', 'Distinctive golden colour and a Vietnamese origin.', 'Hình thức và nguồn gốc', 'Màu vàng đặc trưng, xuất xứ từ Việt Nam.'],
  ['Shelf presentation', 'Display inspiration with a distinctive golden look.', 'Giá trị trưng bày', 'Gợi ý cách trình bày nổi bật tại điểm bán.'],
  ['Packaging formats', 'Discuss formats suited to your distribution channel.', 'Quy cách đóng gói', 'Trao đổi định dạng phù hợp với kênh phân phối.'],
  ['Individual fruit protection', 'Explore protective nets and divided cartons.', 'Bảo vệ từng trái', 'Tham khảo lưới xốp và thùng có ngăn.'],
  ['Supply planning', 'Discuss quantities and delivery schedules.', 'Kế hoạch cung ứng', 'Trao đổi sản lượng và lịch giao hàng theo nhu cầu.'],
]);

const content = {
  nav: {
    label: t('Buyer segments', 'Nhóm khách hàng'),
    items: { export: t('International Buyers', 'Xuất khẩu'), foodservice: t('Foodservice', 'Khách sạn & F&B'), retail: t('Retail Business', 'Đối tác bán lẻ') },
  },

  // ─────────────────────────────── International Buyers ───────────────────────────────
  export: {
    seo: {
      title: t('Golden Passion Fruit Supplier from Vietnam', 'Nhà cung ứng chanh dây vàng Việt Nam'),
      description: t(
        'Orchard sourcing, selection, packing options and export coordination for fresh golden passion fruit from Vietnam, for importers, wholesalers and distributors.',
        'Nguồn hàng từ vùng trồng, phân loại, đóng gói và điều phối xuất khẩu chanh dây vàng tươi Việt Nam cho nhà nhập khẩu, nhà bán sỉ và nhà phân phối.',
      ),
    },
    hero: {
      title: [t('Vietnam', 'Nhà cung ứng'), t('Golden Passion Fruit', 'chanh dây vàng'), t('Supplier', 'Việt Nam')],
      lead: t(
        'Orchard-based sourcing, careful selection, packing options and export coordination for global buyers of fresh golden passion fruit.',
        'Nguồn hàng từ vùng trồng, phân loại cẩn thận, quy cách đóng gói và điều phối xuất khẩu cho khách hàng quốc tế mua chanh dây vàng tươi.',
      ),
      primary: t('Request a Supply Proposal', 'Yêu cầu đề xuất cung ứng'),
      secondary: t('Ask HMV Trade Desk', 'Hỏi HMV Trade Desk'),
    },
    strip: [
      item('Orchard Sourcing', 'Fruit sourced from growing areas in Vietnam',
           'Nguồn từ vùng trồng', 'Trái được thu mua từ các vùng trồng tại Việt Nam'),
      item('Careful Grading', 'Sorting and selection agreed with each buyer',
           'Phân loại cẩn thận', 'Cách phân loại và chọn lọc thống nhất với từng khách hàng'),
      item('Export Packing', 'Packing options discussed for your market',
           'Đóng gói xuất khẩu', 'Quy cách đóng gói trao đổi theo thị trường của bạn'),
      item('Buyer Support', 'HMV Trade Desk, from first question to proposal',
           'Hỗ trợ khách hàng', 'HMV Trade Desk đồng hành từ câu hỏi đầu tiên đến đề xuất'),
    ],
    why: {
      title: t('Why Buyers Choose ', 'Vì sao khách hàng chọn '),
      accent: t('HMV Passion Fruit', 'chanh dây HMV'),
      items: [
        item('Orchard-Based Supply', 'Sourcing from growing areas in Vietnam, matched to your brief.',
             'Nguồn hàng từ vùng trồng', 'Thu mua từ các vùng trồng tại Việt Nam, phù hợp với yêu cầu của bạn.'),
        item('Quality & Selection', 'Hand sorting and selection against requirements agreed with you.',
             'Chất lượng & chọn lọc', 'Phân loại thủ công và chọn lọc theo yêu cầu đã thống nhất với bạn.'),
        item('Packaging Solutions', 'Carton and protective packing formats discussed for your channel.',
             'Giải pháp đóng gói', 'Quy cách thùng và bảo vệ trái được trao đổi theo kênh phân phối của bạn.'),
        item('Export-Oriented Support', 'The HMV Trade Desk guides you from requirements to proposal.',
             'Hỗ trợ xuất khẩu', 'HMV Trade Desk hướng dẫn bạn từ yêu cầu đến đề xuất.'),
      ],
    },
    orchard: {
      title: t('Orchard & Sourcing', 'Vùng trồng & nguồn hàng'),
      text: t(
        'Golden passion fruit is sourced from growing areas in Vietnam. These photographs show vines and fruit in the field; the source of each shipment is confirmed in your proposal.',
        'Chanh dây vàng được thu mua từ các vùng trồng tại Việt Nam. Những bức ảnh này cho thấy giàn và trái ngoài đồng; nguồn hàng của từng lô được xác nhận trong đề xuất của bạn.',
      ),
      note: t('Photographs supplied by HMV.', 'Ảnh do HMV cung cấp.'),
    },
    quality: {
      title: t('Quality & Size References', 'Chất lượng & kích cỡ tham chiếu'),
      text: t(
        'Size and selection are agreed with you before quotation, so the fruit you are offered matches the specification of your market.',
        'Kích cỡ và cách chọn lọc được thống nhất với bạn trước khi báo giá, để trái được chào phù hợp với yêu cầu của thị trường bạn.',
      ),
      points: [
        t('Selection and sizing agreed with each buyer', 'Chọn lọc và phân cỡ thống nhất với từng khách hàng'),
        t('Whole fruit, protected in foam nets for presentation', 'Trái nguyên quả, bọc lưới xốp để bảo vệ và trưng bày'),
        t('Specifications confirmed in the proposal', 'Thông số được xác nhận trong đề xuất'),
      ],
    },
    specs: {
      title: t('Product at a glance', 'Sản phẩm tóm tắt'),
      text: t('What is confirmed today.', 'Những gì đã được xác nhận hiện nay.'),
      facts: [
        [t('Product form', 'Dạng sản phẩm'), t('Fresh whole fruit', 'Trái tươi nguyên quả')],
        [t('Variety', 'Giống'), t('Golden passion fruit', 'Chanh dây vàng')],
        [t('Origin', 'Xuất xứ'), t('Vietnam', 'Việt Nam')],
      ],
      more: t(
        'Size, weight, grading, packaging, storage and availability are confirmed against your requirements when you inquire.',
        'Kích cỡ, khối lượng, phân hạng, đóng gói, bảo quản và nguồn hàng được xác nhận theo yêu cầu của bạn khi bạn gửi yêu cầu.',
      ),
      cta: t('Request Detailed Product Specifications', 'Yêu cầu thông số sản phẩm chi tiết'),
    },
    sorting: {
      title: t('Sorting & Handling', 'Phân loại & xử lý'),
      text: t(
        'Fruit is sorted by hand to remove what does not meet the requirement and to keep consistent fruit together before packing. The photograph shows fruit on a sorting tarpaulin in the field, still green.',
        'Trái được phân loại thủ công để loại bỏ trái không đạt yêu cầu và giữ các trái đồng đều với nhau trước khi đóng gói. Bức ảnh cho thấy trái trên tấm bạt phân loại ngoài hiện trường, khi trái còn xanh.',
      ),
    },
    packing: {
      title: t('Packing Options', 'Quy cách đóng gói'),
      text: t(
        'Packing is discussed around your market and channel. These illustrative formats show how golden passion fruit can be protected and separated; packaging arrangements are subject to your requirements, and carton type, net weight and labelling are agreed in the proposal.',
        'Quy cách đóng gói được trao đổi theo thị trường và kênh phân phối của bạn. Các định dạng minh họa này cho thấy cách bảo vệ và tách từng trái chanh dây vàng; cách đóng gói tùy theo yêu cầu của bạn, còn loại thùng, khối lượng tịnh và nhãn mác được thống nhất trong đề xuất.',
      ),
      points: [
        t('Divided cartons, one fruit per compartment', 'Thùng có ngăn, mỗi trái một ngăn'),
        t('Protective foam nets around individual fruit', 'Lưới xốp bảo vệ từng trái'),
        t('Labelling and carton type to your channel', 'Nhãn mác và loại thùng theo kênh của bạn'),
      ],
    },
    process: {
      title: t('From your requirements to delivery', 'Từ yêu cầu của bạn đến khi giao hàng'),
      stepLabel: t('Step', 'Bước'),
      steps: [
        item('Share your requirements', 'Volume, destination and the specification you need.',
             'Chia sẻ yêu cầu', 'Sản lượng, thị trường đích và thông số bạn cần.'),
        item('Review availability', 'HMV checks availability and specifications against your brief.',
             'Xem xét nguồn hàng', 'HMV đối chiếu nguồn hàng và thông số với yêu cầu của bạn.'),
        item('Discuss quotation and terms', 'Commercial terms are discussed once the requirement is clear.',
             'Trao đổi báo giá và điều kiện', 'Điều kiện thương mại được trao đổi khi yêu cầu đã rõ.'),
        item('Coordinate the order', 'The agreed order is coordinated with the sourcing side.',
             'Điều phối đơn hàng', 'Đơn hàng đã thống nhất được điều phối với phía nguồn hàng.'),
        item('Arrange delivery', 'Delivery is arranged according to the agreement.',
             'Sắp xếp giao hàng', 'Giao hàng được sắp xếp theo thỏa thuận.'),
      ],
    },
    faq: {
      title: t('Frequently Asked Questions', 'Câu hỏi thường gặp'),
      text: t('Quick answers to common questions from global buyers.', 'Giải đáp nhanh các câu hỏi thường gặp từ khách hàng quốc tế.'),
      items: [
        item('Can HMV supply golden passion fruit for export?', 'HMV Global coordinates the sourcing of fresh golden passion fruit from Vietnam for importers, distributors and wholesale buyers. Availability, volume and timing are confirmed for each inquiry.',
             'HMV có cung ứng chanh dây vàng xuất khẩu không?', 'HMV Global điều phối nguồn chanh dây vàng tươi từ Việt Nam cho nhà nhập khẩu, nhà phân phối và khách hàng mua sỉ. Nguồn hàng, sản lượng và thời điểm được xác nhận theo từng yêu cầu.'),
        item('Which specifications can I request?', 'Share the size, Brix, grading and packaging you need. HMV reviews them against what can be sourced and confirms the specification in the proposal; none is fixed on this page.',
             'Tôi có thể yêu cầu những thông số nào?', 'Hãy chia sẻ kích cỡ, độ Brix, phân hạng và đóng gói bạn cần. HMV đối chiếu với nguồn hàng có thể thu mua và xác nhận thông số trong đề xuất; trang này không cố định thông số nào.'),
        item('What packing options are available?', 'Packing is discussed around your market. Divided cartons and protective foam nets are examples; carton type, net weight and labelling are agreed in the proposal.',
             'Có những quy cách đóng gói nào?', 'Quy cách đóng gói được trao đổi theo thị trường của bạn. Thùng có ngăn và lưới xốp bảo vệ là các ví dụ; loại thùng, khối lượng tịnh và nhãn mác được thống nhất trong đề xuất.'),
        item('Can you support export documentation and coordination?', 'HMV coordinates the proposal, the documents and the delivery plan around your agreed requirements and destination. The documents depend on the destination market and are confirmed with you.',
             'HMV có hỗ trợ chứng từ và điều phối xuất khẩu không?', 'HMV điều phối đề xuất, chứng từ và kế hoạch giao hàng theo yêu cầu và thị trường đích đã thống nhất. Chứng từ cần thiết phụ thuộc thị trường đích và được xác nhận cùng bạn.'),
        item('How can I get a quotation?', 'Send your product, destination and volume through the request form below, or ask the HMV Trade Desk. Commercial terms are discussed once the requirement is clear.',
             'Làm sao để nhận báo giá?', 'Gửi sản phẩm, thị trường đích và sản lượng qua biểu mẫu bên dưới, hoặc hỏi HMV Trade Desk. Điều kiện thương mại được trao đổi khi yêu cầu đã rõ.'),
      ],
    },
    cta: {
      title: t('Request a Supply Proposal', 'Yêu cầu đề xuất cung ứng'),
      text: t(
        'Tell us what you need and our team will come back to you with a suitable supply proposal for golden passion fruit from Vietnam.',
        'Cho chúng tôi biết nhu cầu của bạn, đội ngũ HMV sẽ phản hồi với đề xuất cung ứng chanh dây vàng Việt Nam phù hợp.',
      ),
      desk: t('A dedicated export team via HMV Trade Desk', 'Đội ngũ xuất khẩu chuyên trách qua HMV Trade Desk'),
    },
  },

  // ─────────────────────────────── Foodservice & Luxury Hospitality ───────────────────────────────
  foodservice: {
    seo: {
      title: t('Golden Passion Fruit for Hotels & Foodservice', 'Chanh dây vàng cho khách sạn & F&B'),
      description: t(
        'Fresh Vietnamese golden passion fruit for hotels, restaurants and beverage businesses. Discuss specifications, quantities and supply needs with HMV Global.',
        'Chanh dây vàng tươi Việt Nam dành cho khách sạn, nhà hàng và doanh nghiệp đồ uống. Trao đổi quy cách, sản lượng và nhu cầu cung ứng cùng HMV Global.',
      ),
    },
    hero: {
      eyebrow: t('HMV GOLDEN PASSION FRUIT — FOODSERVICE', 'HMV CHANH DÂY VÀNG — KHÁCH SẠN & F&B'),
      title: t('Golden Passion Fruit for Professional Food & Beverage', 'Chanh dây vàng cho ẩm thực và đồ uống chuyên nghiệp'),
      tagline: t('An Exceptional Ingredient. A Memorable Experience.', 'Nguyên liệu khác biệt. Trải nghiệm đáng nhớ.'),
      lead: t(
        'Fresh golden passion fruit from Vietnam, bringing tropical inspiration to hospitality menus, restaurant kitchens and beverage concepts.',
        'Chanh dây vàng tươi từ Việt Nam, mang cảm hứng nhiệt đới đến thực đơn của khách sạn, nhà hàng và các thương hiệu đồ uống.',
      ),
      primary: t('Discuss Your Supply Needs', 'Trao đổi nhu cầu cung ứng'),
      secondary: t('Explore Applications', 'Khám phá ứng dụng'),
    },
    values: foodserviceValues,
    // #applications. `id` picks the photograph in the view (`photos` in FoodserviceSegment.jsx): the beverage, the dessert and the
    // plated dish are AI-generated application illustrations. The supply information of the old fourth card is in `partnership`.
    applications: {
      eyebrow: t('APPLICATIONS IN HOSPITALITY', 'ỨNG DỤNG TRONG KHÁCH SẠN & F&B'),
      title: t('Versatile Inspiration for Exceptional Menus', 'Đa dạng ứng dụng, nâng tầm thực đơn'),
      text: t(
        'From signature beverages to refined desserts and culinary creations, golden passion fruit offers a range of possibilities for professional foodservice teams.',
        'Từ những thức uống đặc trưng đến món tráng miệng và các sáng tạo ẩm thực, chanh dây vàng mở ra nhiều cách khai thác nguyên liệu cho đội ngũ F&B.',
      ),
      items: [
        { id: 'beverages', ...item('Signature Beverages', 'Ideas for juices, fruit teas, mocktails and seasonal drinks.', 'Đồ uống đặc trưng', 'Gợi cảm hứng cho nước ép, trà trái cây, mocktail và các thức uống theo mùa.') },
        { id: 'desserts', ...item('Refined Desserts', 'A tropical note for panna cotta, pastries, ice cream and creative desserts.', 'Tráng miệng tinh tế', 'Điểm nhấn nhiệt đới cho panna cotta, bánh ngọt, kem và món tráng miệng sáng tạo.') },
        { id: 'culinary', ...item('Culinary Creations', 'Possibilities in sauces, main courses and the art of plating.', 'Ẩm thực sáng tạo', 'Khám phá các ứng dụng trong nước sốt, món chính và nghệ thuật trình bày món ăn.') },
      ],
      note: t(
        'The beverage, dessert and dish images are illustrations of possible uses. HMV supplies fresh golden passion fruit, not finished food or drinks.',
        'Các hình ảnh đồ uống, món tráng miệng và món ăn là minh họa cho ý tưởng ứng dụng. HMV cung ứng chanh dây vàng tươi, không cung cấp món ăn hay đồ uống thành phẩm.',
      ),
    },
    origin: {
      eyebrow: t('ORIGIN & INGREDIENT', 'NGUỒN GỐC & NGUYÊN LIỆU'),
      title: t('From Vietnamese Growing Areas to the Table', 'Từ vùng trồng Việt Nam đến bàn ăn'),
      text: t(
        'HMV connects Vietnamese golden passion fruit sourcing with the needs of hospitality, culinary and beverage businesses. Product specifications and supply arrangements are discussed according to each partner requirements.',
        'HMV kết nối nguồn chanh dây vàng tươi từ các vùng trồng tại Việt Nam với nhu cầu của khách sạn, nhà hàng và doanh nghiệp F&B. Quy cách sản phẩm và phương án cung ứng được trao đổi theo mục đích sử dụng của từng đối tác.',
      ),
      points: [
        t('Fresh whole fruit', 'Trái tươi nguyên quả'),
        t('Distinctive golden skin', 'Vỏ vàng đặc trưng'),
        t('Versatile across food and beverage', 'Dùng được cho cả món ăn và đồ uống'),
      ],
      specs: t('Request product specifications', 'Yêu cầu thông số sản phẩm'),
      link: t('Explore the product origin', 'Khám phá nguồn gốc sản phẩm'),
    },
    partnership: {
      eyebrow: t('FOODSERVICE PARTNERSHIP', 'ĐỒNG HÀNH CÙNG ĐỐI TÁC F&B'),
      title: t('A Clear Path to Foodservice Partnership', 'Quy trình hợp tác đơn giản, rõ ràng'),
      text: t(
        'Share your business requirements so HMV can discuss a suitable golden passion fruit supply arrangement with your team.',
        'Chia sẻ nhu cầu của doanh nghiệp để HMV cùng bạn trao đổi phương án cung ứng chanh dây vàng phù hợp.',
      ),
      // The six topics HMV asks about, in three steps: quantities, frequency and destination; applications, specifications and packaging.
      steps: [
        item('Share Your Requirements', 'Expected quantities, purchasing frequency and delivery destination.', 'Chia sẻ nhu cầu', 'Sản lượng dự kiến, tần suất nhập hàng và địa điểm giao hàng.'),
        item('Discuss Product Specifications', 'Intended applications, product requirements and packaging preferences.', 'Trao đổi quy cách', 'Mục đích sử dụng, thông số sản phẩm và yêu cầu đóng gói.'),
        item('Review a Supply Proposal', 'HMV reviews your requirements and discusses suitable commercial arrangements.', 'Đề xuất cung ứng', 'HMV xem xét nhu cầu và trao đổi phương án hợp tác thương mại.'),
      ],
      note: t('Availability, quantities and delivery are confirmed with each inquiry.', 'Nguồn hàng, sản lượng và lịch giao được xác nhận theo từng yêu cầu cụ thể.'),
      cta: t('Start a Foodservice Partnership', 'Bắt đầu hợp tác cùng HMV'),
    },
    faq: {
      title: t('Questions about Golden Passion Fruit Supply for Foodservice', 'Câu hỏi thường gặp về cung ứng chanh dây vàng cho F&B'),
      text: t('For purchasing managers, chefs and beverage teams.', 'Dành cho bộ phận thu mua, bếp trưởng và đội ngũ đồ uống.'),
      items: [
        item('Which businesses does HMV supply golden passion fruit to?', 'This page is for hotels, resorts, restaurants, bars, cafés and beverage businesses. HMV supplies fresh whole golden passion fruit from Vietnam; it does not supply juice, purée or finished food and drinks.',
             'HMV cung ứng chanh dây vàng cho những nhóm doanh nghiệp nào?', 'Trang này dành cho khách sạn, khu nghỉ dưỡng, nhà hàng, quầy bar, quán cà phê và doanh nghiệp đồ uống. HMV cung ứng chanh dây vàng tươi nguyên quả từ Việt Nam; HMV không cung cấp nước ép, cốt hay món ăn, đồ uống thành phẩm.'),
        item('Can I discuss specifications and quantities for my needs?', 'Yes. Open the HMV Trade Desk and share your intended use, expected quantity and delivery destination. HMV replies with what is confirmed for your inquiry and does not publish values that are not verified.',
             'Tôi có thể trao đổi quy cách và sản lượng theo nhu cầu không?', 'Có. Hãy mở HMV Trade Desk và cho biết mục đích sử dụng, sản lượng dự kiến và địa điểm giao hàng. HMV phản hồi bằng những thông tin đã được xác nhận cho yêu cầu của bạn và không công bố các số liệu chưa được kiểm chứng.'),
        item('Are the dishes and drinks in the images HMV products?', 'No. The beverage, dessert and dish images are AI-generated illustrations of possible uses. HMV supplies fresh golden passion fruit and does not make finished dishes or beverages; the images do not show HMV customers.',
             'Hình ảnh món ăn và đồ uống có phải sản phẩm do HMV sản xuất không?', 'Không. Các hình ảnh đồ uống, món tráng miệng và món ăn do AI tạo ra để minh họa ý tưởng ứng dụng. HMV cung ứng chanh dây vàng tươi, không sản xuất món ăn hay đồ uống thành phẩm, và các hình ảnh này không đại diện cho khách hàng của HMV.'),
        item('Does HMV help with product specifications?', 'Yes. Ask through the Trade Desk and HMV provides the information confirmed for your inquiry. Divided cartons and protective nets are examples of packaging; the format is agreed in the proposal.',
             'HMV có hỗ trợ trao đổi thông số sản phẩm không?', 'Có. Hãy gửi yêu cầu qua Trade Desk, HMV sẽ cung cấp thông tin đã xác nhận cho yêu cầu của bạn. Thùng có ngăn và lưới bảo vệ là các ví dụ về quy cách đóng gói; quy cách cụ thể được thống nhất trong đề xuất.'),
        item('How do I start a supply partnership?', 'Open the HMV Trade Desk and tell HMV your product, destination and expected quantity. Frequency, applications and packaging can follow. No minimum order or delivery schedule is stated on this page; both are confirmed for each inquiry.',
             'Làm thế nào để bắt đầu hợp tác cung ứng?', 'Hãy mở HMV Trade Desk và cho HMV biết sản phẩm, địa điểm giao hàng và sản lượng dự kiến. Tần suất nhập hàng, ứng dụng và quy cách đóng gói có thể trao đổi sau. Trang này không nêu đơn hàng tối thiểu hay lịch giao cố định; những nội dung đó được xác nhận theo từng yêu cầu.'),
      ],
    },
    cta: {
      title: t('Bring Tropical Inspiration to Your Menu', 'Mang cảm hứng nhiệt đới vào thực đơn của bạn'),
      text: t('Connect with HMV to discuss your product requirements and supply arrangements.', 'Kết nối với HMV để trao đổi nhu cầu và phương án cung ứng phù hợp với doanh nghiệp.'),
      button: t('Become a Foodservice Partner', 'Trở thành đối tác F&B'),
    },
  },

  // ─────────────────────────────── Premium Retail Business ───────────────────────────────
  retail: {
    seo: {
      title: t('Golden Passion Fruit Supplier for Retailers', 'Nhà cung ứng chanh dây vàng cho đối tác bán lẻ'),
      description: t(
        'Vietnamese golden passion fruit for retailers, supermarkets and distributors. Discuss product presentation, packaging and commercial supply with HMV Global.',
        'Chanh dây vàng Việt Nam dành cho siêu thị, cửa hàng trái cây và nhà phân phối. Trao đổi quy cách đóng gói và phương án cung ứng cùng HMV Global.',
      ),
    },
    hero: {
      eyebrow: t('HMV GOLDEN PASSION FRUIT — RETAIL BUSINESS', 'HMV CHANH DÂY VÀNG — ĐỐI TÁC BÁN LẺ'),
      title: t('Golden Passion Fruit for Retail & Distribution', 'Chanh dây vàng cho đối tác phân phối và bán lẻ'),
      tagline: t('Distinctive Fruit. Distinguished Shelves.', 'Trái cây khác biệt. Giá trị tại điểm bán.'),
      lead: t(
        'Fresh Vietnamese golden passion fruit for distributors and retailers who value product origin, presentation and shelf appeal.',
        'Chanh dây vàng tươi từ Việt Nam dành cho những đối tác chú trọng nguồn gốc, hình thức sản phẩm và giá trị trưng bày tại điểm bán.',
      ),
      primary: t('Discuss a Retail Partnership', 'Trao đổi hợp tác phân phối'),
      secondary: t('Explore Packaging', 'Khám phá quy cách đóng gói'),
    },
    values: retailValues,
    packaging: {
      eyebrow: t('PACKAGING & PRESENTATION', 'ĐÓNG GÓI & TRƯNG BÀY'),
      title: t('Flexible Packaging, Refined Presentation', 'Quy cách linh hoạt, trưng bày ấn tượng'),
      text: t(
        'From individual fruit protection to retail presentation, HMV works with buyers to discuss packaging formats suited to their distribution channels.',
        'Từ cách bảo vệ từng trái đến hình thức trưng bày, HMV cùng đối tác trao đổi quy cách đóng gói phù hợp với từng kênh phân phối.',
      ),
      items: [
        item('Individual fruit protection', 'Foam nets around each fruit.',
             'Bảo vệ từng trái', 'Lưới xốp bao quanh từng trái.'),
        item('Divided cartons', 'One fruit per compartment, in cartons with divided trays.',
             'Thùng có ngăn', 'Mỗi trái một ngăn, trong thùng có khay chia.'),
        item('Display presentation', 'Fruit shown on a display stand.',
             'Trưng bày tại điểm bán', 'Trái được trình bày trên kệ trưng bày.'),
      ],
      note: t(
        'The gift carton at the top of the page is an illustrative concept, and the carton and net images are market references: none is official HMV packaging. Pack sizes and private-label options are not offered on this page; packaging is discussed for each buyer channel.',
        'Hộp quà ở đầu trang là concept minh họa, các hình thùng và lưới chỉ là tham khảo thị trường: không hình nào là bao bì chính thức của HMV. Trang này không nêu kích cỡ đóng gói hay tùy chọn nhãn riêng; phương án đóng gói được trao đổi theo kênh phân phối của từng đối tác.',
      ),
    },
    opportunities: {
      eyebrow: t('RETAIL OPPORTUNITIES', 'CƠ HỘI PHÂN PHỐI'),
      title: t('Golden Passion Fruit for Premium Retail Channels', 'Cơ hội phân phối chanh dây vàng'),
      text: t(
        'With its distinctive golden appearance and Vietnamese origin, golden passion fruit offers another product direction for premium fresh-produce businesses.',
        'Với màu vàng đặc trưng và câu chuyện nguồn gốc từ Việt Nam, chanh dây vàng mở ra thêm lựa chọn cho các doanh nghiệp kinh doanh trái cây và thực phẩm cao cấp.',
      ),
      items: [
        item('Premium supermarkets and grocery retailers', 'A distinctive fresh fruit for produce sections where presentation and origin matter.',
             'Siêu thị và cửa hàng thực phẩm cao cấp', 'Một loại trái cây tươi nổi bật cho quầy rau quả, nơi hình thức và nguồn gốc được coi trọng.'),
        item('Specialty fruit stores', 'A golden fruit that sets a specialist range apart from standard offers.',
             'Cửa hàng trái cây đặc sản', 'Một lựa chọn màu vàng giúp danh mục đặc sản khác với trái cây thông thường.'),
        item('Distributors and premium gifting businesses', 'Fresh fruit for distributors, and for businesses that assemble premium fruit gifts.',
             'Nhà phân phối và doanh nghiệp quà tặng', 'Trái cây tươi cho nhà phân phối và đơn vị làm quà tặng trái cây cao cấp.'),
      ],
    },
    origin: {
      eyebrow: t('ORIGIN & PRODUCT', 'NGUỒN GỐC & SẢN PHẨM'),
      title: t('Product Value Begins with Origin', 'Giá trị sản phẩm bắt đầu từ nguồn gốc'),
      text: t(
        'HMV connects Vietnamese golden passion fruit sourcing with the needs of distribution partners. Product specifications and packaging requirements are discussed for each market.',
        'HMV kết nối nguồn chanh dây vàng từ các vùng trồng tại Việt Nam với nhu cầu của đối tác phân phối. Thông số sản phẩm và quy cách đóng gói được trao đổi theo yêu cầu của từng thị trường.',
      ),
      links: [t('Explore the product origin', 'Khám phá nguồn gốc sản phẩm'), t('Request product specifications', 'Yêu cầu thông số sản phẩm')],
    },
    partnership: {
      eyebrow: t('PARTNER WITH HMV GLOBAL', 'HỢP TÁC CÙNG HMV GLOBAL'),
      title: t('Develop Your Market with HMV', 'Cùng HMV phát triển thị trường của bạn'),
      text: t(
        'Discuss your distribution needs, product requirements and purchasing plans with HMV to explore suitable commercial arrangements.',
        'Trao đổi nhu cầu phân phối, quy cách sản phẩm và kế hoạch nhập hàng để cùng HMV xây dựng phương án hợp tác phù hợp.',
      ),
      steps: [
        item('Understand Your Market', 'Distribution channels, target customers and expected purchasing volume.', 'Hiểu thị trường', 'Kênh phân phối, nhóm khách hàng và sản lượng dự kiến.'),
        item('Discuss the Right Format', 'Product specifications, retail presentation and packaging requirements.', 'Lựa chọn quy cách', 'Thông số sản phẩm, hình thức trưng bày và nhu cầu đóng gói.'),
        item('Plan the Partnership', 'Purchasing frequency, delivery destination and commercial arrangements.', 'Kế hoạch hợp tác', 'Tần suất nhập hàng, địa điểm giao nhận và đề xuất thương mại.'),
      ],
      note: t('HMV works with businesses only and does not publish prices, price tiers or margins on this page.', 'HMV chỉ làm việc với doanh nghiệp và không công bố giá, bậc giá hay biên lợi nhuận trên trang này.'),
      cta: t('Discuss a Retail Partnership', 'Bắt đầu trao đổi hợp tác'),
    },
    faq: {
      title: t('Questions about Golden Passion Fruit for Retail Partners', 'Giải đáp về hợp tác phân phối chanh dây vàng'),
      text: t('For category buyers, distributors and gifting businesses.', 'Dành cho bộ phận mua hàng, nhà phân phối và doanh nghiệp quà tặng.'),
      items: [
        item('Where does HMV golden passion fruit come from?', 'From growing areas in Vietnam. HMV connects that sourcing with distribution partners, and the buyer page shows the growing area and the sorting in more detail. All commercial contact goes through HMV.',
             'Chanh dây vàng HMV có nguồn gốc từ đâu?', 'Từ các vùng trồng tại Việt Nam. HMV kết nối nguồn hàng này với đối tác phân phối; trang dành cho khách hàng xuất khẩu trình bày chi tiết hơn về vùng trồng và khâu phân loại. Mọi trao đổi thương mại đều thông qua HMV.'),
        item('Can packaging be discussed for my distribution channel?', 'Yes. Packaging is discussed for each channel: protective nets and divided cartons are examples, and the format is agreed in the proposal. No pack size or private-label option is offered on this page.',
             'Có thể trao đổi quy cách đóng gói theo kênh phân phối không?', 'Có. Quy cách đóng gói được trao đổi theo từng kênh phân phối: lưới bảo vệ và thùng có ngăn là các ví dụ, quy cách cụ thể được thống nhất trong đề xuất. Trang này không nêu kích cỡ đóng gói hay tùy chọn nhãn riêng.'),
        item('Is the illustrated packaging official HMV packaging?', 'No. The gift carton at the top of the page is an AI-generated concept and the other carton and net images are market references. None is official or manufactured HMV packaging, and HMV-branded or private-label packaging is not confirmed.',
             'Bao bì minh họa có phải bao bì chính thức của HMV không?', 'Không. Hộp quà ở đầu trang là concept do AI tạo ra, các hình thùng và lưới còn lại là tham khảo thị trường. Không hình nào là bao bì chính thức hay do HMV sản xuất, và bao bì mang nhãn HMV hay nhãn riêng chưa được xác nhận.'),
        item('How do I discuss specifications and purchasing volume?', 'Open the HMV Trade Desk and share your expected volume, destination and packaging needs. HMV replies with what is confirmed for your inquiry. Prices are not published here; commercial terms are discussed once the requirement is clear.',
             'Làm thế nào để trao đổi thông số và sản lượng nhập hàng?', 'Hãy mở HMV Trade Desk và chia sẻ sản lượng dự kiến, địa điểm giao hàng và nhu cầu đóng gói. HMV phản hồi bằng những thông tin đã xác nhận cho yêu cầu của bạn. Trang này không niêm yết giá; điều kiện thương mại được trao đổi khi nhu cầu đã rõ.'),
        item('What do I need to share to receive a proposal?', 'Your market and distribution channel, expected volume and purchasing frequency, product and packaging requirements, and the delivery destination. HMV reviews them and replies with a proposal for your channel.',
             'Tôi cần cung cấp thông tin gì để nhận đề xuất hợp tác?', 'Kênh phân phối và thị trường, sản lượng dự kiến và tần suất nhập hàng, yêu cầu về sản phẩm và đóng gói, cùng địa điểm giao hàng. HMV xem xét và phản hồi bằng đề xuất phù hợp với kênh của bạn.'),
      ],
    },
    cta: {
      title: t('Bring Distinctive Value to Your Shelves', 'Đưa giá trị khác biệt đến điểm bán của bạn'),
      text: t('Connect with HMV Global to discuss your golden passion fruit distribution and supply requirements.', 'Liên hệ HMV Global để trao đổi nhu cầu phân phối và phương án cung ứng chanh dây vàng.'),
      button: t('Become a Retail Partner', 'Trở thành đối tác phân phối'),
    },
  },
};

export const passionFruitPages = { en: resolve(content, 'en'), vi: resolve(content, 'vi') };

/** Title and description of a segment's page, without the " | HMV Global" suffix both builds add. */
export const passionFruitMeta = (lang, segment = 'export') => (own(passionFruitPages[lang], segment) ?? passionFruitPages[lang].export).seo;
