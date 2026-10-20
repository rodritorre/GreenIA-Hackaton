import { useMemo, useState } from 'react';
import { HOY } from '../data/config';
import { DESTINOS } from '../data/destinos';
import { useI18n } from '../i18n';
import { estadoEn } from '../lib/fenologia';
import { BloomMap, type MapItem } from './BloomMap';
import { DateSelector } from './DateSelector';
import { DestinoFicha } from './ficha/DestinoFicha';
import { DestinoList, type FiltroTipo } from './DestinoList';
import { Legend } from './Legend';

const RANK = { pleno: 0, avance: 1, inicio: 2, final: 3, fuera_temporada: 4 } as const;

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
  const [tipo, setTipo] = useState<FiltroTipo>('all');
  const [off, setOff] = useState(true);
  const [zones, setZones] = useState(false);
  const [photos, setPhotos] = useState(false);

  const all: MapItem[] = useMemo(() => DESTINOS.map((d) => ({ d, e: estadoEn(d, fecha) })), [fecha]);
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter(({ d, e }) => {
        const tipoOk = tipo === 'all' || d.tipo === tipo;
        const qOk = !needle || `${d.nombre} ${d.lugar} ${d.provincia} ${d.especie} ${d.fenomeno}`.toLowerCase().includes(needle);
        return tipoOk && qOk && (off || e.fase !== 'fuera_temporada');
      })
      .sort((a, b) => RANK[a.e.fase] - RANK[b.e.fase] || a.d.nombre.localeCompare(b.d.nombre));
  }, [all, q, tipo, off]);

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
                tipo={tipo}
                onTipo={setTipo}
                off={off}
                onOff={setOff}
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
