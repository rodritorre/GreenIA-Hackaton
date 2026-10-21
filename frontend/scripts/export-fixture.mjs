// Exports the mock data in src/data/ as JSON, used to seed the backend database
// (backend/florece/seed/fixture.json). Run: node scripts/export-fixture.mjs <out.json>
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const entry = `
export { DESTINOS } from './src/api/mock/destinos';
export { OFERTAS, FOTOS, FUENTES, LOG_INGESTA, SUSCRIPCIONES } from './src/api/mock/comercial';
export { HOY, ULTIMA_ACTUALIZACION } from './src/api/mock/config';
`;
const dir = mkdtempSync(join(tmpdir(), 'fixture-'));
const outfile = join(dir, 'fixture.mjs');
await build({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'error' });
const m = await import(pathToFileURL(outfile).href);
const data = { hoy: m.HOY, ultimaActualizacion: m.ULTIMA_ACTUALIZACION, destinos: m.DESTINOS, ofertas: m.OFERTAS, fotos: m.FOTOS, fuentes: m.FUENTES, log: m.LOG_INGESTA, suscripciones: m.SUSCRIPCIONES };
writeFileSync(process.argv[2], JSON.stringify(data, null, 1));
console.log('wrote', process.argv[2], data.destinos.length, 'destinations');
