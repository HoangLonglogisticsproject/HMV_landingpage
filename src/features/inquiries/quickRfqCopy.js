// Quick RFQ wording, each entry [English, Vietnamese]. The validation messages, the consent line and the privacy link say
// what the Trade Desk's say (trade-desk/copy.js: not imported, its code stays out of the homepage until the desk is
// opened). Plain and short: no promise of price, availability, lead time or response time.
const COPY = {
  eyebrow: ['QUICK RFQ · FAST LANE', 'QUICK RFQ · GỬI NHANH'],
  title: ['Tell us what you need', 'Cho HMV biết nhu cầu của bạn'],
  lead: [
    'Share the basics. HMV will review the sourcing requirement and follow up with you.',
    'Chỉ cần cung cấp các thông tin chính. HMV sẽ xem xét nhu cầu và liên hệ lại với bạn.',
  ],
  form: ['Quick RFQ', 'Quick RFQ'],
  progress: ['Progress', 'Tiến trình'],
  stepRequirement: ['Requirement', 'Yêu cầu'],
  stepContact: ['Contact', 'Liên hệ'],

  product: ['Product', 'Sản phẩm'],
  chooseProduct: ['Select a product', 'Chọn sản phẩm'],
  destination: ['Destination', 'Điểm đến'],
  destinationPlaceholder: ['Busan, South Korea', 'Busan, Hàn Quốc'],
  volume: ['Estimated volume', 'Sản lượng dự kiến'],
  amountPlaceholder: ['e.g. 500', 'VD: 500'],
  unit: ['Unit', 'Đơn vị'],
  continue: ['Continue', 'Tiếp tục'],

  contactTitle: ['Where should HMV contact you?', 'HMV có thể liên hệ với bạn qua đâu?'],
  requirement: ['Your requirement', 'Yêu cầu của bạn'],
  edit: ['Edit', 'Sửa'],
  company: ['Company', 'Công ty'],
  email: ['Work email', 'Email công việc'],
  more: ['Add more details', 'Thêm thông tin'],
  name: ['Name', 'Họ tên'],
  phone: ['WhatsApp / phone', 'WhatsApp / điện thoại'],
  notes: ['Additional information', 'Thông tin bổ sung'],
  optional: ['optional', 'không bắt buộc'],
  consent: ['HMV may contact me about this inquiry.', 'Tôi đồng ý để HMV liên hệ về yêu cầu này.'],
  privacy: ['Privacy notice', 'Thông báo quyền riêng tư'],
  submit: ['Send Request', 'Gửi yêu cầu'],
  sending: ['Sending…', 'Đang gửi…'],
  noCommitment: ['No commitment.', 'Không ràng buộc.'],

  failed: [
    'We could not send your request. Your details are kept here: try again, or send it by email instead.',
    'Chưa gửi được yêu cầu. Thông tin của bạn vẫn được giữ tại đây: hãy thử lại, hoặc gửi bằng email thay thế.',
  ],
  retry: ['Try again', 'Thử lại'],
  mailto: ['Send by email instead', 'Gửi bằng email thay thế'],

  sentTitle: ['Request received', 'HMV đã nhận yêu cầu'],
  reference: ['Reference', 'Mã tham chiếu'],
  sentText: [
    'HMV will review your requirement and contact you through the information provided.',
    'HMV sẽ xem xét nhu cầu và liên hệ lại qua thông tin bạn đã cung cấp.',
  ],
  copy: ['Copy reference', 'Sao chép mã'],
  copied: ['Copied', 'Đã sao chép'],
  another: ['Submit another request', 'Gửi yêu cầu khác'],

  assistTitle: ['Need guidance?', 'Cần HMV tư vấn thêm?'],
  assistText: [
    'Use HMV Trade Desk for sourcing, logistics or requirement support.',
    'Trao đổi với HMV Trade Desk về nguồn hàng, logistics hoặc yêu cầu cụ thể.',
  ],
  assistCta: ['Open HMV Trade Desk', 'Mở HMV Trade Desk'],

  direct: ['Prefer to write to HMV directly?', 'Muốn liên hệ trực tiếp với HMV?'],

  // By the inquiry contract's field name (what POST /api/inquiry answers a 400 with).
  errors: {
    product: ['Choose a product.', 'Chọn sản phẩm.'],
    destination: ['Enter a destination.', 'Nhập điểm đến.'],
    'volume.amount': ['Enter a number, for example 500.', 'Nhập một số, ví dụ 500.'],
    'contact.company': ['Enter your company name.', 'Nhập tên công ty.'],
    'contact.email': ['Enter a valid business email.', 'Nhập email doanh nghiệp hợp lệ.'],
    'contact.name': ['Use up to 100 characters.', 'Tối đa 100 ký tự.'],
    'contact.phone': ['Use digits, spaces and + ( ) - only.', 'Chỉ dùng chữ số, khoảng trắng và + ( ) -.'],
    'consent.contact': ['Confirm that HMV may contact you.', 'Xác nhận HMV có thể liên hệ với bạn.'],
    notes: ['Use up to 2000 characters.', 'Tối đa 2000 ký tự.'],
  },
};

const pick = (value, i) => (Array.isArray(value) ? value[i] : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, pick(v, i)])));

/** One language's copy: the same shape as COPY, each pair replaced by its text. */
export const quickRfqCopy = { en: pick(COPY, 0), vi: pick(COPY, 1) };
