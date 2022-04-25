import { Input, Select } from 'https://deno.land/x/cliffy@v0.23.0/prompt/mod.ts';
import { PromtOptions } from './types.ts';
import * as path from 'https://deno.land/std@0.136.0/node/path/mod.ts';
import chalk from 'https://deno.land/x/chalkin@v0.1.3/mod.ts';
import { TerminalSpinner } from 'https://deno.land/x/spinners@v1.1.2/mod.ts';
import * as fs from 'https://deno.land/std@0.136.0/node/fs.ts';
import * as os from 'https://deno.land/std@0.136.0/node/os.ts';
import * as process from 'https://deno.land/std@0.136.0/node/process.ts';
import * as stream from 'https://deno.land/std@0.136.0/node/stream.ts';
import * as util from 'https://deno.land/std@0.136.0/node/util.ts';
import { Untar } from 'https://deno.land/std@0.136.0/archive/tar.ts';
import { readerFromStreamReader } from 'https://deno.land/std@0.136.0/streams/conversion.ts';
import { ensureFile } from 'https://deno.land/std@0.136.0/fs/ensure_file.ts';
import { ensureDir } from 'https://deno.land/std@0.136.0/fs/ensure_dir.ts';
import { copy } from 'https://deno.land/std@0.136.0/streams/conversion.ts';

export const exec = async (opts: { cmd: string, cwd?: string }) => {
  const runner =  Deno.run({
    stderr: 'null',
    cmd: opts.cmd.split(' '),
    cwd: opts.cwd,
    stdout: 'null',
  });

  await runner.status();
  runner.close();
};

export const spinner = (text: string) => {
  const instance = new TerminalSpinner(text);

  return {
    start: instance.start.bind(instance),
    fail: instance.fail.bind(instance),
    succeed: instance.succeed.bind(instance),
  };
};

export async function promt(opts: PromtOptions) {
  if (opts.type === 'select' && opts.choices) {
    const options = opts.choices.map(c => c.title);
    const result = await Select.prompt({
      options,
      message: opts.message,
      keys: {
        next: ['down'],
        previous: ['up'],
      },
      indent: '',
    });

    return opts.choices.find(c => c.title === result)?.value;
  } else if (opts.type === 'text') {
    const result = await Input.prompt({
      default: opts.initial,
      message: opts.message,
      validate: opts.validate,
      indent: '',
    });

    return result;
  } else throw new Error(`Unknown type ${opts.type}`);
}

const Fetch = fetch;

export const untar = async (root: string, body: ReadableStream<Uint8Array>, ) => {
  const streamReader = body
    .pipeThrough(new DecompressionStream('gzip'))
    .getReader();

  const denoReader = readerFromStreamReader(streamReader);
  const instance = new Untar(denoReader);
  
  let directory: string = '';

  for await (const entry of instance) {
    if (!directory && entry.type === 'directory') {
      directory = entry.fileName;
      continue;
    }

    const entryPath = path.resolve(root, entry.fileName.replace(directory, ''));
    if (entry.type === 'directory') {
      await ensureDir(entryPath);
      continue;
    }

    await ensureFile(entryPath);
    
    const file = await Deno.open(entryPath, { write: true });
    await copy(entry, file);
  }
};

export { path, chalk, fs, os, process, stream, util, Fetch as fetch };
