#!/usr/bin/env node

import chalk from "chalk";
import { execSync } from "child_process";
import path from "node:path";
import ora from "ora";
import prompts from "prompts";
import fs from 'node:fs/promises'

import { IsFolderEmpty, MakeDir } from "./helper/dir.js";
import { TryGitInit } from "./helper/git.js";
import { ValidateNpmName } from "./helper/npm.js";
import {
  GetPackageManager,
  InstallPackage,
  PackageManager,
} from "./helper/package-manager.js";
import { GetPlatform } from './helper/platform.js';
import { DownloadAndExtractTemplate, GetTemplates } from "./helper/template.js";
import "./helper/updater.js";
import { DownloadAndExtractTSConfig } from './helper/tsconfig.js';


/**
 * Get project path and name
 */

let projectPath = "./";

const res = await prompts(
  {
    initial: "my-app",
    message: "What is your project named?",
    name: "path",
    type: "text",
    validate: (name) => {
      const validation = ValidateNpmName(path.basename(path.resolve(name)));
      if (validation.valid) {
        return true;
      }

      return "Invalid project name: " + validation.problems?.[0] ?? "unknown";
    },
  },
  {
    onCancel: () => {
      process.exit();
    },
  }
);

if (typeof res.path === "string") {
  projectPath = res.path.trim();
}

const resolvedProjectPath = path.resolve(projectPath);
const projectName = path.basename(resolvedProjectPath);

/**
 * Select platform
 */

const platform = await GetPlatform()


/**
 * Select template prompt
 */

const templateList = await GetTemplates(platform);

if (!templateList.length) {
  console.log(chalk.red("> Unable to load templates :("));
  process.exit();
}

const response = await prompts<string>(
  {
    choices: templateList,
    message: "Pick template",
    name: "template",
    type: "select",
  },
  {
    onCancel: () => {
      process.exit();
    },
  }
);

const isCustomTemplate = !response.template.toLowerCase().includes('satont/create-grammy')

if (!response.template || typeof response.template !== "string") {
  console.log(chalk.red("> Please select a template :("));
  process.exit();
}

/**
 * Make project directory
 */

try {
  await MakeDir(resolvedProjectPath);
} catch (err) {
  console.log(chalk.red("> Failed to create specified directory :("));
  process.exit();
}

/**
 * Make sure directory is clean
 */

if (!IsFolderEmpty(resolvedProjectPath, projectName)) {
  process.exit();
}

/**
 * Download and extract template
 */

const spinner = ora({
  text: chalk.bold("Downloading template..."),
}).start();

try {
  await DownloadAndExtractTemplate(resolvedProjectPath, response.template);
  spinner.succeed(chalk.bold("Downloaded template"));
} catch (err) {
  console.error(err)
  spinner.fail(chalk.bold("Failed to download selected template :("));
  process.exit();
}

if (platform === 'node') {
  try {
    await fs.access(path.resolve(resolvedProjectPath, 'tsconfig.json'))
  } catch (error) {
    await DownloadAndExtractTSConfig(resolvedProjectPath)
  }
}

/**
 * Update project name
 */

if (platform === 'node') {
  try {
    execSync(
      `npx -y json -I -f package.json -e "this.name=\\"${projectName}\\""`,
      {
        cwd: resolvedProjectPath,
        stdio: "ignore",
      }
    );
  } catch (err) {
    console.log(chalk.red("> Failed to update project name :("));
  }
}


/**
 * Init git
 */

TryGitInit(resolvedProjectPath);

/**
 * Install packages
 */

if (!isCustomTemplate) {
  let packageManager: PackageManager | null = null

  if (platform === 'node') {
    packageManager = await GetPackageManager();
  }

  await InstallPackage(resolvedProjectPath, platform, packageManager);
}

console.log(
  chalk.greenBright("√"),
  chalk.bold("Created grammY project"),
  chalk.gray("»"),
  chalk.greenBright(projectName)
);

console.log();
console.log(chalk.blueBright("?"), chalk.bold("Support"));
console.log("    Telegram channel: https://t.me/grammyjs");
console.log("          Documentation: https://grammy.dev");
console.log("        GitHub: https://github.com/grammyjs");
console.log();
console.log(
  chalk.greenBright("√"),
  chalk.bold("Thank you for using grammY"),
  chalk.red("❤️")
);