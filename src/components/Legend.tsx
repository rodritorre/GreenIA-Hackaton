import { useI18n } from '../i18n';
import type { Fase } from '../types';
import { PhaseGlyph } from './ui/Badges';

const FASES: Fase[] = ['fuera_temporada', 'inicio', 'avance', 'pleno', 'final'];

/** Always-visible legend for the phase code (MAP-4). */
export function Legend() {
  const { t } = useI18n();
  return (
    <div className="legend" aria-label={t('legend.title')} role="group">
      {FASES.map((f) => (
        <span key={f} className="legend__item">
          <PhaseGlyph fase={f} size={f === 'pleno' ? 18 : 16} />
          {t(`fase.short.${f}`)}
        </span>
      ))}
      <span className="legend__item">
        <span aria-hidden="true" className="legend__ring" />
        {t('legend.certainty')}
      </span>
    </div>
  );
}
