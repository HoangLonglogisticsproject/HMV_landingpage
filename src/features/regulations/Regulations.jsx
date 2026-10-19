import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  regulations,
  regulationGroups,
  regulationCopy,
} from '@/data/regulations';

export function Regulations({ lang, limit }) {
  const c = regulationCopy[lang];
  const items = limit ? regulations.slice(0, limit) : regulations;
  const groups = regulationGroups
    .map(g => ({ ...g, docs: items.filter(d => d.group === g.id) }))
    .filter(g => g.docs.length);
  return (
    <section className="regulations section-pad" aria-labelledby="regs-title">
      <div className="content-width">
        {limit ? (
          <div className="section-heading">
            <div>
              <p className="eyebrow">{c.label}</p>
              <h2 id="regs-title">{c.title}</h2>
            </div>
            <Link className="text-link" to="/regulations">
              {lang === 'vi' ? 'Xem tất cả văn bản' : 'All documents'}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <p className="eyebrow">{c.label}</p>
            <h2 id="regs-title">{c.title}</h2>
            <p className="body-copy">{c.intro}</p>
          </>
        )}
        {groups.map(g => (
          <div key={g.id} className="reg-group">
            <h3 className="reg-group-title">
              <ScrollText size={16} />
              {g.label[lang]}
            </h3>
            <div className="reg-grid">
              {g.docs.map(d => (
                <article key={d.id} className="reg-card">
                  <div className="reg-card-meta">
                    <span className="reg-type">{d.type[lang]}</span>
                    {d.number && <span className="reg-number">{d.number}</span>}
                    {(d.issued || d.effective) && (
                      <span>{(d.issued || d.effective)[lang]}</span>
                    )}
                  </div>
                  <h4>{d.title[lang]}</h4>
                  <p>{d.summary[lang]}</p>
                  <a
                    className="reg-link"
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={15} />
                    {c.view}
                    <ArrowUpRight size={15} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        ))}
        <p className="commercial-note reg-note">{c.note}</p>
        {!limit && (
          <Button asChild size="lg" variant="brand">
            <Link to="/contact">
              {c.ask}
              <ArrowUpRight />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
