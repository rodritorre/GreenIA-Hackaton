import { useState, type FormEvent } from 'react';
import { api, useApi, type DestinoConfig, type TipoFenomeno, type Usuario } from '../api';
import { useI18n } from '../i18n';
import { Icon } from '../components/ui/Icon';
import { Cargando, useAccion } from './common';

/** Admin: destination configuration — adding one is config, not code (PRIN-2.4, PHA-2). */
export function DestinationsSection({ usuario }: { usuario: Usuario }) {
  const { t, lang } = useI18n();
  const destinos = useApi(() => api.admin.destinos(), []);
  const [open, setOpen] = useState(false);
  const accion = useAccion();
  const esAdmin = usuario.rol === 'admin';
  const num = (n: number) => n.toLocaleString(lang, { minimumFractionDigits: 2 });

  return (
    <>
      <div className="admin-head">
        <p className="muted lead-sm">{t('admin.destLead')}</p>
        {esAdmin && (
          <button type="button" className="btn btn--primary" onClick={() => setOpen(true)} aria-expanded={open}>
            <Icon name="plus" size={18} />
            {t('admin.add')}
          </button>
        )}
      </div>
      {accion.aviso}
      <Cargando carga={destinos}>
        {(rows) => (
          <ul className="dest-config">
            {rows.map((d) => (
              <li key={d.id} className="admin-card">
                <div className="dest-config__head">
                  <div>
                    <p className="sources__name">{d.nombre}</p>
                    <p className="small muted">
                      {d.especie} · {d.tipo === 'floracion' ? t('map.bloom') : t('map.autumn')} · {d.lat.toFixed(3)}, {d.lon.toFixed(3)} ·{' '}
                      {d.zonas?.length ?? 0} zonas
                    </p>
                    <p className="small muted">
                      {t('admin.thresholds')}: {num(d.umbrales.inicio)} · {num(d.umbrales.avance)} · {num(d.umbrales.pleno)}
                    </p>
                  </div>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={d.activo ?? true}
                      disabled={!esAdmin || accion.ocupado}
                      onChange={(e) => accion.run(async () => (await api.admin.editarDestino(d.id, { activo: e.target.checked }), destinos.reload()))}
                    />
                    {t('admin.active')}
                  </label>
                </div>
                {esAdmin && <Fuentes d={d} onSaved={destinos.reload} />}
              </li>
            ))}
          </ul>
        )}
      </Cargando>
      {open && esAdmin && <NuevoDestino onDone={() => (setOpen(false), destinos.reload())} />}
    </>
  );
}

/** Per-destination data sources: AEMET station/municipality codes and the satellite switch. */
function Fuentes({ d, onSaved }: { d: DestinoConfig; onSaved: () => void }) {
  const { t } = useI18n();
  const [estacion, setEstacion] = useState(d.aemetEstacion ?? '');
  const [municipio, setMunicipio] = useState(d.aemetMunicipio ?? '');
  const [sat, setSat] = useState(d.usaSatelite ?? false);
  const accion = useAccion();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    accion.run(async () => {
      await api.admin.editarDestino(d.id, { aemetEstacion: estacion || null, aemetMunicipio: municipio || null, usaSatelite: sat });
      onSaved();
      return t('admin.savedOk');
    });
  };
  return (
    <form className="dest-config__sources" onSubmit={submit}>
      <label className="field field--light">
        {t('admin.aemetStation')}
        <input id={`aemet-est-${d.id}`} value={estacion} onChange={(e) => setEstacion(e.target.value)} placeholder="p. ej. 3195" />
      </label>
      <label className="field field--light">
        {t('admin.aemetTown')}
        <input id={`aemet-mun-${d.id}`} value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="p. ej. 19071" />
      </label>
      <label className="check">
        <input id={`sat-${d.id}`} type="checkbox" checked={sat} onChange={(e) => setSat(e.target.checked)} />
        {t('admin.satellite')}
      </label>
      <button type="submit" className="btn btn--ghost btn--sm" disabled={accion.ocupado}>
        {t('admin.saveBtn')}
      </button>
      {accion.aviso}
    </form>
  );
}

function NuevoDestino({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const accion = useAccion();
  const [f, setF] = useState({ id: '', nombre: '', especie: '', provincia: '', region: '', tipo: 'floracion' as TipoFenomeno, lat: '', lon: '', temporada: '', fin: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    accion.run(async () => {
      const r = await api.admin.crearDestino({
        id: f.id, nombre: f.nombre, lugar: f.nombre, provincia: f.provincia, region: f.region, especie: f.especie,
        fenomeno: f.tipo === 'floracion' ? 'Floración' : 'Color otoñal', tipo: f.tipo, lat: Number(f.lat), lon: Number(f.lon),
        temporada: f.temporada, finTemporada: f.fin, umbrales: { inicio: 0.15, avance: 0.4, pleno: 0.7, final: 0.5 },
        color: '#6F4FB8', ilustracion: 'cerezo', datosReales: false, activo: true, aemetEstacion: null, aemetMunicipio: null,
        usaSatelite: false, zonas: [], habituales: [], // usual dates: import the "habituales" CSV next
      });
      onDone();
      return r.mensaje;
    });
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <h3 className="sub">{t('admin.addTitle')}</h3>
      <div className="admin-form__grid">
        <label className="field field--light">
          Id
          <input id="new-id" required pattern="[a-z0-9-]{2,64}" placeholder="azahar-sevilla" value={f.id} onChange={set('id')} />
        </label>
        <label className="field field--light">
          {t('admin.name')}
          <input id="new-name" required placeholder="Azahar de Sevilla" value={f.nombre} onChange={set('nombre')} />
        </label>
        <label className="field field--light">
          {t('admin.species')}
          <input id="new-species" required placeholder="Naranjo amargo (Citrus × aurantium)" value={f.especie} onChange={set('especie')} />
        </label>
        <label className="field field--light">
          {t('admin.type')}
          <select id="new-type" value={f.tipo} onChange={set('tipo')}>
            <option value="floracion">{t('map.bloom')}</option>
            <option value="color_otonal">{t('map.autumn')}</option>
          </select>
        </label>
        <label className="field field--light">
          Provincia
          <input id="new-prov" required value={f.provincia} onChange={set('provincia')} />
        </label>
        <label className="field field--light">
          Región
          <input id="new-region" required value={f.region} onChange={set('region')} />
        </label>
        <label className="field field--light">
          {t('admin.lat')}
          <input id="new-lat" type="number" step="0.001" required placeholder="37.389" value={f.lat} onChange={set('lat')} />
        </label>
        <label className="field field--light">
          {t('admin.lon')}
          <input id="new-lon" type="number" step="0.001" required placeholder="-5.984" value={f.lon} onChange={set('lon')} />
        </label>
        <label className="field field--light">
          Temporada
          <input id="new-season" required placeholder="Primavera 2027" value={f.temporada} onChange={set('temporada')} />
        </label>
        <label className="field field--light">
          Fin de temporada
          <input id="new-end" type="date" required value={f.fin} onChange={set('fin')} />
        </label>
      </div>
      <button type="submit" className="btn btn--primary" disabled={accion.ocupado}>
        {t('admin.save')}
      </button>
      {accion.aviso}
    </form>
  );
}
