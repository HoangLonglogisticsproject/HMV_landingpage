import passionFruit from '@/assets/passion-fruit-cut.png';
import bananas from '@/assets/vietnam-bananas.png';
import dragonFruit from '@/assets/dragonFruit.png';
import pepper from '@/assets/phu-quoc-pepper.png';
import cashews from '@/assets/cashew-kernels-unbranded.png';
import tapioca from '@/assets/tapioca-starch-reference.png';

// Only verified photographs belong here. Missing categories stay unfilled
// until an authentic, correctly identified photograph is available.
export const productPhotos = {
  'passion-fruit': {
    src: passionFruit,
    width: 960,
    height: 1280,
    altEn: 'Cut passion fruit showing the pulp and seeds',
    altVi: 'Chanh dây bổ đôi, thấy rõ phần ruột và hạt',
    sourceEn: 'Photo supplied by HMV',
    sourceVi: 'Ảnh do HMV cung cấp',
  },
  bananas: {
    src: bananas,
    width: 1400,
    height: 1050,
    altEn: 'Bananas growing on a plantation in Vietnam',
    altVi: 'Buồng chuối tại vùng trồng ở Việt Nam',
    sourceEn:
      'Vietnam plantation reference; cultivar and organic certification not verified. Resized from original.',
    sourceVi:
      'Ảnh tham khảo vùng trồng Việt Nam; chưa xác minh giống và chứng nhận organic. Đã giảm kích thước từ ảnh gốc.',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Vietnam_08_-_145_-_Bananas_(3185937138).jpg',
    credit: 'McKay Savage · CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  },
  'dragon-fruit': {
    src: dragonFruit,
    width: 1254,
    height: 1254,
    altEn: 'Whole pink-skinned dragon fruit on a clean background',
    altVi: 'Thanh long vỏ hồng nguyên quả trên nền sáng',
    sourceEn:
      'Product reference photograph; growing location, HMV sourcing and organic certification are not established. Resized and converted to WebP.',
    sourceVi:
      'Ảnh tham khảo sản phẩm; chưa xác minh nơi trồng, nguồn hàng HMV và chứng nhận organic. Đã giảm kích thước và chuyển sang WebP.',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Dragon_fruit_(pitaya)_on_white_background.jpg',
    credit: 'Teknad · CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  spices: {
    src: pepper,
    width: 1400,
    height: 1050,
    altEn: 'Pepper vines growing in Phu Quoc, Vietnam',
    altVi: 'Vườn hồ tiêu tại Phú Quốc, Việt Nam',
    sourceEn:
      'Phu Quoc pepper-growing reference. Not an HMV-owned farm or verified HMV supplier; organic status is not established. Resized from original.',
    sourceVi:
      'Ảnh tham khảo vườn hồ tiêu Phú Quốc. Không xác nhận là vùng trồng thuộc HMV hoặc nhà cung cấp HMV; chưa xác minh organic. Đã giảm kích thước từ ảnh gốc.',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Ti%C3%AAu_Ph%C3%BA_Qu%E1%BB%91c.JPG',
    credit: 'Liftold · CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  nuts: {
    src: cashews,
    width: 1054,
    height: 1400,
    altEn: 'Unbranded cashew kernels',
    altVi: 'Nhân hạt điều không có thương hiệu',
    sourceEn:
      'Illustrative product reference photographed outside Vietnam; not a photograph of an HMV lot. Vietnamese origin and organic status require product-specific confirmation. Resized from original.',
    sourceVi:
      'Ảnh tham khảo sản phẩm chụp ngoài Việt Nam, không phải ảnh lô hàng HMV. Xuất xứ Việt Nam và organic cần được xác nhận theo sản phẩm. Đã giảm kích thước từ ảnh gốc.',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:CASHEW_NUTS.jpg',
    credit: 'Ranjithkumar Murugesan · CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  'tapioca-starch': {
    src: tapioca,
    width: 830,
    height: 558,
    altEn: 'Tapioca starch powder with cassava root and leaves',
    altVi: 'Bột sắn bên củ và lá sắn',
    sourceEn:
      'Tapioca powder reference, not an HMV lot photograph. Vietnam origin and organic status are not verified. Converted to WebP.',
    sourceVi:
      'Ảnh tham khảo bột sắn, không phải ảnh lô hàng HMV. Chưa xác minh xuất xứ Việt Nam và organic. Đã chuyển sang WebP.',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tepung_casava.jpg',
    credit: '36Lilis · Public domain',
    licenseUrl:
      'https://commons.wikimedia.org/wiki/File:Tepung_casava.jpg#Licensing',
  },
};
