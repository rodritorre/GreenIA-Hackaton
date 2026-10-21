import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { api, ApiError, type Usuario } from '../api';
import { useI18n, type Lang } from '../i18n';
import { FlowerMark, Icon, type IconName } from '../components/ui/Icon';
import { AlertsAdminSection } from './AlertsAdminSection';
import { ContentSection } from './ContentSection';
import { DataSection } from './DataSection';
import { DestinationsSection } from './DestinationsSection';
import { ForecastSection } from './ForecastSection';
import { PhotosSection } from './PhotosSection';
import { UsersSection } from './UsersSection';

type Sec = 'data' | 'forecast' | 'photos' | 'alerts' | 'dest' | 'content' | 'users';

const SECTIONS: { id: Sec; key: string; icon: IconName; soloAdmin?: boolean; render: (u: Usuario) => ReactNode }[] = [
  { id: 'data', key: 'admin.secData', icon: 'database', render: (u) => <DataSection usuario={u} /> },
  { id: 'forecast', key: 'admin.secForecast', icon: 'calc', render: (u) => <ForecastSection usuario={u} /> },
  { id: 'photos', key: 'admin.secPhotos', icon: 'camera', render: () => <PhotosSection /> },
  { id: 'alerts', key: 'admin.secAlerts', icon: 'bell', render: (u) => <AlertsAdminSection usuario={u} /> },
  { id: 'dest', key: 'admin.secDest', icon: 'pin', render: (u) => <DestinationsSection usuario={u} /> },
  { id: 'content', key: 'admin.secContent', icon: 'book', render: (u) => <ContentSection usuario={u} /> },
  { id: 'users', key: 'admin.secUsers', icon: 'layers', soloAdmin: true, render: () => <UsersSection /> },
];

/** Internal Greenia panel: everything that operates the product rather than serving tourists. */
export function AdminApp() {
  const { t, lang, setLang } = useI18n();
  const [sec, setSec] = useState<Sec>('data');
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined);
  const langs: Lang[] = ['es', 'en'];

  useEffect(() => {
    api.yo().then(setUsuario, () => setUsuario(null));
  }, []);

  const visibles = SECTIONS.filter((s) => !s.soloAdmin || usuario?.rol === 'admin');
  const current = visibles.find((s) => s.id === sec) ?? visibles[0];

  return (
    <div className="admin">
      {api.modo === 'mock' && (
        <p className="mock-banner">
          <Icon name="info" size={16} />
          {t('admin.note')}
        </p>
      )}
      <header className="admin-bar">
        <div className="admin-bar__brand">
          <FlowerMark size={28} />
          <span className="brand__name">{t('brand')}</span>
          <span className="admin-bar__badge">{t('admin.title')}</span>
          <span className="admin-bar__sub">{usuario ? `${usuario.nombre} · ${usuario.rol}` : t('admin.badge')}</span>
        </div>
        <div className="admin-bar__end">
          <div className="lang lang--inverse" role="group" aria-label={t('nav.lang')}>
            {langs.map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {usuario && (
            <button type="button" className="btn btn--outline-inverse btn--sm" onClick={() => api.logout().then(() => setUsuario(null))}>
              {t('admin.logout')}
            </button>
          )}
          <a href="#top" className="btn btn--outline-inverse btn--sm">
            <Icon name="chevronLeft" size={16} />
            {t('admin.back')}
          </a>
        </div>
      </header>
      {usuario === undefined ? (
        <p className="arranque muted" role="status">
          {t('estado.cargando')}
        </p>
      ) : usuario === null ? (
        <Login onOk={setUsuario} />
      ) : (
        <div className="admin-layout">
          <nav aria-label={t('admin.nav')} className="admin-nav">
            {visibles.map((s) => (
              <button key={s.id} type="button" aria-current={current.id === s.id ? 'page' : undefined} onClick={() => setSec(s.id)}>
                <Icon name={s.icon} size={18} />
                {t(s.key)}
              </button>
            ))}
          </nav>
          <main className="admin-main">
            <h1 className="h2">{t(current.key)}</h1>
            {current.render(usuario)}
          </main>
        </div>
      )}
    </div>
  );
}

function Login({ onOk }: { onOk: (u: Usuario) => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      onOk(await api.login(email, password));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('estado.error'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="admin-login">
      <form className="admin-card" onSubmit={submit}>
        <h1 className="h2">{t('admin.login')}</h1>
        <p className="muted">{t('admin.loginLead')}</p>
        <label className="field field--light">
          {t('alerts.email')}
          <input id="login-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field field--light">
          {t('admin.password')}
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {t('admin.enter')}
        </button>
        {error && (
          <p role="alert" className="notice notice--bad">
            <Icon name="warn" size={18} />
            {error}
          </p>
        )}
        {api.modo === 'mock' && <p className="small muted">{t('admin.demoHint')}</p>}
      </form>
    </main>
  );
}
