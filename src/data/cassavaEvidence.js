// The cassava supply evidence: photographs HMV supplied of the product, bulk stock and container loading, shown by
// SupplyEvidence (views/products/ProductLanding.jsx) on the EN/VI dried cassava chips page and on the page-scoped
// Chinese page. A page in another language adds its copy, captions and alt text here; the photographs stay the same.
// They show physical product and activity in HMV's supply network, nothing more: no location, facility ownership,
// lot or link to the network capacity figures is asserted. The originals are not committed; the container photograph
// is cropped to the container opening, leaving out the camera's date and location stamp, the container number and
// the trailer's registration, and the product detail is the product photograph cropped to the 4:3 frame it fills.
import stock from '@/assets/products/cassava-bulk-stock.webp';
import loading from '@/assets/products/cassava-container-loading.webp';
import detail from '@/assets/products/dried-cassava-chips-detail.webp';
import { assetSrc } from '@/lib/utils';
import { productPhotos } from './productPhotos.js';

// The product photograph's alt text (data/productPhotos.js) describes the detail too.
const PRODUCT = productPhotos['dried-cassava-chips'];

export const cassavaEvidence = {
  copy: {
    en: {
      eyebrow: 'REAL SUPPLY EVIDENCE',
      title: "Product, bulk supply and shipment evidence from HMV's supply operations",
      text: "These photographs document dried cassava chips, consolidation activity and shipment preparation within HMV's supply network. Origin, available volume and delivery conditions are confirmed for each commercial proposal.",
      note: 'Photos supplied by HMV.',
    },
    vi: {
      eyebrow: 'HÌNH ẢNH NGUỒN HÀNG THỰC TẾ',
      title: 'Sản phẩm, nguồn hàng và hoạt động chuẩn bị giao hàng trong mạng lưới HMV',
      text: 'Các hình ảnh dưới đây ghi nhận sắn lát khô, hoạt động gom hàng và chuẩn bị giao hàng trong mạng lưới cung ứng của HMV. Nguồn gốc, sản lượng khả dụng và điều kiện giao hàng được xác nhận theo từng phương án thương mại.',
      note: 'Ảnh do HMV cung cấp.',
    },
    zh: {
      eyebrow: '真实供应记录',
      title: 'HMV 供应网络中的产品、集货与出运实景',
      text: '以下照片记录 HMV 供应网络中的木薯干片、集货及出运准备情况。实际原产地、可供数量及交付条件以每个商业供应方案为准。',
      note: '照片由 HMV 提供。',
    },
  },
  // The lead photograph first. Captions say only what each photograph shows.
  photos: [
    {
      id: 'stock',
      src: assetSrc(stock),
      width: 960,
      height: 1280,
      alt: {
        en: 'A large pile of dried cassava chips under a steel roof, a handful of chips held in the foreground',
        vi: 'Đống sắn lát khô lớn dưới mái kèo thép, phía trước là một nắm sắn lát cầm trên tay',
        zh: '钢结构屋顶下的大堆木薯干片，前景是手中的一把木薯干片',
      },
      caption: {
        en: 'Bulk dried cassava chips — real supply evidence',
        vi: 'Sắn lát khô số lượng lớn — hình ảnh nguồn hàng thực tế',
        zh: '大宗木薯干片供应实景',
      },
    },
    {
      id: 'loading',
      src: assetSrc(loading),
      width: 1530,
      height: 1148,
      alt: {
        en: 'An open shipping container loaded with dried cassava chips, sacks stacked at the door',
        vi: 'Container mở cửa đã đóng sắn lát khô, các bao xếp ở cửa container',
        zh: '已装入木薯干片的敞开集装箱，箱门处码放编织袋',
      },
      caption: { en: 'Container loading and shipment preparation', vi: 'Đóng hàng và chuẩn bị container', zh: '装柜及出运准备' },
    },
    {
      id: 'product',
      src: assetSrc(detail),
      width: 960,
      height: 720,
      alt: { en: PRODUCT.altEn, vi: PRODUCT.altVi, zh: '木薯干片特写，白色切面与褐色外皮' },
      caption: { en: 'Dried cassava chips — product detail', vi: 'Cận cảnh sắn lát khô', zh: '木薯干片产品实拍' },
    },
  ],
};
