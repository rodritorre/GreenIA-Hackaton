import { FOTOS } from '../../data/comercial';
import { HOY } from '../../data/config';
import { useI18n } from '../../i18n';
import { FASES_ACTIVAS, intensidadMes, ventanaPleno } from '../../lib/fenologia';
import { addMonths, diffDays, firstOfMonth, fmtDia, fmtHora, fmtMes, fmtRango, fmtTipica } from '../../lib/fechas';
import type { Destino } from '../../types';
import { IndiceChart, MarginChart, TempChart } from '../charts/Charts';
import { ConfidenceBadge, DataTypeTag, LayerHeading, PhaseGlyph } from '../ui/Badges';
import { Icon } from '../ui/Icon';

export function CuandoIr({ d, onMethod, onAlert }: { d: Destino; onMethod: () => void; onAlert: (id: string) => void }) {
  const { t, lang } = useI18n();
  const pleno = ventanaPleno(d);
  const fotos = FOTOS.filter((f) => f.destinoId === d.id);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(firstOfMonth(HOY), i));

  return (
    <div className="ficha-body">
      <LayerHeading capa="calculada" />

      {/* PRIN-4.1 / UX-2: the answer to "¿cuándo voy?" comes first */}
      <div className="best">
        <p className="label">{t('ficha.bestTime')}</p>
        <p className="best__range">
          {t('ficha.bestRange', {
            fase: t(`fase.${d.tipo}.pleno`),
            desde: fmtDia(pleno.desde, lang),
            hasta: fmtDia(pleno.hasta, lang, true),
          })}
        </p>
        <div className="best__meta">
          <ConfidenceBadge confianza={pleno.confianza} probabilidad={pleno.probabilidad} />
          <DataTypeTag tipo={pleno.tipoDato} />
        </div>
        <p className="small muted">
          {t('ficha.basedOn', { hasta: fmtDia(d.entradasHasta, lang), gen: fmtHora(d.generadaEn, lang) })} · {t('ficha.source', { fuente: pleno.fuente })}
        </p>
      </div>

      {/* FIC-8 / HON-1 */}
      <p className="honesty">
        <Icon name="satellite" size={18} />
        <span>
          {t('ficha.honesty')}{' '}
          <button type="button" className="link-button" onClick={onMethod}>
            {t('ficha.honestyLink')}
          </button>
        </span>
      </p>

      {/* FIC-3 + FIC-4 + PRIN-1.4 */}
      <section>
        <h4 className="sub">{t('ficha.phases')}</h4>
        <table className="phases">
          <thead>
            <tr>
              <th scope="col">{t('ficha.colPhase')}</th>
              <th scope="col">{t('ficha.colThisYear')}</th>
              <th scope="col">{t('ficha.colUsual')}</th>
            </tr>
          </thead>
          <tbody>
            {FASES_ACTIVAS.map((f) => {
              const v = d.ventanas.find((w) => w.fase === f)!;
              const h = d.habituales.find((w) => w.fase === f)!;
              const year = v.desde.slice(0, 4);
              const delta = diffDays(v.desde, `${year}-${h.tipica}`) + Math.round(diffDays(v.hasta, v.desde) / 2);
              const isNow = d.estado.fase === f;
              return (
                <tr key={f} className={isNow ? 'is-now' : ''}>
                  <th scope="row">
                    <span className="phases__fase">
                      <PhaseGlyph fase={f} size={16} />
                      {t(`fase.${d.tipo}.${f}`)}
                    </span>
                  </th>
                  <td>
                    <strong>{v.desde === v.hasta ? fmtDia(v.desde, lang) : fmtRango(v.desde, v.hasta, lang)}</strong>
                    <span className="phases__tags">
                      <DataTypeTag tipo={v.tipoDato} />
                      {v.tipoDato === 'previsto' && <ConfidenceBadge confianza={v.confianza} />}
                    </span>
                  </td>
                  <td>
                    {fmtTipica(h.tipica, lang)}
                    <span className="phases__delta">
                      {Math.abs(delta) <= 1 ? t('ficha.onTime') : delta < 0 ? t('ficha.earlier', { n: -delta }) : t('ficha.later', { n: delta })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h4 className="sub">{t('ficha.calendar')}</h4>
        <div className="cal" role="list">
          {months.map((m) => {
            const k = intensidadMes(d, Number(m.slice(0, 4)), Number(m.slice(5, 7)));
            const name = fmtMes(m, lang);
            const state = k === 2 ? t('ficha.calPeak') : k === 1 ? t('ficha.calActive') : t('ficha.calOff');
            return (
              <div key={m} role="listitem" className={`cal__cell cal__cell--${k}`} title={`${name} ${m.slice(0, 4)}: ${state}`}>
                <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
                <span className="sr-only">
                  {name} {m.slice(0, 4)}: {state}
                </span>
              </div>
            );
          })}
        </div>
        <p className="cal__legend small muted">
          <span>
            <i className="key key--peak" />
            {t('ficha.calPeak')}
          </span>
          <span>
            <i className="key key--active" />
            {t('ficha.calActive')}
          </span>
          <span>
            <i className="key key--off" />
            {t('ficha.calOff')}
          </span>
        </p>
      </section>

      {d.serie && d.serieprevision ? (
        <>
          <section>
            <div className="sub-row">
              <h4 className="sub">{t('ficha.chartIndex')}</h4>
              <DataTypeTag tipo="estimado" />
            </div>
            <p className="small muted">{t('ficha.chartIndexDesc')}</p>
            <IndiceChart serie={d.serie} prevision={d.serieprevision} umbrales={d.umbrales} />
          </section>
          <section>
            <div className="sub-row">
              <h4 className="sub">{t('ficha.chartTemp')}</h4>
              <DataTypeTag tipo="observado" />
            </div>
            <p className="small muted">{t('ficha.chartTempDesc')}</p>
            <TempChart serie={d.serie} />
          </section>
        </>
      ) : (
        <p className="empty-box">
          <Icon name="info" size={18} />
          {t('ficha.serieEmpty', { temporada: d.temporada })}
        </p>
      )}

      {d.zonas && (
        <section>
          <div className="sub-row">
            <h4 className="sub">{t('ficha.zones')}</h4>
            <DataTypeTag tipo="estimado" />
          </div>
          <p className="small muted">{t('ficha.zonesDesc', { fecha: fmtDia(d.entradasHasta, lang) })}</p>
          <ul className="zones">
            {d.zonas.map((z) => (
              <li key={z.id} className={z.indice === null ? 'is-nodata' : ''}>
                <span className="zones__name">{z.nombre}</span>
                <span className="zones__track" aria-hidden="true">
                  {z.indice !== null && <span className="zones__bar" style={{ width: `${z.indice * 100}%` }} />}
                </span>
                <span className="zones__val">
                  {z.indice === null ? (
                    <>
                      {t('ficha.noData')} <span className="muted">({t('ficha.clouds')})</span>
                    </>
                  ) : (
                    <>
                      {z.indice.toLocaleString(lang, { minimumFractionDigits: 2 })} · {t(`fase.short.${z.fase}`)}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.historicoMargen && (
        <section>
          <h4 className="sub">{t('ficha.margin')}</h4>
          <p className="small muted">{t('ficha.marginDesc')}</p>
          <MarginChart hist={d.historicoMargen} ventana={pleno} />
        </section>
      )}

      {d.comparativa && (
        <section className="compare">
          <h4 className="sub">{t('ficha.compare')}</h4>
          <dl>
            <div>
              <dt>{t('ficha.compareProvided')}</dt>
              <dd>{fmtRango(d.comparativa.proporcionada.desde, d.comparativa.proporcionada.hasta, lang)}</dd>
            </div>
            <div>
              <dt>{t('ficha.compareOwn')}</dt>
              <dd>
                {fmtRango(d.comparativa.propia.desde, d.comparativa.propia.hasta, lang)} · {Math.round(d.comparativa.propia.probabilidad * 100)} %
              </dd>
            </div>
            <div>
              <dt>{t('ficha.compareMae')}</dt>
              <dd>{t('ficha.compareMaeVal', { n: d.comparativa.maeDias.toLocaleString(lang) })}</dd>
            </div>
            <div>
              <dt>{t('ficha.compareCoverage')}</dt>
              <dd>{Math.round(d.comparativa.cobertura * 100)} %</dd>
            </div>
          </dl>
          <p className="compare__why">
            <strong>{t('ficha.compareWhy')}:</strong> {d.comparativa.explicacion}
          </p>
        </section>
      )}

      {fotos.length > 0 && (
        <section>
          <h4 className="sub">{t('ficha.photos')}</h4>
          <p className="small muted">{t('ficha.photosDesc')}</p>
          <ul className="photos">
            {fotos.map((f) => (
              <li key={f.id}>
                <span className="photos__thumb" style={{ background: d.color }} aria-hidden="true">
                  <Icon name="camera" />
                </span>
                <span>
                  {t(`fase.short.${f.faseReportada}`)} · {fmtHora(f.capturadaEn, lang)}
                </span>
                <span className={`photos__state photos__state--${f.estado}`}>
                  {f.estado === 'valida' ? t('ficha.photoValid') : t('ficha.photoPending')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="btn-row">
        <button type="button" className="btn btn--primary grow" onClick={() => onAlert(d.id)}>
          <Icon name="bell" size={18} />
          {t('ficha.alert')}
        </button>
      </div>
    </div>
  );
}
