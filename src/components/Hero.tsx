import { HOY } from '../data/config';
import { DESTINOS } from '../data/destinos';
import { useI18n } from '../i18n';
import { estadoEn, ventanaPleno } from '../lib/fenologia';
import { fmtDia, fmtRango } from '../lib/fechas';
import { DataTypeTag, Eyebrow, PhaseGlyph } from './ui/Badges';
import { Icon } from './ui/Icon';

export function Hero({ onPick, onMethod }: { onPick: (id: string) => void; onMethod: () => void }) {
  const { t, lang } = useI18n();
  const ahora = DESTINOS.map((d) => ({ d, e: estadoEn(d, HOY) })).filter(({ e }) => e.fase === 'avance' || e.fase === 'pleno');
  const proximo = DESTINOS.filter((d) => d.estado.fase === 'fuera_temporada').sort((a, b) =>
    ventanaPleno(a).desde.localeCompare(ventanaPleno(b).desde),
  )[0];

  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <div className="hero__copy">
          <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
          <h1 className="hero__title">{t('hero.title')}</h1>
          <p className="hero__lead">{t('hero.lead')}</p>
          <div className="btn-row">
            <a href="#mapa" className="btn btn--primary btn--lg">
              {t('hero.explore')}
            </a>
            <button type="button" className="btn btn--ghost btn--lg" onClick={onMethod}>
              {t('hero.how')}
            </button>
          </div>
        </div>

        <aside aria-labelledby="hero-now" className="now-card">
          <div className="now-card__head">
            <p id="hero-now" className="label">
              {t('hero.asideTitle')}
            </p>
            <span className="now-badge">
              <span aria-hidden="true" className="now-badge__dot" />
              {fmtDia(HOY, lang, true)}
            </span>
          </div>
          <div className="now-card__list">
            {ahora.length === 0 && <p className="muted">{t('hero.asideEmpty')}</p>}
            {ahora.map(({ d, e }) => (
              <button key={d.id} type="button" className="now-item" onClick={() => onPick(d.id)}>
                <span className="now-item__glyph">
                  <PhaseGlyph fase={e.fase} size={32} />
                </span>
                <span className="now-item__text">
                  <span className="now-item__name">{d.nombre}</span>
                  <span className="now-item__meta">{t(`fase.${d.tipo}.${e.fase}`)}</span>
                  <DataTypeTag tipo={e.tipoDato} />
                </span>
                <Icon name="chevronRight" />
              </button>
            ))}
            {proximo && (
              <>
                <p className="label label--sub">{t('hero.next')}</p>
                <button type="button" className="now-item" onClick={() => onPick(proximo.id)}>
                  <span className="now-item__glyph">
                    <PhaseGlyph fase="fuera_temporada" size={32} />
                  </span>
                  <span className="now-item__text">
                    <span className="now-item__name">{proximo.nombre}</span>
                    <span className="now-item__meta">
                      {t(`fase.${proximo.tipo}.pleno`)}: {fmtRango(ventanaPleno(proximo).desde, ventanaPleno(proximo).hasta, lang, true)}
                    </span>
                    <DataTypeTag tipo="previsto" />
                  </span>
                  <Icon name="chevronRight" />
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
