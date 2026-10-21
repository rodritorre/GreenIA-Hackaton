import { useI18n } from '../i18n';
import { ventanaPleno } from '../lib/fases';
import { fmtDia } from '../lib/fechas';
import { useDatos, useMapa } from '../state';
import { Eyebrow, FasePill, LayerHeading, SponsoredTag } from './ui/Badges';
import { FlowerArt } from './ui/FlowerArt';
import { Icon } from './ui/Icon';

/** "Dónde dormir / qué hacer" — the design's trip cards, now the commercial layer (PRIN-4.2, PRIN-4.3, MON-1). */
export function PlansSection({ fecha, onPick }: { fecha: string; onPick: (id: string) => void }) {
  const { t, lang } = useI18n();
  const { destinos, ofertas: OFERTAS, getDestino } = useDatos();
  const { estados } = useMapa(fecha);
  const enTemporada = destinos.filter((d) => (estados.get(d.id)?.fase ?? 'fuera_temporada') !== 'fuera_temporada').map((d) => d.id);
  const proximo = destinos
    .filter((d) => ventanaPleno(d) && ventanaPleno(d)!.hasta >= fecha)
    .sort((a, b) => ventanaPleno(a)!.desde.localeCompare(ventanaPleno(b)!.desde))[0];
  const ids = enTemporada.length ? enTemporada : proximo ? [proximo.id] : [];
  const ofertas = OFERTAS.filter((o) => ids.includes(o.destinoId))
    .sort((a, b) => Number(b.patrocinado) - Number(a.patrocinado))
    .slice(0, 6);

  return (
    <section id="planes" className="plans" aria-labelledby="plans-title">
      <div className="container">
        <div className="section-head">
          <div>
            <Eyebrow>{t('plans.eyebrow')}</Eyebrow>
            <h2 id="plans-title" className="h2">
              {t('plans.title', { fecha: fmtDia(fecha, lang, true) })}
            </h2>
            <p className="muted lead-sm">{enTemporada.length ? t('plans.lead') : t('plans.leadNone')}</p>
          </div>
          <LayerHeading capa="comercial">
            <span className="small muted">{t('ficha.neutral')}</span>
          </LayerHeading>
        </div>
        <div className="cards">
          {ofertas.map((o) => {
            const d = getDestino(o.destinoId);
            const e = estados.get(o.destinoId);
            if (!d || !e) return null;
            return (
              <article key={o.id} className="card">
                <div className="card__band" style={{ background: `color-mix(in srgb, ${d.color} 22%, #fff)` }}>
                  <FlowerArt kind={d.ilustracion} size={150} className="card__art" />
                  <span className="card__pill">
                    <FasePill fase={e.fase} tipo={d.tipo} />
                  </span>
                  {o.patrocinado && (
                    <span className="card__sponsor">
                      <SponsoredTag />
                    </span>
                  )}
                </div>
                <div className="card__body">
                  <p className="card__kicker">
                    <Icon name={o.tipo === 'alojamiento' ? 'bed' : 'compass'} size={16} />
                    {o.tipo === 'alojamiento' ? t('plans.stay') : t('plans.activity')} ·{' '}
                    <button type="button" className="link-button" onClick={() => onPick(d.id)}>
                      {d.nombre}
                    </button>
                  </p>
                  <h3 className="card__title">{o.nombre}</h3>
                  <p className="card__text">{o.descripcion}</p>
                  <div className="card__foot">
                    <span className="small muted">
                      {t('ficha.fromPrice')} <strong className="price">{o.precio}</strong>
                    </span>
                    <a href={o.url ?? '#'} className="btn btn--primary" target={o.url ? '_blank' : undefined} rel="noopener sponsored">
                      {t('plans.view')}
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
