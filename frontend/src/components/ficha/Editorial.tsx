import { useI18n } from '../../i18n';
import type { Editorial as EditorialData, FuenteCitada, Patrocinio } from '../../api';
import { LayerHeading, SponsoredTag } from '../ui/Badges';
import { Icon } from '../ui/Icon';

export function Editorial({ editorial: e, patrocinio, fuentes = [] }: { editorial: EditorialData | null; patrocinio: Patrocinio | null; fuentes?: FuenteCitada[] }) {
  const { t } = useI18n();
  if (!e) return <p className="empty">{t('ficha.nothing')}</p>;
  return (
    <div className="ficha-body ficha-body--editorial">
      <LayerHeading capa="editorial" />
      <section>
        <h4 className="sub">{t('ficha.history')}</h4>
        <p className="prose">{e.historia}</p>
      </section>
      <section>
        <h4 className="sub">{t('ficha.see')}</h4>
        <ul className="bullets">
          {e.queVer.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="sub">{t('ficha.howToGet')}</h4>
        <p className="prose">{e.comoLlegar}</p>
      </section>
      <section className="notice notice--warn">
        <Icon name="warn" size={18} />
        <div>
          <h4 className="sub">{t('ficha.access')}</h4>
          <p className="prose">{e.acceso}</p>
        </div>
      </section>
      <section>
        <h4 className="sub">{t('ficha.tips')}</h4>
        <ul className="bullets">
          {e.consejos.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      {fuentes.length > 0 && (
        <section>
          <h4 className="sub">{t('ficha.sources')}</h4>
          <ul className="bullets small">
            {fuentes.map((f) => (
              <li key={f.nombre}>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.nombre}
                  </a>
                ) : (
                  f.nombre
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {patrocinio && (
        <aside className="sponsor-slot" aria-label={t('ficha.sponsoredBy', { entidad: patrocinio.entidad })}>
          <SponsoredTag />
          <p className="sponsor-slot__by">{t('ficha.sponsoredBy', { entidad: patrocinio.entidad })}</p>
          <p className="prose">{patrocinio.mensaje}</p>
          <a href="#" className="btn btn--ghost btn--sm">
            {t('plans.view')}
            <Icon name="arrowRight" size={16} />
          </a>
        </aside>
      )}
    </div>
  );
}
