import { useEffect, useState, type FormEvent } from 'react';
import { OFERTAS } from '../data/comercial';
import { DESTINOS, getDestino } from '../data/destinos';
import { useI18n } from '../i18n';
import { FASES_ACTIVAS } from '../lib/fenologia';
import { fmtDia } from '../lib/fechas';
import type { FaseActiva } from '../types';
import { ConfidenceBadge } from './ui/Badges';
import { Icon } from './ui/Icon';

/** "Avísame cuando llegue la flor" (EXT-3: ALR-1…ALR-5). UI only: nothing is sent. */
export function AlertsSection({ preselect }: { preselect: string | null }) {
  const { t, lang } = useI18n();
  const [dest, setDest] = useState(preselect ?? DESTINOS[0].id);
  const [fase, setFase] = useState<FaseActiva>('pleno');
  const [dias, setDias] = useState(7);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (preselect) setDest(preselect);
  }, [preselect]);

  const d = getDestino(dest)!;
  const v = d.ventanas.find((w) => w.fase === fase)!;
  const ofertas = OFERTAS.filter((o) => o.destinoId === dest);

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
              <button type="button" className="btn btn--outline-inverse" onClick={() => setPreview(true)}>
                <Icon name="mail" size={18} />
                {t('alerts.simulate')}
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

        {preview && (
          <div className="email-preview" role="region" aria-label={t('alerts.previewTitle')}>
            <div className="email-preview__bar">
              <p className="label">{t('alerts.previewTitle')}</p>
              <button type="button" className="icon-btn" aria-label={t('alerts.close')} onClick={() => setPreview(false)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="email">
              <p className="email__subject">
                {t('alerts.previewSubject', {
                  fase: t(`fase.${d.tipo}.${fase}`),
                  destino: d.nombre,
                  desde: fmtDia(v.desde, lang),
                  hasta: fmtDia(v.hasta, lang, true),
                })}
              </p>
              <p>
                {t('alerts.previewBody', {
                  n: dias,
                  conf: `${t(`confianza.${v.confianza}`)}, ${t('confianza.prob', { p: Math.round(v.probabilidad * 100) })}`,
                })}
              </p>
              <ConfidenceBadge confianza={v.confianza} probabilidad={v.probabilidad} />
              <div className="email__links">
                {ofertas.slice(0, 2).map((o) => (
                  <a key={o.id} href="#" className="email__link">
                    <Icon name={o.tipo === 'alojamiento' ? 'bed' : 'compass'} size={16} />
                    {o.tipo === 'alojamiento' ? t('alerts.previewStay') : t('alerts.previewDo')}: {o.nombre}
                  </a>
                ))}
              </div>
              <a href="#" className="small">
                {t('alerts.previewUnsub')}
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
