import { api } from '../api';
import { useI18n, type Lang } from '../i18n';
import { FlowerMark, Icon } from './ui/Icon';

export function Header({ onMethod }: { onMethod: () => void }) {
  const { t, lang, setLang } = useI18n();
  const langs: Lang[] = ['es', 'en'];
  return (
    <>
      {api.modo === 'mock' && (
        <p className="mock-banner">
          <Icon name="info" size={16} />
          {t('mockBanner')}
        </p>
      )}
      <header className="site-header">
        <div className="container site-header__inner">
          <a href="#top" className="brand">
            <FlowerMark />
            <span className="brand__name">{t('brand')}</span>
          </a>
          <nav aria-label={t('nav.main')} className="site-nav">
            <a href="#mapa" aria-current="page">
              {t('nav.map')}
            </a>
            <a href="#mapa">{t('nav.calendar')}</a>
            <a href="#planes">{t('nav.plans')}</a>
            <a href="#avisos">{t('nav.alerts')}</a>
            <button type="button" className="link-button" onClick={onMethod}>
              {t('nav.method')}
            </button>
          </nav>
          <div className="site-header__end">
            <div className="lang" role="group" aria-label={t('nav.lang')}>
              {langs.map((l, i) => (
                <span key={l} className="lang__item">
                  {i > 0 && <span aria-hidden="true" className="lang__sep">/</span>}
                  <button type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                    {l.toUpperCase()}
                  </button>
                </span>
              ))}
            </div>
            <a href="#planes" className="btn btn--primary">
              {t('nav.cta')}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
