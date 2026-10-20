import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GeoJSON, MapContainer, Marker, Pane, useMap } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import basemap from '../data/basemap.json';
import { SPAIN_BOUNDS, ULTIMA_ACTUALIZACION } from '../data/config';
import { CIUDADES } from '../data/ciudades';
import { FOTOS } from '../data/comercial';
import { getDestino } from '../data/destinos';
import { useI18n } from '../i18n';
import type { EstadoEnFecha } from '../lib/fenologia';
import { fmtDiaLargo, fmtHora } from '../lib/fechas';
import type { Destino } from '../types';
import { SatelliteLayers } from './SatelliteLayers';
import { GLYPH_SIZE, PhaseGlyph } from './ui/Badges';
import { Icon } from './ui/Icon';

export interface MapItem {
  d: Destino;
  e: EstadoEnFecha;
}

interface Props {
  items: MapItem[];
  fecha: string;
  esPrevision: boolean;
  activos: number;
  sel: string | null;
  onSelect: (id: string) => void;
  showZones: boolean;
  showPhotos: boolean;
  showCities: boolean;
  onToggleCities: (v: boolean) => void;
  onToggleZones: (v: boolean) => void;
  onTogglePhotos: (v: boolean) => void;
}

const TEJERA = 'tejera-negra';

function cityIcon(nombre: string, capital: boolean) {
  return L.divIcon({
    html: `<span class="city${capital ? ' city--capital' : ''}"><i></i>${nombre}</span>`,
    className: 'mk-wrap',
    iconSize: [0, 0],
    iconAnchor: [4, 4],
  });
}

function markerIcon(item: MapItem, selected: boolean, label: string) {
  const { e, d } = item;
  const size = GLYPH_SIZE[e.fase];
  const html = renderToStaticMarkup(
    <div className={`mk ${selected ? 'mk--sel' : ''} ${e.esPrevision ? `mk--conf-${e.confianza}` : ''}`}>
      {e.fase === 'pleno' && <span className="mk__pulse" />}
      {e.esPrevision && <span className="mk__halo" />}
      <PhaseGlyph fase={e.fase} />
      {selected && <span className="mk__tip">{d.nombre}</span>}
      <span className="sr-only">{label}</span>
    </div>,
  );
  const box = size + 16;
  return L.divIcon({ html, className: 'mk-wrap', iconSize: [box, box], iconAnchor: [box / 2, box / 2] });
}

function zoneIcon(indice: number | null, fase: Parameters<typeof PhaseGlyph>[0]['fase'] | null, text: string) {
  const html = renderToStaticMarkup(
    <div className={`zone ${indice === null ? 'zone--nodata' : ''}`}>
      <PhaseGlyph fase={fase ?? 'fuera_temporada'} size={18} />
      <span className="zone__label">{text}</span>
    </div>,
  );
  return L.divIcon({ html, className: 'mk-wrap', iconSize: [90, 24], iconAnchor: [9, 12] });
}

const photoIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="photo-pin">
      <Icon name="camera" size={14} />
    </div>,
  ),
  className: 'mk-wrap',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function Controls({ sel, showZones }: { sel: string | null; showZones: boolean }) {
  const map = useMap();
  const { t } = useI18n();

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (showZones) {
      const d = getDestino(TEJERA)!;
      map.flyTo([d.lat, d.lon], 12, { duration: 0.8 });
    } else if (sel) {
      const d = getDestino(sel)!;
      map.flyTo([d.lat, d.lon], Math.max(map.getZoom(), 8), { duration: 0.8 });
    } else {
      map.flyToBounds(SPAIN_BOUNDS, { duration: 0.8 });
    }
  }, [sel, showZones, map]);

  return (
    <div className="map-zoom">
      <button type="button" aria-label={t('map.zoomIn')} onClick={() => map.zoomIn()}>
        <Icon name="plus" />
      </button>
      <button type="button" aria-label={t('map.zoomOut')} onClick={() => map.zoomOut()}>
        <Icon name="minus" />
      </button>
      <button type="button" aria-label={t('map.reset')} onClick={() => map.flyToBounds(SPAIN_BOUNDS, { duration: 0.8 })}>
        <Icon name="expand" />
      </button>
    </div>
  );
}

export function BloomMap(p: Props) {
  const { t, lang } = useI18n();
  const tejera = getDestino(TEJERA)!;

  const markers = useMemo(
    () =>
      p.items.map((it) => {
        const label = `${it.d.nombre}: ${t(`fase.${it.d.tipo}.${it.e.fase}`)}${it.e.esPrevision ? ` (${t('map.modeForecast')}, ${t(`confianza.${it.e.confianza}`)})` : ''}`;
        return { it, label, icon: markerIcon(it, p.sel === it.d.id, label) };
      }),
    [p.items, p.sel, t],
  );

  return (
    <div className="map-frame">
      <MapContainer bounds={SPAIN_BOUNDS} minZoom={5} maxZoom={14} maxBounds={[[33, -14], [46.5, 8]]} zoomControl={false} scrollWheelZoom={false} className="map" attributionControl>
        {/* Muted land outline under the imagery, so gaps between satellite passes never show as holes (NFR-3). */}
        <Pane name="fallback" style={{ zIndex: 150 }}>
          <GeoJSON
            data={basemap as FeatureCollection}
            style={() => ({ fillColor: '#8C8A74', fillOpacity: 1, color: '#8C8A74', weight: 1 })}
            interactive={false}
          />
        </Pane>
        <SatelliteLayers />
        {p.showCities &&
          CIUDADES.map((c) => (
            <Marker key={c.nombre} position={[c.lat, c.lon]} icon={cityIcon(c.nombre, c.capital)} interactive={false} keyboard={false} />
          ))}
        {markers.map(({ it, label, icon }) => (
          <Marker
            key={it.d.id}
            position={[it.d.lat, it.d.lon]}
            icon={icon}
            title={label}
            zIndexOffset={p.sel === it.d.id ? 1000 : it.e.fase === 'pleno' ? 500 : 0}
            eventHandlers={{ click: () => p.onSelect(it.d.id) }}
          />
        ))}
        {p.showZones &&
          tejera.zonas!.map((z) => (
            <Marker
              key={z.id}
              position={[z.lat, z.lon]}
              keyboard={false}
              icon={zoneIcon(
                z.indice,
                z.fase,
                z.indice === null ? `${z.nombre} · ${t('ficha.noData')}` : `${z.nombre} · ${z.indice.toFixed(2).replace('.', lang === 'es' ? ',' : '.')}`,
              )}
              title={z.indice === null ? t('map.zoneNoData', { zona: z.nombre }) : t('map.zoneLabel', { zona: z.nombre, valor: z.indice })}
              eventHandlers={{ click: () => p.onSelect(TEJERA) }}
            />
          ))}
        {p.showPhotos &&
          FOTOS.filter((f) => f.estado === 'valida').map((f) => (
            <Marker
              key={f.id}
              position={[f.lat, f.lon]}
              icon={photoIcon}
              keyboard={false}
              title={t('map.photoLabel', { fase: t(`fase.short.${f.faseReportada}`), when: fmtHora(f.capturadaEn, lang) })}
            />
          ))}
        <Controls sel={p.sel} showZones={p.showZones} />
      </MapContainer>

      <div className="map-status">
        <span className={`map-status__badge ${p.esPrevision ? 'is-forecast' : ''}`}>{p.esPrevision ? t('map.badgeForecast') : t('map.badgeNow')}</span>
        <span className="map-status__text">
          {fmtDiaLargo(p.fecha, lang)} · {t('map.summary', { active: p.activos, off: p.items.length - p.activos }).split(' · ')[0]}
        </span>
        <span className="map-status__upd">{t('map.updated', { when: fmtHora(ULTIMA_ACTUALIZACION, lang) })}</span>
      </div>

      <fieldset className="map-layers">
        <legend>
          <Icon name="layers" size={16} />
          {t('map.layers')}
        </legend>
        <label>
          <input type="checkbox" checked={p.showZones} onChange={(e) => p.onToggleZones(e.target.checked)} />
          {t('map.layerZones')}
        </label>
        <label>
          <input type="checkbox" checked={p.showCities} onChange={(e) => p.onToggleCities(e.target.checked)} />
          {t('map.layerCities')}
        </label>
        <label>
          <input type="checkbox" checked={p.showPhotos} onChange={(e) => p.onTogglePhotos(e.target.checked)} />
          {t('map.layerPhotos')}
        </label>
      </fieldset>

      {p.esPrevision && (
        <p className="map-forecast-note">
          <span aria-hidden="true" className="legend__ring" />
          {t('map.forecastNote')}
        </p>
      )}
    </div>
  );
}
