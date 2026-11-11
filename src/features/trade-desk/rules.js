// HMV Trade Desk business rules: goals, products, origins, units and the requirements HMV asks a buyer to define.
// Controlled data only. The review lists what is missing from these rules and nothing else; no requirement, claim or
// value is generated. Product-specific lists follow the approved buyer pages (data/productPages.js).
import { products } from '@/data/hmv';

const t = (en, vi) => ({ en, vi });
const text = (key, label) => ({ key, kind: 'text', label });
const choice = (key, label, options) => ({ key, kind: 'choice', label, options });
const option = (id, label) => ({ id, label });

export const GOALS = [
  option('sourcing', t('Product sourcing', 'Tìm nguồn hàng')),
  option('logistics', t('Logistics', 'Logistics')),
  option('customs', t('Customs & compliance', 'Hải quan & tuân thủ')),
];

export const ORIGINS = { vietnam: t('Vietnam', 'Việt Nam'), cambodia: t('Cambodia', 'Campuchia') };
/** Origins HMV sources a product from: Vietnam; dried cassava chips also Cambodia (HMV cassava dossier). */
export const originsFor = productId => (productId === 'dried-cassava-chips' ? ['vietnam', 'cambodia'] : ['vietnam']);

export const VOLUME_UNITS = {
  containers: t('containers', 'container'),
  containers_month: t('containers / month', 'container / tháng'),
  mt: t('MT', 'tấn'),
  mt_month: t('MT / month', 'tấn / tháng'),
};
export const defaultUnit = productId => (productId === 'dried-cassava-chips' ? 'mt_month' : 'containers');

export const TRANSPORT = {
  sea_fcl: t('Sea freight (FCL)', 'Đường biển (FCL)'),
  sea_reefer: t('Refrigerated container', 'Container lạnh'),
  air: t('Air freight', 'Đường hàng không'),
  undecided: t('Not decided yet', 'Chưa xác định'),
};

/** Applications a buyer chooses from, where the product page defines them. */
export const APPLICATIONS = {
  'dried-cassava-chips': {
    feed: t('Animal feed', 'Thức ăn chăn nuôi'),
    bioethanol: t('Bioethanol', 'Bioethanol'),
    starch: t('Starch processing', 'Chế biến tinh bột'),
  },
};

const INCOTERM = choice('incoterm', t('Incoterm', 'Incoterm'),
  ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'].map(id => option(id, t(id, id))));
const DESTINATION_PORT = text('destinationPort', t('Exact destination port', 'Cảng đến cụ thể'));
const DELIVERY_WINDOW = text('deliveryWindow', t('Delivery window', 'Thời gian giao hàng'));
const CERTIFICATION = text('certification', t('Certification requirement', 'Yêu cầu chứng nhận'));

const PRODUCT_REQUIREMENTS = {
  'passion-fruit': [
    text('variety', t('Variety', 'Giống')),
    text('sizeWeight', t('Size / weight', 'Kích cỡ / khối lượng')),
    text('brix', t('Brix requirement', 'Yêu cầu Brix')),
    text('packaging', t('Packaging', 'Đóng gói')),
    text('deliveryWindow', t('Season / delivery window', 'Mùa vụ / thời gian giao hàng')),
    DESTINATION_PORT,
    text('destinationRequirements', t('Destination requirements', 'Yêu cầu thị trường đích')),
  ],
  'dried-cassava-chips': [
    text('starch', t('Required starch %', 'Hàm lượng tinh bột yêu cầu (%)')),
    text('moisture', t('Maximum moisture %', 'Độ ẩm tối đa (%)')),
    text('loading', t('Loading / packaging requirement', 'Yêu cầu đóng hàng / quy cách')),
    INCOTERM,
    DESTINATION_PORT,
    DELIVERY_WINDOW,
  ],
};

// Other products: the specification points HMV discusses for them (data/hmv.js `specs`), then route and terms.
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const specRequirements = product =>
  product.specs.map(spec => {
    const [en, vi] = spec.split(' / ');
    return text(`spec-${slug(en)}`, t(en, vi));
  });

const GOAL_REQUIREMENTS = {
  logistics: [
    choice('cargoType', t('Cargo type', 'Loại hàng'), [
      option('general', t('General cargo', 'Hàng thông thường')),
      option('reefer', t('Temperature-controlled', 'Hàng cần kiểm soát nhiệt độ')),
      option('dangerous', t('Dangerous goods', 'Hàng nguy hiểm')),
      option('oversized', t('Oversized / project cargo', 'Hàng quá khổ / hàng dự án')),
    ]),
    text('readyDate', t('Cargo ready date', 'Ngày hàng sẵn sàng')),
    INCOTERM,
    text('packaging', t('Packing details', 'Quy cách đóng gói')),
  ],
  customs: [
    choice('service', t('Service needed', 'Dịch vụ cần hỗ trợ'), [
      option('import', t('Import clearance', 'Thông quan nhập khẩu')),
      option('export', t('Export clearance', 'Thông quan xuất khẩu')),
      option('documents', t('Documents & certificates review', 'Rà soát chứng từ & chứng nhận')),
      option('dg', t('Dangerous-goods classification', 'Phân loại hàng nguy hiểm')),
    ]),
    text('hsCode', t('HS code, if known', 'Mã HS (nếu có)')),
    text('timing', t('Required timing', 'Thời gian cần hoàn thành')),
  ],
};

export const productById = id => products.find(p => p.id === id);

/** The requirement fields of a brief: by product for sourcing, by goal otherwise. */
export function requirementsFor({ goal, product }) {
  if (goal !== 'sourcing') return GOAL_REQUIREMENTS[goal] ?? [];
  const p = productById(product);
  if (!p) return [];
  return PRODUCT_REQUIREMENTS[p.id] ?? [...specRequirements(p), DESTINATION_PORT, DELIVERY_WINDOW, CERTIFICATION, INCOTERM];
}

// The core of each goal, asked first: what HMV needs before anything else.
const CORE = {
  sourcing: [['product', t('Product', 'Sản phẩm')], ['destination', t('Destination', 'Điểm đến')], ['volume', t('Estimated volume', 'Sản lượng dự kiến')]],
  logistics: [['goods', t('Cargo description', 'Mô tả hàng hóa')], ['origin', t('Origin', 'Điểm đi')], ['destination', t('Destination', 'Điểm đến')], ['volume', t('Estimated volume', 'Sản lượng dự kiến')]],
  customs: [['goods', t('Goods', 'Hàng hóa')], ['destination', t('Destination country', 'Quốc gia đến')]],
};
const filled = value => String(value ?? '').trim() !== '';

/** Everything HMV asks for in a brief, in asking order: the goal's core fields, the application where the product has
 * them, then the requirements. Each entry: { key, label, core, done }. */
export function checklist(brief) {
  const core = (CORE[brief.goal] ?? []).map(([key, label]) => (
    { key, label, core: true, done: filled(key === 'volume' ? brief.volume?.amount : brief[key]) }
  ));
  const application = APPLICATIONS[brief.product]
    ? [{ key: 'application', label: t('Application', 'Mục đích sử dụng'), core: true, done: filled(brief.application) }]
    : [];
  const requirements = requirementsFor(brief).map(({ key, label }) => (
    { key, label, core: false, done: filled(brief.requirements?.[key]) }
  ));
  return [...core, ...application, ...requirements];
}

/** What HMV still needs: the unanswered checklist entries. */
export const missingInformation = brief => checklist(brief).filter(item => !item.done);
