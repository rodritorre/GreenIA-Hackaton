import { useState, type FormEvent } from 'react';
import { api, useApi, type Usuario } from '../api';
import { useI18n } from '../i18n';
import { fmtHora } from '../lib/fechas';
import { Icon } from '../components/ui/Icon';
import { Cargando, useAccion } from './common';

const DATASETS = ['indice', 'temperaturas', 'habituales', 'prevision'] as const;

/** Admin: data freshness, the automatic pipeline (PRIN-2.3, PRIN-2.5, NFR-4) and dataset import (DATA-1). */
export function DataSection({ usuario }: { usuario: Usuario }) {
  const { t, lang } = useI18n();
  const fuentes = useApi(() => api.admin.fuentes(), []);
  const log = useApi(() => api.admin.log(), []);
  const ingesta = useAccion();
  const esAdmin = usuario.rol === 'admin';

  const ejecutar = () =>
    ingesta.run(async () => {
      await api.admin.ejecutarIngesta();
      // the run continues on the server; refresh the log a few times so progress shows up
      for (const ms of [1500, 5000, 15000]) setTimeout(() => (log.reload(), fuentes.reload()), ms);
      return t('data.ranOk');
    });

  return (
    <>
      <div className="admin-head">
        <p className="muted lead-sm">{t('data.lead')}</p>
        {esAdmin && (
          <button type="button" className="btn btn--ghost" onClick={ejecutar} disabled={ingesta.ocupado} aria-busy={ingesta.ocupado}>
            <Icon name="refresh" size={18} className={ingesta.ocupado ? 'spin' : ''} />
            {ingesta.ocupado ? t('data.running') : t('data.run')}
          </button>
        )}
      </div>
      {ingesta.aviso}
      <div className="data-grid">
        <div className="table-wrap">
          <Cargando carga={fuentes}>
            {(rows) => (
              <table className="sources">
                <thead>
                  <tr>
                    <th scope="col">{t('data.source')}</th>
                    <th scope="col">{t('data.last')}</th>
                    <th scope="col">{t('data.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => (
                    <tr key={f.id}>
                      <th scope="row">
                        <span className="sources__name">{f.nombre}</span>
                        <span className="small muted">{f.detalle}</span>
                      </th>
                      <td>{f.ultimaCarga ? fmtHora(f.ultimaCarga, lang) : '—'}</td>
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
            )}
          </Cargando>
        </div>
        <div className="log">
          <p className="label">{t('data.log')}</p>
          <Cargando carga={log}>
            {(rows) => (
              <ol aria-live="polite">
                {rows.map((l, i) => (
                  <li key={i} className={`log__row log__row--${l.nivel}`}>
                    <time dateTime={l.hora}>{new Date(l.hora).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}</time>
                    <span>{l.mensaje}</span>
                  </li>
                ))}
              </ol>
            )}
          </Cargando>
        </div>
      </div>
      {esAdmin && <Importar onDone={() => (log.reload(), fuentes.reload())} />}
    </>
  );
}

function Importar({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const destinos = useApi(() => api.destinos(), []);
  const [dest, setDest] = useState('');
  const [dataset, setDataset] = useState<(typeof DATASETS)[number]>('indice');
  const [file, setFile] = useState<File | null>(null);
  const accion = useAccion();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    accion.run(async () => {
      const r = await api.admin.importar(dest || destinos.data![0].id, dataset, file);
      onDone();
      return [t('admin.imported', { n: r.filas }), ...r.avisos].join(' · ');
    });
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <h3 className="sub">{t('admin.importTitle')}</h3>
      <p className="small muted">{t('admin.importLead')}</p>
      <div className="admin-form__grid">
        <label className="field field--light">
          {t('alerts.dest')}
          <select id="import-dest" value={dest} onChange={(e) => setDest(e.target.value)}>
            {destinos.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--light">
          {t('admin.dataset')}
          <select id="import-dataset" value={dataset} onChange={(e) => setDataset(e.target.value as typeof dataset)}>
            {DATASETS.map((d) => (
              <option key={d} value={d}>
                {t(`admin.datasets.${d}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--light">
          {t('admin.file')}
          <input id="import-file" type="file" accept=".csv,text/csv" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      <button type="submit" className="btn btn--primary" disabled={!file || accion.ocupado}>
        {t('admin.importBtn')}
      </button>
      {accion.aviso}
    </form>
  );
}
