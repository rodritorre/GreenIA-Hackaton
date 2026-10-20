import { useState } from 'react';
import { OFERTAS } from '../data/comercial';
import { DESTINOS, getDestino } from '../data/destinos';
import { useI18n } from '../i18n';
import { LayerHeading } from '../components/ui/Badges';

/** Admin: editorial and commercial layers, edited apart from the model (PRIN-3.2, MON-2, MON-3). */
export function ContentSection() {
  const { t } = useI18n();
  const [dest, setDest] = useState(DESTINOS[0].id);
  const [patro, setPatro] = useState<Record<string, boolean>>(() => Object.fromEntries(OFERTAS.map((o) => [o.id, o.patrocinado])));
  const d = getDestino(dest)!;
  const ofertas = OFERTAS.filter((o) => o.destinoId === dest);

  return (
    <>
      <p className="muted lead-sm">{t('admin.contentLead')}</p>
      <label className="field field--light admin-pick">
        {t('admin.pick')}
        <select id="content-dest" value={dest} onChange={(e) => setDest(e.target.value)}>
          {DESTINOS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-cols">
        <section className="admin-card" key={`ed-${dest}`}>
          <LayerHeading capa="editorial" />
          <label className="field field--light">
            {t('admin.history')}
            <textarea id="content-history" rows={5} defaultValue={d.editorial.historia} />
          </label>
          <label className="field field--light">
            {t('ficha.see')}
            <textarea id="content-see" rows={4} defaultValue={d.editorial.queVer.join('\n')} />
          </label>
          <label className="field field--light">
            {t('admin.access')}
            <textarea id="content-access" rows={3} defaultValue={d.editorial.acceso} />
          </label>
        </section>

        <section className="admin-card" key={`co-${dest}`}>
          <LayerHeading capa="comercial">
            <span className="small muted">{t('ficha.neutral')}</span>
          </LayerHeading>
          <label className="field field--light">
            {t('admin.sponsorSlot')}
            <input id="content-sponsor" defaultValue={d.patrocinio?.entidad ?? ''} placeholder={t('admin.none')} />
          </label>
          <p className="sub">{t('admin.offers')}</p>
          <ul className="offer-admin">
            {ofertas.map((o) => (
              <li key={o.id}>
                <span>
                  <span className="sources__name">{o.nombre}</span>
                  <span className="small muted">{o.tipo === 'alojamiento' ? t('plans.stay') : t('plans.activity')}</span>
                </span>
                <label className="check">
                  <input type="checkbox" checked={patro[o.id]} onChange={(e) => setPatro({ ...patro, [o.id]: e.target.checked })} />
                  {t('admin.sponsoredToggle')}
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
