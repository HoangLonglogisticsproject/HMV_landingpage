const sampleReviews = [
  ['John D.', { vi: 'Nhập khẩu nông sản (Đức)', en: 'Agri-produce importer (Germany)' }, { vi: 'HMV Global cung cấp chất lượng chanh dây cực kỳ ổn định. Chuỗi cung ứng của họ giúp chúng tôi an tâm tuyệt đối.', en: 'HMV Global delivers remarkably consistent passion fruit quality. Their supply chain gives us complete peace of mind.' }],
  ['Sarah W.', { vi: 'Chuỗi siêu thị (Mỹ)', en: 'Supermarket chain (USA)' }, { vi: 'Truy xuất nguồn gốc rõ ràng và quy trình đóng gói chuyên nghiệp. Đối tác chiến lược đáng tin cậy.', en: 'Clear traceability and professional packing. A strategic partner we can rely on.' }],
  ['Marc L.', { vi: 'Nhà phân phối trái cây (Pháp)', en: 'Fruit distributor (France)' }, { vi: 'Trao đổi nhanh, quy cách rõ ràng và phản hồi đúng hẹn ở mọi khâu.', en: 'Fast communication, clear specifications and on-time responses at every step.' }],
  ['Emma K.', { vi: 'Nhà sản xuất thực phẩm (Hà Lan)', en: 'Food manufacturer (Netherlands)' }, { vi: 'Một đầu mối duy nhất cho nguồn hàng, chứng từ và giao hàng — đúng điều chúng tôi cần.', en: 'One point of contact for sourcing, documents and delivery — exactly what we needed.' }],
];

export function PartnerCommunity({ lang }) {
  const vi = lang === 'vi';
  const row = [...sampleReviews, ...sampleReviews];
  return (
    <section className="partner-community section-pad" aria-labelledby="partner-title">
      <div className="content-width">
        <p className="eyebrow">{vi ? 'CỘNG ĐỒNG ĐỐI TÁC' : 'PARTNER COMMUNITY'}</p>
        <h2 id="partner-title">{vi ? 'Cộng đồng Đối tác' : 'Partner Community'}</h2>
        <p className="sample-badge">{vi ? 'Nội dung mẫu minh họa — sẽ thay bằng đánh giá thật của đối tác' : 'Sample placeholder content — to be replaced with real partner reviews'}</p>
      </div>
      <div className="marquee"><div className="marquee-track">
        {row.map(([n, r, q], i) => (
          <figure key={i} className="review-card" aria-hidden={i >= sampleReviews.length || undefined}>
            <blockquote>“{q[lang]}”</blockquote>
            <figcaption><span className="review-avatar">{n[0]}</span><span><strong>{n}</strong><em>{r[lang]}</em></span></figcaption>
          </figure>
        ))}
      </div></div>
    </section>
  );
}
