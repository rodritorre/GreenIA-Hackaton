import { useI18n } from '../i18n';
import { Eyebrow } from './ui/Badges';
import { Icon } from './ui/Icon';

/** Both sides of the impact: what we want for rural Spain, and the harm we anticipate and how the product handles it. */
export function ImpactSection() {
  const { t, list } = useI18n();
  return (
    <section id="impacto" className="impact" aria-labelledby="impact-title">
      <div className="container">
        <Eyebrow tone="accent">{t('impacto.eyebrow')}</Eyebrow>
        <h2 id="impact-title" className="h2">
          {t('impacto.title')}
        </h2>
        <div className="impact__cols">
          <div className="impact__col">
            <h3 className="impact__head">{t('impacto.goodT')}</h3>
            <ul className="impact__list">
              {list('impacto.good').map((s) => (
                <li key={s}>
                  <Icon name="check" size={18} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="impact__col">
            <h3 className="impact__head">{t('impacto.riskT')}</h3>
            <ul className="impact__list impact__list--risk">
              {list('impacto.risk').map((s) => (
                <li key={s}>
                  <Icon name="warn" size={18} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="impact__col">
            <h3 className="impact__head">{t('impacto.kpiT')}</h3>
            <ol className="impact__kpis">
              {list('impacto.kpis').map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
