import { useEffect, useState, type FormEvent } from 'react';
import { api, useApi, type Editorial, type Usuario } from '../api';
import { useI18n } from '../i18n';
import { LayerHeading } from '../components/ui/Badges';
import { Cargando, useAccion } from './common';

/** Admin: editorial and commercial layers, edited apart from the model (PRIN-3.2, MON-2, MON-3). */
export function ContentSection({ usuario }: { usuario: Usuario }) {
  const { t } = useI18n();
  const destinos = useApi(() => api.destinos(), []);
  const [dest, setDest] = useState('');
  const id = dest || destinos.data?.[0]?.id || '';

  return (
    <>
      <p className="muted lead-sm">{t('admin.contentLead')}</p>
      <label className="field field--light admin-pick">
        {t('admin.pick')}
        <select id="content-dest" value={id} onChange={(e) => setDest(e.target.value)}>
          {destinos.data?.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nombre}
            </option>
          ))}
        </select>
      </label>
      {id && (
        <div className="admin-cols" key={id}>
          <EditorialForm id={id} />
          <ComercialForm id={id} esAdmin={usuario.rol === 'admin'} />
        </div>
      )}
    </>
  );
}

function EditorialForm({ id }: { id: string }) {
  const { t } = useI18n();
  const carga = useApi(() => api.admin.editorial(id), [id]);
  const [e, setE] = useState<Editorial | null>(null);
  const accion = useAccion();
  useEffect(() => setE(carga.data ?? null), [carga.data]);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!e) return;
    accion.run(async () => (await api.admin.guardarEditorial(id, e), t('admin.savedOk')));
  };
  const lines = (v: string) => v.split('\n').map((x) => x.trim()).filter(Boolean);

  return (
    <form className="admin-card" onSubmit={submit}>
      <LayerHeading capa="editorial" />
      <Cargando carga={carga}>
        {() =>
          e && (
            <>
              <label className="field field--light">
                {t('admin.history')}
                <textarea id="content-history" rows={5} value={e.historia} onChange={(x) => setE({ ...e, historia: x.target.value })} />
              </label>
              <label className="field field--light">
                {t('ficha.see')}
                <textarea id="content-see" rows={4} value={e.queVer.join('\n')} onChange={(x) => setE({ ...e, queVer: lines(x.target.value) })} />
              </label>
              <label className="field field--light">
                {t('ficha.howToGet')}
                <textarea id="content-get" rows={2} value={e.comoLlegar} onChange={(x) => setE({ ...e, comoLlegar: x.target.value })} />
              </label>
              <label className="field field--light">
                {t('admin.access')}
                <textarea id="content-access" rows={3} value={e.acceso} onChange={(x) => setE({ ...e, acceso: x.target.value })} />
              </label>
              <label className="field field--light">
                {t('ficha.tips')}
                <textarea id="content-tips" rows={3} value={e.consejos.join('\n')} onChange={(x) => setE({ ...e, consejos: lines(x.target.value) })} />
              </label>
              <button type="submit" className="btn btn--primary" disabled={accion.ocupado}>
                {t('admin.saveBtn')}
              </button>
              {accion.aviso}
            </>
          )
        }
      </Cargando>
    </form>
  );
}

function ComercialForm({ id, esAdmin }: { id: string; esAdmin: boolean }) {
  const { t } = useI18n();
  const ofertas = useApi(() => api.admin.ofertas(id), [id]);
  const ficha = useApi(() => api.ficha(id), [id]);
  const [entidad, setEntidad] = useState('');
  const [mensaje, setMensaje] = useState('');
  const accion = useAccion();
  useEffect(() => {
    const p = ficha.data?.comercial.patrocinio;
    setEntidad(p?.entidad ?? '');
    setMensaje(p?.mensaje ?? '');
  }, [ficha.data]);

  const guardarPatrocinio = (ev: FormEvent) => {
    ev.preventDefault();
    accion.run(async () => {
      await api.admin.guardarPatrocinio(id, entidad.trim() ? { entidad, mensaje, url: null } : null);
      return t('admin.savedOk');
    });
  };

  return (
    <section className="admin-card">
      <LayerHeading capa="comercial">
        <span className="small muted">{t('ficha.neutral')}</span>
      </LayerHeading>
      <form className="dest-config__sources" onSubmit={guardarPatrocinio}>
        <label className="field field--light">
          {t('admin.sponsorSlot')} · {t('admin.entity')}
          <input id="content-sponsor" value={entidad} onChange={(e) => setEntidad(e.target.value)} placeholder={t('admin.none')} disabled={!esAdmin} />
        </label>
        <label className="field field--light">
          {t('admin.message')}
          <input id="content-sponsor-msg" value={mensaje} onChange={(e) => setMensaje(e.target.value)} disabled={!esAdmin} />
        </label>
        {esAdmin && (
          <button type="submit" className="btn btn--ghost btn--sm" disabled={accion.ocupado}>
            {t('admin.saveBtn')}
          </button>
        )}
      </form>
      {accion.aviso}
      <p className="sub">{t('admin.offers')}</p>
      <Cargando carga={ofertas}>
        {(rows) => (
          <ul className="offer-admin">
            {rows.map((o) => (
              <li key={o.id}>
                <span>
                  <span className="sources__name">{o.nombre}</span>
                  <span className="small muted">{o.tipo === 'alojamiento' ? t('plans.stay') : t('plans.activity')}</span>
                </span>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={o.patrocinado}
                    onChange={(e) => accion.run(async () => (await api.admin.editarOferta(o.id, { patrocinado: e.target.checked }), ofertas.reload()))}
                  />
                  {t('admin.sponsoredToggle')}
                </label>
              </li>
            ))}
          </ul>
        )}
      </Cargando>
    </section>
  );
}
