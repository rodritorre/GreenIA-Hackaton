import { useI18n } from '../i18n';
import { fmtDiaLargo, fmtMes } from '../lib/fechas';
import type { TipoFenomeno } from '../api';
import type { MapItem } from './BloomMap';
import { AforoBadge, useAforo } from './Aforo';
import { ConfidenceBadge, FasePill, PhaseGlyph } from './ui/Badges';
import { Icon } from './ui/Icon';

export type FiltroTipo = 'all' | TipoFenomeno;

interface Props {
  all: MapItem[];
  visible: MapItem[];
  fecha: string;
  esPrevision: boolean;
  q: string;
  onQ: (q: string) => void;
  tipo: FiltroTipo;
  onTipo: (t: FiltroTipo) => void;
  off: boolean;
  onOff: (v: boolean) => void;
  onSelect: (id: string) => void;
}

const activo = (it: MapItem) => it.e.fase !== 'fuera_temporada';

/** Accessible list synced with the map (MAP-10), with search (MAP-11) and phenomenon filter (MAP-9). */
export function DestinoList(p: Props) {
  const { t, lang } = useI18n();
  const activos = p.all.filter(activo).length;
  const aforo = useAforo();
  const tipos: { id: FiltroTipo; label: string }[] = [
    { id: 'all', label: t('map.all') },
    { id: 'floracion', label: t('map.bloom') },
    { id: 'color_otonal', label: t('map.autumn') },
  ];

  return (
    <>
      <div className="panel__head">
        <div>
          <p className={`label ${p.esPrevision ? 'label--forecast' : 'label--accent'}`}>{p.esPrevision ? t('map.modeForecast') : t('map.modeNow')}</p>
          <h3 className="panel__title">{fmtDiaLargo(p.fecha, lang)}</h3>
          <p className="muted">{t('map.summary', { active: activos, off: p.all.length - activos })}</p>
        </div>
        <label className="search">
          <Icon name="search" size={18} />
          <input type="search" value={p.q} onChange={(e) => p.onQ(e.target.value)} placeholder={t('map.search')} aria-label={t('map.search')} />
        </label>
        <div role="group" aria-label={t('map.filterLabel')} className="chips">
          {tipos.map((c) => {
            const count = p.all.filter((it) => (c.id === 'all' || it.d.tipo === c.id) && activo(it)).length;
            return (
              <button key={c.id} type="button" className="chip" aria-pressed={p.tipo === c.id} onClick={() => p.onTipo(c.id)}>
                {c.label} <span className="chip__count">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="check">
          <input type="checkbox" checked={p.off} onChange={(e) => p.onOff(e.target.checked)} />
          {t('map.showOff')}
        </label>
      </div>
      <ul className="dest-list">
        {p.visible.map(({ d, e }) => (
          <li key={d.id}>
            <button type="button" className="dest-item" onClick={() => p.onSelect(d.id)}>
              <span className="dest-item__glyph">
                <PhaseGlyph fase={e.fase} />
              </span>
              <span className="dest-item__text">
                <span className="dest-item__name">{d.nombre}</span>
                <span className="dest-item__meta">
                  {d.lugar} · {d.provincia}
                </span>
                <span className="dest-item__tags">
                  {e.fase === 'fuera_temporada' && e.siguiente ? (
                    <span className="pill pill--fuera_temporada">
                      {t('map.from', { when: `${fmtMes(e.siguiente.desde, lang, 'short').replace('.', '')} ${e.siguiente.desde.slice(0, 4)}` })}
                    </span>
                  ) : (
                    <FasePill fase={e.fase} short />
                  )}
                  {e.esPrevision && <ConfidenceBadge confianza={e.confianza} />}
                  <AforoBadge aforo={aforo.get(d.id)} />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {p.visible.length === 0 && <p className="empty">{t('map.empty')}</p>}
    </>
  );
}
