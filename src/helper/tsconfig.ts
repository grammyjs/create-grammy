import * as deps from '../deps.deno.ts';
import { repoName } from './reponame.ts';

export async function DownloadAndExtractTSConfig(
  root: string,
): Promise<void> {
  const pipeline = deps.util.promisify(deps.stream.pipeline);
  const pipe = await deps.fetch(`https://raw.githubusercontent.com/${repoName}/main/configs/tsconfig.json`);
  const readableWebStream = pipe.body as any;

  await pipeline(
    deps.stream.Readable.from(readableWebStream),
    deps.fs.createWriteStream(deps.path.resolve(root, 'tsconfig.json'), {})
  );
}