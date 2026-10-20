import type { ReactNode } from 'react';
import { useI18n } from '../../i18n';
import type { Confianza, Fase, TipoDato, TipoFenomeno } from '../../types';
import { Icon, type IconName } from './Icon';

/** Phase glyph: colour AND fill shape encode the phase, so it never relies on colour alone (MAP-3, UX-6). */
export function PhaseGlyph({ fase, size }: { fase: Fase; size?: number }) {
  const s = size ?? GLYPH_SIZE[fase];
  return (
    <svg aria-hidden="true" width={s} height={s} viewBox="0 0 32 32" className="glyph">
      {fase === 'fuera_temporada' && (
        <circle cx="16" cy="16" r="13" fill="#fff" stroke="var(--fase-fuera)" strokeWidth="3" strokeDasharray="4 3" />
      )}
      {(fase === 'inicio' || fase === 'avance') && (
        <>
          <circle cx="16" cy="16" r="14" fill="#fff" />
          <path d={fase === 'inicio' ? 'M16 16 L16 2 A14 14 0 0 1 30 16 Z' : 'M16 16 L16 2 A14 14 0 0 1 16 30 Z'} fill={`var(--fase-${fase})`} />
          <circle cx="16" cy="16" r="14" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
        </>
      )}
      {fase === 'pleno' && <circle cx="16" cy="16" r="14" fill="var(--fase-pleno)" stroke="var(--ink)" strokeWidth="1.6" />}
      {fase === 'final' && (
        <>
          <circle cx="16" cy="16" r="10.5" fill="#fff" stroke="var(--fase-final)" strokeWidth="7" />
          <circle cx="16" cy="16" r="14" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
        </>
      )}
    </svg>
  );
}

export const GLYPH_SIZE: Record<Fase, number> = {
  fuera_temporada: 16,
  inicio: 22,
  avance: 24,
  pleno: 30,
  final: 22,
};

export function FasePill({ fase, tipo, short = false }: { fase: Fase; tipo?: TipoFenomeno; short?: boolean }) {
  const { t } = useI18n();
  const label = short || !tipo ? t(`fase.short.${fase}`) : t(`fase.${tipo}.${fase}`);
  return (
    <span className={`pill pill--${fase}`}>
      <PhaseGlyph fase={fase} size={12} />
      {label}
    </span>
  );
}

export function ConfidenceBadge({ confianza, probabilidad }: { confianza: Confianza; probabilidad?: number }) {
  const { t } = useI18n();
  return (
    <span className={`conf conf--${confianza}`}>
      <span className="conf__bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {t(`confianza.${confianza}`)}
      {probabilidad !== undefined && <span className="conf__prob"> · {t('confianza.prob', { p: Math.round(probabilidad * 100) })}</span>}
    </span>
  );
}

const TIPO_ICON: Record<TipoDato, IconName> = {
  observado: 'check',
  estimado: 'satellite',
  previsto: 'calc',
  editorial: 'book',
};

/** Every displayed value carries its data type (HON-2). */
export function DataTypeTag({ tipo }: { tipo: TipoDato }) {
  const { t } = useI18n();
  return (
    <span className={`dtag dtag--${tipo}`}>
      <Icon name={TIPO_ICON[tipo]} size={13} />
      {t(`tipoDato.${tipo}`)}
    </span>
  );
}

/** Marks which layer a block belongs to: calculated, editorial or commercial (PRIN-3.3). */
export function LayerHeading({ capa, children }: { capa: 'calculada' | 'editorial' | 'comercial'; children?: ReactNode }) {
  const { t } = useI18n();
  const icon: IconName = capa === 'calculada' ? 'calc' : capa === 'editorial' ? 'book' : 'tag';
  return (
    <div className={`layer layer--${capa}`}>
      <span className="layer__chip">
        <Icon name={icon} size={14} />
        {t(`capa.${capa}`)}
      </span>
      {children}
    </div>
  );
}

export function SponsoredTag() {
  const { t } = useI18n();
  return <span className="sponsored">{t('ficha.sponsored')}</span>;
}

export function Eyebrow({ children, tone = 'forecast' }: { children: ReactNode; tone?: 'forecast' | 'ink' | 'accent' }) {
  return <p className={`eyebrow eyebrow--${tone}`}>{children}</p>;
}
