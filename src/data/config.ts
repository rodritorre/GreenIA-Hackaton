// Demo clock. The whole mockup reads "today" from here so the demo is reproducible
// (spec §12.1: open the map "today" during the hackathon week).
export const HOY = '2026-10-20';
export const ULTIMA_ACTUALIZACION = '2026-10-20T07:00:00+02:00';

/** Map view that frames the peninsula and the Balearic Islands. */
export const SPAIN_BOUNDS: [[number, number], [number, number]] = [
  [35.8, -9.6],
  [43.9, 4.4],
];
