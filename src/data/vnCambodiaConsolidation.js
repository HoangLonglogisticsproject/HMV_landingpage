// The Vietnam–Cambodia consolidation page (/logistics/vietnam-cambodia-consolidation): B2B less-than-truckload cargo
// between Vietnam and Cambodia, for manufacturers, exporters, importers, traders and distributors whose recurring
// shipments do not fill a dedicated truck. Rendered by views/consolidation/ConsolidationView.jsx; its form by
// RouteAssessmentForm.jsx. /logistics stays the logistics capability hub and links here.
// Operational wording is HMV's consolidator workflow and nothing more: receive, check and count, classify, consolidate,
// pack, label and palletize where applicable, stage by trip, hand cargo and documents over to the border and partner
// execution, follow status, confirm delivery. Not asserted: an HMV warehouse or CFS at the border, a departure
// schedule, a transit time, DDP, a customs clearance time, a warehouse size or location, rates, customers.
// Customs statements stay general: the procedures depend on the cargo and the rules in force, and the authorities clear.
//
// One content tree; only text leaves are localized, `t(en, vi)`, resolved per language.
const t = (en, vi) => lang => (lang === 'vi' ? vi : en);
const resolve = (node, lang) => {
  if (typeof node === 'function') return node(lang);
  if (Array.isArray(node)) return node.map(n => resolve(n, lang));
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolve(v, lang)]));
  return node;
};
const item = (en, vi) => ({ title: t(en[0], vi[0]), text: t(en[1], vi[1]) });

const content = {
  seo: {
    title: t('Vietnam–Cambodia LTL Consolidation & Cross-Border Freight', 'Ghép hàng Việt Nam – Campuchia & vận chuyển xuyên biên giới'),
    description: t(
      'B2B less-than-truckload consolidation between Vietnam and Cambodia: cargo checked, consolidated and staged by trip, with a route assessment for each shipment.',
      'Dịch vụ ghép hàng lẻ B2B Việt Nam – Campuchia: hàng được kiểm đếm, ghép chuyến theo lịch đã lên kế hoạch và đánh giá tuyến cho từng lô hàng.',
    ),
  },
  hero: {
    eyebrow: t('HMV GLOBAL · SUPPLY-CHAIN EXECUTION', 'HMV GLOBAL · THỰC THI CHUỖI CUNG ỨNG'),
    h1: t('Vietnam–Cambodia Cross-Border Consolidation for B2B Shipments', 'Ghép hàng Việt Nam – Campuchia cho lô hàng B2B'),
    lead: t(
      'For manufacturers, exporters, importers, traders and distributors whose recurring commercial shipments do not fill a dedicated truck. HMV consolidates cargo into planned cross-border trips between Vietnam and Cambodia and coordinates its hand-over to the border and partner execution.',
      'Dành cho nhà sản xuất, doanh nghiệp xuất nhập khẩu, thương mại và phân phối có lô hàng thương mại định kỳ chưa đủ một xe riêng. HMV ghép hàng vào các chuyến xuyên biên giới Việt Nam – Campuchia đã lên kế hoạch và điều phối việc bàn giao hàng cho khâu thực hiện tại biên giới và đối tác.',
    ),
    cta: t('Request a route assessment', 'Yêu cầu đánh giá tuyến'),
    secondary: t('All logistics capabilities', 'Toàn bộ năng lực logistics'),
    points: [
      t('Commercial B2B cargo, not parcels', 'Hàng thương mại B2B, không nhận bưu kiện'),
      t('Less-than-truckload (LTL) loads', 'Hàng lẻ, ghép chuyến (LTL)'),
      t('Route assessed for each shipment', 'Đánh giá tuyến cho từng lô hàng'),
      t('Status followed to delivery', 'Theo dõi trạng thái đến khi giao hàng'),
    ],
    panel: {
      title: t('What a route assessment covers', 'Nội dung đánh giá tuyến'),
      items: [
        t('Pickup and delivery points in Vietnam and Cambodia', 'Điểm nhận và điểm giao tại Việt Nam và Campuchia'),
        t('Cargo type, packaging and handling', 'Loại hàng, quy cách đóng gói và yêu cầu xếp dỡ'),
        t('Weight, volume (CBM) and frequency', 'Trọng lượng, thể tích (CBM) và tần suất'),
        t('Border gate and documents for the shipment', 'Cửa khẩu và chứng từ cho lô hàng'),
      ],
      note: t('Rate, timing and acceptance are confirmed after the assessment.', 'Giá, thời gian và việc nhận hàng được xác nhận sau khi đánh giá.'),
    },
  },
  audience: {
    title: t('Who this service is for', 'Dịch vụ dành cho ai'),
    text: t('Commercial cargo between businesses. HMV does not carry consumer parcels.', 'Hàng thương mại giữa doanh nghiệp với doanh nghiệp. HMV không nhận bưu kiện cá nhân.'),
    items: [
      item(['Manufacturers', 'Materials, components and finished goods moving between factories, suppliers and customers in Vietnam and Cambodia.'],
        ['Nhà sản xuất', 'Nguyên vật liệu, linh kiện và thành phẩm luân chuyển giữa nhà máy, nhà cung cấp và khách hàng tại Việt Nam và Campuchia.']),
      item(['Exporters and importers', 'Cross-border commercial shipments that need consolidating before the border and coordinated documents.'],
        ['Doanh nghiệp xuất nhập khẩu', 'Lô hàng thương mại xuyên biên giới cần được gom trước khi qua biên giới, với chứng từ được điều phối.']),
      item(['Traders and distributors', 'Stock for customers or warehouses on the other side of the border.'],
        ['Doanh nghiệp thương mại và phân phối', 'Hàng bổ sung cho khách hàng hoặc kho ở phía bên kia biên giới.']),
      item(['Recurring shipments', 'Regular volumes too small for a dedicated truck but steady enough to plan by trip.'],
        ['Lô hàng định kỳ', 'Sản lượng đều đặn, chưa đủ một xe riêng nhưng đủ ổn định để lên kế hoạch theo chuyến.']),
    ],
  },
  fit: {
    title: t('When consolidation (LTL) makes sense', 'Khi nào nên ghép hàng (LTL)'),
    text: t(
      "A consolidated trip carries several shippers' cargo; a dedicated truck (FTL) carries one shipper's cargo only.",
      'Một chuyến ghép chở hàng của nhiều chủ hàng; xe nguyên chuyến (FTL) chỉ chở hàng của một chủ hàng.',
    ),
    ltl: {
      title: t('Consolidation usually fits when', 'Ghép hàng thường phù hợp khi'),
      items: [
        t('The shipment fills only part of a truck', 'Lô hàng chỉ chiếm một phần xe'),
        t('Shipments repeat, weekly or monthly', 'Hàng đi định kỳ, hằng tuần hoặc hằng tháng'),
        t('The cargo is packed to travel with other cargo: cartons, pallets, bags', 'Hàng được đóng gói để đi chung với hàng khác: thùng carton, pallet, bao'),
        t('The cost per shipment matters more than a dedicated departure', 'Chi phí mỗi lô quan trọng hơn một chuyến khởi hành riêng'),
      ],
    },
    ftl: {
      title: t('A dedicated truck may fit better when', 'Xe nguyên chuyến có thể phù hợp hơn khi'),
      items: [
        t('The cargo fills most of a truck', 'Hàng gần đầy một xe'),
        t('The cargo needs its own departure time', 'Hàng cần thời điểm khởi hành riêng'),
        t('The cargo cannot be handled or stored with other cargo', 'Hàng không thể xếp dỡ hoặc lưu cùng hàng khác'),
        t('The cargo needs special equipment or conditions', 'Hàng cần thiết bị hoặc điều kiện đặc biệt'),
      ],
    },
    note: t('HMV recommends one or the other after the route assessment.', 'HMV đề xuất phương án phù hợp sau khi đánh giá tuyến.'),
  },
  workflow: {
    title: t('How the consolidation workflow works', 'Quy trình ghép hàng'),
    text: t(
      'HMV coordinates each step with the receiving point, the border and the partners that execute the trip.',
      'HMV điều phối từng bước với điểm nhận hàng, khâu biên giới và các đối tác thực hiện chuyến hàng.',
    ),
    steps: [
      item(['Receive', 'Cargo is received at the agreed receiving point.'], ['Nhận hàng', 'Hàng được nhận tại điểm nhận đã thống nhất.']),
      item(['Check and count', "Packages are checked and counted against the shipper's documents."], ['Kiểm đếm', 'Kiện hàng được kiểm tra và đếm theo chứng từ của chủ hàng.']),
      item(['Classify', 'Cargo is sorted by destination, type and handling.'], ['Phân loại', 'Hàng được phân loại theo điểm đến, loại hàng và yêu cầu xếp dỡ.']),
      item(['Consolidate', 'Shipments on the same route are combined into one trip.'], ['Ghép hàng', 'Các lô cùng tuyến được ghép vào một chuyến.']),
      item(['Pack, label, palletize', 'Where the cargo needs it.'], ['Đóng gói, dán nhãn, pallet', 'Khi hàng cần.']),
      item(['Stage by trip', 'Consolidated cargo is staged for its planned trip.'], ['Tập kết theo chuyến', 'Hàng đã ghép được tập kết cho chuyến đã lên kế hoạch.']),
      item(['Hand over at the border', 'Cargo and documents go to the border and partner execution.'], ['Bàn giao tại biên giới', 'Hàng và chứng từ được bàn giao cho khâu thực hiện tại biên giới và đối tác.']),
      item(['Follow status', 'HMV follows the shipment and keeps the shipper informed.'], ['Theo dõi trạng thái', 'HMV theo dõi lô hàng và cập nhật cho chủ hàng.']),
      item(['Confirm delivery', 'Delivery is confirmed to the shipper.'], ['Xác nhận giao hàng', 'Việc giao hàng được xác nhận với chủ hàng.']),
    ],
  },
  corridor: {
    title: t('The Vietnam–Cambodia corridor and route assessment', 'Hành lang Việt Nam – Campuchia và đánh giá tuyến'),
    text: t(
      'Road freight between Vietnam and Cambodia crosses at international border gates. Moc Bai (Tay Ninh) – Bavet is the road crossing between Ho Chi Minh City and Phnom Penh; another gate is assessed when the pickup or delivery point makes it the better route.',
      'Hàng vận chuyển đường bộ giữa Việt Nam và Campuchia đi qua các cửa khẩu quốc tế. Mộc Bài (Tây Ninh) – Bavet là cửa khẩu đường bộ trên tuyến TP. Hồ Chí Minh – Phnom Penh; cửa khẩu khác được đánh giá khi điểm nhận hoặc điểm giao phù hợp hơn với tuyến đó.',
    ),
    items: [
      item(['Pickup and delivery points', 'Where the cargo starts and ends, in Vietnam and in Cambodia.'], ['Điểm nhận và điểm giao', 'Nơi hàng bắt đầu và kết thúc hành trình, tại Việt Nam và Campuchia.']),
      item(['Border gate', 'The gate that suits the route and the cargo, confirmed for each shipment.'], ['Cửa khẩu', 'Cửa khẩu phù hợp với tuyến và loại hàng, được xác nhận cho từng lô.']),
      item(['Cargo and documents', 'What the cargo is and which documents its customs procedures need.'], ['Hàng hóa và chứng từ', 'Loại hàng và các chứng từ mà thủ tục hải quan của lô hàng cần.']),
      item(['Trip planning', 'How the shipment fits the planned consolidated trips.'], ['Kế hoạch chuyến', 'Lô hàng được xếp vào các chuyến ghép đã lên kế hoạch như thế nào.']),
    ],
    hub: t("HMV's border gates and wider logistics capabilities", 'Các cửa khẩu và năng lực logistics của HMV'),
  },
  info: {
    title: t('Information HMV needs to assess a shipment', 'Thông tin HMV cần để đánh giá lô hàng'),
    text: t(
      'The more of it you share, the sooner HMV can confirm whether and how the shipment can be consolidated.',
      'Bạn cung cấp càng đầy đủ, HMV càng sớm xác nhận lô hàng có thể ghép hay không và ghép như thế nào.',
    ),
    items: [
      t('Pickup location (city or province)', 'Điểm nhận hàng (thành phố hoặc tỉnh)'),
      t('Delivery location', 'Điểm giao hàng'),
      t('Cargo description, and the HS code if known', 'Mô tả hàng hóa, và mã HS nếu có'),
      t('Packaging: cartons, pallets, bags or other', 'Quy cách đóng gói: thùng carton, pallet, bao hoặc khác'),
      t('Gross weight and volume (CBM) per shipment', 'Trọng lượng cả bì và thể tích (CBM) mỗi lô'),
      t('Expected frequency', 'Tần suất dự kiến'),
      t('Target pickup date', 'Ngày dự kiến nhận hàng'),
      t('Documents available, such as the commercial invoice and packing list', 'Chứng từ hiện có, ví dụ hóa đơn thương mại và phiếu đóng gói'),
    ],
  },
  boundaries: {
    title: t('Operational boundaries', 'Phạm vi vận hành'),
    text: t('Every shipment is confirmed after the route assessment. In particular:', 'Mỗi lô hàng được xác nhận sau khi đánh giá tuyến. Cụ thể:'),
    items: [
      t('HMV handles commercial B2B cargo, not consumer parcels.', 'HMV nhận hàng thương mại B2B, không nhận bưu kiện cá nhân.'),
      t(
        'Dangerous goods, temperature-controlled, oversized or high-value cargo, and goods under import or export controls, are subject to confirmation for each shipment.',
        'Hàng nguy hiểm, hàng cần kiểm soát nhiệt độ, hàng quá khổ, hàng giá trị cao và hàng thuộc diện quản lý xuất nhập khẩu được xem xét và xác nhận riêng cho từng lô.',
      ),
      t('Departure dates and transit times are confirmed per shipment; none is fixed in advance.', 'Ngày khởi hành và thời gian vận chuyển được xác nhận theo từng lô; không có lịch cố định trước.'),
      t(
        'The customs procedures and documents a shipment needs depend on the cargo and the rules in force; HMV confirms them for each shipment, and clearance is decided by the authorities.',
        'Thủ tục hải quan và chứng từ của lô hàng phụ thuộc vào loại hàng và quy định hiện hành; HMV xác nhận cho từng lô, và việc thông quan do cơ quan có thẩm quyền quyết định.',
      ),
      t('Rates are quoted after the assessment, for the cargo and route assessed.', 'Giá được báo sau khi đánh giá, theo loại hàng và tuyến đã đánh giá.'),
    ],
  },
  faq: {
    title: t('Frequently asked questions', 'Câu hỏi thường gặp'),
    items: [
      {
        q: t('What is cross-border consolidation between Vietnam and Cambodia?', 'Ghép hàng đi Campuchia là gì?'),
        a: t(
          'Consolidation combines shipments going the same way into one trip, so each shipper uses part of a truck rather than a whole one. HMV receives, checks and stages the cargo, then coordinates its hand-over to the border and partner execution.',
          'Ghép hàng là gom các lô hàng cùng tuyến vào một chuyến, để mỗi chủ hàng chỉ sử dụng một phần xe thay vì cả xe. HMV nhận, kiểm đếm và tập kết hàng, sau đó điều phối việc bàn giao cho khâu thực hiện tại biên giới và đối tác.',
        ),
      },
      {
        q: t('Is this a parcel or courier service?', 'Đây có phải dịch vụ chuyển phát bưu kiện không?'),
        a: t(
          'No. HMV handles commercial cargo between businesses: manufacturers, exporters, importers, traders and distributors.',
          'Không. HMV nhận hàng thương mại giữa các doanh nghiệp: nhà sản xuất, doanh nghiệp xuất nhập khẩu, thương mại và phân phối.',
        ),
      },
      {
        q: t('What is the difference between LTL and FTL?', 'Hàng lẻ (LTL) và nguyên xe (FTL) khác nhau thế nào?'),
        a: t(
          "LTL (less than truckload) shares a truck with other shippers' cargo; FTL (full truckload) is a truck for one shipper. LTL usually suits smaller, recurring shipments; FTL suits cargo that fills a truck or needs its own departure.",
          'Hàng lẻ (LTL) đi chung xe với hàng của chủ hàng khác; nguyên xe (FTL) là xe dành riêng cho một chủ hàng. LTL thường phù hợp với lô nhỏ, đi định kỳ; FTL phù hợp với hàng gần đầy xe hoặc cần khởi hành riêng.',
        ),
      },
      {
        q: t('How long does a shipment take?', 'Một lô hàng đi mất bao lâu?'),
        a: t(
          'It depends on the route, the border gate, the cargo and its customs procedures. HMV confirms the expected timing for each shipment after the route assessment; there is no fixed transit time.',
          'Thời gian phụ thuộc vào tuyến, cửa khẩu, loại hàng và thủ tục hải quan. HMV xác nhận thời gian dự kiến cho từng lô sau khi đánh giá tuyến; không có thời gian vận chuyển cố định.',
        ),
      },
      {
        q: t('Does HMV handle customs clearance?', 'HMV có làm thủ tục hải quan không?'),
        a: t(
          'HMV coordinates the documents and the hand-over of the cargo to the border and partner execution. Which procedures and documents apply depends on the cargo and the rules in force; clearance itself is decided by the customs authorities.',
          'HMV điều phối chứng từ và việc bàn giao hàng cho khâu thực hiện tại biên giới và đối tác. Thủ tục và chứng từ áp dụng phụ thuộc vào loại hàng và quy định hiện hành; việc thông quan do cơ quan hải quan quyết định.',
        ),
      },
      {
        q: t('How do I get a rate?', 'Làm sao để nhận báo giá?'),
        a: t(
          'Send the route assessment request below with the pickup and delivery points, the cargo and its volume. HMV reviews the shipment and follows up with how it can be handled and its rate.',
          'Gửi yêu cầu đánh giá tuyến bên dưới với điểm nhận, điểm giao, loại hàng và khối lượng. HMV xem xét lô hàng và phản hồi phương án vận chuyển cùng giá.',
        ),
      },
    ],
  },
  form: {
    title: t('Request a route assessment', 'Yêu cầu đánh giá tuyến'),
    lead: t(
      'Tell HMV what you ship and where. HMV reviews the route and the cargo, then follows up by email or phone.',
      'Cho HMV biết bạn cần vận chuyển gì và đi đâu. HMV xem xét tuyến và hàng hóa, sau đó liên hệ lại qua email hoặc điện thoại.',
    ),
    groups: { shipment: t('Shipment', 'Lô hàng'), contact: t('Contact', 'Liên hệ') },
    labels: {
      origin: t('Origin (pickup)', 'Điểm nhận hàng'),
      destination: t('Destination (delivery)', 'Điểm giao hàng'),
      cargo: t('Cargo description', 'Mô tả hàng hóa'),
      volume: t('Weight / CBM / shipment volume', 'Trọng lượng / CBM / khối lượng lô hàng'),
      frequency: t('Expected frequency', 'Tần suất dự kiến'),
      notes: t('Notes', 'Ghi chú'),
      company: t('Company', 'Công ty'),
      name: t('Contact name', 'Người liên hệ'),
      email: t('Business email', 'Email doanh nghiệp'),
      phone: t('WhatsApp / phone', 'WhatsApp / điện thoại'),
    },
    hints: {
      origin: t('e.g. Binh Duong, Vietnam', 'VD: Bình Dương, Việt Nam'),
      destination: t('e.g. Phnom Penh, Cambodia', 'VD: Phnom Penh, Campuchia'),
      cargo: t('Goods, packaging (cartons, pallets, bags), special handling', 'Hàng hóa, quy cách đóng gói (thùng, pallet, bao), yêu cầu xếp dỡ đặc biệt'),
      volume: t('e.g. 4 pallets, 2.5 CBM, 900 kg', 'VD: 4 pallet, 2,5 CBM, 900 kg'),
      frequency: t('e.g. weekly, twice a month', 'VD: hằng tuần, 2 lần/tháng'),
    },
    optional: t('optional', 'không bắt buộc'),
    consent: t('HMV may contact me about this request.', 'Tôi đồng ý để HMV liên hệ về yêu cầu này.'),
    privacy: t('Privacy notice', 'Thông báo quyền riêng tư'),
    submit: t('Request route assessment', 'Gửi yêu cầu đánh giá tuyến'),
    sending: t('Sending…', 'Đang gửi…'),
    errors: {
      origin: t('Enter the pickup location.', 'Nhập điểm nhận hàng.'),
      destination: t('Enter the delivery location.', 'Nhập điểm giao hàng.'),
      cargo: t('Describe the cargo.', 'Mô tả hàng hóa.'),
      volume: t('Enter the weight, CBM or shipment volume.', 'Nhập trọng lượng, CBM hoặc khối lượng lô hàng.'),
      frequency: t('Shorten this answer.', 'Rút gọn câu trả lời này.'),
      notes: t('Shorten this answer.', 'Rút gọn câu trả lời này.'),
      'contact.company': t('Enter your company name.', 'Nhập tên công ty.'),
      'contact.email': t('Enter a valid business email.', 'Nhập email doanh nghiệp hợp lệ.'),
      'contact.name': t('Shorten this answer.', 'Rút gọn câu trả lời này.'),
      'contact.phone': t('Use digits, spaces and + ( ) - only.', 'Chỉ dùng chữ số, khoảng trắng và + ( ) -.'),
      'consent.contact': t('Confirm that HMV may contact you.', 'Xác nhận HMV có thể liên hệ với bạn.'),
    },
    sent: {
      title: t('Request sent to HMV', 'Đã gửi yêu cầu đến HMV'),
      text: t('HMV reviews the route and the cargo, then follows up. Your reference:', 'HMV sẽ xem xét tuyến và hàng hóa, sau đó liên hệ lại. Mã tham chiếu của bạn:'),
      another: t('Send another request', 'Gửi yêu cầu khác'),
    },
    failed: {
      text: t('The request could not be sent. Your answers are kept.', 'Chưa gửi được yêu cầu. Thông tin bạn nhập vẫn được giữ.'),
      retry: t('Try again', 'Thử lại'),
      email: t('Prepare an email instead', 'Soạn email thay thế'),
    },
  },
};

export const vnCambodiaConsolidation = { en: resolve(content, 'en'), vi: resolve(content, 'vi') };
