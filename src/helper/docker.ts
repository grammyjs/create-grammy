import { Stream, Readable } from "node:stream";
import { promisify } from "util";
import fetch from 'node-fetch';
import fs from 'node:fs'
import path from 'node:path'
import { Platform } from './platform.js';

export async function DownloadAndExtractDockerFiles(
  root: string,
  platform: Platform
): Promise<void> {
  const filesRequest = await fetch(`https://api.github.com/repos/satont/create-grammy/contents/configs/docker/${platform}`)
  const filesArray = await filesRequest.json() as Array<{ name: string, download_url: string, type: 'file' | 'dir' }>

  for (const file of filesArray.filter(file => file.type === 'file')) {
    const pipeline = promisify(Stream.pipeline);

    const pipe = await fetch(file.download_url)
    const readableWebStream = pipe.body as AsyncIterable<any>;

    await pipeline(
      Readable.from(readableWebStream),
      fs.createWriteStream(path.resolve(root, file.name))
    );
  }
}