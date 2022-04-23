import { fs } from '../deps.deno.ts';

export const packageJson = JSON.parse(
  await fs.promises.readFile(new URL('../../package.json', import.meta.url), 'utf-8')
);