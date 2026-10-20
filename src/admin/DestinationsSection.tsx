import { useState, type FormEvent } from 'react';
import { DESTINOS } from '../data/destinos';
import { useI18n } from '../i18n';
import { Icon } from '../components/ui/Icon';

/** Admin: destination configuration — adding one is config, not code (PRIN-2.4, PHA-2). */
export function DestinationsSection() {
  const { t, lang } = useI18n();
  const [activos, setActivos] = useState<Record<string, boolean>>(() => Object.fromEntries(DESTINOS.map((d) => [d.id, true])));
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const num = (n: number) => n.toLocaleString(lang, { minimumFractionDigits: 2 });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <>
      <div className="admin-head">
        <p className="muted lead-sm">{t('admin.destLead')}</p>
        <button type="button" className="btn btn--primary" onClick={() => setOpen(true)} aria-expanded={open}>
          <Icon name="plus" size={18} />
          {t('admin.add')}
        </button>
      </div>
      <div className="table-wrap">
        <table className="sources">
          <thead>
            <tr>
              <th scope="col">{t('admin.colDest')}</th>
              <th scope="col">{t('admin.coords')}</th>
              <th scope="col">{t('admin.thresholds')}</th>
              <th scope="col">{t('admin.sources')}</th>
              <th scope="col">{t('admin.active')}</th>
            </tr>
          </thead>
          <tbody>
            {DESTINOS.map((d) => (
              <tr key={d.id}>
                <th scope="row">
                  <span className="sources__name">{d.nombre}</span>
                  <span className="small muted">
                    {d.especie} · {d.tipo === 'floracion' ? t('map.bloom') : t('map.autumn')}
                  </span>
                </th>
                <td className="num">
                  {d.lat.toFixed(3)}, {d.lon.toFixed(3)}
                </td>
                <td className="num">
                  {num(d.umbrales.inicio)} · {num(d.umbrales.avance)} · {num(d.umbrales.pleno)}
                </td>
                <td className="small">{[...new Set(d.ventanas.map((v) => v.fuente))].join(' · ')}</td>
                <td>
                  <label className="switch">
                    <input type="checkbox" checked={activos[d.id]} onChange={(e) => setActivos({ ...activos, [d.id]: e.target.checked })} />
                    <span className="sr-only">
                      {t('admin.active')}: {d.nombre}
                    </span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <form className="admin-form" onSubmit={submit}>
          <h3 className="sub">{t('admin.addTitle')}</h3>
          <div className="admin-form__grid">
            <label className="field field--light">
              {t('admin.name')}
              <input id="new-name" required placeholder="Azahar de Sevilla" />
            </label>
            <label className="field field--light">
              {t('admin.species')}
              <input id="new-species" required placeholder="Naranjo amargo (Citrus × aurantium)" />
            </label>
            <label className="field field--light">
              {t('admin.type')}
              <select id="new-type">
                <option value="floracion">{t('map.bloom')}</option>
                <option value="color_otonal">{t('map.autumn')}</option>
              </select>
            </label>
            <label className="field field--light">
              {t('admin.lat')}
              <input id="new-lat" type="number" step="0.001" required placeholder="37.389" />
            </label>
            <label className="field field--light">
              {t('admin.lon')}
              <input id="new-lon" type="number" step="0.001" required placeholder="-5.984" />
            </label>
            <label className="field field--light">
              {t('admin.thresholds')}
              <input id="new-thresholds" defaultValue="0,15 · 0,40 · 0,70" />
            </label>
          </div>
          <button type="submit" className="btn btn--primary">
            {t('admin.save')}
          </button>
          {saved && (
            <p role="status" className="notice notice--ok">
              <Icon name="check" size={18} />
              {t('admin.saved')}
            </p>
          )}
        </form>
      )}
    </>
  );
}
