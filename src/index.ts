import * as deps from './deps.deno.ts';

import { IsFolderEmpty, MakeDir } from './helper/dir.ts';
import { TryGitInit } from './helper/git.ts';
import {
  GetPackageManager,
  InstallPackage,
  PackageManager,
} from './helper/package-manager.ts';
import { GetPlatform } from './helper/platform.ts';
import { DownloadAndExtractTemplate, GetTemplates } from './helper/template.ts';

if (!('Deno' in globalThis)) {
  await import('./node/updater.js' as any);
}

import { DownloadAndExtractTSConfig } from './helper/tsconfig.ts';
import { DownloadAndExtractDockerFiles } from './helper/docker.ts';
import { repoName } from './helper/reponame.ts';

/**
 * Get project path and name
 */

let projectPath = './';

const res = await deps.promt(
  {
    initial: 'my-app',
    message: 'What is your project named?',
    type: 'text',
  }
);

if (typeof res === 'string') {
  projectPath = res.trim();
}

const resolvedProjectPath = deps.path.resolve(projectPath);
const projectName = deps.path.basename(resolvedProjectPath);

/**
 * Select platform
 */

const platform = await GetPlatform();


/**
 * Select template prompt
 */

const templateList = await GetTemplates(platform);

if (!templateList.length) {
  console.log(deps.chalk.red('> Unable to load templates :('));
  deps.process.exit();
}

const template = await deps.promt(
  {
    choices: templateList,
    message: 'Pick template',
    type: 'select',
  }
);

const isCustomTemplate = !template.toLowerCase().includes(repoName);

if (!template || typeof template !== 'string') {
  console.log(deps.chalk.red('> Please select a template :('));
  deps.process.exit();
}

/**
 * Make project directory
 */

try {
  await MakeDir(resolvedProjectPath);
} catch (err) {
  console.log(deps.chalk.red('> Failed to create specified directory :('));
  deps.process.exit();
}

/**
 * Make sure directory is clean
 */

if (!IsFolderEmpty(resolvedProjectPath, projectName)) {
  deps.process.exit();
}

/**
 * Download and extract template
 */

const spinner = deps.spinner(deps.chalk.bold('Downloading template...')).start();

try {
  await DownloadAndExtractTemplate(resolvedProjectPath, template);
  spinner.succeed(deps.chalk.bold('Downloaded template'));
} catch (err) {
  console.error(err);
  spinner.fail(deps.chalk.bold('Failed to download selected template :('));
  deps.process.exit();
}

if (platform === 'node') {
  try {
    await deps.fs.promises.access(deps.path.resolve(resolvedProjectPath, 'tsconfig.json'));
  } catch (error) {
    await DownloadAndExtractTSConfig(resolvedProjectPath);
  }
}

/**
 * Update project name
 */

if (platform === 'node') {
  try {
    await deps.exec(
      {
        cmd: `npx -y json -I -f package.json -e "this.name=\\"${projectName}\\""`,
        cwd: resolvedProjectPath,
      }
    );
  } catch (err) {
    console.log(deps.chalk.red('> Failed to update project name :('));
  }
}


/**
 * Init git
 */

const gitInit = await TryGitInit(resolvedProjectPath);
if (gitInit && platform === 'node' && !isCustomTemplate) {
  await deps.fs.promises.writeFile(
    deps.path.resolve(resolvedProjectPath, '.gitignore'), 
    `dist${deps.os.EOL}node_modules${deps.os.EOL}`
  );
}

/**
 * Install packages
 */

if (!isCustomTemplate && platform !== 'other') {
  let packageManager: PackageManager | null = null;

  if (platform === 'node') {
    packageManager = await GetPackageManager();
  }

  await InstallPackage(resolvedProjectPath, platform, packageManager);
}

if (!deps.fs.existsSync(deps.path.resolve(resolvedProjectPath, 'Dockerfile')) && platform !== 'other') {
  const addDocker = await deps.promt(
    {
      choices: [{ title: 'Yes', value: true }, { title: 'No', value: false }],
      message: 'Add docker related files',
      type: 'select',
    }
  );
  
  if (addDocker) {
    await DownloadAndExtractDockerFiles(resolvedProjectPath, platform);
  }
}

console.log(
  deps.chalk.greenBright('√'),
  deps.chalk.bold('Created grammY project'),
  deps.chalk.gray('»'),
  deps.chalk.greenBright(projectName)
);

console.log();
console.log(deps.chalk.blueBright('?'), deps.chalk.bold('Support'));
console.log('    Telegram channel: https://t.me/grammyjs');
console.log('          Documentation: https://grammy.dev');
console.log('        GitHub: https://github.com/grammyjs');
console.log();
console.log(
  deps.chalk.greenBright('√'),
  deps.chalk.bold('Thank you for using grammY'),
  deps.chalk.red('❤️')
);