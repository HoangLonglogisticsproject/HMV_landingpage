// HMV Trade Desk business rules: products, origins, units and how a buyer's words name a product. The desk asks only
// product, destination and volume; the application, transport and requirement lists below are the inquiry contract's
// (POST /api/inquiry and the CMS still accept them from earlier inquiries), never questions the desk asks. Controlled
// data only: no requirement, claim or value is generated. Product-specific lists follow the approved buyer pages
// (data/productPages.js).
import { products } from '@/data/hmv';

const t = (en, vi) => ({ en, vi });
const text = (key, label) => ({ key, kind: 'text', label });
const choice = (key, label, options) => ({ key, kind: 'choice', label, options });
const option = (id, label) => ({ id, label });

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

export const productById = id => products.find(p => p.id === id);

/** The requirement fields of a brief's product; none until a product is chosen. */
export function requirementsFor({ product }) {
  const p = productById(product);
  if (!p) return [];
  return PRODUCT_REQUIREMENTS[p.id] ?? [...specRequirements(p), DESTINATION_PORT, DELIVERY_WINDOW, CERTIFICATION, INCOTERM];
}

/** Without accents (đ as d). */
const plain = text => text.normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd');

// How a buyer may name each product (patterns, matched as whole words: "passionate" is not "passion"; plurals are
// spelled out where buyers use them). A name with accents is matched with them, so "chuỗi cung ứng" (supply chain) is
// never "chuối" (bananas); one without is matched accent-free, so "san lat" and "sắn lát" read the same. Spaces are one
// space: the buyer's text is normalized before matching. Controlled data: nothing is inferred beyond it.
const PRODUCT_NAMES = [
  ['passion-fruit', ['passion', 'chanh day', 'chanh leo']],
  ['dried-cassava-chips', ['cassava(?! starch)', 'san lat', 'san kho', '(?<!bột )sắn']],
  ['tapioca-starch', ['tapioca', 'cassava starch', 'tinh bot san', 'tinh bot khoai mi']],
  ['bananas', ['bananas?', 'cavendish', 'chuối']],
  ['dragon-fruit', ['dragon ?fruits?', 'pitayas?', 'pitahayas?', 'thanh long']],
  ['spices', ['spices?', 'pepper(?:corn)?s?', 'cinnamon', 'star anise', 'gia vi', 'ho tieu', 'hat tieu']],
  ['nuts', ['cashews?', 'hat dieu', 'nhan dieu']],
].map(([id, names]) => [id, names.map(name => ({ pattern: new RegExp(String.raw`(?<!\p{L})(?:${name})(?!\p{L})`, 'u'), accented: name !== plain(name) }))]);

/** The one HMV product a buyer's words name, or null when they name none or several. */
export function recognizeProduct(text) {
  const lower = String(text ?? '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ');
  const bare = plain(lower);
  const named = PRODUCT_NAMES.filter(([, names]) => names.some(({ pattern, accented }) => pattern.test(accented ? lower : bare)));
  return named.length === 1 ? named[0][0] : null;
}
