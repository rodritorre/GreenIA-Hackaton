import { api, useApi } from '../api';
import { useI18n } from '../i18n';
import { fmtHora } from '../lib/fechas';
import { PhaseGlyph } from '../components/ui/Badges';
import { Icon } from '../components/ui/Icon';
import { Cargando, useAccion } from './common';

const MOTIVOS: Record<string, string> = { lejos: 'admin.farReason', antigua: 'admin.oldReason' };

/** Admin: moderation queue for citizen photos (EXT-2: CIT-3, CIT-6). */
export function PhotosSection() {
  const { t, lang } = useI18n();
  const fotos = useApi(() => api.admin.fotos(), []);
  const destinos = useApi(() => api.destinos(), []);
  const accion = useAccion();
  const destino = (id: string) => destinos.data?.find((d) => d.id === id);

  const moderar = (id: number, estado: 'valida' | 'rechazada') =>
    accion.run(async () => {
      await api.admin.moderar(id, estado);
      fotos.reload();
    });

  return (
    <>
      <p className="muted lead-sm">{t('admin.photosLead')}</p>
      {accion.aviso}
      <Cargando carga={fotos}>
        {(rows) => (
          <ul className="mod-list">
            {rows.map((f) => {
              const d = destino(f.destinoId);
              const lejos = f.distanciaKm !== null && f.distanciaKm > 3;
              const antigua = f.horas !== null && f.horas > 72;
              return (
                <li key={f.id} className={`mod mod--${f.estado}`}>
                  {f.url ? (
                    <img className="mod__thumb" src={f.url} alt="" />
                  ) : (
                    <span className="mod__thumb" style={{ background: d?.color }} aria-hidden="true">
                      <Icon name="camera" />
                    </span>
                  )}
                  <div className="mod__body">
                    <p className="mod__title">
                      {d?.nombre ?? f.destinoId} · {fmtHora(f.capturadaEn ?? f.recibidaEn, lang)}
                    </p>
                    <p className="small muted mod__phase">
                      <PhaseGlyph fase={f.faseReportada} size={14} />
                      {t('admin.reported', { fase: t(`fase.${d?.tipo ?? 'floracion'}.${f.faseReportada}`) })}
                    </p>
                    <ul className="checks-inline" aria-label={t('admin.autoChecks')}>
                      {f.distanciaKm !== null && (
                        <li className={lejos ? 'is-bad' : 'is-ok'}>
                          <Icon name={lejos ? 'x' : 'check'} size={14} />
                          {t('admin.distance', { n: f.distanciaKm.toLocaleString(lang, { maximumFractionDigits: 1 }), zona: f.zona ?? d?.nombre ?? '' })}
                        </li>
                      )}
                      {f.horas !== null && (
                        <li className={antigua ? 'is-bad' : 'is-ok'}>
                          <Icon name={antigua ? 'x' : 'check'} size={14} />
                          {t('admin.age', { n: Math.round(f.horas) })}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="mod__actions">
                    <span className={`status status--${f.estado === 'valida' ? 'ok' : f.estado === 'pendiente' ? 'desactualizado' : 'error'}`}>
                      {f.estado === 'valida' ? t('admin.valid') : f.estado === 'pendiente' ? t('admin.pending') : t('admin.rejected')}
                      {f.estado === 'rechazada' && f.motivo && ` · ${MOTIVOS[f.motivo] ? t(MOTIVOS[f.motivo]) : f.motivo}`}
                    </span>
                    {f.estado === 'pendiente' && (
                      <span className="btn-row">
                        <button type="button" className="btn btn--primary btn--sm" disabled={accion.ocupado} onClick={() => moderar(f.id, 'valida')}>
                          {t('admin.approve')}
                        </button>
                        <button type="button" className="btn btn--ghost btn--sm" disabled={accion.ocupado} onClick={() => moderar(f.id, 'rechazada')}>
                          {t('admin.reject')}
                        </button>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Cargando>
    </>
  );
}
