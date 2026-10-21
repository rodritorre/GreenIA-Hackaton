import type { HistoricoMargen, PuntoPrevisionSerie, PuntoSerie, Umbrales, VentanaFase } from '../../api';
import { useI18n } from '../../i18n';
import { diffDays, fmtDia } from '../../lib/fechas';
import { useDatos } from '../../state';

const W = 360;
const PAD = { l: 30, r: 10, t: 10, b: 24 };

/** Daily colour index with forecast band (FIC-5). Gaps are drawn as gaps, never interpolated (HON-4). */
export function IndiceChart({
  serie,
  prevision,
  umbrales,
}: {
  serie: PuntoSerie[];
  prevision: PuntoPrevisionSerie[];
  umbrales: Umbrales;
}) {
  const { t, lang } = useI18n();
  const { hoy: HOY } = useDatos();
  const H = 190;
  const start = serie[0].fecha;
  const end = prevision.length ? prevision[prevision.length - 1].fecha : serie[serie.length - 1].fecha;
  const span = diffDays(end, start);
  const x = (f: string) => PAD.l + (diffDays(f, start) / span) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);

  const segments: string[] = [];
  let cur = '';
  for (const p of serie) {
    if (p.indice === null) {
      if (cur) segments.push(cur);
      cur = '';
    } else {
      cur += `${cur ? 'L' : 'M'}${x(p.fecha).toFixed(1)} ${y(p.indice).toFixed(1)} `;
    }
  }
  if (cur) segments.push(cur);

  const band = !prevision.length
    ? ''
    : prevision.map((p, i) => `${i ? 'L' : 'M'}${x(p.fecha).toFixed(1)} ${y(p.p90).toFixed(1)}`).join(' ') +
    ' ' +
    prevision
      .slice()
      .reverse()
      .map((p) => `L${x(p.fecha).toFixed(1)} ${y(p.p10).toFixed(1)}`)
      .join(' ') +
    ' Z';
  const median = prevision.map((p, i) => `${i ? 'L' : 'M'}${x(p.fecha).toFixed(1)} ${y(p.p50).toFixed(1)}`).join(' ');
  const ticks = serie.filter((p) => p.fecha.endsWith('-01') || p.fecha.endsWith('-15')).map((p) => p.fecha);
  const primeroMes = prevision.find((p) => p.fecha.endsWith('-01'))?.fecha;
  if (primeroMes) ticks.push(primeroMes);

  const thresholds = ['inicio', 'avance', 'pleno'] as const;

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t('ficha.chartIndex')}. ${t('ficha.chartIndexDesc')}`}>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="chart__grid" />
            <text x={PAD.l - 6} y={y(v) + 4} className="chart__axis" textAnchor="end">
              {v.toLocaleString(lang)}
            </text>
          </g>
        ))}
        {thresholds.map((f) => (
          <g key={f}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(umbrales[f])} y2={y(umbrales[f])} className="chart__threshold" />
            <text x={PAD.l + 4} y={y(umbrales[f]) - 3} className="chart__th-label">
              {t(`fase.short.${f}`)}
            </text>
          </g>
        ))}
        <path d={band} className="chart__band" />
        <path d={median} className="chart__median" />
        {segments.map((d, i) => (
          <path key={i} d={d} className="chart__line" />
        ))}
        {serie
          .filter((p) => p.indice === null)
          .map((p) => (
            <g key={p.fecha} className="chart__gap">
              <rect x={x(p.fecha) - 2.5} y={PAD.t} width={5} height={H - PAD.t - PAD.b} />
              <text x={x(p.fecha)} y={H - PAD.b - 4} textAnchor="middle">
                ×
              </text>
            </g>
          ))}
        <line x1={x(HOY)} x2={x(HOY)} y1={PAD.t} y2={H - PAD.b} className="chart__today" />
        <text x={x(HOY) + 3} y={PAD.t + 9} className="chart__today-label">
          {t('map.today')}
        </text>
        {ticks.map((f) => (
          <text key={f} x={x(f)} y={H - 6} className="chart__axis" textAnchor="middle">
            {fmtDia(f, lang)}
          </text>
        ))}
      </svg>
      <figcaption className="chart__legend">
        <span>
          <i className="key key--line" />
          {t('ficha.chartObserved')}
        </span>
        <span>
          <i className="key key--gap" />
          {t('ficha.chartNoData')}
        </span>
        <span>
          <i className="key key--band" />
          {t('ficha.chartBand')}
        </span>
        <span>
          <i className="key key--threshold" />
          {t('ficha.chartThreshold')}
        </span>
      </figcaption>
    </figure>
  );
}

/** Daily maximum temperature (FIC-6). */
export function TempChart({ serie }: { serie: PuntoSerie[] }) {
  const { t, lang } = useI18n();
  const H = 120;
  const vals = serie.map((p) => p.tMax ?? 0);
  const max = Math.ceil(Math.max(...vals) / 5) * 5;
  const bw = (W - PAD.l - PAD.r) / serie.length;
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t('ficha.chartTemp')}. ${t('ficha.chartTempDesc')}`}>
        {[0, max / 2, max].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="chart__grid" />
            <text x={PAD.l - 6} y={y(v) + 4} className="chart__axis" textAnchor="end">
              {v}°
            </text>
          </g>
        ))}
        {serie.map((p, i) =>
          p.tMax === null ? null : (
            <rect key={p.fecha} x={PAD.l + i * bw + 0.5} y={y(p.tMax)} width={Math.max(1, bw - 1)} height={H - PAD.b - y(p.tMax)} className="chart__bar" />
          ),
        )}
        {[serie[0], serie[Math.floor(serie.length / 2)], serie[serie.length - 1]].map((p) => (
          <text key={p.fecha} x={PAD.l + serie.indexOf(p) * bw + bw / 2} y={H - 6} className="chart__axis" textAnchor="middle">
            {fmtDia(p.fecha, lang)}
          </text>
        ))}
      </svg>
    </figure>
  );
}

/** Forecast snapshots showing the margin narrowing as data arrives (PRIN-1.3). */
export function MarginChart({ hist, ventana }: { hist: HistoricoMargen[]; ventana: VentanaFase }) {
  const { lang } = useI18n();
  const min = hist.reduce((m, h) => (h.desde < m ? h.desde : m), hist[0].desde);
  const max = hist.reduce((m, h) => (h.hasta > m ? h.hasta : m), hist[0].hasta);
  const span = diffDays(max, min) || 1;
  const pct = (f: string) => (diffDays(f, min) / span) * 100;
  return (
    <ol className="margin">
      {hist.map((h, i) => {
        const last = i === hist.length - 1;
        return (
          <li key={h.generadaEn} className={last ? 'is-current' : ''}>
            <span className="margin__when">{fmtDia(h.generadaEn, lang)}</span>
            <span className="margin__track">
              <span className="margin__bar" style={{ left: `${pct(h.desde)}%`, width: `${pct(h.hasta) - pct(h.desde)}%` }} />
            </span>
            <span className="margin__range">
              {diffDays(h.hasta, h.desde)} d{last ? ` · ${Math.round(ventana.probabilidad * 100)} %` : ''}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
