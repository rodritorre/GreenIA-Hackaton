import { useState } from 'react';
import { FUENTES, LOG_INGESTA } from '../data/comercial';
import { useI18n } from '../i18n';
import { fmtHora } from '../lib/fechas';
import type { EntradaLog } from '../types';
import { Icon } from '../components/ui/Icon';

/** Admin: data freshness and the automatic pipeline (PRIN-2.3, PRIN-2.5, NFR-4). Simulated. */
export function DataSection() {
  const { t, lang } = useI18n();
  const [log, setLog] = useState<EntradaLog[]>(LOG_INGESTA);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    window.setTimeout(() => {
      const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setLog((l) => [...l, { hora, nivel: 'info', mensaje: t('data.ranOk') }]);
      setRunning(false);
    }, 1200);
  };

  return (
    <>
      <div className="admin-head">
        <p className="muted lead-sm">{t('data.lead')}</p>
        <button type="button" className="btn btn--ghost" onClick={run} disabled={running} aria-busy={running}>
          <Icon name="refresh" size={18} className={running ? 'spin' : ''} />
          {running ? t('data.running') : t('data.run')}
        </button>
      </div>
        <div className="data-grid">
          <div className="table-wrap">
            <table className="sources">
              <thead>
                <tr>
                  <th scope="col">{t('data.source')}</th>
                  <th scope="col">{t('data.last')}</th>
                  <th scope="col">{t('data.status')}</th>
                </tr>
              </thead>
              <tbody>
                {FUENTES.map((f) => (
                  <tr key={f.id}>
                    <th scope="row">
                      <span className="sources__name">{f.nombre}</span>
                      <span className="small muted">{f.detalle}</span>
                    </th>
                    <td>{fmtHora(f.ultimaCarga, lang)}</td>
                    <td>
                      <span className={`status status--${f.estado}`}>
                        <Icon name={f.estado === 'ok' ? 'check' : 'warn'} size={14} />
                        {f.estado === 'ok' ? t('data.ok') : f.estado === 'desactualizado' ? t('data.stale') : t('data.error')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="log">
            <p className="label">{t('data.log')}</p>
            <ol aria-live="polite">
              {log.map((l, i) => (
                <li key={i} className={`log__row log__row--${l.nivel}`}>
                  <time>{l.hora}</time>
                  <span>{l.mensaje}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
    </>
  );
}
