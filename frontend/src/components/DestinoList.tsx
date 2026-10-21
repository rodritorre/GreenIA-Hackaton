import { useState } from 'react';
import { useI18n } from '../i18n';
import { useDatos } from '../state';
import { FASES_FILTRO, FILTROS_BASE, especies, nFiltros, regiones, type Filtros, type Orden } from './filtros';
import { fmtDiaLargo, fmtMes } from '../lib/fechas';
import type { MapItem } from './BloomMap';
import { AforoBadge, useAforo } from './Aforo';
import { ConfidenceBadge, FasePill, PhaseGlyph } from './ui/Badges';
import { Icon } from './ui/Icon';

export type FiltroTipo = Filtros['tipo'];

interface Props {
  all: MapItem[];
  visible: MapItem[];
  fecha: string;
  esPrevision: boolean;
  q: string;
  onQ: (q: string) => void;
  flt: Filtros;
  onFlt: (f: Filtros) => void;
  onSelect: (id: string) => void;
}

const activo = (it: MapItem) => it.e.fase !== 'fuera_temporada';

/** Accessible list synced with the map (MAP-10), with search (MAP-11) and phenomenon filter (MAP-9). */
export function DestinoList(p: Props) {
  const { t, lang } = useI18n();
  const activos = p.all.filter(activo).length;
  const aforo = useAforo();
  const { destinos } = useDatos();
  const [abierto, setAbierto] = useState(false);
  const F = p.flt;
  const set = <K extends keyof Filtros>(k: K, v: Filtros[K]) => p.onFlt({ ...F, [k]: v });
  const n = nFiltros(F);
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
        <div className="filters__bar">
          <label className="search">
            <Icon name="search" size={18} />
            <input type="search" value={p.q} onChange={(e) => p.onQ(e.target.value)} placeholder={t('map.search')} aria-label={t('map.search')} />
          </label>
          <button type="button" className="filters__toggle" aria-expanded={abierto} aria-controls="map-filters" onClick={() => setAbierto((x) => !x)}>
            <Icon name="layers" size={18} />
            {t('map.filters')}
            {n > 0 && <span className="chip__count">{n}</span>}
          </button>
        </div>
        <div role="group" aria-label={t('map.filterLabel')} className="chips">
          {tipos.map((c) => {
            const count = p.all.filter((it) => (c.id === 'all' || it.d.tipo === c.id) && activo(it)).length;
            return (
              <button key={c.id} type="button" className="chip" aria-pressed={F.tipo === c.id} onClick={() => set('tipo', c.id)}>
                {c.label} <span className="chip__count">{count}</span>
              </button>
            );
          })}
        </div>
        {abierto && (
          <div id="map-filters" className="filters">
            <fieldset className="filters__group">
              <legend className="filters__legend">{t('map.phase')}</legend>
              <div className="chips">
                {FASES_FILTRO.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className="chip"
                    aria-pressed={F.fases.includes(f)}
                    onClick={() => set('fases', F.fases.includes(f) ? F.fases.filter((x) => x !== f) : [...F.fases, f])}
                  >
                    <PhaseGlyph fase={f} size={14} />
                    {t(`fase.short.${f}`)}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="filters__row">
              <label className="filters__field">
                {t('map.region')}
                <select value={F.region} onChange={(e) => set('region', e.target.value)}>
                  <option value="">{t('map.anyRegion')}</option>
                  {regiones(destinos).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="filters__field">
                {t('map.species')}
                <select value={F.especie} onChange={(e) => set('especie', e.target.value)}>
                  <option value="">{t('map.anySpecies')}</option>
                  {especies(destinos).map(([id, nombre]) => (
                    <option key={id} value={id}>
                      {nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="filters__field">
                {t('map.sort')}
                <select value={F.orden} onChange={(e) => set('orden', e.target.value as Orden)}>
                  <option value="fase">{t('map.sortPhase')}</option>
                  <option value="next">{t('map.sortNext')}</option>
                  <option value="name">{t('map.sortName')}</option>
                </select>
              </label>
            </div>
            <div className="filters__row">
              <label className="check">
                <input type="checkbox" checked={F.reales} onChange={(e) => set('reales', e.target.checked)} />
                {t('map.realOnly')}
              </label>
              <label className="check">
                <input type="checkbox" checked={F.off} onChange={(e) => set('off', e.target.checked)} />
                {t('map.showOff')}
              </label>
            </div>
          </div>
        )}
        <div className="filters__summary">
          <span className="small muted" role="status">
            {t('map.results', { n: p.visible.length, total: p.all.length })}
          </span>
          {(n > 0 || p.q) && (
            <button
              type="button"
              className="link-button small"
              onClick={() => {
                p.onFlt(FILTROS_BASE);
                p.onQ('');
              }}
            >
              {t('map.clear')}
            </button>
          )}
        </div>
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
