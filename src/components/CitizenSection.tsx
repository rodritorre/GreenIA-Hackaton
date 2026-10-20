import { useState, type FormEvent } from 'react';
import { DESTINOS } from '../data/destinos';
import { useI18n } from '../i18n';
import type { FaseActiva } from '../types';
import { Eyebrow, PhaseGlyph } from './ui/Badges';
import { Icon } from './ui/Icon';

/** Citizen verification with geolocated photos (EXT-2: CIT-1…CIT-7). The checks are simulated; moderation is in the admin panel. */
export function CitizenSection() {
  const { t } = useI18n();
  const [dest, setDest] = useState(DESTINOS[0].id);
  const [file, setFile] = useState<string | null>(null);
  const [fase, setFase] = useState<FaseActiva | null>(null);
  const [sent, setSent] = useState(false);
  const fases: FaseActiva[] = ['inicio', 'avance', 'pleno', 'final'];
  const tipo = DESTINOS.find((d) => d.id === dest)!.tipo;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  // Simulated EXIF checks (CIT-2, CIT-3). Rejections are reviewed in the admin panel.
  const checks = [
    { ok: true, text: t('citizen.checkPlace', { n: '0,8', zona: 'Zona 2' }) },
    { ok: true, text: t('citizen.checkTime', { n: 2 }) },
  ];

  return (
    <section id="verifica" className="citizen" aria-labelledby="citizen-title">
      <div className="container citizen__inner">
        <div className="citizen__copy">
          <Eyebrow>{t('citizen.eyebrow')}</Eyebrow>
          <h2 id="citizen-title" className="h2">
            {t('citizen.title')}
          </h2>
          <p className="muted lead-sm">{t('citizen.lead')}</p>
          <p className="small muted">{t('citizen.limits')}</p>
        </div>
        <form className="citizen__form" onSubmit={submit}>
          <label className="field field--light">
            {t('citizen.dest')}
            <select value={dest} onChange={(e) => setDest(e.target.value)}>
              {DESTINOS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </label>
          <div className="field field--light">
            <span>{t('citizen.photo')}</span>
            <label className="upload">
              <Icon name="camera" />
              <span>{file ?? t('citizen.choose')}</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  setFile(e.target.files?.[0]?.name ?? null);
                  setSent(false);
                }}
              />
            </label>
          </div>
          {file && (
            <div className="checks" aria-live="polite">
              <p className="label">{t('citizen.checks')}</p>
              <ul>
                {checks.map((c) => (
                  <li key={c.text} className={c.ok ? 'is-ok' : 'is-bad'}>
                    <Icon name={c.ok ? 'check' : 'x'} size={16} />
                    {c.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <fieldset className="phase-pick">
            <legend>{t('citizen.phaseQ')}</legend>
            {fases.map((f) => (
              <button key={f} type="button" aria-pressed={fase === f} onClick={() => setFase(f)}>
                <PhaseGlyph fase={f} size={18} />
                {t(`fase.${tipo}.${f}`)}
              </button>
            ))}
          </fieldset>
          <label className="consent consent--light">
            <input type="checkbox" required />
            {t('citizen.consent')}
          </label>
          <button type="submit" className="btn btn--primary" disabled={!file || !fase}>
            {t('citizen.submit')}
          </button>
          {sent && (
            <p role="status" className="notice notice--ok">
              <Icon name="check" size={18} />
              {t('citizen.accepted')}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
