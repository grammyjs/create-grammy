import * as deps from '../deps.deno.ts';
import { Platform } from './platform.ts';
import { repoName } from './reponame.ts';

/**
 * Get templates list
 *
 * @returns
 */
export async function GetTemplates(platform: Platform) {
  const r = await deps.fetch(`https://api.github.com/repos/${repoName}/contents/templates/${platform}`);
  const response = await r.json() as Array<{ name: string, git_url: string, type: string }>;

  return response
    .filter(row => !row.name.startsWith('.'))
    .map((row) => ({ title: row.name, value: row.git_url }));
}

export async function DownloadAndExtractTemplate(
  root: string,
  treeUrl: string
): Promise<void> {
  // "https://api.github.com/repos/grammyjs/create-grammy/git/trees/eb63b5810b3c5afb6ef32aaa039d4e89bd26829f",
  // "https://api.github.com/repos/bot-base/telegram-bot-template/git/trees/f214deaac92c4c75ad3ae092495563d2f0333e84",
  treeUrl = treeUrl.replace('https://api.github.com/repos/', '');
  // bot-base/telegram-bot-template/git/trees/f214deaac92c4c75ad3ae092495563d2f0333e84
  const splitedTree = treeUrl.split('/');
  const repoPath = splitedTree.slice(0, 2);
  const tree = splitedTree.pop();

  const pipe = await deps.fetch(`https://codeload.github.com/${repoPath.join('/')}/tar.gz/${tree}`);

  if (!pipe.body) {
    throw new Error('Something bad happend. Please, create bug report at https://github.com/grammyjs/create-grammy');
  }

  await deps.untar(root, pipe.body);
}
