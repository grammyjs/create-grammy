import * as deps from '../deps.deno.ts';
import { Platform } from './platform.ts';

export enum PackageManager {
  npm = 'npm',
  yarn = 'yarn',
  pnpm = 'pnpm',
  none = 'none',
}

export async function GetPackageManager(): Promise<PackageManager | null> {
  const selected = await deps.promt(
    {
      choices: [
        {
          title: 'npm',
          value: PackageManager.npm.toString(),
        },
        {
          title: 'yarn',
          value: PackageManager.yarn.toString(),
        },
        {
          title: 'pnpm',
          value: PackageManager.pnpm.toString(),
        },
        {
          title: 'none',
          value: PackageManager.none.toString(),
        },
      ],
      message: 'Pick package manager',
      type: 'select',
    }
  );

  const manager = selected as PackageManager;

  try {
    switch (manager) {
      case PackageManager.none:
        break;

      case PackageManager.npm:
        deps.exec({ cmd: 'npm --version' });
        break;

      case PackageManager.yarn:
        deps.exec({ cmd: 'yarn --version' });
        break;

      case PackageManager.pnpm:
        deps.exec({ cmd: 'pnpm --version' });
        break;
    }
  } catch (err) {
    console.log(
      deps.chalk.red('×'),
      `Could not found ${deps.chalk.greenBright(
        PackageManager[manager]
      )} package manager, Please install it from:`,
      PackageManager.pnpm === manager
        ? 'https://pnpm.io'
        : PackageManager.yarn === manager
          ? 'https://yarnpkg.com'
          : 'https://nodejs.org/en/download'
    );
  }

  return manager;
}

export async function InstallPackage(
  root: string,
  platform: Platform | null | undefined,
  manager: PackageManager | null | undefined
): Promise<void> {
  if (PackageManager.none === manager && platform === 'node') {
    console.log(
      deps.chalk.blueBright('?'),
      deps.chalk.bold('skipped package installation...')
    );
    return;
  }

  const spinner = deps.spinner(deps.chalk.bold('Installing packages...')).start();

  try {
    if (platform === 'deno') {
      deps.exec({ cmd: 'deno cache src/mod.ts', cwd: root });
    } else {
      switch (manager) {
        case PackageManager.npm:
          deps.exec({ cwd: root, cmd: 'npm install' });
          break;
        case PackageManager.yarn:
          deps.exec({ cwd: root, cmd: 'yarn install' });
          break;
  
        case PackageManager.pnpm:
          deps.exec({ cmd: 'pnpm install', cwd: root });
          break;
      }
    }

    spinner.succeed(deps.chalk.bold(`Installed packages via`, deps.chalk.gray('»'), deps.chalk.greenBright(platform === 'deno' ? 'deno cache' : manager)));
  } catch (err) {
    console.error(err);
    spinner.fail(deps.chalk.bold('Failed to install packages. That\'s more likely something wrong with template. If you are sure it\'s a grammY cli problem - please let us know via github issue or contact us in chat.'));
  }
}