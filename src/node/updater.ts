import boxen from 'boxen';
import chalk from 'chalk';
import isInstalledGlobally from 'is-installed-globally';
import checkForUpdate from 'update-check';
import fs from 'node:fs/promises';

const packageJson = JSON.parse(
  await fs.readFile(new URL('../../package.json', import.meta.url), 'utf-8')
); 

/**
 * Check for update
 */

let update = null;

try {
  update = await checkForUpdate(packageJson);
} catch (err) {
  console.log(
    boxen('Failed to check for updates', {
      align: 'center',
      borderColor: 'red',
      borderStyle: 'round',
      margin: 1,
      padding: 1,
    })
  );
}

if (update) {
  const updateCmd = isInstalledGlobally
    ? 'npm i -g @grammyjs/create-grammy@latest'
    : 'npm i @grammyjs/create-grammy@latest';

  const template =
    'Update available ' +
    chalk.dim(`${packageJson.version}`) +
    chalk.reset(' → ') +
    chalk.green(`${update.latest}`) +
    ' \nRun ' +
    chalk.cyan(updateCmd) +
    ' to update';

  console.log(
    boxen(template, {
      align: 'center',
      borderColor: 'yellow',
      borderStyle: 'round',
      margin: 1,
      padding: 1,
    })
  );
}

export default packageJson.version;