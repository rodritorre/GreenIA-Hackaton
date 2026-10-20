import { OFERTAS } from '../data/comercial';
import { DESTINOS, getDestino } from '../data/destinos';
import { useI18n } from '../i18n';
import { estadoEn, ventanaPleno } from '../lib/fenologia';
import { fmtDia } from '../lib/fechas';
import { Eyebrow, FasePill, LayerHeading, SponsoredTag } from './ui/Badges';
import { Icon, PetalWatermark } from './ui/Icon';

/** "Dónde dormir / qué hacer" — the design's trip cards, now the commercial layer (PRIN-4.2, PRIN-4.3, MON-1). */
export function PlansSection({ fecha, onPick }: { fecha: string; onPick: (id: string) => void }) {
  const { t, lang } = useI18n();
  const enTemporada = DESTINOS.filter((d) => estadoEn(d, fecha).fase !== 'fuera_temporada').map((d) => d.id);
  const proximo = DESTINOS.slice().sort((a, b) => ventanaPleno(a).desde.localeCompare(ventanaPleno(b).desde)).find((d) => ventanaPleno(d).hasta >= fecha);
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
            const d = getDestino(o.destinoId)!;
            const e = estadoEn(d, fecha);
            return (
              <article key={o.id} className="card">
                <div className="card__band" style={{ background: d.color }}>
                  <PetalWatermark size={240} className="card__petals" />
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
                    <a href="#" className="btn btn--primary">
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
