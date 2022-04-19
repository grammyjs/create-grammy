import chalk from "chalk";
import { exec, execSync } from "child_process";
import ora from "ora";
import prompts from "prompts";
import { Platform } from './platform.js';


export enum PackageManager {
  npm = 'npm',
  yarn = 'yarn',
  pnpm = 'pnpm',
  none = 'none',
}

export async function GetPackageManager(): Promise<PackageManager | null> {
  const selected = await prompts<string>(
    {
      choices: [
        {
          title: "npm",
          value: PackageManager.npm.toString(),
        },
        {
          title: "yarn",
          value: PackageManager.yarn.toString(),
        },
        {
          title: "pnpm",
          value: PackageManager.pnpm.toString(),
        },
        {
          title: "none - do not install packages",
          value: PackageManager.none.toString(),
        },
      ],
      message: "Pick package manager",
      name: "package-manager",
      type: "select",
    },
    {
      onCancel: () => {
        process.exit();
      },
    }
  );

  const manager = selected["package-manager"] as PackageManager;

  try {
    switch (manager) {
      case PackageManager.none:
        break;

      case PackageManager.npm:
        execSync("npm --version", { stdio: "ignore" });
        break;

      case PackageManager.yarn:
        execSync("yarn --version", { stdio: "ignore" });
        break;

      case PackageManager.pnpm:
        execSync("pnpm --version", { stdio: "ignore" });
        break;
    }
  } catch (err) {
    console.log(
      chalk.red("×"),
      `Could not found ${chalk.greenBright(
        PackageManager[manager]
      )} package manager, Please install it from:`,
      PackageManager.pnpm === manager
        ? "https://pnpm.io"
        : PackageManager.yarn === manager
        ? "https://yarnpkg.com"
        : "https://nodejs.org/en/download"
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
      chalk.blueBright("?"),
      chalk.bold("skipped package installation...")
    );
    return;
  }

  const spinner = ora({
    text: chalk.bold("Installing packages..."),
  }).start();

  try {
    if (platform === 'deno') {
      await new Promise((resolve, reject) => {
        exec("deno cache src/mod.ts", { cwd: root }, (err) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      });
    } else {
      switch (manager) {
        case PackageManager.npm:
          await new Promise((resolve, reject) => {
            exec("npm install", { cwd: root }, (err) => {
              if (err) {
                reject(err);
              }
              resolve(true);
            });
          });
          break;
  
        case PackageManager.yarn:
          await new Promise((resolve, reject) => {
            exec("yarn install", { cwd: root }, (err) => {
              if (err) {
                reject(err);
              }
              resolve(true);
            });
          });
          break;
  
        case PackageManager.pnpm:
          await new Promise((resolve, reject) => {
            exec("pnpm install", { cwd: root }, (err) => {
              if (err) {
                reject(err);
              }
              resolve(true);
            });
          });
      }
    }

    spinner.succeed(chalk.bold(`Installed packages via`, chalk.gray("»"), chalk.greenBright(platform === 'deno' ? 'deno cache' : manager)));
  } catch (err) {
    console.error(err)
    spinner.fail(chalk.bold("Failed to install packages. That's more likely something wrong with template. If you are sure it's a grammY cli problem - please let us know via github issue or contact us in chat."));
  }
}