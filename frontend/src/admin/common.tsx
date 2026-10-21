import { useState, type ReactNode } from 'react';
import type { Carga } from '../api';
import { useI18n } from '../i18n';
import { Icon } from '../components/ui/Icon';

/** Renders a loading line or an error until `carga` has data. */
export function Cargando<T>({ carga, children }: { carga: Carga<T>; children: (data: T) => ReactNode }) {
  const { t } = useI18n();
  if (carga.error) {
    return (
      <p role="alert" className="notice notice--bad">
        <Icon name="warn" size={18} />
        {t('admin.loadError', { msg: carga.error.message })}
      </p>
    );
  }
  if (!carga.data) {
    return (
      <p role="status" className="muted">
        {t('estado.cargando')}
      </p>
    );
  }
  return <>{children(carga.data)}</>;
}

/** Runs an async action, exposing busy state and a one-line result/error to show next to the button. */
export function useAccion() {
  const [estado, setEstado] = useState<{ ok: boolean; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const run = async (fn: () => Promise<string | void>) => {
    setOcupado(true);
    setEstado(null);
    try {
      const texto = await fn();
      if (texto) setEstado({ ok: true, texto });
    } catch (e) {
      setEstado({ ok: false, texto: (e as Error).message });
    } finally {
      setOcupado(false);
    }
  };
  const aviso = estado && (
    <p role="status" className={`notice ${estado.ok ? 'notice--ok' : 'notice--bad'}`}>
      <Icon name={estado.ok ? 'check' : 'warn'} size={18} />
      {estado.texto}
    </p>
  );
  return { run, ocupado, aviso };
}
