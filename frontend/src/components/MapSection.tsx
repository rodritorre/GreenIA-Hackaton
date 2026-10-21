import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { useDatos, useMapa } from '../state';
import { BloomMap, type MapItem } from './BloomMap';
import { DateSelector } from './DateSelector';
import { DestinoFicha } from './ficha/DestinoFicha';
import { DestinoList } from './DestinoList';
import { FILTROS_BASE, aplicar, type Filtros } from './filtros';
import { Legend } from './Legend';

interface Props {
  fecha: string;
  onFecha: (f: string) => void;
  sel: string | null;
  onSel: (id: string | null) => void;
  onMethod: () => void;
  onAlert: (id: string) => void;
}

export function MapSection({ fecha, onFecha, sel, onSel, onMethod, onAlert }: Props) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [flt, setFlt] = useState<Filtros>(FILTROS_BASE);
  const [zones, setZones] = useState(false);
  const [photos, setPhotos] = useState(false);
  const [cities, setCities] = useState(true);

  const { hoy: HOY, destinos } = useDatos();
  const { estados } = useMapa(fecha);
  const all: MapItem[] = useMemo(
    () => destinos.flatMap((d) => (estados.has(d.id) ? [{ d, e: estados.get(d.id)! }] : [])),
    [destinos, estados],
  );
  const visible = useMemo(() => aplicar(all, q, flt), [all, q, flt]);

  const selected = sel ? all.find((it) => it.d.id === sel) : undefined;
  const esPrevision = fecha > HOY;
  const activos = all.filter((it) => it.e.fase !== 'fuera_temporada').length;

  return (
    <section id="mapa" className="map-section" aria-labelledby="map-title">
      <div className="container">
        <div className="section-head">
          <div>
            <h2 id="map-title" className="h2">
              {t('map.title')}
            </h2>
            <p className="muted lead-sm">{t('map.lead')}</p>
          </div>
          <Legend />
        </div>

        <DateSelector fecha={fecha} onChange={onFecha} />

        <div className="map-layout">
          <div className="panel">
            {selected ? (
              <DestinoFicha key={selected.d.id} d={selected.d} e={selected.e} fecha={fecha} onBack={() => onSel(null)} onMethod={onMethod} onAlert={onAlert} />
            ) : (
              <DestinoList
                all={all}
                visible={visible}
                fecha={fecha}
                esPrevision={esPrevision}
                q={q}
                onQ={setQ}
                flt={flt}
                onFlt={setFlt}
                onSelect={onSel}
              />
            )}
          </div>
          <div className="map-col">
            <BloomMap
              items={visible}
              fecha={fecha}
              esPrevision={esPrevision}
              activos={activos}
              sel={sel}
              onSelect={onSel}
              showZones={zones}
              showPhotos={photos}
              showCities={cities}
              onToggleCities={setCities}
              onToggleZones={setZones}
              onTogglePhotos={setPhotos}
            />
            <p className="map-footnote">{t('map.footnote')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
