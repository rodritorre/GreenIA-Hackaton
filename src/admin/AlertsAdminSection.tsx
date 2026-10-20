import { useState } from 'react';
import { OFERTAS, SUSCRIPCIONES } from '../data/comercial';
import { DESTINOS, getDestino } from '../data/destinos';
import { useI18n } from '../i18n';
import { addDays, fmtDia } from '../lib/fechas';
import { ConfidenceBadge } from '../components/ui/Badges';
import { Icon } from '../components/ui/Icon';

const ANTELACION = 7;

/** Admin: alert subscriptions and a test send (EXT-3: ALR-2, ALR-3, ALR-5). */
export function AlertsAdminSection() {
  const { t, lang } = useI18n();
  const [dest, setDest] = useState(DESTINOS[0].id);
  const [sent, setSent] = useState(false);
  const d = getDestino(dest)!;
  const v = d.ventanas.find((w) => w.fase === 'pleno')!;
  const ofertas = OFERTAS.filter((o) => o.destinoId === dest);

  return (
    <>
      <p className="muted lead-sm">{t('admin.alertsLead')}</p>
      <div className="table-wrap">
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
            {SUSCRIPCIONES.map((s) => {
              const dd = getDestino(s.destinoId)!;
              const w = dd.ventanas.find((x) => x.fase === s.fase)!;
              return (
                <tr key={s.destinoId + s.fase}>
                  <th scope="row">{dd.nombre}</th>
                  <td>{t(`fase.${dd.tipo}.${s.fase}`)}</td>
                  <td className="num">{s.confirmadas.toLocaleString(lang)}</td>
                  <td className="num">{s.sinConfirmar.toLocaleString(lang)}</td>
                  <td>{fmtDia(addDays(w.desde, -ANTELACION), lang, true)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-row">
        <label className="field field--light">
          {t('alerts.dest')}
          <select
            id="admin-alert-dest"
            value={dest}
            onChange={(e) => {
              setDest(e.target.value);
              setSent(false);
            }}
          >
            {DESTINOS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nombre}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn--primary" onClick={() => setSent(true)}>
          <Icon name="mail" size={18} />
          {t('admin.test')}
        </button>
      </div>

      {sent && (
        <div className="email-preview" role="region" aria-label={t('admin.preview')}>
          <p className="label">{t('admin.preview')}</p>
          <div className="email">
            <p className="email__subject">
              {t('alerts.previewSubject', {
                fase: t(`fase.${d.tipo}.pleno`),
                destino: d.nombre,
                desde: fmtDia(v.desde, lang),
                hasta: fmtDia(v.hasta, lang, true),
              })}
            </p>
            <p>
              {t('alerts.previewBody', {
                n: ANTELACION,
                conf: `${t(`confianza.${v.confianza}`)}, ${t('confianza.prob', { p: Math.round(v.probabilidad * 100) })}`,
              })}
            </p>
            <ConfidenceBadge confianza={v.confianza} probabilidad={v.probabilidad} />
            <div className="email__links">
              {ofertas.slice(0, 2).map((o) => (
                <a key={o.id} href="#admin" className="email__link">
                  <Icon name={o.tipo === 'alojamiento' ? 'bed' : 'compass'} size={16} />
                  {o.tipo === 'alojamiento' ? t('alerts.previewStay') : t('alerts.previewDo')}: {o.nombre}
                </a>
              ))}
            </div>
            <a href="#admin" className="small">
              {t('alerts.previewUnsub')}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
