import { packageJson } from './packageJson.ts';

export const repoName = (packageJson.homepage as string).replace('https://github.com/', '').replace('#readme', '');
