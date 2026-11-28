// Photographs of the golden passion fruit pages, one entry per web derivative (scripts/passion-fruit-images.mjs, written into
// src/assets/passion-fruit/production/; the originals are local, in the ignored private-sources/). Three kinds, told apart in the captions:
//  - documentary: genuine photographs HMV supplied of a growing area and of sorted fruit (vine, sorting, orchard), cropped so that
//    no person and no supplier mark is in the frame;
//  - illustrative: edited product and packaging images (golden fruit presentation, cartons), without any marking. They show
//    how the fruit can be presented, not shipments, HMV packaging, a grade or a specification, and say so in their captions;
//  - AI-generated (V2: foodserviceHero, foodservicePulp, signatureDrinks, refinedDessert, luxuryCulinary, premiumPackaging): marketing concepts of golden passion fruit in a
//    beverage, a plated dish, a dessert, ingredient close-ups and a gift carton. Application and packaging illustrations: not specimens, not a customer's venue,
//    not a finished HMV product, not manufactured packaging. Register: docs/architecture/IMAGE_ASSET_DEBT.md.
// No photograph is recolored. Used, withheld and pending photographs, and why: docs/architecture/PASSION_FRUIT.md.
//
// A page asks for a photograph by key and never by file, so approved hospitality or packaging photography replaces an entry
// here (or fills `culinary.media` in data/passionFruitPages.js) without touching a component.
import scene from '@/assets/passion-fruit/production/shared/product/golden-fruit-scene.webp';
import display from '@/assets/passion-fruit/production/shared/product/golden-fruit-display.webp';
import onTree from '@/assets/passion-fruit/production/shared/product/golden-fruit-on-tree.webp';
import pile from '@/assets/passion-fruit/production/shared/product/golden-fruit-pile.webp';
import cluster from '@/assets/passion-fruit/production/shared/product/golden-fruit-cluster.webp';
import halved from '@/assets/passion-fruit/production/shared/product/golden-fruit-halved.webp';
import nets from '@/assets/passion-fruit/production/shared/packaging/fruit-protective-nets.webp';
import carton from '@/assets/passion-fruit/production/shared/packaging/carton-twelve-compartments.webp';
import neutralCartons from '@/assets/passion-fruit/production/shared/packaging/neutral-packaging-cartons.webp';
import neutralFruit from '@/assets/passion-fruit/production/shared/packaging/neutral-carton-fruit.webp';
import vine from '@/assets/passion-fruit/production/shared/farming/vine-green-fruit.webp';
import sorting from '@/assets/passion-fruit/production/shared/operations/manual-sorting.webp';
import orchard from '@/assets/passion-fruit/production/shared/farming/orchard-trellis.webp';
import foodserviceHero from '@/assets/passion-fruit/production/foodservice/foodservice-hero.webp';
import foodservicePulp from '@/assets/passion-fruit/production/foodservice/foodservice-pulp.webp';
import refinedDessert from '@/assets/passion-fruit/production/foodservice/refined-dessert.webp';
import signatureDrinks from '@/assets/passion-fruit/production/foodservice/signature-drinks.webp';
import luxuryCulinary from '@/assets/passion-fruit/production/foodservice/luxury-culinary.webp';
import premiumPackaging from '@/assets/passion-fruit/production/retail/premium-packaging.webp';
import { assetSrc } from '@/lib/utils';

const photo = (image, width, height, alt, caption) => ({ src: assetSrc(image), width, height, alt, caption });
const t = (en, vi) => ({ en, vi });

export const passionFruitMedia = {
  // Illustrative product images.
  scene: photo(scene, 1254, 1254,
    t('Golden passion fruit in yellow foam nets on a display stand and in a divided carton, with golden fruit on the vine above', 'Chanh dây vàng bọc lưới xốp vàng trên kệ trưng bày và trong thùng có ngăn, phía trên là trái vàng trên giàn'),
    t('Golden passion fruit. Illustrative product presentation.', 'Chanh dây vàng. Hình ảnh minh họa sản phẩm.')),
  display: photo(display, 1120, 714,
    t('Golden passion fruit in a divided carton and on a stand, with two fruit cut open on a leaf', 'Chanh dây vàng trong thùng có ngăn và trên kệ, hai trái bổ đôi đặt trên lá'),
    t('Whole golden fruit, in protective nets and a divided carton. Illustrative product presentation.', 'Trái vàng nguyên quả, bọc lưới bảo vệ và xếp trong thùng có ngăn. Hình ảnh minh họa sản phẩm.')),
  onTree: photo(onTree, 1254, 560,
    t('Golden passion fruit hanging among the leaves of a vine', 'Chanh dây vàng treo giữa tán lá của giàn'),
    t('Golden fruit on the vine. Illustrative product presentation.', 'Trái vàng trên giàn. Hình ảnh minh họa sản phẩm.')),
  cluster: photo(cluster, 640, 634,
    t('Golden passion fruit in foam nets and loose on a stand, two fruit cut open on a green leaf', 'Chanh dây vàng bọc lưới xốp và để rời trên kệ, hai trái bổ đôi đặt trên lá xanh'),
    t('Whole and halved golden fruit. Illustrative product presentation.', 'Trái vàng nguyên quả và bổ đôi. Hình ảnh minh họa sản phẩm.')),
  pile: photo(pile, 640, 374,
    t('A pile of whole golden passion fruit', 'Một đống chanh dây vàng nguyên quả'),
    t('Whole golden fruit. Illustrative product presentation.', 'Trái vàng nguyên quả. Hình ảnh minh họa sản phẩm.')),
  halved: photo(halved, 540, 260,
    t('Two golden passion fruit cut open to show the pulp, on a green leaf', 'Hai trái chanh dây vàng bổ đôi để lộ phần ruột, đặt trên lá xanh'),
    t('Golden passion fruit, halved. Illustrative product presentation.', 'Chanh dây vàng bổ đôi. Hình ảnh minh họa sản phẩm.')),
  // Illustrative packaging images: formats the fruit can be packed in, subject to buyer requirements.
  nets: photo(nets, 600, 600,
    t('Golden passion fruit in yellow foam nets on a clear display stand', 'Chanh dây vàng bọc lưới xốp vàng trên kệ trưng bày trong suốt'),
    t('Individual fruit protection with foam nets. Illustrative packaging format.', 'Bảo vệ từng trái bằng lưới xốp. Định dạng đóng gói minh họa.')),
  carton: photo(carton, 1086, 1448,
    t('An open carton with twelve yellow passion fruit, each in its own compartment', 'Thùng mở với mười hai trái chanh dây vàng, mỗi trái trong một ngăn riêng'),
    t('A twelve-compartment carton. Packaging presentation reference, not HMV packaging.', 'Thùng mười hai ngăn. Hình ảnh tham khảo cách đóng gói, không phải bao bì của HMV.')),
  neutralCartons: photo(neutralCartons, 1448, 1086,
    t('Plain white and green cartons, one open with twenty-four fruit in foam nets, each in its own compartment', 'Các thùng carton trơn màu trắng và xanh, một thùng mở với hai mươi bốn trái bọc lưới xốp, mỗi trái một ngăn'),
    t('Plain cartons with separated fruit in foam nets, the fruit shown green. An illustrative packaging format, subject to buyer requirements; not HMV packaging.',
      'Thùng carton trơn với trái bọc lưới xốp được tách riêng, trái còn xanh trong hình. Định dạng đóng gói minh họa, tùy theo yêu cầu của khách hàng; không phải bao bì của HMV.')),
  neutralFruit: photo(neutralFruit, 808, 570,
    t('An open carton with twenty-four fruit in yellow foam nets, in separate compartments', 'Thùng mở với hai mươi bốn trái bọc lưới xốp vàng, trong các ngăn riêng'),
    t('Separated fruit in an open carton. Illustrative packaging format.', 'Trái được tách riêng trong thùng mở. Định dạng đóng gói minh họa.')),
  // AI-generated application and packaging illustrations (V2), labelled as such on the pages.
  foodserviceHero: photo(foodserviceHero, 1086, 1448,
    t('Three whole golden passion fruit with water droplets and one cut open to show the pulp, on a travertine stone slab with green leaves in warm light', 'Ba trái chanh dây vàng nguyên quả còn đọng giọt nước và một trái bổ đôi để lộ phần ruột, trên phiến đá travertine cùng lá xanh trong ánh sáng ấm'),
    t('Whole and halved golden passion fruit. Illustrative product imagery.', 'Chanh dây vàng nguyên quả và bổ đôi. Hình ảnh minh họa sản phẩm.')),
  foodservicePulp: photo(foodservicePulp, 1086, 1448,
    t('A spoon lifting golden passion fruit pulp above a glass bowl, with a whole and a halved golden passion fruit behind', 'Chiếc thìa múc phần ruột chanh dây vàng phía trên bát thủy tinh, phía sau là một trái nguyên quả và một trái bổ đôi'),
    t('Golden passion fruit pulp. Illustrative product imagery.', 'Ruột chanh dây vàng. Hình ảnh minh họa sản phẩm.')),
  refinedDessert: photo(refinedDessert, 1086, 1448,
    t('A panna cotta topped with golden passion fruit pulp and seeds on a stoneware plate, with a whole and a halved golden passion fruit behind', 'Món panna cotta phủ ruột chanh dây vàng trên đĩa gốm, phía sau là một trái nguyên quả và một trái bổ đôi'),
    t('Illustrative application imagery.', 'Hình ảnh minh họa ứng dụng.')),
  signatureDrinks: photo(signatureDrinks, 1448, 1086,
    t('A coupe glass of golden passion fruit drink with crushed ice and seeds, beside a whole and a halved golden passion fruit on a brass tray', 'Ly đồ uống chanh dây vàng với đá bào và hạt, bên cạnh một trái chanh dây vàng nguyên quả và một trái bổ đôi trên khay đồng'),
    t('Illustrative application imagery.', 'Hình ảnh minh họa ứng dụng.')),
  luxuryCulinary: photo(luxuryCulinary, 1448, 1086,
    t('A plated fish fillet with golden passion fruit sauce, asparagus and edible flowers, with whole and halved golden passion fruit behind', 'Món cá phi lê sốt chanh dây vàng với măng tây và hoa ăn được, phía sau là chanh dây vàng nguyên quả và bổ đôi'),
    t('Illustrative application imagery.', 'Hình ảnh minh họa ứng dụng.')),
  premiumPackaging: photo(premiumPackaging, 1448, 1086,
    t('A cream and gold gift carton with twelve golden passion fruit in yellow foam nets, each in its own compartment, beside cut-out lid boxes and whole and halved golden fruit', 'Hộp quà màu kem và vàng với mười hai trái chanh dây vàng bọc lưới xốp vàng, mỗi trái một ngăn, cạnh các hộp nắp đục hoa văn và trái vàng nguyên quả, bổ đôi'),
    t('Illustrative packaging concept, not official HMV packaging.', 'Concept bao bì minh họa, chưa phải bao bì chính thức của HMV.')),
  // Documentary photographs supplied by HMV.
  vine: photo(vine, 960, 1280,
    t('Green passion fruit growing on the vine in a field', 'Chanh dây xanh đang phát triển trên giàn ngoài đồng'),
    t('Fruit on the vine, still green in this photograph.', 'Trái trên giàn, còn xanh trong bức ảnh này.')),
  sorting: photo(sorting, 720, 390,
    t('Passion fruit on a blue sorting tarpaulin', 'Chanh dây trên tấm bạt phân loại màu xanh'),
    t('Fruit on a sorting tarpaulin.', 'Chanh dây trên tấm bạt phân loại.')),
  orchard: photo(orchard, 1280, 960,
    t('Passion fruit vines on a trellis with green fruit under a blue sky', 'Giàn chanh dây với trái xanh dưới bầu trời xanh'),
    t('A growing area in Vietnam, fruit on the trellis.', 'Một vùng trồng ở Việt Nam, trái trên giàn.')),
};
