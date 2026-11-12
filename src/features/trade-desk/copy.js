// HMV Trade Desk wording. Each entry pairs its English and Vietnamese text, t(en, vi); a plain string is the same in
// both languages. The desk is HMV's: no assistant, bot or live-agent language.
const t = (en, vi) => ({ en, vi });
const isPair = v => Object.keys(v).length === 2 && 'en' in v && 'vi' in v;

const COPY = {
  deskName: 'HMV Trade Desk',
  description: t('Trade inquiry & sourcing desk', 'Tiếp nhận & chuẩn hóa yêu cầu giao thương'),
  close: t('Close', 'Đóng'),
  steps: [
    t('Requirements', 'Nhu cầu'),
    t('Requirement review', 'Phân tích yêu cầu'),
    t('Complete requirements', 'Bổ sung thông tin'),
    t('Supply plan & quotation', 'Phương án & báo giá'),
  ],
  guidance: [
    t(
      'Start with what you need. Leave anything you do not know yet: HMV helps complete it.',
      'Bắt đầu với nhu cầu của bạn. Thông tin chưa rõ có thể để trống: HMV sẽ cùng bạn hoàn thiện.',
    ),
    t(
      'Your requirement as HMV reads it, and what the commercial team needs to prepare an accurate proposal.',
      'Yêu cầu của bạn theo cách HMV ghi nhận, và những thông tin bộ phận kinh doanh cần để chuẩn bị phương án chính xác.',
    ),
    t(
      'Add what you know. Every field is optional and your brief stays editable.',
      'Bổ sung những gì bạn đã biết. Mọi trường đều không bắt buộc và phương án luôn có thể chỉnh sửa.',
    ),
    t(
      'Review the preliminary brief, then send it to the HMV commercial team.',
      'Xem lại phương án sơ bộ, sau đó gửi cho bộ phận kinh doanh HMV.',
    ),
  ],
  yourBrief: t('Your brief', 'Phương án của bạn'),
  emptyBrief: t('Your answers appear here as you build the brief.', 'Thông tin bạn nhập sẽ hiển thị tại đây.'),
  goal: t('What do you need?', 'Bạn cần hỗ trợ gì?'),
  product: t('Product', 'Sản phẩm'),
  goods: t('Cargo or goods', 'Hàng hóa'),
  goodsPlaceholder: t('e.g. 2 pallets of chemical samples', 'VD: 2 pallet mẫu hóa chất'),
  origin: t('Origin', 'Điểm đi'),
  originPlaceholder: t('Country or city', 'Quốc gia hoặc thành phố'),
  destination: t('Destination (country or port)', 'Điểm đến (quốc gia hoặc cảng)'),
  destinationPlaceholder: t('e.g. Rotterdam, Netherlands', 'VD: Rotterdam, Hà Lan'),
  volume: t('Estimated volume', 'Sản lượng dự kiến'),
  volumePlaceholder: t('e.g. 2', 'VD: 2'),
  unit: t('Unit', 'Đơn vị'),
  application: t('Application', 'Mục đích sử dụng'),
  transport: t('Transport preference, if known', 'Phương thức vận chuyển (nếu đã có)'),
  optional: t('optional', 'không bắt buộc'),
  chooseProduct: t('Choose a product to continue.', 'Chọn sản phẩm để tiếp tục.'),
  describeGoods: t('Describe the cargo or goods to continue.', 'Mô tả hàng hóa để tiếp tục.'),
  back: t('Back', 'Quay lại'),
  continue: t('Continue', 'Tiếp tục'),
  review: t('Review requirement', 'Xem phân tích'),
  complete: t('Complete requirements', 'Bổ sung thông tin'),
  toBrief: t('See preliminary brief', 'Xem phương án sơ bộ'),
  status: t('Status', 'Trạng thái'),
  statusValue: t('Preliminary buyer requirement', 'Yêu cầu sơ bộ của người mua'),
  needs: t('Information HMV still needs', 'Thông tin HMV cần thêm'),
  nothingMissing: t('Nothing essential is missing.', 'Không còn thông tin thiết yếu nào bị thiếu.'),
  pending: t('to be confirmed', 'cần xác nhận'),
  qualityReference: t('Quality reference', 'Tham chiếu chất lượng'),
  notes: t('Anything else HMV should know?', 'Thông tin khác HMV cần biết?'),
  notesHint: t(
    'In your own words. The structured brief above remains the reference.',
    'Viết theo cách của bạn. Phương án có cấu trúc ở trên vẫn là thông tin chính.',
  ),
  briefTitle: t('Preliminary Supply Brief', 'Phương án sơ bộ'),
  requirements: t('Requirements', 'Yêu cầu'),
  toConfirm: t('Information to confirm', 'Thông tin cần xác nhận'),
  next: t('Next HMV action', 'Bước tiếp theo của HMV'),
  nextText: t(
    'The HMV commercial team reviews this brief, confirms the missing information with you and prepares a commercial proposal.',
    'Bộ phận kinh doanh HMV xem xét phương án này, xác nhận các thông tin còn thiếu với bạn và chuẩn bị phương án thương mại.',
  ),
  disclaimer: t(
    'Availability, specifications, pricing and delivery terms are confirmed by HMV in the commercial proposal.',
    'Thông tin chính thức về nguồn hàng, quy cách, giá và điều kiện giao hàng được HMV xác nhận trong phương án thương mại.',
  ),
  contactTitle: t('Send your brief to the HMV commercial team', 'Gửi phương án cho bộ phận kinh doanh HMV'),
  company: t('Company', 'Công ty'),
  email: t('Work email', 'Email công việc'),
  name: t('Contact name', 'Người liên hệ'),
  phone: t('WhatsApp / phone', 'WhatsApp / điện thoại'),
  required: t('required', 'bắt buộc'),
  consent: t('HMV Global may contact me about this inquiry.', 'Tôi đồng ý để HMV Global liên hệ về yêu cầu này.'),
  privacy: t('Privacy notice', 'Thông báo quyền riêng tư'),
  submit: t('Send to HMV Commercial Team', 'Gửi yêu cầu cho bộ phận kinh doanh HMV'),
  sending: t('Sending…', 'Đang gửi…'),
  errors: {
    'contact.company': t('Enter your company name.', 'Nhập tên công ty.'),
    'contact.email': t('Enter a valid work email.', 'Nhập email công việc hợp lệ.'),
    'contact.phone': t('Use digits, spaces and + ( ) - only.', 'Chỉ dùng chữ số, khoảng trắng và + ( ) -.'),
    'consent.contact': t('Confirm that HMV may contact you.', 'Xác nhận HMV có thể liên hệ với bạn.'),
    'contact.name': t('Use up to 100 characters.', 'Tối đa 100 ký tự.'),
    product: t('Choose a product.', 'Chọn một sản phẩm.'),
    goods: t('Describe the cargo or goods, up to 200 characters.', 'Mô tả hàng hóa, tối đa 200 ký tự.'),
    origin: t('Use up to 120 characters.', 'Tối đa 120 ký tự.'),
    destination: t('Use up to 120 characters.', 'Tối đa 120 ký tự.'),
    'volume.amount': t('Enter a number, for example 2 or 5000.', 'Nhập một số, ví dụ 2 hoặc 5000.'),
    notes: t('Use up to 2,000 characters.', 'Tối đa 2.000 ký tự.'),
    requirement: t(
      'Check this answer: choose one of the options, or use up to 200 characters.',
      'Kiểm tra lại: chọn một phương án, hoặc tối đa 200 ký tự.',
    ),
    field: t('Check this field.', 'Kiểm tra lại trường này.'),
  },
  failed: t(
    'The brief could not be sent. Your answers are kept here: try again, or prepare an email instead.',
    'Chưa gửi được phương án. Thông tin của bạn vẫn được giữ tại đây: hãy thử lại, hoặc soạn email thay thế.',
  ),
  retry: t('Try again', 'Thử lại'),
  mailto: t('Prepare an email instead', 'Soạn email thay thế'),
  sentTitle: t('Sent to the HMV commercial team', 'Đã gửi tới bộ phận kinh doanh HMV'),
  reference: t('Inquiry reference', 'Mã yêu cầu'),
  sentText: t(
    'The commercial team reviews your brief and contacts you about the next step. Keep this reference for follow-up.',
    'Bộ phận kinh doanh HMV sẽ xem xét phương án và liên hệ với bạn về bước tiếp theo. Vui lòng lưu mã này để tiện trao đổi.',
  ),
  followUp: t(
    'Want to add something? Optional, quote your reference:',
    'Muốn bổ sung thông tin? Không bắt buộc, vui lòng nêu mã yêu cầu:',
  ),
  channels: {
    whatsapp: t('Message HMV on WhatsApp', 'Nhắn HMV qua WhatsApp'),
    zalo: t('Message HMV on Zalo', 'Nhắn HMV qua Zalo'),
    email: t('Email the HMV commercial team', 'Gửi email cho bộ phận kinh doanh HMV'),
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
