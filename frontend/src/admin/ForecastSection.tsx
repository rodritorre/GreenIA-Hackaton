import { api, useApi, type Usuario } from '../api';
import { useI18n } from '../i18n';
import { fmtDia, fmtHora, fmtRango } from '../lib/fechas';
import { ConfidenceBadge, DataTypeTag } from '../components/ui/Badges';
import { Icon } from '../components/ui/Icon';
import { Cargando, useAccion } from './common';

/** Admin: current forecasts per destination and our model against the provided forecast (EXT-1: PRED-4…PRED-7). */
export function ForecastSection({ usuario }: { usuario: Usuario }) {
  const { t, lang } = useI18n();
  const previsiones = useApi(() => api.admin.previsiones(), []);
  const comparativa = useApi(() => api.admin.comparativa(), []);
  const destinos = useApi(() => api.destinos(), []);
  const accion = useAccion();
  const nombre = (id: string) => destinos.data?.find((d) => d.id === id)?.nombre ?? id;

  const recalcular = () =>
    accion.run(async () => {
      const r = await api.admin.recalcular();
      previsiones.reload();
      comparativa.reload();
      return r.mensaje;
    });

  return (
    <>
      <div className="admin-head">
        <p className="muted lead-sm">{t('admin.forecastLead')}</p>
        {usuario.rol === 'admin' && (
          <button type="button" className="btn btn--ghost" onClick={recalcular} disabled={accion.ocupado}>
            <Icon name="refresh" size={18} className={accion.ocupado ? 'spin' : ''} />
            {t('admin.recalc')}
          </button>
        )}
      </div>
      {accion.aviso}
      <div className="table-wrap">
        <Cargando carga={previsiones}>
          {(rows) => (
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
                {rows.map((p) => (
                  <tr key={p.destinoId + p.ventana.fase}>
                    <th scope="row">{p.destino}</th>
                    <td>{t(`fase.${p.tipo}.${p.ventana.fase}`)}</td>
                    <td>
                      <span className="sources__name">{fmtRango(p.ventana.desde, p.ventana.hasta, lang, true)}</span>
                      <span className="phases__tags">
                        <DataTypeTag tipo={p.ventana.tipoDato} />
                        <ConfidenceBadge confianza={p.ventana.confianza} probabilidad={p.ventana.probabilidad} />
                      </span>
                    </td>
                    <td>{t(`admin.method.${p.ventana.metodo}`)}</td>
                    <td>{p.entradasHasta ? fmtDia(p.entradasHasta, lang) : '—'}</td>
                    <td>{p.generadaEn ? fmtHora(p.generadaEn, lang) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cargando>
      </div>

      <Cargando carga={comparativa}>
        {(rows) =>
          rows.map((c) => (
            <section key={c.destinoId + c.fase} className="compare compare--admin">
              <h3 className="sub">
                {t('admin.validation')} · {nombre(c.destinoId)} · {t(`fase.short.${c.fase}`)}
              </h3>
              <dl>
                <div>
                  <dt>{t('ficha.compareProvided')}</dt>
                  <dd>{fmtRango(c.proporcionadaDesde, c.proporcionadaHasta, lang)}</dd>
                </div>
                <div>
                  <dt>{t('ficha.compareOwn')}</dt>
                  <dd>
                    {fmtRango(c.propiaDesde, c.propiaHasta, lang)} · {Math.round(c.propiaProbabilidad * 100)} %
                  </dd>
                </div>
                <div>
                  <dt>{t('ficha.compareMae')}</dt>
                  <dd>{c.maeDias === null ? t('admin.notValidated') : t('ficha.compareMaeVal', { n: c.maeDias.toLocaleString(lang) })}</dd>
                </div>
                <div>
                  <dt>{t('ficha.compareCoverage')}</dt>
                  <dd>{c.cobertura === null ? t('admin.notValidated') : `${Math.round(c.cobertura * 100)} %`}</dd>
                </div>
              </dl>
              <p className="compare__why">
                <strong>{t('ficha.compareWhy')}:</strong> {c.explicacion}
              </p>
            </section>
          ))
        }
      </Cargando>
    </>
  );
}
