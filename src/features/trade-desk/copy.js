// HMV Trade Desk wording. Each entry pairs its English and Vietnamese text, t(en, vi); a plain string is the same in
// both languages. HMV speaks as an experienced seller: three questions, then the route; no technical questionnaire,
// no promises of price, availability or delivery.
const t = (en, vi) => ({ en, vi });
const isPair = v => Object.keys(v).length === 2 && 'en' in v && 'vi' in v;

const COPY = {
  deskName: 'HMV Trade Desk',
  description: t('B2B Agricultural Supply Desk', 'Trợ lý giao thương & cung ứng nông sản'),
  close: t('Close', 'Đóng'),
  language: t('Language', 'Ngôn ngữ'),
  conversation: t('Conversation with HMV', 'Trao đổi với HMV'),
  you: t('You', 'Bạn'),
  askProduct: t('What product are you looking for?', 'Anh/chị đang tìm sản phẩm nào?'),
  productInput: t('Product', 'Sản phẩm'),
  productPlaceholder: t('e.g. dried cassava chips', 'VD: sắn lát khô'),
  productChoices: t('HMV products', 'Sản phẩm HMV'),
  productUnclear: t(
    'Which HMV product is closest to your requirement?',
    'Sản phẩm nào của HMV gần nhất với nhu cầu của anh/chị?',
  ),
  askDestination: t('Where would you like the goods delivered?', 'Anh/chị cần giao hàng đến đâu?'),
  destinationInput: t('Delivery destination', 'Nơi giao hàng'),
  destinationPlaceholder: t('City, country or port', 'Thành phố, quốc gia hoặc cảng'),
  askVolume: t('What volume are you planning to purchase?', 'Anh/chị dự kiến mua với sản lượng bao nhiêu?'),
  volumeInput: t('Expected volume', 'Sản lượng dự kiến'),
  volumePlaceholder: t('e.g. 2,000', 'VD: 2.000'),
  unit: t('Unit', 'Đơn vị'),
  answer: t('Send', 'Gửi'),
  exploring: t("I'm still exploring", 'Tôi đang tìm hiểu'),
  ready: [
    t(
      'Thank you. I have enough information to open a commercial inquiry for this requirement.',
      'Cảm ơn anh/chị. HMV đã có đủ thông tin cơ bản để mở yêu cầu thương mại cho nhu cầu này.',
    ),
    t(
      'HMV can now review the supply requirement and continue directly with our Sales team for quotation.',
      'Bộ phận Sales có thể tiếp tục đánh giá khả năng cung ứng và chuẩn bị báo giá.',
    ),
  ],
  requestQuotation: t('Request Quotation', 'Yêu cầu báo giá'),
  discovery: t(
    'No problem. HMV Customer Service can help clarify your requirement and connect you with the appropriate commercial team.',
    'Không vấn đề. Customer Service HMV có thể hỗ trợ anh/chị làm rõ nhu cầu trước khi chuyển sang bước thương mại phù hợp.',
  ),
  discuss: t('Discuss with HMV', 'Trao đổi với HMV'),
  requirement: t('Your requirement', 'Thông tin yêu cầu'),
  product: t('Product', 'Sản phẩm'),
  destination: t('Destination', 'Điểm đến'),
  volume: t('Volume', 'Sản lượng'),
  notYet: t('Not specified yet', 'Chưa xác định'),
  route: {
    rfq: { status: t('Ready for quotation', 'Sẵn sàng chuyển báo giá'), next: t('Next: HMV Sales', 'Tiếp theo: HMV Sales') },
    discovery: {
      status: t('Exploring requirement', 'Đang làm rõ nhu cầu'),
      next: t('Next: HMV Customer Service', 'Tiếp theo: Customer Service HMV'),
    },
  },
  contactTitle: {
    rfq: t('Request a quotation', 'Yêu cầu báo giá'),
    discovery: t('Talk to HMV Customer Service', 'Trao đổi với Customer Service HMV'),
  },
  company: t('Company', 'Công ty'),
  email: t('Business email', 'Email doanh nghiệp'),
  name: t('Contact name', 'Người liên hệ'),
  phone: t('WhatsApp / phone', 'WhatsApp / điện thoại'),
  required: t('required', 'bắt buộc'),
  optional: t('optional', 'không bắt buộc'),
  consent: t('HMV may contact me about this inquiry.', 'Tôi đồng ý để HMV liên hệ về yêu cầu này.'),
  privacy: t('Privacy notice', 'Thông báo quyền riêng tư'),
  submit: t('Send Request', 'Gửi yêu cầu'),
  sending: t('Sending…', 'Đang gửi…'),
  errors: {
    'contact.company': t('Enter your company name.', 'Nhập tên công ty.'),
    'contact.email': t('Enter a valid business email.', 'Nhập email doanh nghiệp hợp lệ.'),
    'contact.phone': t('Use digits, spaces and + ( ) - only.', 'Chỉ dùng chữ số, khoảng trắng và + ( ) -.'),
    'consent.contact': t('Confirm that HMV may contact you.', 'Xác nhận HMV có thể liên hệ với bạn.'),
    'contact.name': t('Use up to 100 characters.', 'Tối đa 100 ký tự.'),
    volume: t('Enter a number, for example 2 or 5000.', 'Nhập một số, ví dụ 2 hoặc 5000.'),
  },
  failed: t(
    'The request could not be sent. Your answers are kept here: try again, or prepare an email instead.',
    'Chưa gửi được yêu cầu. Thông tin của anh/chị vẫn được giữ tại đây: hãy thử lại, hoặc soạn email thay thế.',
  ),
  retry: t('Try again', 'Thử lại'),
  mailto: t('Prepare an email instead', 'Soạn email thay thế'),
  sentTitle: {
    rfq: t('Commercial inquiry received', 'Đã nhận yêu cầu thương mại'),
    discovery: t('Inquiry received', 'Đã nhận yêu cầu'),
  },
  sentText: {
    rfq: t(
      'HMV Sales will review your requirement and continue the quotation process with you.',
      'HMV Sales sẽ xem xét nhu cầu và tiếp tục quy trình báo giá với anh/chị.',
    ),
    discovery: t(
      'HMV Customer Service will continue the conversation and help clarify the requirement.',
      'Customer Service HMV sẽ tiếp tục trao đổi và hỗ trợ anh/chị làm rõ nhu cầu.',
    ),
  },
  reference: t('Reference', 'Mã tham chiếu'),
  process: t('The commercial process', 'Quy trình thương mại'),
  // The expected process, not a status: only the first stage has happened.
  timeline: [
    t('Request received', 'Đã nhận yêu cầu'),
    t('Quotation', 'Báo giá'),
    t('Commercial discussion', 'Trao đổi thương mại'),
    t('Sales contract', 'Hợp đồng mua bán'),
    t('Supply execution', 'Thực hiện cung ứng'),
  ],
  followUp: t(
    'Want to add something? Optional, quote your reference:',
    'Muốn bổ sung thông tin? Không bắt buộc, vui lòng nêu mã tham chiếu:',
  ),
  channels: {
    whatsapp: t('Message HMV on WhatsApp', 'Nhắn HMV qua WhatsApp'),
    zalo: t('Message HMV on Zalo', 'Nhắn HMV qua Zalo'),
    email: t('Email HMV', 'Gửi email cho HMV'),
  },
  done: t('Close', 'Đóng'),
  newInquiry: t('Start a new inquiry', 'Tạo yêu cầu mới'),
};

/** One language's copy: the same shape as COPY, each pair replaced by its text in `lang`. */
const resolve = (value, lang) => {
  if (Array.isArray(value)) return value.map(v => resolve(v, lang));
  if (value && typeof value === 'object') {
    return isPair(value) ? value[lang] : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, lang)]));
  }
  return value;
};

export const deskCopy = { en: resolve(COPY, 'en'), vi: resolve(COPY, 'vi') };
