import { useState, type ReactNode } from 'react';
import { useI18n, type Lang } from '../i18n';
import { FlowerMark, Icon, type IconName } from '../components/ui/Icon';
import { AlertsAdminSection } from './AlertsAdminSection';
import { ContentSection } from './ContentSection';
import { DataSection } from './DataSection';
import { DestinationsSection } from './DestinationsSection';
import { ForecastSection } from './ForecastSection';
import { PhotosSection } from './PhotosSection';

type Sec = 'data' | 'forecast' | 'photos' | 'alerts' | 'dest' | 'content';

const SECTIONS: { id: Sec; key: string; icon: IconName; render: () => ReactNode }[] = [
  { id: 'data', key: 'admin.secData', icon: 'database', render: () => <DataSection /> },
  { id: 'forecast', key: 'admin.secForecast', icon: 'calc', render: () => <ForecastSection /> },
  { id: 'photos', key: 'admin.secPhotos', icon: 'camera', render: () => <PhotosSection /> },
  { id: 'alerts', key: 'admin.secAlerts', icon: 'bell', render: () => <AlertsAdminSection /> },
  { id: 'dest', key: 'admin.secDest', icon: 'pin', render: () => <DestinationsSection /> },
  { id: 'content', key: 'admin.secContent', icon: 'book', render: () => <ContentSection /> },
];

/** Internal Greenia panel: everything that operates the product rather than serving tourists. */
export function AdminApp() {
  const { t, lang, setLang } = useI18n();
  const [sec, setSec] = useState<Sec>('data');
  const current = SECTIONS.find((s) => s.id === sec)!;
  const langs: Lang[] = ['es', 'en'];

  return (
    <div className="admin">
      <p className="mock-banner">
        <Icon name="info" size={16} />
        {t('admin.note')}
      </p>
      <header className="admin-bar">
        <div className="admin-bar__brand">
          <FlowerMark size={28} />
          <span className="brand__name">{t('brand')}</span>
          <span className="admin-bar__badge">{t('admin.title')}</span>
          <span className="admin-bar__sub">{t('admin.badge')}</span>
        </div>
        <div className="admin-bar__end">
          <div className="lang lang--inverse" role="group" aria-label={t('nav.lang')}>
            {langs.map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a href="#top" className="btn btn--outline-inverse btn--sm">
            <Icon name="chevronLeft" size={16} />
            {t('admin.back')}
          </a>
        </div>
      </header>
      <div className="admin-layout">
        <nav aria-label={t('admin.nav')} className="admin-nav">
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" aria-current={sec === s.id ? 'page' : undefined} onClick={() => setSec(s.id)}>
              <Icon name={s.icon} size={18} />
              {t(s.key)}
            </button>
          ))}
        </nav>
        <main className="admin-main">
          <h1 className="h2">{t(current.key)}</h1>
          {current.render()}
        </main>
      </div>
    </div>
  );
}
