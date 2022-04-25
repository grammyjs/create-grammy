import * as deps from '../deps.deno.ts';
import { Platform } from './platform.ts';
import { repoName } from './reponame.ts';

export async function DownloadAndExtractDockerFiles(
  root: string,
  platform: Platform
): Promise<void> {
  const filesRequest = await deps.fetch(`https://api.github.com/repos/${repoName}/contents/configs/docker/${platform}`);
  const filesArray = await filesRequest.json() as Array<{ name: string, download_url: string, type: 'file' | 'dir' }>;

  for (const file of filesArray.filter(file => file.type === 'file')) {
    const pipeline = deps.util.promisify(deps.stream.pipeline);

    const pipe = await deps.fetch(file.download_url);
    const readableWebStream = pipe.body as any;

    await pipeline(
      deps.stream.Readable.from(readableWebStream),
      deps.fs.createWriteStream(deps.path.resolve(root, file.name), {})
    );
  }
}