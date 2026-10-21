import { useI18n } from '../i18n';
import { Eyebrow } from './ui/Badges';
import { Icon } from './ui/Icon';

/** "Para pueblos y negocios": who pays and for what (the business model, made visible). */
export function BusinessSection() {
  const { t, list } = useI18n();
  const planes = [
    { id: 'destino', per: t('business.per.year'), href: '#destino', destacado: true },
    { id: 'negocio', per: t('business.per.season'), href: '#alta', destacado: false },
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
        </div>
        <div className="pricing">
          {planes.map((p) => (
            <article key={p.id} className={`plan ${p.destacado ? 'plan--main' : ''}`}>
              <h3 className="plan__name">{t(`business.${p.id}.name`)}</h3>
              <p className="plan__who">{t(`business.${p.id}.who`)}</p>
              <p className="plan__price">
                {t(`business.${p.id}.price`)}
                <span>{p.per}</span>
              </p>
              <p className="small muted">{t(`business.${p.id}.note`)}</p>
              <ul className="plan__features">
                {list(`business.${p.id}.features`).map((f) => (
                  <li key={f}>
                    <Icon name="check" size={18} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={p.href} className={`btn ${p.destacado ? 'btn--primary' : 'btn--ghost'}`}>
                {t(`business.${p.id}.cta`)}
                <Icon name="arrowRight" size={16} />
              </a>
            </article>
          ))}
        </div>
        <ul className="biz-grid biz-grid--extra">
          <li className="biz">
            <span className="biz__icon">
              <Icon name="utensils" />
            </span>
            <h3 className="biz__title">{t('business.commT')}</h3>
            <p className="biz__text">{t('business.commD')}</p>
            <a href="#packs" className="btn btn--ghost btn--sm">
              {t('business.commCta')}
              <Icon name="arrowRight" size={16} />
            </a>
          </li>
          <li className="biz">
            <span className="biz__icon">
              <Icon name="compass" />
            </span>
            <h3 className="biz__title">{t('business.grantT')}</h3>
            <p className="biz__text">{t('business.grantD')}</p>
          </li>
        </ul>
        <p className="biz-scale">
          <Icon name="arrowRight" size={18} />
          {t('business.scale')}
        </p>
      </div>
    </section>
  );
}
