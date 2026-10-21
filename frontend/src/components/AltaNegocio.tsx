import { useState, type FormEvent } from 'react';
import { api, type NormasFinca, type SolicitudNegocio, type SolicitudNegocioIn, type TipoNegocio } from '../api';
import { useI18n } from '../i18n';
import { useDatos } from '../state';
import { Eyebrow } from './ui/Badges';
import { Icon } from './ui/Icon';

const TIPOS: TipoNegocio[] = ['alojamiento', 'actividad', 'finca', 'productor'];
const NORMAS: NormasFinca[] = ['abierta', 'entrada', 'prohibida'];

const VACIO: SolicitudNegocioIn = { destinoId: 'brihuega', nombre: '', tipo: 'alojamiento', pueblo: 'Brihuega', descripcion: '' };

/** The three scripted cases of the demo: one approved, one fake review rejected, one sent to human review. */
const PRESETS: { key: string; datos: SolicitudNegocioIn }[] = [
  {
    key: 'alta.preset1',
    datos: {
      ...VACIO, nombre: 'Casa rural El Lavandar',
      descripcion: 'Cuatro habitaciones en una casa de piedra del casco histórico, a 2 km de los campos.', fotoDistanciaKm: 0.6,
    },
  },
  {
    key: 'alta.preset2',
    datos: {
      ...VACIO, nombre: 'Hostal Vista Lavanda', descripcion: 'Habitaciones con vistas a los campos de lavanda.',
      resena: '¡¡La mejor casa rural de España!! Increíble, reserva ya, 100 % recomendable.', mismaIp: true, fotoDistanciaKm: 1.2,
    },
  },
  {
    key: 'alta.preset3',
    datos: {
      ...VACIO, nombre: 'Campo de lavanda La Peñahora', tipo: 'finca', normas: 'abierta',
      descripcion: 'Finca familiar de lavandín, abierta a visitas al atardecer.', fotoDistanciaKm: 4.8,
    },
  },
];

/** Business sign-up with automatic moderation (licence of the business listing, ~99 €/season). */
export function AltaNegocio() {
  const { t } = useI18n();
  const { destinos } = useDatos();
  const [f, setF] = useState<SolicitudNegocioIn>(VACIO);
  const [estado, setEstado] = useState<'analizando' | null>(null);
  const [resultado, setResultado] = useState<SolicitudNegocio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof SolicitudNegocioIn>(k: K, v: SolicitudNegocioIn[K]) => setF((x) => ({ ...x, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEstado('analizando');
    setResultado(null);
    setError(null);
    try {
      setResultado(await api.altaNegocio(f));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEstado(null);
    }
  };

  const v = resultado?.veredicto;
  return (
    <section id="alta" className="alta" aria-labelledby="alta-title">
      <div className="container alta__inner">
        <div className="alta__copy">
          <Eyebrow>{t('alta.eyebrow')}</Eyebrow>
          <h2 id="alta-title" className="h2">
            {t('alta.title')}
          </h2>
          <p className="muted lead-sm">{t('alta.lead')}</p>
          <p className="label">{t('alta.presets')}</p>
          <div className="chips">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                className="chip"
                aria-pressed={f.nombre === p.datos.nombre}
                onClick={() => {
                  setF(p.datos);
                  setResultado(null);
                }}
              >
                {t(p.key)}
              </button>
            ))}
          </div>
          <p className="small muted">{t('alta.simulated')}</p>
        </div>

        <form className="alta__form" onSubmit={submit}>
          <label className="field field--light">
            {t('alta.dest')}
            <select value={f.destinoId} onChange={(e) => set('destinoId', e.target.value)}>
              {destinos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="field field--light">
            {t('alta.type')}
            <select value={f.tipo} onChange={(e) => set('tipo', e.target.value as TipoNegocio)}>
              {TIPOS.map((x) => (
                <option key={x} value={x}>
                  {t(`alta.types.${x}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field field--light field--wide">
            {t('alta.name')}
            <input required value={f.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </label>
          <label className="field field--light">
            {t('alta.village')}
            <input required value={f.pueblo} onChange={(e) => set('pueblo', e.target.value)} />
          </label>
          {f.tipo === 'finca' && (
            <label className="field field--light">
              {t('alta.rules')}
              <select value={f.normas ?? ''} onChange={(e) => set('normas', (e.target.value || undefined) as NormasFinca | undefined)}>
                <option value="">·</option>
                {NORMAS.map((x) => (
                  <option key={x} value={x}>
                    {t(`alta.rulesOpts.${x}`)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="field field--light field--wide">
            {t('alta.desc')}
            <textarea rows={2} value={f.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
          </label>
          <label className="field field--light field--wide">
            {t('alta.review')}
            <textarea rows={2} value={f.resena ?? ''} onChange={(e) => set('resena', e.target.value || undefined)} />
          </label>
          <label className="field field--light">
            {t('alta.photo')}
            <input
              type="number"
              min={0}
              step={0.1}
              value={f.fotoDistanciaKm ?? ''}
              onChange={(e) => set('fotoDistanciaKm', e.target.value === '' ? undefined : Number(e.target.value))}
            />
            <span className="small muted">{t('alta.photoHint')}</span>
          </label>
          <div className="alta__actions">
            <button type="submit" className="btn btn--primary" disabled={estado === 'analizando'}>
              <Icon name="check" size={18} />
              {t('alta.submit')}
            </button>
          </div>

          {estado === 'analizando' && (
            <p className="alta__analysing" role="status">
              <span className="spinner" aria-hidden="true" />
              {t('alta.analysing')}
            </p>
          )}
          {error && (
            <p role="alert" className="notice notice--bad">
              <Icon name="warn" size={18} />
              {error}
            </p>
          )}
          {v && (
            <div className={`verdict verdict--${v.estado}`} role="status">
              <p className="verdict__head">
                <Icon name={v.estado === 'aprobado' ? 'check' : v.estado === 'rechazado' ? 'x' : 'warn'} size={20} />
                {t(`alta.verdict.${v.estado}`)}
              </p>
              <p>{v.motivo}</p>
              <p className="label">{t('alta.checks')}</p>
              <ul className="checks-inline">
                {v.comprobaciones.map((c) => (
                  <li key={c.clave} className={c.ok ? 'is-ok' : 'is-bad'}>
                    <Icon name={c.ok ? 'check' : 'x'} size={14} />
                    {c.detalle}
                  </li>
                ))}
              </ul>
              <p className="small muted">{v.modelo}</p>
              <a href="#destino" className="btn btn--ghost btn--sm">
                {t('alta.toPanel')}
                <Icon name="arrowRight" size={16} />
              </a>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
