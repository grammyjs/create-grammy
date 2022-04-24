import prompts from 'prompts';

import chalk from 'chalk';
import { exec as Exec } from 'child_process';
import path from 'node:path';
import ora from 'ora';
import os from 'node:os';
import fs from 'node:fs';
import stream from 'node:stream';
import util from 'util';
import Fetch from 'node-fetch';
import tar from 'tar';
import { PromtOptions } from './types';

export const exec = async (opts: { cmd: string, cwd?: string }) => {
  const promise = util.promisify(Exec);

  await promise(opts.cmd, {
    cwd: opts.cwd,
  });
};

export const spinner = (text: string) => {
  const instance = ora({ text });

  return {
    start: instance.start.bind(instance),
    fail: instance.fail.bind(instance),
    succeed: instance.succeed.bind(instance),
  };
};

export async function promt(opts: PromtOptions) {
  const name = Math.floor(Math.random() * (10 - 1 + 1) + 1).toString();

  const res = await prompts(
    {
      initial: opts.initial,
      choices: opts.choices,
      message: opts.message,
      name,
      type: opts.type,
      validate: opts.validate,
    },
    {
      onCancel: opts.onCancel,
    }
  );
    
  return res[name];
}

export const untar = async (root: string, body: NodeJS.ReadableStream) => {
  const stream = tar.extract({ cwd: root, strip: 1 });

  for await (const chunk of body) {
    stream.write(chunk);
  }
};

const proc = process;
export const fetch = Fetch;

export { path, os, chalk, fs, proc as process, stream, util };