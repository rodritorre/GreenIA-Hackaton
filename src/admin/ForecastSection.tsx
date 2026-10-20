import { useState } from 'react';
import { DESTINOS } from '../data/destinos';
import { useI18n } from '../i18n';
import { fmtDia, fmtHora, fmtRango } from '../lib/fechas';
import { ConfidenceBadge, DataTypeTag } from '../components/ui/Badges';
import { Icon } from '../components/ui/Icon';

/** Admin: current forecasts per destination and validation of our own model (EXT-1: PRED-4…PRED-7). */
export function ForecastSection() {
  const { t, lang } = useI18n();
  const [done, setDone] = useState(false);
  const comparadas = DESTINOS.filter((d) => d.comparativa);

  return (
    <>
      <div className="admin-head">
        <p className="muted lead-sm">{t('admin.forecastLead')}</p>
        <button type="button" className="btn btn--ghost" onClick={() => setDone(true)}>
          <Icon name="refresh" size={18} />
          {t('admin.recalc')}
        </button>
      </div>
      {done && (
        <p role="status" className="notice notice--ok">
          <Icon name="check" size={18} />
          {t('admin.recalcDone', { fecha: fmtDia(DESTINOS[0].entradasHasta, lang) })}
        </p>
      )}
      <div className="table-wrap">
        <table className="sources">
          <thead>
            <tr>
              <th scope="col">{t('admin.colDest')}</th>
              <th scope="col">{t('admin.colPhase')}</th>
              <th scope="col">{t('admin.colRange')}</th>
              <th scope="col">{t('admin.colMethod')}</th>
              <th scope="col">{t('admin.colUntil')}</th>
              <th scope="col">{t('admin.colGen')}</th>
            </tr>
          </thead>
          <tbody>
            {DESTINOS.flatMap((d) =>
              d.ventanas
                .filter((v) => v.fase === 'pleno' || d.estado.fase === v.fase)
                .map((v) => (
                  <tr key={d.id + v.fase}>
                    <th scope="row">{d.nombre}</th>
                    <td>{t(`fase.${d.tipo}.${v.fase}`)}</td>
                    <td>
                      <span className="sources__name">{fmtRango(v.desde, v.hasta, lang, true)}</span>
                      <span className="phases__tags">
                        <DataTypeTag tipo={v.tipoDato} />
                        <ConfidenceBadge confianza={v.confianza} probabilidad={v.probabilidad} />
                      </span>
                    </td>
                    <td>{t(`admin.method.${v.metodo}`)}</td>
                    <td>{fmtDia(d.entradasHasta, lang)}</td>
                    <td>{fmtHora(d.generadaEn, lang)}</td>
                  </tr>
                )),
            )}
          </tbody>
        </table>
      </div>

      {comparadas.map((d) => {
        const c = d.comparativa!;
        return (
          <section key={d.id} className="compare compare--admin">
            <h3 className="sub">
              {t('admin.validation')} · {d.nombre} · {t(`fase.${d.tipo}.${c.fase}`)}
            </h3>
            <dl>
              <div>
                <dt>{t('ficha.compareProvided')}</dt>
                <dd>{fmtRango(c.proporcionada.desde, c.proporcionada.hasta, lang)}</dd>
              </div>
              <div>
                <dt>{t('ficha.compareOwn')}</dt>
                <dd>
                  {fmtRango(c.propia.desde, c.propia.hasta, lang)} · {Math.round(c.propia.probabilidad * 100)} %
                </dd>
              </div>
              <div>
                <dt>{t('ficha.compareMae')}</dt>
                <dd>{t('ficha.compareMaeVal', { n: c.maeDias.toLocaleString(lang) })}</dd>
              </div>
              <div>
                <dt>{t('ficha.compareCoverage')}</dt>
                <dd>{Math.round(c.cobertura * 100)} %</dd>
              </div>
            </dl>
            <p className="compare__why">
              <strong>{t('ficha.compareWhy')}:</strong> {c.explicacion}
            </p>
          </section>
        );
      })}
    </>
  );
}
