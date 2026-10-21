import { useI18n } from '../i18n';
import { Eyebrow } from './ui/Badges';
import { Icon, type IconName } from './ui/Icon';

/** Monetisation argument made visible (MIN-4, MON-4…MON-6). */
export function BusinessSection() {
  const { t } = useI18n();
  const lines: { icon: IconName; title: string; text: string }[] = [
    { icon: 'bed', title: t('business.stayT'), text: t('business.stayD') },
    { icon: 'compass', title: t('business.doT'), text: t('business.doD') },
    { icon: 'tag', title: t('business.sponsorT'), text: t('business.sponsorD') },
    { icon: 'database', title: t('business.b2bT'), text: t('business.b2bD') },
  ];
  return (
    <section id="negocio" className="business" aria-labelledby="business-title">
      <div className="container">
        <div className="section-head">
          <div>
            <Eyebrow>{t('business.eyebrow')}</Eyebrow>
            <h2 id="business-title" className="h2">
              {t('business.title')}
            </h2>
            <p className="muted lead-sm">{t('business.lead')}</p>
          </div>
          <a href="#" className="btn btn--primary">
            {t('business.contact')}
          </a>
        </div>
        <ul className="biz-grid">
          {lines.map((l) => (
            <li key={l.title} className="biz">
              <span className="biz__icon">
                <Icon name={l.icon} />
              </span>
              <h3 className="biz__title">{l.title}</h3>
              <p className="biz__text">{l.text}</p>
            </li>
          ))}
        </ul>
        <p className="biz-scale">
          <Icon name="arrowRight" size={18} />
          {t('business.scale')}
        </p>
      </div>
    </section>
  );
}
