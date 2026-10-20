import { HOY } from '../data/config';
import { DESTINOS } from '../data/destinos';
import { useI18n } from '../i18n';
import { intensidadMes } from '../lib/fenologia';
import { addDays, addMonths, firstOfMonth, fmtMes } from '../lib/fechas';

/** Time selector (MAP-6): a rolling 12-month strip plus an exact-date picker. */
export function DateSelector({ fecha, onChange }: { fecha: string; onChange: (f: string) => void }) {
  const { t, lang } = useI18n();
  const months = Array.from({ length: 12 }, (_, i) => addMonths(firstOfMonth(HOY), i));
  const selMonth = fecha.slice(0, 7);
  const max = addDays(HOY, 364);

  return (
    <div className="date-selector">
      <div role="group" aria-label={t('map.chooseMonth')} className="month-strip">
        {months.map((m, i) => {
          const y = Number(m.slice(0, 4));
          const mo = Number(m.slice(5, 7));
          const count = DESTINOS.filter((d) => intensidadMes(d, y, mo) > 0).length;
          const sel = m.slice(0, 7) === selMonth;
          const target = i === 0 ? HOY : m.slice(0, 8) + '15';
          return (
            <button key={m} type="button" className="month" aria-pressed={sel} onClick={() => onChange(target)}>
              <span className="month__label">
                {fmtMes(m, lang, 'short').replace('.', '')}
                {i === 0 && <span className="month__now">{t('map.badgeNow')}</span>}
              </span>
              <span className="month__sub">
                {y} · {t('map.inSeason', { n: count })}
              </span>
            </button>
          );
        })}
      </div>
      <div className="date-exact">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(HOY)} disabled={fecha === HOY}>
          {t('map.today')}
        </button>
        <label className="date-exact__field">
          <span>{t('map.exactDate')}</span>
          <input type="date" value={fecha} min={HOY} max={max} onChange={(e) => e.target.value && onChange(e.target.value)} />
        </label>
      </div>
    </div>
  );
}
