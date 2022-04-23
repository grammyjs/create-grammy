import { promt } from '../deps.deno.ts';

export type Platform = 'deno' | 'node' | 'other'

export async function GetPlatform(): Promise<Platform> {
  const selected = await promt(
    {
      choices: [
        {
          title: 'Deno',
          value: 'deno',
        },
        {
          title: 'Node',
          value: 'node',
        },
        {
          title: 'Other',
          value: 'other',
        },
      ],
      message: 'Pick platform',
      type: 'select',
    }
  );

  return selected;
}
