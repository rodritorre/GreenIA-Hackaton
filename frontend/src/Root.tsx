import { useEffect, useState } from 'react';
import { AdminApp } from './admin/AdminApp';
import App from './App';
import { DestinoPanel } from './destino/DestinoPanel';
import { useI18n } from './i18n';
import { DatosProvider } from './state';

// The internal panel lives at #admin (a plain anchor, so the link also works when the
// mockup is embedded). In production it would be a separate, authenticated app.
// The destination panel (paying towns) lives at #destino, the same way.
type Vista = 'admin' | 'destino' | 'web';
const vista = (): Vista => {
  const h = window.location.hash;
  return h.startsWith('#admin') ? 'admin' : h.startsWith('#destino') ? 'destino' : 'web';
};

export default function Root() {
  const [v, setV] = useState(vista);
  useEffect(() => {
    const on = () => {
      const next = vista();
      setV((prev) => {
        if (prev !== next) {
          // Coming back to the public site lands on the section the link points to.
          const id = window.location.hash.slice(1);
          if (next !== 'web') setTimeout(() => window.scrollTo(0, 0), 0);
          else setTimeout(() => (id ? document.getElementById(id)?.scrollIntoView() : window.scrollTo(0, 0)), 400);
        }
        return next;
      });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  if (v === 'admin') return <AdminApp />;
  if (v === 'destino') {
    return (
      <DatosProvider fallback={(f) => <Arranque {...f} />}>
        <DestinoPanel />
      </DatosProvider>
    );
  }
  return (
    <DatosProvider fallback={(f) => <Arranque {...f} />}>
      <App />
    </DatosProvider>
  );
}

/** First load: a quiet loading line, or a clear error with a retry when the API can't be reached (UX-9). */
function Arranque({ error, reload }: { error?: Error; reload: () => void }) {
  const { t } = useI18n();
  return (
    <main className="arranque">
      <p className="brand__name">Cuándo Florece</p>
      {error ? (
        <>
          <p role="alert">{t('estado.error')}</p>
          <button type="button" className="btn btn--primary" onClick={reload}>
            {t('estado.reintentar')}
          </button>
        </>
      ) : (
        <p role="status" className="muted">
          {t('estado.cargando')}
        </p>
      )}
    </main>
  );
}
