import { Stream, Readable } from "node:stream";
import tar from "tar";
import { promisify } from "util";
import fetch from 'node-fetch';
import { Platform } from './platform.js';
import { repoName } from './reponame.js';

/**
 * Get templates list
 *
 * @returns
 */
export async function GetTemplates(platform: Platform) {
  const r = await fetch(`https://api.github.com/repos/${repoName}/contents/templates/${platform}`)
  const response = await r.json() as Array<{ name: string, git_url: string, type: string }>

  return response
    .filter(row => row.type !== 'file')
    .map((row) => ({ title: row.name, value: row.git_url }))
}

export async function DownloadAndExtractTemplate(
  root: string,
  treeUrl: string
): Promise<void> {
  const pipeline = promisify(Stream.pipeline);
  // "https://api.github.com/repos/grammyjs/create-grammy/git/trees/eb63b5810b3c5afb6ef32aaa039d4e89bd26829f",
  // "https://api.github.com/repos/bot-base/telegram-bot-template/git/trees/f214deaac92c4c75ad3ae092495563d2f0333e84",
  treeUrl = treeUrl.replace('https://api.github.com/repos/', '')
  // bot-base/telegram-bot-template/git/trees/f214deaac92c4c75ad3ae092495563d2f0333e84
  const splitedTree = treeUrl.split('/')
  const repoPath = splitedTree.slice(0, 2)
  const tree = splitedTree.pop()

  const pipe = await fetch(`https://codeload.github.com/${repoPath.join('/')}/tar.gz/${tree}`)
  const readableWebStream = pipe.body as AsyncIterable<any>;

  return pipeline(
    Readable.from(readableWebStream),
    tar.extract({ cwd: root, strip: 1 })
  );
}