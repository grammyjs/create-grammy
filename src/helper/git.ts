import * as deps from '../deps.deno.ts';

async function IsInGitRepository(root: string) {
  try {
    await deps.exec({
      cmd: 'git rev-parse --is-inside-work-tree',
      cwd: root,
    });
    return true;
  // eslint-disable-next-line no-empty
  } catch (_) {}
  return false;
}

async function IsInMercurialRepository(root: string) {
  try {
    deps.exec({ cwd: root, cmd: 'hg --cwd . root' });
    return true;
  // eslint-disable-next-line no-empty
  } catch (_) {}
  return false;
}

export async function TryGitInit(root: string) {
  let didInit = false;
  try {
    await deps.exec({ cwd: root, cmd: 'git --version' });

    if (await IsInGitRepository(root) || await IsInMercurialRepository(root)) {
      return false;
    }

    await deps.exec({ cwd: root, cmd: 'git init' });
    didInit = true;

    await deps.exec({ cwd: root, cmd: 'git checkout -b main' });
    await deps.exec({ cwd: root, cmd: 'git add -A' });

    return true;
  } catch (e) {

    if (didInit) {
      try {
        deps.fs.rmSync(deps.path.join(root, '.git'));
      } catch (_) {
        // empty statement
      }
    }

    return false;
  }
}