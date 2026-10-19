import { LivingLogistics } from './LivingLogistics';

export function GlobalReach({ lang }) {
  const trust = lang === 'vi'
    ? ['Chuỗi cung ứng xuyên suốt', 'Kiểm soát chất lượng chặt chẽ', 'Điều phối chứng từ xuất khẩu', 'Một đầu mối thương mại']
    : ['End-to-End Supply Chain', 'Strict Quality Control', 'Export Documentation Coordination', 'One Commercial Point of Contact'];
  const nodes = lang === 'vi'
    ? [['Vùng trồng', 'Kết nối người trồng, quy cách và mùa vụ.'], ['Chế biến', 'Đối tác sơ chế, đóng gói hoặc chế biến theo yêu cầu.'], ['Cảng xuất', 'Chứng từ và điều phối giao hàng xuất khẩu.']]
    : [['Farm', 'Grower sourcing, specification and season planning.'], ['Processing', 'Partner packing or processing to buyer requirements.'], ['Port', 'Export documentation and delivery coordination.']];
  return (
    <section className="global-reach">
      <div className="content-width">
        <p className="eyebrow">{lang === 'vi' ? 'TẦM VƯƠN TOÀN CẦU' : 'GLOBAL REACH'}</p>
        <h2>{lang === 'vi' ? 'Từ Việt Nam đến châu Âu & Hoa Kỳ.' : 'From Vietnam to Europe & the USA.'}</h2>
        <LivingLogistics lang={lang} />
        <ol className="chain-nodes">{nodes.map((n, i) => <li key={n[0]} tabIndex={0} className="glass"><span>0{i + 1}</span><strong>{n[0]}</strong><em role="tooltip">{n[1]}</em></li>)}</ol>
        <ul className="trust-list">{trust.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="reach-note">{lang === 'vi' ? 'Bản đồ minh họa thị trường mục tiêu, không phải tuyến hàng đã vận hành.' : 'Illustrative target markets, not a record of operated routes.'}</p>
      </div>
    </section>
  );
}
