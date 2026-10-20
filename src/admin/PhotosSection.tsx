import { useState } from 'react';
import { FOTOS } from '../data/comercial';
import { getDestino } from '../data/destinos';
import { useI18n } from '../i18n';
import { fmtHora } from '../lib/fechas';
import type { FotoCiudadana } from '../types';
import { PhaseGlyph } from '../components/ui/Badges';
import { Icon } from '../components/ui/Icon';

/** Admin: moderation queue for citizen photos (EXT-2: CIT-3, CIT-6). */
export function PhotosSection() {
  const { t, lang } = useI18n();
  const [estados, setEstados] = useState<Record<string, FotoCiudadana['estado']>>(() => Object.fromEntries(FOTOS.map((f) => [f.id, f.estado])));
  const orden = { pendiente: 0, rechazada: 1, valida: 2 } as const;
  const fotos = FOTOS.slice().sort((a, b) => orden[estados[a.id]] - orden[estados[b.id]]);

  return (
    <>
      <p className="muted lead-sm">{t('admin.photosLead')}</p>
      <ul className="mod-list">
        {fotos.map((f) => {
          const d = getDestino(f.destinoId)!;
          const estado = estados[f.id];
          const lejos = f.distanciaKm > 3;
          const antigua = f.horas > 72;
          return (
            <li key={f.id} className={`mod mod--${estado}`}>
              <span className="mod__thumb" style={{ background: d.color }} aria-hidden="true">
                <Icon name="camera" />
              </span>
              <div className="mod__body">
                <p className="mod__title">
                  {d.nombre} · {fmtHora(f.capturadaEn, lang)}
                </p>
                <p className="small muted mod__phase">
                  <PhaseGlyph fase={f.faseReportada} size={14} />
                  {t('admin.reported', { fase: t(`fase.${d.tipo}.${f.faseReportada}`) })}
                </p>
                <ul className="checks-inline" aria-label={t('admin.autoChecks')}>
                  <li className={lejos ? 'is-bad' : 'is-ok'}>
                    <Icon name={lejos ? 'x' : 'check'} size={14} />
                    {t('admin.distance', { n: f.distanciaKm.toLocaleString(lang), zona: f.zona })}
                  </li>
                  <li className={antigua ? 'is-bad' : 'is-ok'}>
                    <Icon name={antigua ? 'x' : 'check'} size={14} />
                    {t('admin.age', { n: f.horas })}
                  </li>
                </ul>
              </div>
              <div className="mod__actions">
                <span className={`status status--${estado === 'valida' ? 'ok' : estado === 'pendiente' ? 'desactualizado' : 'error'}`}>
                  {estado === 'valida' ? t('admin.valid') : estado === 'pendiente' ? t('admin.pending') : t('admin.rejected')}
                  {estado === 'rechazada' && f.motivo && ` · ${f.motivo === 'lejos' ? t('admin.farReason') : t('admin.oldReason')}`}
                </span>
                {estado === 'pendiente' && (
                  <span className="btn-row">
                    <button type="button" className="btn btn--primary btn--sm" onClick={() => setEstados({ ...estados, [f.id]: 'valida' })}>
                      {t('admin.approve')}
                    </button>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEstados({ ...estados, [f.id]: 'rechazada' })}>
                      {t('admin.reject')}
                    </button>
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
