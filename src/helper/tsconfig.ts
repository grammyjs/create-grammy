import { Stream, Readable } from "node:stream";
import { promisify } from "util";
import fetch from 'node-fetch';
import fs from 'node:fs'
import path from 'node:path'

export async function DownloadAndExtractTSConfig(
  root: string,
): Promise<void> {
  const pipeline = promisify(Stream.pipeline);
  const pipe = await fetch(`https://raw.githubusercontent.com/satont/create-grammy/master/configs/tsconfig.json`)
  const readableWebStream = pipe.body as AsyncIterable<any>;

  return pipeline(
    Readable.from(readableWebStream),
    fs.createWriteStream(path.resolve(root, 'tsconfig.json'))
  );
}