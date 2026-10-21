import { useI18n } from '../i18n';

export function Footer({ onMethod }: { onMethod: () => void }) {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__name">{t('brand')}</p>
          <p className="muted">{t('footer.tagline')}</p>
        </div>
        <div className="site-footer__cols">
          <div className="site-footer__col">
            <p className="label">{t('footer.explore')}</p>
            <a href="#mapa">{t('nav.map')}</a>
            <a href="#packs">{t('nav.plans')}</a>
            <a href="#avisos">{t('nav.alerts')}</a>
            <a href="#verifica">{t('footer.verify')}</a>
          </div>
          <div className="site-footer__col">
            <p className="label">{t('footer.project')}</p>
            <button type="button" className="link-button" onClick={onMethod}>
              {t('nav.method')}
            </button>
            <a href="#negocio">{t('footer.business')}</a>
            <a href="#destino">{t('nav.panel')}</a>
            <a href="#">{t('footer.privacy')}</a>
            <a href="#admin" className="site-footer__admin">
              {t('footer.admin')}
            </a>
          </div>
        </div>
      </div>
      <div className="container site-footer__legal">
        <p>{t('footer.attribution')}</p>
        <p>{t('footer.copy')}</p>
      </div>
    </footer>
  );
}
