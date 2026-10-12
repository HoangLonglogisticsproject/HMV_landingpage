import container1 from '@/assets/container1.jpg';
import container2 from '@/assets/container2.jpg';
import move from '@/assets/move.jpg';
import pack1 from '@/assets/pack1.jpg';
import pack2 from '@/assets/pack2.jpg';
import pack3 from '@/assets/pack3.jpg';
import pack4 from '@/assets/pack4.jpg';

export const operationalPhotos = {
  container1,
  container2,
  move,
  pack1,
  pack2,
  pack3,
  pack4,
};

export const packagingData = {
  standards: [
    {
      id: 'palletizing',
      titleVi: 'Tiêu Chuẩn Đóng Pallet Xuất Khẩu (ISPM 15)',
      titleEn: 'Export Palletizing Standards (ISPM 15)',
      descVi: 'Hàng hóa được xếp chồng khoa học trên pallet gỗ xử lý nhiệt chuẩn ISPM 15 hoặc pallet nhựa chịu tải cao, bọc màng co PE nhiều lớp và dây đai cố định đa chiều chống xô lệch trong suốt hải trình biển.',
      descEn: 'Cargo is systematically stacked on ISPM 15 heat-treated or heavy-duty plastic pallets, wrapped with multi-layer PE shrink film, and secured with multi-axis strapping against shifting during ocean transit.',
      image: pack1,
      tagVi: 'BẢO VỆ ĐA TẦNG',
      tagEn: 'MULTI-LAYER SECURITY',
      badgeVi: 'Chuẩn ISPM 15 & Màng Co PE',
      badgeEn: 'ISPM 15 & PE Shrink Film',
    },
    {
      id: 'inspection',
      titleVi: 'Kiểm Soát Kích Thước & Soi Chiếu An Ninh',
      titleEn: 'Dimensional Inspection & Security Screening',
      descVi: 'Từng kiện hàng và thùng carton được kiểm tra kích thước chuẩn, cân tải trọng chính xác và chạy qua hệ thống soi chiếu an ninh sân bay/cảng biển trước khi dán tem niêm phong xuất khẩu.',
      descEn: 'Each carton and cargo unit undergoes precise dimensional checks, gross weight verification, and x-ray security screening prior to export security tamper-evident sealing.',
      image: pack2,
      tagVi: 'KIỂM SOÁT TỔNG THỂ',
      tagEn: 'ACCURATE VERIFICATION',
      badgeVi: 'Kiểm Định & Soi Chiếu',
      badgeEn: 'Screening & Checkpoint',
    },
    {
      id: 'warehousing',
      titleVi: 'Kho Đệm & Đóng Kiện Carton Cứng Cáp',
      titleEn: 'Buffer Warehousing & Heavy-Duty Carton Bundling',
      descVi: 'Thùng carton 5-7 lớp chống thấm chịu lực nén cao, có góc nẹp bảo vệ mép thùng. Quy cách đóng kiện đồng nhất tạo khối pallet vững chắc, tối ưu hóa dung tích xếp dỡ trong container.',
      descEn: 'High-compression 5-to-7-ply moisture-resistant cartons with reinforced edge protectors. Uniform carton modularity guarantees cubic efficiency and stack rigidity inside shipping containers.',
      image: pack3,
      tagVi: 'LƯU KHO & ĐÓNG GÓI',
      tagEn: 'STORAGE & RIGID PACKING',
      badgeVi: 'Carton 5-7 Lớp & Nẹp Góc',
      badgeEn: '5-7 Ply Cartons & Edge Protectors',
    },
    {
      id: 'labeling',
      titleVi: 'Đai Buộc Chịu Lực & Nhãn Mác Truy Xuất Nguồn Gốc',
      titleEn: 'High-Tensile Strapping & Traceability Labeling',
      descVi: 'Dây đai composite chịu lực cao gia cố khối hàng cùng hệ thống nhãn mã vạch, mã QR truy xuất lô hàng, ngày đóng gói, cảng đến (LAX, RTM, HAM) và hướng dẫn bảo quản rõ ràng.',
      descEn: 'High-tensile composite strapping reinforces pallet blocks, integrated with barcode/QR labels detailing batch IDs, packing dates, destination ports (LAX, RTM, HAM), and handling instructions.',
      image: pack4,
      tagVi: 'TRUY XUẤT RÕ RÀNG',
      tagEn: 'FULL TRACEABILITY',
      badgeVi: 'Mã Vạch & Tem Cảng Đích',
      badgeEn: 'Barcodes & Destination Tags',
    },
  ],

  transportStages: [
    {
      id: 'drum-handling',
      stageVi: 'Giai Đoạn 1: Xếp Dỡ Cơ Giới Nội Bộ',
      stageEn: 'Stage 1: Internal Mechanical Handling',
      titleVi: 'Vận Hành Xe Nâng Chuyên Dụng & Cố Định Hàng Lỏng/Trọng Tải',
      titleEn: 'Specialized Forklift Operations & Liquid/Heavy Securement',
      descVi: 'Đội ngũ xe nâng cơ giới làm việc 24/7 di chuyển phuy nguyên liệu và kiện pallet từ khu vực sơ chế/kho thành phẩm ra sàn nâng xếp dỡ, ràng dây đai an toàn chuyên dụng cho mọi khối hàng dễ lăn hoặc rung chấn.',
      descEn: '24/7 dedicated forklift teams transfer material drums and palletized units from processing floors to cross-docking bays, utilizing specialized tie-down harnesses for unstable or cylindrical loads.',
      image: move,
      statNumber: '100%',
      statLabelVi: 'Kiểm định an toàn cơ giới',
      statLabelEn: 'Mechanical safety inspected',
    },
    {
      id: 'night-loading',
      stageVi: 'Giai Đoạn 2: Đóng Hàng & Xuyên Đêm (Night Shift Cross-Dock)',
      stageEn: 'Stage 2: Night-Shift Cross-Dock & Container Loading',
      titleVi: 'Đóng Container Xuyên Đêm Bảo Đảm Nhiệt Độ Ổn Định',
      titleEn: 'Overnight Container Stuffing & Thermal Stability Control',
      descVi: 'Vận hành bốc xếp cả ban đêm dưới hệ thống chiếu sáng tiêu chuẩn. Đóng hàng vào thùng xe lạnh/container chuyên dụng vào ban đêm giúp giảm sốc nhiệt môi trường đối với nông sản tươi và nguyên liệu nhạy cảm.',
      descEn: 'Night-shift container stuffing operations under high-lumen dock lighting. Overnight loading minimizes ambient heat shock for fresh commodities and temperature-sensitive consignments.',
      image: container2,
      statNumber: '24/7',
      statLabelVi: 'Vận hành kho đệm không gián đoạn',
      statLabelEn: 'Continuous cross-dock workflow',
    },
    {
      id: 'container-dispatch',
      stageVi: 'Giai Đoạn 3: Niêm Phong Chì & Vận Chuyển Cảng Biển',
      stageEn: 'Stage 3: Bolt Seal Lockout & Port Drayage Dispatch',
      titleVi: 'Container 45ft/40ft Cao Tải, Kẹp Chì Hải Quan Đi Cát Lái & Cái Mép',
      titleEn: 'High-Cube 40ft/45ft Fleet, Customs Bolt Seals to Deepwater Ports',
      descVi: 'Đoàn xe đầu kéo container tải trọng lớn (High Cube 45G1/40HC) tiếp nhận hàng trực tiếp tại kho xưởng, niêm phong chì niêm phong bảo mật, kiểm tra thông số kỹ thuật trước khi lăn bánh thẳng về các cảng biển quốc tế.',
      descEn: 'Heavy drayage fleet (High Cube 45G1/40HC) receives loaded containers at facility docks, applies ISO/PAS 17712 bolt seals, and executes direct transit to international deep-water seaports.',
      image: container1,
      statNumber: '45G1',
      statLabelVi: 'Đội xe container tiêu chuẩn quốc tế',
      statLabelEn: 'International spec container fleet',
    },
  ],

  stats: [
    { value: '100%', labelVi: 'Hàng hóa đóng chuẩn pallet & màng co bảo vệ', labelEn: 'Cargo palletized with multi-layer wrap' },
    { value: '0.02%', labelVi: 'Tỷ lệ suy hao va đập trong vận chuyển biển', labelEn: 'Ocean transit impact loss tolerance' },
    { value: '24/7', labelVi: 'Vận hành đóng hàng & giám sát chuỗi lạnh', labelEn: 'Continuous stuffing & thermal telemetry' },
    { value: '45G1/40HC', labelVi: 'Tiêu chuẩn container chuyên tuyến EU & Mỹ', labelEn: 'Dedicated container fleet for EU & US routes' },
  ],
};
