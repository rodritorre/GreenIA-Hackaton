import { api, useApi, type Alternativa, type EstadoAforo } from '../api';
import { useI18n } from '../i18n';
import { fmtDia } from '../lib/fechas';
import { Icon } from './ui/Icon';

/** Capacity of every destination as the towns set it (GET /aforo). */
export function useAforo() {
  const c = useApi(() => api.aforo(), []);
  const por = new Map<string, EstadoAforo>();
  c.data?.forEach((a) => por.set(a.destinoId, a));
  return por;
}

export function AforoBadge({ aforo }: { aforo?: EstadoAforo }) {
  const { t } = useI18n();
  if (!aforo?.completo) return null;
  return <span className="pill pill--full">{aforo.completo.motivo === 'pausa' ? t('aforo.badgePaused') : t('aforo.badge')}</span>;
}

export function Alternativas({ lista }: { lista: Alternativa[] }) {
  const { t } = useI18n();
  return (
    <ul className="alts">
      {lista.map((a) => (
        <li key={a.nombre} className="alts__item">
          <Icon name="pin" size={18} />
          <span>
            <strong>{a.nombre}</strong> <span className="muted">· {t('aforo.km', { n: a.distanciaKm })}</span>
            <br />
            <span className="small">{a.motivo}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** "Aforo completo": the public site stops promoting the dates and sends people elsewhere. */
export function AforoAviso({ aforo }: { aforo?: EstadoAforo }) {
  const { t, lang } = useI18n();
  if (!aforo?.completo) return null;
  const { motivo, desde, hasta } = aforo.completo;
  const d = fmtDia(desde, lang);
  const h = fmtDia(hasta, lang, true);
  return (
    <section className="aforo" role="status">
      <p className="aforo__title">
        <Icon name="warn" size={20} />
        {motivo === 'pausa' ? t('aforo.paused', { desde: d, hasta: h }) : t('aforo.full', { desde: d, hasta: h })}
      </p>
      <p className="small">{t('aforo.why')}</p>
      {aforo.entreSemana && (
        <p className="aforo__weekdays">
          <Icon name="check" size={18} />
          {t('aforo.weekdays', { desde: fmtDia(aforo.entreSemana.desde, lang), hasta: fmtDia(aforo.entreSemana.hasta, lang, true) })}
        </p>
      )}
      <Alternativas lista={aforo.alternativas} />
    </section>
  );
}
