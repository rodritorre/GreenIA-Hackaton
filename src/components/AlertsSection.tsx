import { useEffect, useState, type FormEvent } from 'react';
import { DESTINOS, getDestino } from '../data/destinos';
import { useI18n } from '../i18n';
import { FASES_ACTIVAS } from '../lib/fenologia';
import type { FaseActiva } from '../types';
import { Icon } from './ui/Icon';

/** "Avísame cuando llegue la flor" (EXT-3: ALR-1, ALR-4). UI only: nothing is sent. Test sends live in the admin panel. */
export function AlertsSection({ preselect }: { preselect: string | null }) {
  const { t } = useI18n();
  const [dest, setDest] = useState(preselect ?? DESTINOS[0].id);
  const [fase, setFase] = useState<FaseActiva>('pleno');
  const [dias, setDias] = useState(7);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (preselect) setDest(preselect);
  }, [preselect]);

  const d = getDestino(dest)!;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <section id="avisos" className="alerts-section" aria-labelledby="alerts-title">
      <div className="container">
        <div className="alerts">
          <div className="alerts__copy">
            <h2 id="alerts-title" className="h2 h2--inverse">
              {t('alerts.title')}
            </h2>
            <p className="alerts__lead">{t('alerts.lead')}</p>
          </div>
          <form className="alerts__form" onSubmit={submit}>
            <label className="field">
              {t('alerts.dest')}
              <select value={dest} onChange={(e) => setDest(e.target.value)}>
                {DESTINOS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {t('alerts.phase')}
              <select value={fase} onChange={(e) => setFase(e.target.value as FaseActiva)}>
                {FASES_ACTIVAS.map((f) => (
                  <option key={f} value={f}>
                    {t(`fase.${d.tipo}.${f}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {t('alerts.advance')}
              <select value={dias} onChange={(e) => setDias(Number(e.target.value))}>
                {[3, 7, 14].map((n) => (
                  <option key={n} value={n}>
                    {t('alerts.days', { n })}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--wide">
              {t('alerts.email')}
              <input type="email" required placeholder="tu@email.com" autoComplete="email" />
            </label>
            <label className="consent">
              <input type="checkbox" required />
              {t('alerts.consent')}
            </label>
            <div className="alerts__actions">
              <button type="submit" className="btn btn--sun">
                {t('alerts.submit')}
              </button>
            </div>
            {done && (
              <p className="alerts__done" role="status">
                <Icon name="check" size={18} />
                {t('alerts.done')}
              </p>
            )}
          </form>
        </div>

      </div>
    </section>
  );
}
