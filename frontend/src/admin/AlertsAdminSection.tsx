import { useState } from 'react';
import { api, useApi, type Usuario } from '../api';
import { useI18n } from '../i18n';
import { fmtDia, fmtHora } from '../lib/fechas';
import { Icon } from '../components/ui/Icon';
import { Cargando, useAccion } from './common';

/** Admin: alert subscriptions, test sends and the outbox (EXT-3: ALR-2, ALR-3, ALR-5). */
export function AlertsAdminSection({ usuario }: { usuario: Usuario }) {
  const { t, lang } = useI18n();
  const subs = useApi(() => api.admin.suscripciones(), []);
  const correos = useApi(() => api.admin.correos(), []);
  const destinos = useApi(() => api.destinos(), []);
  const [dest, setDest] = useState('');
  const accion = useAccion();
  const destino = (id: string) => destinos.data?.find((d) => d.id === id);

  const prueba = () =>
    accion.run(async () => {
      await api.admin.prueba(dest || destinos.data![0].id, 'pleno');
      correos.reload();
    });

  return (
    <>
      <p className="muted lead-sm">{t('admin.alertsLead')}</p>
      <div className="table-wrap">
        <Cargando carga={subs}>
          {(rows) =>
            rows.length === 0 ? (
              <p className="empty">{t('admin.noSubs')}</p>
            ) : (
              <table className="sources">
                <thead>
                  <tr>
                    <th scope="col">{t('admin.colDest')}</th>
                    <th scope="col">{t('admin.colPhase')}</th>
                    <th scope="col">{t('admin.subs')}</th>
                    <th scope="col">{t('admin.pendingOptIn')}</th>
                    <th scope="col">{t('admin.nextSend')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const d = destino(s.destinoId);
                    return (
                      <tr key={s.destinoId + s.fase}>
                        <th scope="row">{d?.nombre ?? s.destinoId}</th>
                        <td>{t(`fase.${d?.tipo ?? 'floracion'}.${s.fase}`)}</td>
                        <td className="num">{s.confirmadas.toLocaleString(lang)}</td>
                        <td className="num">{s.sinConfirmar.toLocaleString(lang)}</td>
                        <td>{s.proximoEnvio ? fmtDia(s.proximoEnvio, lang, true) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          }
        </Cargando>
      </div>

      <div className="admin-row">
        <label className="field field--light">
          {t('alerts.dest')}
          <select id="admin-alert-dest" value={dest} onChange={(e) => setDest(e.target.value)}>
            {destinos.data?.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nombre}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn--primary" onClick={prueba} disabled={accion.ocupado}>
          <Icon name="mail" size={18} />
          {t('admin.test')}
        </button>
        {usuario.rol === 'admin' && (
          <button
            type="button"
            className="btn btn--ghost"
            disabled={accion.ocupado}
            onClick={() =>
              accion.run(async () => {
                const r = await api.admin.despachar();
                correos.reload();
                return r.mensaje;
              })
            }
          >
            <Icon name="bell" size={18} />
            {t('admin.dispatch')}
          </button>
        )}
      </div>
      {accion.aviso}

      <section className="admin-card">
        <h3 className="sub">{t('admin.outbox')}</h3>
        <p className="small muted">{t('admin.outboxLead')}</p>
        <Cargando carga={correos}>
          {(rows) =>
            rows.length === 0 ? (
              <p className="muted">{t('admin.noEmails')}</p>
            ) : (
              <ul className="outbox">
                {rows.map((c) => (
                  <li key={c.id}>
                    <details>
                      <summary>
                        <span className="sources__name">{c.asunto}</span>
                        <span className="small muted">
                          {c.para} · {c.tipo} · {c.estado} · {fmtHora(c.creadoEn, lang)}
                        </span>
                      </summary>
                      <pre className="outbox__body">{c.cuerpo}</pre>
                    </details>
                  </li>
                ))}
              </ul>
            )
          }
        </Cargando>
      </section>
    </>
  );
}
