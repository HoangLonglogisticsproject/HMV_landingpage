import chemical from '@/assets/chemical.jpg';
import chemical2 from '@/assets/chemical2.jpg';
import dangerousGoods from '@/assets/dangerousGoods.jpg';
import dangerousGoods1 from '@/assets/dangerousGoods1.jpg';
import specialcargoes from '@/assets/specialcargoes.jpg';
import generalCargoesHandling from '@/assets/generalCargoesHandling.jpg';
import crossborder1 from '@/assets/crossborder1.jpg';
import crossborder2 from '@/assets/crossborder2.jpg';
import crossborder3 from '@/assets/crossborder3.jpg';
import crossborder4 from '@/assets/crossborder4.jpg';
import crossborder5 from '@/assets/crossborder5.jpg';
import crossborder6 from '@/assets/crossborder6.jpg';
import mijack from '@/assets/mijack.jpg';
import mijack2 from '@/assets/mijack2.jpg';
import mijack3 from '@/assets/mijack3.jpg';

export const logisticsServicesData = {
  dangerousGoods: {
    id: 'dangerous-goods',
    titleVi: 'Chuyên Biệt Xử Lý & Vận Chuyển Hàng Nguy Hiểm (Dangerous Goods)',
    titleEn: 'Specializing for Dangerous Goods Handling & Chemicals',
    subtitleVi: 'Tuân thủ nghiêm ngặt quy tắc IMO / IMDG Code, IATA DGR và tiêu chuẩn an toàn hóa chất quốc tế',
    subtitleEn: 'Strict adherence to IMO/IMDG Code, IATA DGR regulations and global chemical safety protocols',
    leadVi: 'HMV Logistics cung cấp giải pháp xử lý chuyên biệt đối với hàng hóa chất và hàng nguy hiểm (DG Classes 1-9), kết hợp quy trình đóng gói chứng nhận UN, khai báo MSDS/DGD và điều phối đa phương thức đường biển lẫn đường hàng không an toàn tuyệt đối.',
    leadEn: 'HMV Logistics provides engineered handling for chemical commodities and hazardous materials across DG Classes 1-9, combining UN-certified packaging, MSDS/DGD declaration, and end-to-end multimodal sea and air transport.',
    subServices: [
      {
        id: 'dg-air-sea',
        slug: 'dg-air-sea',
        titleVi: 'Hàng Nguy Hiểm Bằng Đường Hàng Không & Đường Biển (Dangerous Goods by Air & Sea)',
        titleEn: 'Dangerous Goods by Air & Sea',
        descVi: 'Book tàu container chuyên dụng (DG Reefer / ISO Tank / DG Dry) và tải bay chuyên biệt tuân thủ IATA Dangerous Goods Regulations. Giám sát phân loại UN/Class, tách lô tương thích (Segregation table) và niêm phong an toàn.',
        descEn: 'Direct booking for DG vessel space (ISO Tank / DG Reefer / DG Dry) and air cargo capacity under strict IATA DGR rules, complete with UN segregation validation and certified sealing.',
        images: [
          { src: dangerousGoods, title: 'IATA/IMO Dangerous Goods Container Handling', tag: 'DG Air & Sea' },
          { src: dangerousGoods1, title: 'DG Cargo Sorting & Drum Palletization', tag: 'IMDG Protocol' },
          { src: chemical, title: 'Chemical Drum Stowage & Seal Verification', tag: 'Chemical Transit' }
        ],
        highlightsVi: [
          'Khai báo hàng nguy hiểm (IMO Dangerous Goods Declaration - DGD)',
          'Tư vấn dán nhãn UN, số Class, Hazmat placards chuẩn quốc tế',
          'Tách lô hóa chất không tương thích theo bảng IMDG Segregation',
          'Bảo hiểm trách nhiệm hàng hải & ứng phó sự cố hóa chất 24/7'
        ],
        highlightsEn: [
          'IMO Dangerous Goods Declaration (DGD) & Shipper Declaration',
          'UN-certified hazard labeling, Class diamonds & Hazmat placards',
          'Strict compatibility segregation according to IMDG code matrices',
          '24/7 marine liability insurance & chemical incident emergency response'
        ]
      },
      {
        id: 'special-cargoes',
        slug: 'special-cargoes',
        titleVi: 'Xử Lý Hàng Hóa Đặc Biệt (Special Cargoes Handling)',
        titleEn: 'Special Cargoes Handling',
        descVi: 'Năng lực xử lý các loại hàng dự án quá khổ quá tải (OOG), thiết bị siêu trường siêu trọng, hàng hóa chất lỏng công nghiệp đựng trong phuy thép/nhựa và thùng IBC Tanks chuyên dụng.',
        descEn: 'Proven engineering capacity for Out-Of-Gauge (OOG), project breakbulk, liquid industrial chemicals in heavy-gauge drums, and certified IBC bulk containers.',
        images: [
          { src: specialcargoes, title: 'Special Cargo Lift & Heavy Rigging Inspection', tag: 'Special Cargo' },
          { src: chemical2, title: 'Chemical Drums & IBC Tank Loading Line', tag: 'IBC & Drums' }
        ],
        highlightsVi: [
          'Xếp dỡ cơ giới hạng nặng bằng cẩu bến và xe nâng tải trọng lớn',
          'Chằng buộc lashing & dunnage theo tiêu chuẩn hàng hải quốc tế',
          'Khảo sát tuyến đường (Route Survey) cho thiết bị quá khổ',
          'Kiểm tra rò rỉ và áp suất trước khi niêm phong container'
        ],
        highlightsEn: [
          'Heavy-lift crane rigging & industrial forklift operations',
          'Certified marine lashing, blocking & dunnage calculations',
          'Engineering route surveys for oversized equipment & turbines',
          'Pressure & integrity leak checks before container sealing'
        ]
      },
      {
        id: 'general-cargoes',
        slug: 'general-cargoes',
        titleVi: 'Xử Lý Hàng Hóa Tổng Hợp (General Cargoes Handling)',
        titleEn: 'General Cargoes Handling',
        descVi: 'Quản lý kho bãi, đóng gói, phân loại và lưu thông hàng bách hóa, nguyên phụ liệu công nghiệp, nông sản xuất khẩu và hàng tiêu dùng nhanh với năng suất cross-docking vượt trội.',
        descEn: 'Full-spectrum dry warehouse management, carton bundling, pallet wrapping, and high-velocity cross-dock dispatch for industrial materials and export commodities.',
        images: [
          { src: generalCargoesHandling, title: 'General Cargo Cross-Dock Warehouse & Pallet Stacking', tag: 'General Cargo' }
        ],
        highlightsVi: [
          'Đóng pallet chuẩn ISPM 15, màng co nhiệt PE chống ẩm',
          'Quản lý kho WMS mã vạch & kiểm đếm chính xác từng kiện hàng',
          'Tối ưu hóa khối lượng xếp cont (CBM Optimization) tiết kiệm cước phí',
          'Giao nhận door-to-door linh hoạt nội địa và quốc tế'
        ],
        highlightsEn: [
          'ISPM 15 palletization with heavy-duty PE stretch film',
          'WMS barcode scanning & carton-level piece counting',
          'CBM container stowage optimization reducing freight costs',
          'Door-to-door delivery coordination across domestic and global legs'
        ]
      },
      {
        id: 'factory-tour',
        slug: 'factory-tour',
        titleVi: 'Khảo Sát Hiện Trường & Nhà Máy (Factory Tour & Site Audit)',
        titleEn: 'Factory Tour & Site Audit',
        descVi: 'Tổ chức các chuyến khảo sát thực địa tận nhà máy sản xuất, kho hóa chất và bến bãi cảng biển. Minh bạch quy trình đóng gói, năng lực thiết bị và đảm bảo an toàn lao động.',
        descEn: 'On-site factory walkthroughs, chemical plant audits, and container yard inspection visits verifying physical packing standards, machinery capacity, and safety compliance.',
        images: [
          { src: mijack, title: 'Terminal Gantry Crane & Site Inspection', tag: 'Factory & Port Audit' },
          { src: mijack2, title: 'Container Yard Logistics Audit', tag: 'Yard Equipment' },
          { src: mijack3, title: 'Intermodal Transfer & Heavy Equipment Verification', tag: 'Site Tour' }
        ],
        highlightsVi: [
          'Khảo sát trực tiếp điều kiện đóng gói và lưu kho tại nhà xưởng',
          'Đánh giá rủi ro an toàn và quy trình PCCC đối với kho hóa chất',
          'Ghi nhận video/hình ảnh thực tế từng lô hàng trước khi xuất xưởng',
          'Cầu nối tin cậy giữa nhà sản xuất trong nước và khách hàng quốc tế'
        ],
        highlightsEn: [
          'Direct evaluation of factory packing conditions and storage safety',
          'Fire safety and hazardous risk audits for chemical facilities',
          'Comprehensive photo & video audit reports prior to dispatch',
          'Transparent bridge between domestic manufacturers and global buyers'
        ]
      }
    ]
  },
  crossBorder: {
    id: 'cross-border',
    titleVi: 'Vận Tải Xuyên Biên Giới Việt Nam - Campuchia',
    titleEn: 'Crossed Border Vietnam - Cambodia Freight & Drayage',
    subtitleVi: 'Tuyến vận tải đường bộ liên vận kết nối các KCN trọng điểm Việt Nam và Campuchia qua cửa khẩu quốc tế',
    subtitleEn: 'Cross-border road freight connecting manufacturing zones in Vietnam and Cambodia via international border gates',
    leadVi: 'Đội xe kéo container chuyên dụng và xe tải liên vận phục vụ tuyến xuyên biên giới Việt Nam - Campuchia (Mộc Bài / Bavet, Xa Mát / Trapeang Phlong, Hoa Lư / Trapeang Sre). Dịch vụ thông quan tại cả 2 đầu biên giới, sang xe nhanh chóng, an toàn và đúng hẹn.',
    leadEn: 'Dedicated container chassis and cross-border trucking fleet serving the direct Vietnam - Cambodia trade lane (Moc Bai / Bavet, Xa Mat, Hoa Lu). Full customs clearance at both borders, seamless transshipment, bonded drayage, and punctuality.',
    images: [
      { src: crossborder1, title: 'Cross-Border Container Trucks at Border Checkpoint', tag: 'Border Gate' },
      { src: crossborder2, title: 'Fleet Staging & Customs Inspection Lane', tag: 'Customs Lane' },
      { src: crossborder3, title: 'Border Crossing Drayage Convoy', tag: 'Highway Convoy' },
      { src: crossborder4, title: 'Cross-Border Truck Terminal Dispatch', tag: 'Terminal Dispatch' },
      { src: crossborder5, title: 'Inspection & Seal Check at International Border', tag: 'Security Seal' },
      { src: crossborder6, title: 'Border Gate Crossing Clearance Process', tag: 'Clearance Gate' }
    ],
    featuresVi: [
      'Thông quan 2 đầu cửa khẩu (Hai quan Việt Nam & Hải quan Campuchia)',
      'Đội xe container biển số liên vận vận hành 24/7 không gián đoạn',
      'Vận chuyển hàng may mặc, giày da, phụ tùng công nghiệp, hóa chất nông nghiệp',
      'Thời gian vận chuyển nhanh chỉ 12-24 giờ giữa TP.HCM và Phnom Penh',
      'Dịch vụ sang xe hạ tải hoặc đi thẳng xe (Direct Trucking) theo nhu cầu',
      'Định vị GPS theo dõi thời gian thực suốt hành trình'
    ],
    featuresEn: [
      'Dual customs clearance at both checkpoints (Vietnam & Cambodia)',
      'Cross-border licensed prime-mover fleet operating 24/7 without delays',
      'Regular carriage for garments, footwear, machinery parts & agricultural inputs',
      'Express transit of only 12–24 hours between Ho Chi Minh City & Phnom Penh',
      'Direct drayage or cross-dock transshipment tailored to cargo specifications',
      'Real-time GPS fleet tracking throughout the cross-border corridor'
    ]
  },
  localAgency: {
    id: 'local-agency',
    titleVi: 'Đại Lý Hãng Tàu & Forwarding Nội Địa Tại Việt Nam',
    titleEn: 'Local Agency Handling in Vietnam',
    subtitleVi: 'Mạng lưới dịch vụ logistics đại lý bao phủ toàn bộ các cụm cảng Hải Phòng, Đà Nẵng, Quy Nhơn, Cát Lái, Cái Mép',
    subtitleEn: 'Comprehensive local agency representation across major seaport hubs: Hai Phong, Da Nang, Quy Nhon, Cat Lai, Cai Mep',
    leadVi: 'HMV Logistics cung cấp dịch vụ đại lý giao nhận hàng hóa trọn gói tại Việt Nam cho các Forwarder và đối tác toàn cầu: từ đại lý cảng, thủ tục hải quan, vận tải nội địa đường bộ, lưu kho bãi CFS/ngoại quan cho đến xử lý chứng từ D/O, House B/L.',
    leadEn: 'HMV Logistics acts as the reliable local partner in Vietnam for global forwarders and shipping lines: handling terminal discharge, customs brokerage, inland trucking, CFS/bonded warehousing, and D/O / House B/L releases.',
    capabilitiesVi: [
      'Dịch vụ đại lý đến (Inbound Consignee Handling & D/O issuance)',
      'Khai thuê hải quan điện tử VNACCS cho tất cả các loại hình xuất nhập khẩu',
      'Vận chuyển nội địa đường bộ (Inland Trucking) từ cảng đến nhà máy khách hàng',
      'Đại lý lưu cước hãng tàu (Ocean Carrier Booking Agency) giá cạnh tranh',
      'Dịch vụ kho bãi, đóng gói lại, dán tem nhãn phụ và phân phối nội địa'
    ],
    capabilitiesEn: [
      'Inbound destination handling, cargo turnover & prompt D/O release',
      'VNACCS electronic customs brokerage covering all import/export regimes',
      'Inland container trucking from deepwater ports to inland industrial parks',
      'Preferred ocean carrier contract rates for FCL/LCL trade lanes',
      'Warehouse devanning, repacking, compliance sub-labeling and last-mile delivery'
    ]
  },
  overseaAgency: {
    id: 'oversea-agency',
    titleVi: 'Mạng Lưới Đại Lý Toàn Cầu (JC Trans Membership)',
    titleEn: 'Oversea Agency Networking (JC Trans Membership)',
    subtitleVi: 'Thành viên chính thức mạng lưới giao nhận toàn cầu JC Trans với bảo chứng thanh toán quốc tế GCP',
    subtitleEn: 'Accredited Member of JC Trans Global Freight Forwarding Network with Global Credit Protection (GCP)',
    leadVi: 'Với tư cách là thành viên chính thức trong mạng lưới logistics quốc tế JC Trans, HMV Logistics kết nối hơn 10.000+ đại lý giao nhận uy tín tại hơn 160 quốc gia và vùng lãnh thổ. Khách hàng được bảo đảm an toàn tài chính (JC Trans Financial Protection Fund), dịch vụ DDP/DAP uy tín và cước phí cạnh tranh nhất trên các tuyến Á - Âu - Mỹ.',
    leadEn: 'As an accredited member of the JC Trans Global Freight Forwarding Network, HMV Logistics connects with over 10,000+ verified partner agencies across 160+ countries. Our clients enjoy JC Trans Financial Credit Protection (GCP), seamless DDP/DAP terms, and volume-tiered ocean/air rates worldwide.',
    advantagesVi: [
      'Bảo chứng an toàn tài chính quốc tế (GCP - Global Credit Protection)',
      'Xử lý trọn gói dịch vụ giao hàng tận nơi DDP, DAP, Ex-works trên toàn thế giới',
      'Mạng lưới đối tác phủ sóng khắp Bắc Mỹ, Châu Âu, Trung Đông, Châu Á và Châu Phi',
      'Phối hợp giải quyết nhanh các vấn đề phát sinh tại cảng đích (Destinations clearance & detention/demurrage)',
      'Đối soát thanh toán quốc tế minh bạch, tỷ giá tối ưu và chứng từ số hóa'
    ],
    advantagesEn: [
      'Global Credit Protection (GCP) ensuring secure multilateral settlement',
      'End-to-end Ex-works, DDU, DAP & DDP solutions to consignee door worldwide',
      'Verified agency coverage spanning North America, Europe, Middle East, Asia & Africa',
      'Immediate resolution desk for destination customs queries, demurrage & detention',
      'Transparent international remittance, preferential FX rates, and digitized document flow'
    ]
  }
};
