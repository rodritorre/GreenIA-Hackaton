import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { api, useApi, type DestinoResumen, type EstadoDatos, type EstadoEnFecha, type Oferta } from './api';

interface Datos {
  hoy: string;
  estadoDatos: EstadoDatos;
  destinos: DestinoResumen[];
  ofertas: Oferta[];
  getDestino: (id: string) => DestinoResumen | undefined;
  recargar: () => void;
}

const Ctx = createContext<Datos | null>(null);

/** Loads what every public section shares (destinations, offers, data freshness) once. */
export function DatosProvider({ children, fallback }: { children: ReactNode; fallback: (s: { error?: Error; reload: () => void }) => ReactNode }) {
  const carga = useApi(() => Promise.all([api.estadoDatos(), api.destinos(), api.ofertas()]), []);
  const value = useMemo<Datos | null>(() => {
    if (!carga.data) return null;
    const [estadoDatos, destinos, ofertas] = carga.data;
    return {
      hoy: estadoDatos.hoy, estadoDatos, destinos, ofertas,
      getDestino: (id) => destinos.find((d) => d.id === id),
      recargar: carga.reload,
    };
  }, [carga.data, carga.reload]);
  if (!value) return <>{fallback({ error: carga.error, reload: carga.reload })}</>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDatos(): Datos {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDatos outside DatosProvider');
  return v;
}

/** State of every destination on a date, from GET /mapa. */
export function useMapa(fecha: string) {
  const c = useApi(() => api.mapa(fecha), [fecha]);
  const estados = useMemo(() => {
    const m = new Map<string, EstadoEnFecha>();
    c.data?.destinos.forEach((x) => m.set(x.destinoId, x.estado));
    return m;
  }, [c.data]);
  return { estados, cargando: c.loading, error: c.error, listo: !!c.data && c.data.fecha === fecha };
}
