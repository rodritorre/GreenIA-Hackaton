import { useState, type FormEvent } from 'react';
import { api, type FaseActiva, type ObservacionResultado } from '../api';
import { useI18n } from '../i18n';
import { FASES_ACTIVAS } from '../lib/fases';
import { useDatos } from '../state';
import { Eyebrow, PhaseGlyph } from './ui/Badges';
import { Icon } from './ui/Icon';

/** Citizen verification with geolocated photos (EXT-2: CIT-1…CIT-7). The server reads the photo's location and
 * time, checks them against the destination's zones and strips the metadata; doubtful photos go to moderation. */
export function CitizenSection() {
  const { t } = useI18n();
  const { destinos } = useDatos();
  const [dest, setDest] = useState(destinos[0]?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [fase, setFase] = useState<FaseActiva | null>(null);
  const [consent, setConsent] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [res, setRes] = useState<ObservacionResultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tipo = destinos.find((d) => d.id === dest)?.tipo ?? 'floracion';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !fase) return;
    setEnviando(true);
    setError(null);
    setRes(null);
    try {
      setRes(await api.subirFoto({ foto: file, destinoId: dest, fase, consentimiento: consent }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

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
            <select id="citizen-dest" value={dest} onChange={(e) => setDest(e.target.value)}>
              {destinos.map((d) => (
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
              <span>{file?.name ?? t('citizen.choose')}</span>
              <input
                id="citizen-photo"
                type="file"
                accept="image/jpeg,image/png,image/heic,image/webp"
                className="sr-only"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setRes(null);
                }}
              />
            </label>
          </div>
          <fieldset className="phase-pick">
            <legend>{t('citizen.phaseQ')}</legend>
            {FASES_ACTIVAS.map((f) => (
              <button key={f} type="button" aria-pressed={fase === f} onClick={() => setFase(f)}>
                <PhaseGlyph fase={f} size={18} />
                {t(`fase.${tipo}.${f}`)}
              </button>
            ))}
          </fieldset>
          <label className="consent consent--light">
            <input id="citizen-consent" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            {t('citizen.consent')}
          </label>
          <button type="submit" className="btn btn--primary" disabled={!file || !fase || enviando} aria-busy={enviando}>
            {enviando ? t('estado.cargando') : t('citizen.submit')}
          </button>
          {res && (
            <div className="checks" aria-live="polite">
              <p className="label">{t('citizen.checks')}</p>
              <ul>
                {res.comprobaciones.map((c) => (
                  <li key={c.clave} className={c.ok ? 'is-ok' : 'is-bad'}>
                    <Icon name={c.ok ? 'check' : 'x'} size={16} />
                    {c.detalle}
                  </li>
                ))}
              </ul>
              <p role="status" className={`notice ${res.estado === 'rechazada' ? 'notice--bad' : 'notice--ok'}`}>
                <Icon name={res.estado === 'rechazada' ? 'warn' : 'check'} size={18} />
                {t(`citizen.res_${res.estado}`)}
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="notice notice--bad">
              <Icon name="warn" size={18} />
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
