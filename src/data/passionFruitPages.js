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
// Four value points under the navigation: what to discuss, never a promise of quality, sweetness, aroma or yield.
const foodserviceValues = valueRows([
  ['Tropical inspiration', 'Inspiration for distinctive menus.', 'Cảm hứng nhiệt đới', 'Gợi mở hương vị cho thực đơn sáng tạo.'],
  ['Quality requirements', 'Discuss specifications for your application.', 'Yêu cầu chất lượng', 'Trao đổi quy cách theo nhu cầu sử dụng.'],
  ['Culinary versatility', 'Beverages, desserts and culinary dishes.', 'Ứng dụng đa dạng', 'Đồ uống, tráng miệng và món ăn.'],
  ['Foodservice partnership', 'Discuss your requirements and supply plans with HMV.', 'Đồng hành cùng F&B', 'Thảo luận nhu cầu và kế hoạch cung ứng cùng HMV.'],
]);
// Five commercial points under the navigation: no promise of damage-free transport, grading, fixed supply, margins or private label.
const retailValues = valueRows([
  ['Packaging options', 'Discuss formats for your distribution channel.', 'Quy cách đóng gói', 'Thảo luận định dạng phù hợp với kênh phân phối.'],
  ['Shelf presentation', 'Distinctive golden appearance and display inspiration.', 'Hình thức tại điểm bán', 'Màu vàng đặc trưng, gợi mở cách trưng bày.'],
  ['Individual fruit protection', 'Explore protective nets and divided cartons.', 'Bảo vệ từng trái', 'Tham khảo lưới và ngăn carton.'],
  ['Product value', 'Origin and product presentation.', 'Giá trị sản phẩm', 'Câu chuyện nguồn gốc và cách trình bày.'],
  ['Supply planning', 'Discuss quantities and delivery schedules.', 'Kế hoạch cung ứng', 'Trao đổi lượng mua và lịch giao theo nhu cầu.'],
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
      title: t('Golden Passion Fruit for Hotels & Foodservice', 'Chanh dây vàng cho khách sạn, nhà hàng & F&B'),
      description: t(
        'Fresh golden passion fruit from Vietnam for hotels, restaurants, bars, cafés and beverage businesses. Discuss quantities, applications and packaging with HMV.',
        'Chanh dây vàng tươi Việt Nam cho khách sạn, nhà hàng, quầy bar, quán cà phê và doanh nghiệp đồ uống. Trao đổi sản lượng, ứng dụng và đóng gói cùng HMV.',
      ),
    },
    hero: {
      eyebrow: t('HMV GOLDEN PASSION FRUIT — FOODSERVICE', 'HMV CHANH DÂY VÀNG — KHÁCH SẠN & F&B'),
      title: t('An Exceptional Ingredient. A Memorable Experience.', 'Nguyên liệu khác biệt. Trải nghiệm đáng nhớ.'),
      lead: t(
        'Fresh golden passion fruit from Vietnam, bringing tropical inspiration to beverages, desserts and culinary creations.',
        'Chanh dây vàng tươi từ Việt Nam, mang cảm hứng nhiệt đới cho đồ uống, món tráng miệng và những sáng tạo ẩm thực.',
      ),
      primary: t('Discuss Your Supply Needs', 'Trao đổi nhu cầu cung ứng'),
      secondary: t('Explore Applications', 'Khám phá ứng dụng'),
    },
    values: foodserviceValues,
    ingredient: {
      eyebrow: t('THE INGREDIENT', 'NGUYÊN LIỆU'),
      title: t('An Ingredient with Character', 'Nguyên liệu có cá tính'),
      text: t(
        'Fresh whole golden passion fruit, recognisable by its golden skin. A single ingredient that kitchens and bars can take in many directions, from the plate to the glass.',
        'Chanh dây vàng tươi nguyên quả, dễ nhận ra nhờ lớp vỏ vàng. Một nguyên liệu mà bếp và quầy bar có thể phát triển theo nhiều hướng, từ đĩa ăn đến ly đồ uống.',
      ),
      points: [
        t('Fresh whole fruit', 'Trái tươi nguyên quả'),
        t('Distinctive golden appearance', 'Vẻ ngoài vàng đặc trưng'),
        t('Versatile across food and beverage', 'Linh hoạt cho cả món ăn và đồ uống'),
      ],
      link: t('Request product specifications', 'Yêu cầu thông số sản phẩm'),
    },
    // The visual centerpiece (#applications). `id` picks the photograph in the view (`photos` in FoodserviceSegment.jsx): the beverage,
    // the dessert and the plated dish are AI-generated application illustrations, the supply card shows separated fruit in a carton.
    applications: {
      eyebrow: t('APPLICATIONS IN HOSPITALITY', 'ỨNG DỤNG TRONG KHÁCH SẠN & F&B'),
      title: t('From signature drinks to culinary creations.', 'Từ đồ uống đến ẩm thực sáng tạo.'),
      text: t(
        'Inspiration for your menu, bar and kitchen. These are ideas, not finished products from HMV and not HMV customers.',
        'Nguồn cảm hứng cho thực đơn, quầy bar và bếp của bạn. Đây là gợi ý, không phải sản phẩm thành phẩm hay khách hàng của HMV.',
      ),
      items: [
        { id: 'beverages', ...item('Signature beverages', 'Inspiration for juices, tea and mocktails.', 'Đồ uống đặc trưng', 'Gợi ý cho nước ép, trà và mocktail.') },
        { id: 'desserts', ...item('Refined desserts', 'Dessert ideas, not a finished HMV product.', 'Tráng miệng tinh tế', 'Gợi ý cho món tráng miệng, không phải sản phẩm thành phẩm của HMV.') },
        { id: 'culinary', ...item('Culinary creations', 'Potential savory and culinary applications.', 'Món ăn sáng tạo', 'Những ứng dụng mặn và ẩm thực có thể có.') },
        { id: 'supply', ...item('Hospitality supply', 'Discuss quantities and delivery requirements.', 'Cung ứng cho Hospitality', 'Trao đổi sản lượng và yêu cầu giao hàng.') },
      ],
    },
    origin: {
      eyebrow: t('FROM ORCHARD TO HOSPITALITY', 'TỪ VÙNG TRỒNG ĐẾN NHÀ HÀNG & KHÁCH SẠN'),
      title: t('It begins in a Vietnamese orchard', 'Mọi thứ bắt đầu từ một vùng trồng Việt Nam'),
      text: t(
        'Golden passion fruit is sourced from growing areas in Vietnam. For the orchard, the sorting and the quality evidence behind the fruit, see the buyer page.',
        'Chanh dây vàng được thu mua từ các vùng trồng tại Việt Nam. Về vùng trồng, công đoạn phân loại và bằng chứng chất lượng của trái, xem trang dành cho khách hàng nhập khẩu.',
      ),
      link: t('See sourcing and quality evidence', 'Xem nguồn hàng và bằng chứng chất lượng'),
    },
    supply: {
      eyebrow: t('PROFESSIONAL SUPPLY', 'CUNG ỨNG CHUYÊN NGHIỆP'),
      title: t('Professional Foodservice Supply', 'Cung ứng chuyên nghiệp cho F&B'),
      text: t('What to share with HMV so the supply can be discussed around your kitchen or venue.', 'Những gì cần chia sẻ với HMV để trao đổi cung ứng phù hợp với bếp hoặc cơ sở của bạn.'),
      items: [
        item('Required quantities', 'How much you expect to use.',
             'Sản lượng cần', 'Lượng bạn dự kiến sử dụng.'),
        item('Delivery destination', 'Where the fruit needs to arrive.',
             'Nơi giao hàng', 'Nơi trái cần được giao đến.'),
        item('Intended applications', 'The dishes or drinks you have in mind.',
             'Ứng dụng dự kiến', 'Các món ăn hoặc đồ uống bạn đang nghĩ đến.'),
        item('Product specifications', 'The size and selection that suit your use.',
             'Thông số sản phẩm', 'Kích cỡ và cách chọn lọc phù hợp với cách bạn sử dụng.'),
        item('Purchasing frequency', 'One order or a regular need.',
             'Tần suất mua', 'Một đơn hàng hay nhu cầu thường xuyên.'),
        item('Packaging requirements', 'How you need the fruit packed.',
             'Yêu cầu đóng gói', 'Cách bạn cần đóng gói trái.'),
      ],
      note: t('Availability, quantities and delivery are confirmed with each inquiry.', 'Nguồn hàng, sản lượng và giao hàng được xác nhận theo từng yêu cầu.'),
    },
    faq: {
      title: t('Foodservice questions', 'Câu hỏi của khách hàng F&B'),
      text: t('For purchasing managers, chefs and beverage teams.', 'Dành cho bộ phận thu mua, bếp trưởng và đội ngũ đồ uống.'),
      items: [
        item('What does HMV supply to foodservice businesses?', 'Fresh whole golden passion fruit from Vietnam. HMV does not supply juice, purée or finished drinks on this page.',
             'HMV cung ứng gì cho doanh nghiệp F&B?', 'Chanh dây vàng tươi nguyên quả từ Việt Nam. Trên trang này, HMV không cung cấp nước ép, cốt hay đồ uống thành phẩm.'),
        item('How do I start a supply discussion?', 'Open the HMV Trade Desk and tell us the product, your destination and the quantity you expect. Applications, packaging and frequency can follow.',
             'Làm sao để bắt đầu trao đổi cung ứng?', 'Mở HMV Trade Desk và cho chúng tôi biết sản phẩm, nơi giao hàng và sản lượng dự kiến. Ứng dụng, đóng gói và tần suất có thể trao đổi sau.'),
        item('Can I get product specifications?', 'Yes. Ask for them through the Trade Desk; HMV provides what is confirmed for your inquiry and does not publish values that are not verified.',
             'Tôi có thể nhận thông số sản phẩm không?', 'Có. Hãy hỏi qua Trade Desk; HMV cung cấp những thông tin đã xác nhận cho yêu cầu của bạn và không công bố các giá trị chưa được xác minh.'),
        item('What packaging is available?', 'Packaging is discussed for your use. Divided cartons and protective nets are examples; the format is agreed in the proposal.',
             'Có những quy cách đóng gói nào?', 'Quy cách đóng gói được trao đổi theo cách bạn sử dụng. Thùng có ngăn và lưới bảo vệ là các ví dụ; quy cách được thống nhất trong đề xuất.'),
        item('Is there a minimum order or a delivery schedule?', 'None is promised on this page. Quantities, frequency and delivery are confirmed for each inquiry.',
             'Có đơn hàng tối thiểu hay lịch giao cố định không?', 'Trang này không cam kết điều đó. Sản lượng, tần suất và giao hàng được xác nhận theo từng yêu cầu.'),
      ],
    },
    cta: {
      title: t('Bring Something Exceptional to Your Menu.', 'Mang đến điều đặc biệt cho thực đơn của bạn.'),
      text: t('Start with a conversation about your kitchen, your bar and your supply needs.', 'Hãy bắt đầu bằng một cuộc trao đổi về bếp, quầy bar và nhu cầu cung ứng của bạn.'),
      button: t('Become a Foodservice Partner', 'Trở thành đối tác F&B'),
    },
  },

  // ─────────────────────────────── Premium Retail Business ───────────────────────────────
  retail: {
    seo: {
      title: t('Golden Passion Fruit for Retail Businesses', 'Chanh dây vàng cho đối tác bán lẻ'),
      description: t(
        'Fresh golden passion fruit from Vietnam for supermarkets, specialty fruit retailers, distributors and gifting businesses. Discuss volume and packaging with HMV.',
        'Chanh dây vàng tươi Việt Nam cho siêu thị, cửa hàng trái cây đặc sản, nhà phân phối và doanh nghiệp quà tặng. Trao đổi sản lượng và đóng gói cùng HMV.',
      ),
    },
    hero: {
      eyebrow: t('HMV GOLDEN PASSION FRUIT — RETAIL BUSINESS', 'HMV CHANH DÂY VÀNG — ĐỐI TÁC BÁN LẺ'),
      title: t('Distinctive Fruit. Distinguished Shelves.', 'Trái cây khác biệt. Giá trị tại điểm bán.'),
      lead: t(
        'Fresh golden passion fruit for retailers and distributors who value origin, product presentation and packaging options.',
        'Chanh dây vàng tươi cho các đối tác phân phối và bán lẻ chú trọng nguồn gốc, hình thức sản phẩm và quy cách đóng gói.',
      ),
      primary: t('Discuss a Retail Partnership', 'Trao đổi hợp tác phân phối'),
      secondary: t('Explore Packaging', 'Khám phá quy cách đóng gói'),
    },
    values: retailValues,
    presentation: {
      eyebrow: t('PRODUCT PRESENTATION', 'HÌNH THỨC SẢN PHẨM'),
      title: t('A fruit that stands out on the shelf', 'Một loại trái cây nổi bật trên quầy'),
      text: t(
        'Whole golden passion fruit with a clear golden skin, shown here in illustrative product images. Further product details are provided with your inquiry.',
        'Chanh dây vàng nguyên quả với lớp vỏ vàng rõ nét, được thể hiện ở đây bằng hình ảnh minh họa sản phẩm. Các thông tin sản phẩm khác được cung cấp kèm yêu cầu của bạn.',
      ),
      facts: [
        [t('Product', 'Sản phẩm'), t('Fresh whole golden passion fruit', 'Chanh dây vàng tươi nguyên quả')],
        [t('Appearance', 'Hình thức'), t('Golden skin, whole fruit', 'Vỏ vàng, nguyên quả')],
        [t('Origin', 'Xuất xứ'), t('Vietnam', 'Việt Nam')],
        [t('Further details', 'Thông tin khác'), t('Provided with your inquiry', 'Cung cấp kèm yêu cầu của bạn')],
      ],
    },
    packaging: {
      eyebrow: t('PACKAGING & PRESENTATION', 'ĐÓNG GÓI & TRƯNG BÀY'),
      title: t('Packaging & Presentation', 'Đóng gói & trưng bày'),
      text: t(
        'Illustrative formats for protecting and presenting golden passion fruit. They are packaging presentation references, not confirmed HMV packaging or pack sizes.',
        'Các định dạng minh họa cách bảo vệ và trưng bày chanh dây vàng. Đây là hình ảnh tham khảo về cách đóng gói, không phải bao bì hay quy cách đóng gói đã xác nhận của HMV.',
      ),
      items: [
        item('Individual fruit protection', 'Foam nets around each fruit.',
             'Bảo vệ từng trái', 'Lưới xốp bao quanh mỗi trái.'),
        item('Compartmentalised cartons', 'One fruit per compartment, in cartons with divided trays.',
             'Thùng có ngăn', 'Mỗi trái một ngăn, trong thùng có khay chia ngăn.'),
        item('Premium fruit display', 'Fruit presented on a display stand.',
             'Trưng bày trái cây cao cấp', 'Trái được trưng bày trên kệ.'),
      ],
      note: t(
        'Pack sizes and private-label options are not offered on this page. Packaging arrangements are subject to buyer requirements: ask HMV what is available for your channel.',
        'Trang này không đưa ra quy cách đóng gói hay tùy chọn nhãn riêng. Cách đóng gói tùy theo yêu cầu của khách hàng: hãy hỏi HMV về những gì có thể đáp ứng cho kênh của bạn.',
      ),
    },
    opportunities: {
      eyebrow: t('RETAIL OPPORTUNITIES', 'CƠ HỘI BÁN LẺ'),
      title: t('Where golden passion fruit can fit', 'Chanh dây vàng có thể phù hợp ở đâu'),
      items: [
        item('Premium supermarkets & gourmet grocery', 'A distinctive fresh fruit for a premium produce section, where presentation and origin matter.',
             'Siêu thị cao cấp & cửa hàng thực phẩm gourmet', 'Một loại trái cây tươi khác biệt cho quầy rau quả cao cấp, nơi hình thức và nguồn gốc được coi trọng.'),
        item('Specialty fruit retailers', 'A golden fruit to set a specialist range apart from standard fruit offers.',
             'Cửa hàng trái cây đặc sản', 'Một loại trái vàng giúp danh mục đặc sản khác biệt so với trái cây thông thường.'),
        item('Distributors & gifting businesses', 'Fresh fruit for distributors, and for businesses that assemble premium fruit gifts.',
             'Nhà phân phối & doanh nghiệp quà tặng', 'Trái cây tươi cho nhà phân phối và doanh nghiệp làm quà tặng trái cây cao cấp.'),
      ],
    },
    origin: {
      eyebrow: t('ORIGIN BEHIND THE PRODUCT', 'NGUỒN GỐC SẢN PHẨM'),
      title: t('Presentation starts in the orchard', 'Hình thức sản phẩm bắt đầu từ vùng trồng'),
      text: t(
        'Fruit grown in Vietnamese growing areas and sorted by hand before packing. The buyer page shows the orchard, the sorting and the product specification in more detail.',
        'Trái được trồng tại các vùng trồng ở Việt Nam và phân loại thủ công trước khi đóng gói. Trang dành cho khách hàng nhập khẩu trình bày chi tiết hơn về vùng trồng, công đoạn phân loại và thông số sản phẩm.',
      ),
      links: [t('Sourcing and orchard', 'Nguồn hàng và vùng trồng'), t('Product specification', 'Thông số sản phẩm')],
    },
    partnership: {
      eyebrow: t('COMMERCIAL PARTNERSHIP', 'HỢP TÁC THƯƠNG MẠI'),
      title: t('A clear way to start', 'Một cách bắt đầu rõ ràng'),
      text: t('Tell HMV about your business in a few points. Details follow in the conversation.', 'Hãy cho HMV biết vài điểm về doanh nghiệp của bạn. Chi tiết sẽ được trao đổi tiếp trong cuộc trò chuyện.'),
      note: t('HMV does not publish prices, price tiers or margins on this page.', 'HMV không công bố giá, bậc giá hay biên lợi nhuận trên trang này.'),
      items: [
        item('Purchasing volume', 'The quantity you expect to buy.',
             'Sản lượng mua', 'Lượng bạn dự kiến mua.'),
        item('Product specifications', 'The product details your range needs.',
             'Thông số sản phẩm', 'Thông tin sản phẩm mà danh mục của bạn cần.'),
        item('Packaging needs', 'How the fruit should be packed and presented.',
             'Nhu cầu đóng gói', 'Cách trái cần được đóng gói và trưng bày.'),
        item('Destination', 'Where the fruit needs to be delivered.',
             'Nơi giao hàng', 'Nơi trái cần được giao đến.'),
        item('Purchasing frequency', 'A single order or a regular supply.',
             'Tần suất mua', 'Một đơn hàng hay nguồn cung thường xuyên.'),
        item('Distribution requirements', 'How the fruit reaches your stores or customers.',
             'Yêu cầu phân phối', 'Cách trái đến cửa hàng hoặc khách hàng của bạn.'),
      ],
    },
    faq: {
      text: t('For category buyers, distributors and gifting businesses.', 'Dành cho bộ phận mua hàng, nhà phân phối và doanh nghiệp quà tặng.'),
      title: t('Retail business questions', 'Câu hỏi của đối tác bán lẻ'),
      items: [
        item('Who is this page for?', 'Businesses: retailers, distributors and gifting companies. HMV does not sell to individual shoppers.',
             'Trang này dành cho ai?', 'Dành cho doanh nghiệp: nhà bán lẻ, nhà phân phối và công ty quà tặng. HMV không bán cho người mua lẻ cá nhân.'),
        item('What does HMV supply?', 'Fresh whole golden passion fruit from Vietnam. Processed products are not part of this offer.',
             'HMV cung ứng gì?', 'Chanh dây vàng tươi nguyên quả từ Việt Nam. Sản phẩm chế biến không nằm trong phần chào hàng này.'),
        item('Is HMV-branded or private-label packaging available?', 'Not confirmed. The packaging shown is a market reference. Ask HMV what can be arranged for your channel.',
             'Có bao bì mang nhãn HMV hoặc nhãn riêng không?', 'Chưa được xác nhận. Bao bì trong ảnh chỉ là tham khảo thị trường. Hãy hỏi HMV những gì có thể sắp xếp cho kênh của bạn.'),
        item('How do I ask about volume and specifications?', 'Open the HMV Trade Desk and share your volume, destination and packaging needs. HMV replies with what is confirmed for your inquiry.',
             'Làm sao để hỏi về sản lượng và thông số?', 'Mở HMV Trade Desk và chia sẻ sản lượng, nơi giao hàng và nhu cầu đóng gói. HMV phản hồi với những gì đã xác nhận cho yêu cầu của bạn.'),
        item('Can I see prices here?', 'No. Commercial terms are discussed with each business once the requirement is clear.',
             'Tôi có thể xem giá tại đây không?', 'Không. Điều kiện thương mại được trao đổi với từng doanh nghiệp khi yêu cầu đã rõ.'),
      ],
    },
    cta: {
      title: t('Bring the Golden Taste of Vietnam to Your Market.', 'Mang hương vị vàng của Việt Nam đến thị trường của bạn.'),
      button: t('Become a Retail Partner', 'Trở thành đối tác bán lẻ'),
      text: t('Share your market and your range. HMV will take it from there.', 'Hãy chia sẻ về thị trường và danh mục của bạn. HMV sẽ tiếp tục từ đó.'),
    },
  },
};

export const passionFruitPages = { en: resolve(content, 'en'), vi: resolve(content, 'vi') };

/** Title and description of a segment's page, without the " | HMV Global" suffix both builds add. */
export const passionFruitMeta = (lang, segment = 'export') => (own(passionFruitPages[lang], segment) ?? passionFruitPages[lang].export).seo;
