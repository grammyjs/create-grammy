# gmy

Fast and simple command line tool to setup the needed files to quickly create
Telegram bots powered by the [grammY bot framework](https://grammy.dev). This
tool allows you to create projects from several [templates](./templates.json),
maintained by both official team and third-party users.

<!-- ![504541](https://user-images.githubusercontent.com/70066170/176051380-9930b0de-8bf7-40ab-95ec-ee64e937c282.gif) -->

<!-- ![504541-2](https://user-images.githubusercontent.com/70066170/176159673-214b1a9d-13e4-4b28-80f2-bbaaf162f973.gif) -->

<!-- ![504541-3-med](https://user-images.githubusercontent.com/70066170/176159745-e7a62611-d514-4dba-8353-0d9c78283514.gif) -->

Here is a preview of the tool: https://asciinema.org/a/504541

## Install

TODO: Release executables

Install using [Go](https://go.dev).

```shell
go install github.com/grammyjs/create-grammy@latest
```

After installation, run **gmy** command to use the tool. You can provide a
project name as the first argument.

## Templates

Open a pull request by adding your own templates to the
[templates.json](./templates.json) file. There are currently three platforms
that you can add templates to: Deno, Node.js, and other templates.

Each template should contain the following fields:

- `name` — Name to be shown in the templates list in CLI. Recommended to use
  "owner/repository" as the name if it's a repository.
- `type` — **repository** or **subfolder**. If your template is an entire
  repository, use `repository` as type, or if it is a subfolder in a repository
  use `subfolder` as the type.
- `owner` — GitHub repository owner.
- `repository` — GitHub repository name.
- `docker_prompt` — Should the CLI prompt the user to add
  [default docker files](./internal/files/dockerfiles.go).
- `tsconfig_prompt` — Should the CLI prompt the user to add the default
  [tsconfig.json](./configs/tsconfig.json) file.

You also need to add the following fields according to your template:

#### "repository" type

- `branch` — Primary repository branch name. Try your best to keep that branch
  up-to-date.

#### "subfolder" type

- `path` — Path to the subfolder where the template is located at.

#### For Deno templates

- `cache_file` — When the user chose to cache dependencies, `deno cache` command
  will get executed for the specified file. Point to deps.ts, or the entry point
  of the template.
