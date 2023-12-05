> [!WARNING]
> There is not enough motivation because in my opinion it is easier to copy by hand what this cli offers. Also requires adding existing templates, which I think [grammyjs/examples](https://github.com/grammyjs/examples) and [grammyjs/awesome-grammY](https://github.com/grammyjs/awesome-grammY) does a great job with. If we want a cli for grammy, I think it should be a utility not just for scaffold templates, but also for modifying code, like `gmy add sessions conversations`, which will adjust middlewares to code.

# Create grammy

Fast and simple command line tool to setup the needed files to quickly create
Telegram bots powered by the [grammY bot framework](https://grammy.dev). This
tool allows you to create projects from several [templates](./templates.json),
maintained by both official team and third-party users.

Here is a preview of the tool: https://asciinema.org/a/504541

## Install

Install using npm
```shell
npm i -g @grammyjs/create-grammy@latest
```

Install using [Go](https://go.dev).

```shell
go install github.com/grammyjs/create-grammy@latest
```

After installation, run **create-grammy** command to use the tool. You can provide a
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
