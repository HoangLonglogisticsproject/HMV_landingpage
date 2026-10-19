// Văn bản pháp lý do HMV Global tổng hợp; bản gốc lưu trên Google Drive (chỉ đọc).
export const regulationGroups = [
  {
    id: 'plant-quarantine',
    label: { vi: 'Kiểm dịch thực vật', en: 'Plant quarantine' },
  },
  {
    id: 'food-safety',
    label: { vi: 'An toàn thực phẩm nhập khẩu', en: 'Imported food safety' },
  },
  {
    id: 'administrative',
    label: {
      vi: 'Phân cấp & thủ tục hành chính',
      en: 'Decentralisation & procedures',
    },
  },
];

export const regulations = [
  {
    id: 'kdtv-che-bien-xuat-khau',
    group: 'plant-quarantine',
    type: { vi: 'Thông báo', en: 'Notice' },
    title: {
      vi: 'Thông báo về việc kiểm dịch thực vật và cấp Giấy chứng nhận KDTV đối với hàng hóa có nguồn gốc thực vật đã qua chế biến khi xuất khẩu',
      en: 'Notice on plant quarantine and issuance of Phytosanitary Certificates for processed plant-origin goods for export',
    },
    summary: {
      vi: 'Phạm vi áp dụng kiểm dịch thực vật và thủ tục cấp Giấy chứng nhận KDTV cho hàng nông sản đã qua chế biến khi làm thủ tục xuất khẩu.',
      en: 'Scope of plant quarantine and the procedure for obtaining a Phytosanitary Certificate for processed agricultural goods at export.',
    },
    url: 'https://drive.google.com/file/d/1F7iGxEO-PrWw5bj2_29gT8lSSEXjG-Nn/view',
  },
  {
    id: 'attp-huong-dan-ho-so',
    group: 'food-safety',
    type: { vi: 'Thông báo', en: 'Notice' },
    title: {
      vi: 'Thông báo cơ quan thực hiện và hướng dẫn nộp, tiếp nhận, xử lý hồ sơ kiểm tra nhà nước về ATTP đối với thực phẩm có nguồn gốc thực vật nhập khẩu',
      en: 'Notice on the competent authority and guidance for submitting, receiving and processing state food-safety inspection dossiers for imported plant-origin food',
    },
    summary: {
      vi: 'Xác định cơ quan tiếp nhận hồ sơ và hướng dẫn trình tự nộp, xử lý hồ sơ kiểm tra nhà nước về an toàn thực phẩm đối với hàng nhập khẩu.',
      en: 'Identifies the receiving authority and sets out how food-safety inspection dossiers for imports are filed and processed.',
    },
    url: 'https://drive.google.com/file/d/1VfDGw-aKKagJvMdC_Ln2n0PSodK_UY-T/view',
  },
  {
    id: 'attp-tu-01-09-2026',
    group: 'food-safety',
    type: { vi: 'Thông báo', en: 'Notice' },
    effective: {
      vi: 'Hiệu lực từ 01/9/2026',
      en: 'Effective 1 September 2026',
    },
    title: {
      vi: 'Thông báo về việc thực hiện kiểm tra nhà nước về an toàn thực phẩm đối với hàng hóa có nguồn gốc thực vật nhập khẩu từ ngày 01/9/2026',
      en: 'Notice on state food-safety inspection of imported plant-origin goods from 1 September 2026',
    },
    summary: {
      vi: 'Mốc thời gian và cách thức triển khai kiểm tra nhà nước về ATTP đối với hàng hóa có nguồn gốc thực vật nhập khẩu kể từ 01/9/2026.',
      en: 'Timeline and arrangements for state food-safety inspection of imported plant-origin goods from 1 September 2026.',
    },
    url: 'https://drive.google.com/file/d/1aHIONG5KgyHwoaJl-DIEF3HW8m_8Dy_s/view',
  },
  {
    id: 'tt-22-2026-bnnmt',
    group: 'administrative',
    type: { vi: 'Thông tư', en: 'Circular' },
    number: '22/2026/TT-BNNMT',
    issued: { vi: 'Ngày 19/5/2026', en: '19 May 2026' },
    title: {
      vi: 'Sửa đổi, bổ sung một số Thông tư liên quan phân cấp, cắt giảm, đơn giản hóa thủ tục hành chính thuộc phạm vi quản lý nhà nước của Bộ Nông nghiệp và Môi trường',
      en: 'Amending and supplementing several Circulars on decentralisation, reduction and simplification of administrative procedures under the Ministry of Agriculture and Environment',
    },
    summary: {
      vi: 'Văn bản gốc sửa đổi nhiều thông tư, phân cấp và đơn giản hóa thủ tục hành chính trong lĩnh vực nông nghiệp và môi trường.',
      en: 'The source Circular amending multiple circulars to decentralise and simplify administrative procedures in agriculture and environment.',
    },
    url: 'https://drive.google.com/file/d/1cT5BjmDKHPZ_WU5eVEJrUP0zekB1C1jb/view',
  },
  {
    id: 'phoi-hop-phan-cap-attp',
    group: 'administrative',
    type: { vi: 'Công văn', en: 'Official letter' },
    title: {
      vi: 'Phối hợp triển khai quy định phân cấp kiểm tra nhà nước về ATTP nhập khẩu',
      en: 'Coordination in implementing the decentralised state food-safety inspection regime for imports',
    },
    summary: {
      vi: 'Đề nghị phối hợp giữa các cơ quan, đơn vị khi áp dụng quy định phân cấp kiểm tra nhà nước về ATTP đối với hàng nhập khẩu.',
      en: 'Requests inter-agency coordination when applying the decentralised food-safety inspection rules for imports.',
    },
    url: 'https://drive.google.com/file/d/13QrHKappIZUegrX2B9LVKiAzLohhfzv-/view',
  },
  {
    id: 'trien-khai-phan-cap-attp',
    group: 'administrative',
    type: { vi: 'Công văn', en: 'Official letter' },
    title: {
      vi: 'Triển khai quy định phân cấp kiểm tra nhà nước về ATTP nhập khẩu',
      en: 'Implementation of the decentralised state food-safety inspection regime for imports',
    },
    summary: {
      vi: 'Hướng dẫn triển khai trên thực tế việc phân cấp kiểm tra nhà nước về an toàn thực phẩm đối với hàng hóa nhập khẩu.',
      en: 'Practical guidance on rolling out decentralised state food-safety inspection for imported goods.',
    },
    url: 'https://drive.google.com/file/d/1YOg0Vh4HLFtopu6lHYqXH3LacqCU8fhw/view',
  },
];

export const regulationCopy = {
  vi: {
    label: 'VĂN BẢN PHÁP LÝ',
    title: 'Thông tư & Quy định',
    nav: 'Thông tư',
    intro:
      'Tổng hợp thông tư, thông báo và công văn mới nhất về kiểm dịch thực vật và kiểm tra nhà nước về an toàn thực phẩm đối với hàng hóa có nguồn gốc thực vật xuất nhập khẩu. Bản gốc được lưu trữ dạng chỉ đọc để đội ngũ và đối tác của HMV Global tra cứu nhanh.',
    view: 'Xem văn bản',
    note: 'Tài liệu chỉ mang tính tham khảo. Khi áp dụng cho lô hàng cụ thể, vui lòng đối chiếu bản gốc do cơ quan có thẩm quyền ban hành hoặc liên hệ HMV Global.',
    ask: 'Cần tư vấn hồ sơ KDTV / ATTP cho lô hàng của bạn?',
  },
  en: {
    label: 'REGULATORY LIBRARY',
    title: 'Circulars & Regulations',
    nav: 'Regulations',
    intro:
      'A curated set of the latest circulars, notices and official letters on plant quarantine and state food-safety inspection for plant-origin goods in trade. Originals are kept read-only so the HMV Global team and partners can check them quickly.',
    view: 'View document',
    note: 'Provided for reference only. For a specific shipment, always check the original text issued by the competent authority or contact HMV Global.',
    ask: 'Need help with plant quarantine or food-safety dossiers?',
  },
};
