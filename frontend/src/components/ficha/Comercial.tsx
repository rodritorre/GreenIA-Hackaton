import { useI18n } from '../../i18n';
import type { Oferta } from '../../api';
import { LayerHeading, SponsoredTag } from '../ui/Badges';
import { Icon } from '../ui/Icon';

function OfertaRow({ o }: { o: Oferta }) {
  const { t } = useI18n();
  return (
    <li className="offer">
      <span className="offer__icon" aria-hidden="true">
        <Icon name={o.tipo === 'alojamiento' ? 'bed' : 'compass'} />
      </span>
      <span className="offer__text">
        <span className="offer__name">
          {o.nombre}
          {o.patrocinado && <SponsoredTag />}
        </span>
        <span className="small muted">{o.descripcion}</span>
        <span className="small muted">{o.distanciaKm === 0 ? t('ficha.onSite') : t('ficha.km', { n: o.distanciaKm })}</span>
      </span>
      <span className="offer__end">
        <span className="small muted">
          {t('ficha.fromPrice')} <strong className="price">{o.precio}</strong>
        </span>
        <a href={o.url ?? '#'} className="btn btn--ghost btn--sm" target={o.url ? '_blank' : undefined} rel="noopener sponsored">
          {t('ficha.book')}
        </a>
      </span>
    </li>
  );
}

/** Commercial layer (FIC-11, FIC-12, MON-1, MON-2). Kept apart from the forecast (MON-3). */
export function Comercial({ ofertas }: { ofertas: Oferta[] }) {
  const { t } = useI18n();
  const stay = ofertas.filter((o) => o.tipo === 'alojamiento');
  const act = ofertas.filter((o) => o.tipo === 'actividad');
  return (
    <div className="ficha-body">
      <LayerHeading capa="comercial">
        <span className="small muted">{t('ficha.neutral')}</span>
      </LayerHeading>
      {ofertas.length === 0 && <p className="empty">{t('ficha.nothing')}</p>}
      {stay.length > 0 && (
        <section>
          <h4 className="sub">{t('ficha.stayTitle')}</h4>
          <ul className="offers">
            {stay.map((o) => (
              <OfertaRow key={o.id} o={o} />
            ))}
          </ul>
        </section>
      )}
      {act.length > 0 && (
        <section>
          <h4 className="sub">{t('ficha.doTitle')}</h4>
          <ul className="offers">
            {act.map((o) => (
              <OfertaRow key={o.id} o={o} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
