import { LivingLogistics } from './LivingLogistics';

export function GlobalReach({ lang }) {
  const nodes = lang === 'vi'
    ? [['Vùng trồng', 'Kết nối người trồng, quy cách và mùa vụ.'], ['Chế biến', 'Đối tác sơ chế, đóng gói hoặc chế biến theo yêu cầu.'], ['Cảng xuất', 'Chứng từ và điều phối giao hàng xuất khẩu.']]
    : [['Farm', 'Grower sourcing, specification and season planning.'], ['Processing', 'Partner packing or processing to buyer requirements.'], ['Port', 'Export documentation and delivery coordination.']];
  return (
    <section className="global-reach">
      <div className="content-width">
        <p className="eyebrow">{lang === 'vi' ? 'TẦM VƯƠN TOÀN CẦU' : 'GLOBAL REACH'}</p>
        <h2>{lang === 'vi' ? 'Từ Việt Nam đến châu Âu & Hoa Kỳ.' : 'From Vietnam to Europe & the USA.'}</h2>
        <LivingLogistics lang={lang} />
        {/* Each node is a button described by its tooltip, which shows on hover and on keyboard focus. */}
        <ol className="chain-nodes">{nodes.map((n, i) => <li key={n[0]} className="glass"><button type="button" className="flex items-center gap-[14px]" aria-describedby={`reach-tip-${i}`}><span>0{i + 1}</span><strong>{n[0]}</strong></button><em role="tooltip" id={`reach-tip-${i}`}>{n[1]}</em></li>)}</ol>
        <p className="reach-note">{lang === 'vi' ? 'Bản đồ minh họa thị trường mục tiêu, không phải tuyến hàng đã vận hành.' : 'Illustrative target markets, not a record of operated routes.'}</p>
      </div>
    </section>
  );
}
