import { packageJson } from './packageJson.js';

export const repoName = (packageJson.homepage as string).replace('https://github.com/', '').replace('#readme', '')
