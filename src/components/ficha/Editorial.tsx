import { useI18n } from '../../i18n';
import type { Destino } from '../../types';
import { LayerHeading, SponsoredTag } from '../ui/Badges';
import { Icon } from '../ui/Icon';

export function Editorial({ d }: { d: Destino }) {
  const { t } = useI18n();
  const e = d.editorial;
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
      {d.patrocinio && (
        <aside className="sponsor-slot" aria-label={t('ficha.sponsoredBy', { entidad: d.patrocinio.entidad })}>
          <SponsoredTag />
          <p className="sponsor-slot__by">{t('ficha.sponsoredBy', { entidad: d.patrocinio.entidad })}</p>
          <p className="prose">{d.patrocinio.mensaje}</p>
          <a href="#" className="btn btn--ghost btn--sm">
            {t('plans.view')}
            <Icon name="arrowRight" size={16} />
          </a>
        </aside>
      )}
    </div>
  );
}
