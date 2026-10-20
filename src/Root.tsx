import { useEffect, useState } from 'react';
import { AdminApp } from './admin/AdminApp';
import App from './App';

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
  return admin ? <AdminApp /> : <App />;
}
