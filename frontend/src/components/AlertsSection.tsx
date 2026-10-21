import { useEffect, useState, type FormEvent } from 'react';
import { api, type FaseActiva } from '../api';
import { useI18n } from '../i18n';
import { PROVINCIAS } from '../data/provincias';
import { FASES_ACTIVAS } from '../lib/fases';
import { useDatos } from '../state';
import { Icon } from './ui/Icon';

/** "Avísame cuando llegue la flor" (EXT-3: ALR-1, ALR-4): POST /alertas, then the visitor confirms by email. */
export function AlertsSection({ preselect }: { preselect: string | null }) {
  const { t, lang } = useI18n();
  const { destinos: DESTINOS, getDestino } = useDatos();
  const [dest, setDest] = useState(preselect ?? DESTINOS[0]?.id ?? '');
  const [fase, setFase] = useState<FaseActiva>('pleno');
  const [dias, setDias] = useState(7);
  const [email, setEmail] = useState('');
  const [provincia, setProvincia] = useState('');
  const [consent, setConsent] = useState(false);
  const [estado, setEstado] = useState<{ tipo: 'ok' | 'error' | 'enviando'; texto?: string } | null>(null);

  useEffect(() => {
    if (preselect) setDest(preselect);
  }, [preselect]);

  const d = getDestino(dest);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEstado({ tipo: 'enviando' });
    try {
      const r = await api.suscribir({ email, destinoId: dest, fase, antelacionDias: dias, idioma: lang, consentimiento: consent, provincia: provincia || undefined });
      setEstado({ tipo: 'ok', texto: r.mensaje });
    } catch (err) {
      setEstado({ tipo: 'error', texto: (err as Error).message });
    }
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
              <select id="alert-dest" value={dest} onChange={(e) => setDest(e.target.value)}>
                {DESTINOS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {t('alerts.phase')}
              <select id="alert-fase" value={fase} onChange={(e) => setFase(e.target.value as FaseActiva)}>
                {FASES_ACTIVAS.map((f) => (
                  <option key={f} value={f}>
                    {t(`fase.${d?.tipo ?? 'floracion'}.${f}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {t('alerts.advance')}
              <select id="alert-dias" value={dias} onChange={(e) => setDias(Number(e.target.value))}>
                {[3, 7, 14].map((n) => (
                  <option key={n} value={n}>
                    {t('alerts.days', { n })}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {t('alerts.province')}
              <select id="alert-provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)}>
                <option value="">{t('alerts.provinceAny')}</option>
                {PROVINCIAS.slice().sort((a, b) => a.localeCompare(b, 'es')).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--wide">
              {t('alerts.email')}
              <input id="alert-email" type="email" required placeholder="tu@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="consent">
              <input id="alert-consent" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              {t('alerts.consent')}
            </label>
            <div className="alerts__actions">
              <button type="submit" className="btn btn--sun" disabled={estado?.tipo === 'enviando'}>
                {t('alerts.submit')}
              </button>
            </div>
            {estado && estado.tipo !== 'enviando' && (
              <p className={`alerts__done ${estado.tipo === 'error' ? 'is-error' : ''}`} role="status">
                <Icon name={estado.tipo === 'ok' ? 'check' : 'warn'} size={18} />
                {estado.tipo === 'ok' ? t('alerts.done') : estado.texto}
              </p>
            )}
          </form>
        </div>

      </div>
    </section>
  );
}
