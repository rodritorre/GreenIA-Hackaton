import { useState } from 'react';
import { api, useApi, type DestinoResumen, type EstadoEnFecha } from '../../api';
import { useI18n } from '../../i18n';
import { fmtHora, fmtMes } from '../../lib/fechas';
import { ConfidenceBadge, DataTypeTag, FasePill } from '../ui/Badges';
import { FlowerArt } from '../ui/FlowerArt';
import { Icon } from '../ui/Icon';
import { AforoAviso, useAforo } from '../Aforo';
import { Comercial } from './Comercial';
import { CuandoIr } from './CuandoIr';
import { Descubrir } from './Descubrir';
import { Editorial } from './Editorial';

type Tab = 'when' | 'see' | 'stay';

interface Props {
  d: DestinoResumen;
  e: EstadoEnFecha;
  fecha: string;
  onBack: () => void;
  onMethod: () => void;
  onAlert: (id: string) => void;
}

export function DestinoFicha({ d, e, fecha, onBack, onMethod, onAlert }: Props) {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<Tab>('when');
  const ficha = useApi(() => api.ficha(d.id, lang), [d.id, lang]);
  const aforo = useAforo().get(d.id);
  const tabs: { id: Tab; label: string }[] = [
    { id: 'when', label: t('ficha.tabWhen') },
    { id: 'see', label: t('ficha.tabSee') },
    { id: 'stay', label: t('ficha.tabStay') },
  ];

  return (
    <article className="ficha" aria-labelledby="ficha-title">
      <div className="ficha__back">
        <button type="button" className="back" onClick={onBack}>
          <Icon name="chevronLeft" size={18} />
          {t('ficha.back')}
        </button>
      </div>
      <div className="ficha__band" style={{ background: `color-mix(in srgb, ${d.color} 22%, #fff)` }}>
        <FlowerArt kind={d.ilustracion} size={132} className="ficha__art" />
        <span className={`ficha__source ${d.datosReales ? 'is-real' : ''}`}>{d.datosReales ? t('ficha.realData') : t('ficha.publicData')}</span>
      </div>
      <header className="ficha__head">
        {/* FIC-1 + FIC-2 */}
        <div className="ficha__status">
          <FasePill fase={e.fase} tipo={d.tipo} />
          <DataTypeTag tipo={e.tipoDato} />
          {e.esPrevision && <ConfidenceBadge confianza={e.confianza} />}
        </div>
        <h3 id="ficha-title" className="ficha__title">
          {d.nombre}
        </h3>
        <p className="ficha__place">
          {d.lugar} · {d.provincia} · {d.fenomeno} · {d.especie}
        </p>
        {!e.esPrevision ? (
          <p className="ficha__summary">{d.estado.resumen}</p>
        ) : (
          e.transicion && (
            <p className="ficha__summary">
              {fmtMes(fecha, lang)}: {t('map.transition', { fase: t(`fase.${d.tipo}.${e.transicion.fase}`).toLowerCase() })}
            </p>
          )
        )}
        <p className="small muted">
          {t('ficha.updated', { when: fmtHora(d.estado.actualizadoEn, lang) })} · {t('ficha.source', { fuente: d.estado.fuente })}
        </p>
        <AforoAviso aforo={aforo} />
      </header>

      <div role="tablist" aria-label={t('ficha.tabs')} className="tabs">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`tab-${x.id}`}
            aria-controls={`panel-${x.id}`}
            aria-selected={tab === x.id}
            tabIndex={tab === x.id ? 0 : -1}
            className="tab"
            onClick={() => setTab(x.id)}
            onKeyDown={(ev) => {
              if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
              const i = tabs.findIndex((y) => y.id === tab);
              const next = tabs[(i + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].id;
              setTab(next);
              document.getElementById(`tab-${next}`)?.focus();
            }}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {!ficha.data ? (
          <p className="empty" role="status">
            {ficha.error ? t('estado.error') : t('estado.cargando')}
          </p>
        ) : (
          <>
            {tab === 'when' && <CuandoIr d={d} calculado={ficha.data.calculado} onMethod={onMethod} onAlert={onAlert} />}
            {tab === 'see' && (
              <>
                <Editorial editorial={ficha.data.editorial} patrocinio={ficha.data.comercial.patrocinio} fuentes={ficha.data.fuentes} />
                <Descubrir destinoId={d.id} />
              </>
            )}
            {tab === 'stay' && <Comercial ofertas={ficha.data.comercial.ofertas} />}
          </>
        )}
      </div>
    </article>
  );
}
