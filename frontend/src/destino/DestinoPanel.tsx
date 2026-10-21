import { useEffect, useState } from 'react';
import { api, useApi, type EventoAgenda, type ModoVisibilidad, type PanelDestino } from '../api';
import { useI18n, type Lang } from '../i18n';
import { fmtDia } from '../lib/fechas';
import { useAccion } from '../admin/common';
import { AforoAviso } from '../components/Aforo';
import { FlowerMark, Icon } from '../components/ui/Icon';

// Panel for a paying destination (town council, natural park). One click, no login in the demo.
const CLIENTES = ['brihuega', 'tejera-negra'];
const MODOS: ModoVisibilidad[] = ['normal', 'reducida', 'pausada'];

const idDeHash = () => {
  const m = window.location.hash.match(/^#destino=([\w-]+)/);
  return m && CLIENTES.includes(m[1]) ? m[1] : CLIENTES[0];
};

/** 1240 → "1.240" in both languages' style ("es-ES" alone does not group four-digit numbers). */
export const miles = (n: number, lang: Lang) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'es' ? '.' : ',');

export function DestinoPanel() {
  const { t, lang, setLang } = useI18n();
  const [id, setId] = useState(idDeHash);
  const panel = useApi(() => api.destino.panel(id), [id]);
  const p = panel.data;

  const elegir = (nuevo: string) => {
    window.history.replaceState(null, '', `#destino=${nuevo}`);
    setId(nuevo);
  };

  return (
    <div className="admin pueblo">
      <p className="mock-banner">
        <Icon name="info" size={16} />
        {t('pueblo.note')}
      </p>
      <header className="admin-bar">
        <div className="admin-bar__brand">
          <FlowerMark size={28} />
          <span className="brand__name">{t('brand')}</span>
          <span className="admin-bar__badge">{t('pueblo.badge')}</span>
          <span className="admin-bar__sub">{p?.entidad ?? ''}</span>
        </div>
        <div className="admin-bar__end">
          <label className="pueblo__as">
            {t('pueblo.viewAs')}
            <select value={id} onChange={(e) => elegir(e.target.value)}>
              {CLIENTES.map((c) => (
                <option key={c} value={c}>
                  {c === 'brihuega' ? 'Ayuntamiento de Brihuega' : 'Parque Natural Sierra Norte'}
                </option>
              ))}
            </select>
          </label>
          <div className="lang lang--inverse" role="group" aria-label={t('nav.lang')}>
            {(['es', 'en'] as Lang[]).map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn--outline-inverse btn--sm"
            onClick={() => api.destino.reiniciarDemo().then(() => window.location.reload())}
          >
            <Icon name="refresh" size={16} />
            {t('pueblo.reset')}
          </button>
          <a href="#mapa" className="btn btn--outline-inverse btn--sm">
            <Icon name="chevronLeft" size={16} />
            {t('pueblo.back')}
          </a>
        </div>
      </header>

      {!p ? (
        <p className="arranque muted" role="status">
          {panel.error ? t('estado.error') : t('estado.cargando')}
        </p>
      ) : (
        <main className="pueblo__main container">
          <Demanda p={p} />
          <VisibilidadCard p={p} onSaved={panel.reload} />
          <Impacto p={p} />
          <Cola p={p} />
          <Contenido p={p} />
          <Widget code={p.widget} />
        </main>
      )}
    </div>
  );
}

function Simulado() {
  const { t } = useI18n();
  return <span className="tag tag--simulado">{t('pueblo.simulated')}</span>;
}

function Demanda({ p }: { p: PanelDestino }) {
  const { t, lang } = useI18n();
  const top = p.demanda.porProvincia.find((x) => x.provincia !== 'Otras');
  const max = Math.max(...p.demanda.porProvincia.map((x) => x.personas), 1);
  const maxDia = Math.max(...p.demanda.porVentana.map((w) => w.visitantesDia), p.visibilidad.aforoDiario, 1);
  return (
    <section className="admin-card pueblo__card pueblo__card--wide" aria-labelledby="dem-title">
      <div className="pueblo__card-head">
        <h2 id="dem-title" className="h3">
          {t('pueblo.secDemand')}
        </h2>
        <Simulado />
      </div>
      <p className="pueblo__headline">
        {t('pueblo.headline', { n: miles(p.demanda.total, lang), que: t(`pueblo.que.${p.destinoId}`) })}
        {top && <span>{t('pueblo.headlineProv', { pct: `${Math.round((top.personas / p.demanda.total) * 100)} %`, prov: top.provincia })}</span>}
      </p>
      <div className="pueblo__cols">
        <div>
          <h3 className="sub">{t('pueblo.byProvince')}</h3>
          <ul className="hbars">
            {p.demanda.porProvincia.map((x) => (
              <li key={x.provincia}>
                <span className="hbars__label">{x.provincia}</span>
                <span className="hbars__track">
                  <span className="hbars__bar" style={{ width: `${(x.personas / max) * 100}%` }} />
                </span>
                <span className="hbars__val">{miles(x.personas, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="sub">{t('pueblo.byWindow')}</h3>
          <ul className="hbars hbars--dates">
            {p.demanda.porVentana.map((w) => {
              const over = w.visitantesDia > p.visibilidad.aforoDiario;
              return (
                <li key={w.desde} className={over ? 'is-over' : ''}>
                  <span className="hbars__label">
                    {fmtDia(w.desde, lang)}–{fmtDia(w.hasta, lang)}
                    <span className="small muted">{w.finDeSemana ? t('pueblo.weekend') : t('pueblo.weekdays')}</span>
                  </span>
                  <span className="hbars__track">
                    <span className="hbars__bar" style={{ width: `${(w.visitantesDia / maxDia) * 100}%` }} />
                    <span className="hbars__cap" style={{ left: `${(p.visibilidad.aforoDiario / maxDia) * 100}%` }} />
                  </span>
                  <span className="hbars__val">
                    {t('pueblo.perDay', { n: miles(w.visitantesDia, lang) })}
                    {over && <strong className="hbars__over">{t('pueblo.over')}</strong>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function VisibilidadCard({ p, onSaved }: { p: PanelDestino; onSaved: () => void }) {
  const { t, lang } = useI18n();
  const [modo, setModo] = useState(p.visibilidad.modo);
  const [aforo, setAforo] = useState(p.visibilidad.aforoDiario);
  const { run, ocupado, aviso } = useAccion();
  useEffect(() => {
    setModo(p.visibilidad.modo);
    setAforo(p.visibilidad.aforoDiario);
  }, [p.visibilidad]);

  const pico = [...p.demanda.porVentana].filter((w) => w.finDeSemana).sort((a, b) => b.visitantesDia - a.visitantesDia)[0];
  const tope = Math.max(4000, ...p.demanda.porVentana.map((w) => w.visitantesDia));

  return (
    <section className="admin-card pueblo__card pueblo__card--wide pueblo__vis" aria-labelledby="vis-title">
      <h2 id="vis-title" className="h3">
        {t('pueblo.secVisibility')}
      </h2>
      {p.visibilidad.modo === 'normal' && pico && pico.visitantesDia > p.visibilidad.aforoDiario && (
        <p className="notice notice--warn">
          <Icon name="warn" size={18} />
          {t('pueblo.warnOver', { desde: fmtDia(pico.desde, lang), hasta: fmtDia(pico.hasta, lang), n: miles(pico.visitantesDia, lang), aforo: miles(p.visibilidad.aforoDiario, lang) })}
        </p>
      )}
      <div className="pueblo__cols">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await api.destino.guardarVisibilidad(p.destinoId, { modo, aforoDiario: aforo });
              onSaved();
            });
          }}
        >
          <div role="radiogroup" aria-label={t('pueblo.secVisibility')} className="segmented">
            {MODOS.map((m) => (
              <label key={m} className={modo === m ? 'is-on' : ''}>
                <input type="radio" name="modo" value={m} checked={modo === m} onChange={() => setModo(m)} />
                {t(`pueblo.mode.${m}`)}
              </label>
            ))}
          </div>
          <p className="small muted">{t(`pueblo.modeHelp.${modo}`)}</p>
          <label className="field field--light">
            {t('pueblo.capacity')}: <strong>{miles(aforo, lang)}</strong>
            <input type="range" min={100} max={tope} step={100} value={aforo} onChange={(e) => setAforo(Number(e.target.value))} />
          </label>
          <button type="submit" className="btn btn--primary" disabled={ocupado}>
            {t('pueblo.save')}
          </button>
          {aviso}
        </form>
        <div className="pueblo__preview">
          <p className="label">{t('pueblo.preview')}</p>
          {p.aforo.completo ? <AforoAviso aforo={p.aforo} /> : <p className="muted">{t('pueblo.previewNone')}</p>}
          <a href="#mapa" className="btn btn--ghost btn--sm">
            {t('pueblo.seeMap')}
            <Icon name="arrowRight" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Impacto({ p }: { p: PanelDestino }) {
  const { t } = useI18n();
  return (
    <section className="admin-card pueblo__card pueblo__card--wide" aria-labelledby="imp-title">
      <div className="pueblo__card-head">
        <h2 id="imp-title" className="h3">
          {t('pueblo.secImpact')}
        </h2>
        <Simulado />
      </div>
      <ul className="kpis">
        {p.kpis.map((k) => (
          <li key={k.clave} className="kpi">
            <span className="kpi__label">{t(`pueblo.kpi.${k.clave}`)}</span>
            <span className="kpi__value">{k.valor}</span>
            <span className="kpi__trend">{k.tendencia}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cola({ p }: { p: PanelDestino }) {
  const { t, lang } = useI18n();
  return (
    <section className="admin-card pueblo__card" aria-labelledby="cola-title">
      <h2 id="cola-title" className="h3">
        {t('pueblo.secQueue')}
      </h2>
      <p className="small">
        <Icon name="camera" size={16} /> {t('pueblo.photosPending', { n: p.fotosPendientes })}
      </p>
      <h3 className="sub">{t('pueblo.queue')}</h3>
      {p.solicitudes.length === 0 && <p className="muted">{t('pueblo.noRequests')}</p>}
      <ul className="queue">
        {p.solicitudes.map((s) => (
          <li key={s.id} className={`queue__item verdict--${s.veredicto.estado}`}>
            <p className="queue__head">
              <strong>{s.nombre}</strong>
              <span className={`pill pill--verdict-${s.veredicto.estado}`}>{t(`alta.verdict.${s.veredicto.estado}`)}</span>
            </p>
            <p className="small muted">
              {t(`alta.types.${s.tipo}`)} · {s.pueblo} · {fmtDia(s.recibidaEn, lang)}
            </p>
            <p className="small">{s.veredicto.motivo}</p>
          </li>
        ))}
      </ul>
      <a href="#alta" className="btn btn--ghost btn--sm">
        {t('pueblo.addBusiness')}
        <Icon name="arrowRight" size={16} />
      </a>
    </section>
  );
}

function Contenido({ p }: { p: PanelDestino }) {
  const { t } = useI18n();
  const ficha = useApi(() => api.ficha(p.destinoId), [p.destinoId]);
  const [historia, setHistoria] = useState('');
  const [agenda, setAgenda] = useState<EventoAgenda[]>(p.agenda);
  const historiaAccion = useAccion();
  const agendaAccion = useAccion();
  useEffect(() => {
    if (ficha.data?.editorial) setHistoria(ficha.data.editorial.historia);
  }, [ficha.data]);

  const cambiar = (i: number, campo: keyof EventoAgenda, valor: string) => setAgenda((a) => a.map((e, j) => (j === i ? { ...e, [campo]: valor } : e)));

  return (
    <section className="admin-card pueblo__card" aria-labelledby="cont-title">
      <h2 id="cont-title" className="h3">
        {t('pueblo.secContent')}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          historiaAccion.run(async () => (await api.destino.guardarHistoria(p.destinoId, historia)).mensaje);
        }}
      >
        <label className="field field--light">
          {t('pueblo.story')}
          <textarea rows={4} value={historia} onChange={(e) => setHistoria(e.target.value)} />
        </label>
        <button type="submit" className="btn btn--ghost btn--sm" disabled={historiaAccion.ocupado}>
          {t('pueblo.saveStory')}
        </button>
        {historiaAccion.aviso}
      </form>
      <h3 className="sub">{t('pueblo.agenda')}</h3>
      <ul className="agenda-edit">
        {agenda.map((e, i) => (
          <li key={i}>
            <input type="date" aria-label={t('pueblo.date')} value={e.fecha} onChange={(ev) => cambiar(i, 'fecha', ev.target.value)} />
            <input aria-label={t('pueblo.event')} value={e.titulo} onChange={(ev) => cambiar(i, 'titulo', ev.target.value)} />
            <button type="button" className="link-button" onClick={() => setAgenda((a) => a.filter((_, j) => j !== i))}>
              {t('pueblo.remove')}
            </button>
          </li>
        ))}
      </ul>
      <div className="btn-row">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAgenda((a) => [...a, { fecha: a[a.length - 1]?.fecha ?? '', titulo: '' }])}>
          <Icon name="plus" size={16} />
          {t('pueblo.addEvent')}
        </button>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          disabled={agendaAccion.ocupado}
          onClick={() =>
            agendaAccion.run(async () => {
              await api.destino.guardarAgenda(p.destinoId, agenda.filter((e) => e.fecha && e.titulo.trim()));
              return t('pueblo.saved');
            })
          }
        >
          {t('pueblo.saveAgenda')}
        </button>
      </div>
      {agendaAccion.aviso}
    </section>
  );
}

function Widget({ code }: { code: string }) {
  const { t } = useI18n();
  const [copiado, setCopiado] = useState(false);
  return (
    <section className="admin-card pueblo__card pueblo__card--wide" aria-labelledby="wid-title">
      <h2 id="wid-title" className="h3">
        {t('pueblo.secWidget')}
      </h2>
      <p className="small muted">{t('pueblo.widgetLead')}</p>
      <pre className="code">{code}</pre>
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => {
          navigator.clipboard?.writeText(code).then(() => setCopiado(true), () => setCopiado(false));
        }}
      >
        {copiado ? t('pueblo.copied') : t('pueblo.copy')}
      </button>
    </section>
  );
}
