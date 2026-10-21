import { useEffect, useState } from 'react';
import { AdminApp } from './admin/AdminApp';
import App from './App';
import { useI18n } from './i18n';
import { DatosProvider } from './state';

// The internal panel lives at #admin (a plain anchor, so the link also works when the
// mockup is embedded). In production it would be a separate, authenticated app.
const isAdmin = () => window.location.hash.startsWith('#admin');

export default function Root() {
  const [admin, setAdmin] = useState(isAdmin);
  useEffect(() => {
    const on = () => {
      const next = isAdmin();
      setAdmin((prev) => {
        if (prev !== next) window.scrollTo(0, 0);
        return next;
      });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return admin ? (
    <AdminApp />
  ) : (
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
