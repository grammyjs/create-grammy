# 📖 Introduction

Create grammY apps with one command. Inspired and original code by [create-discordx](https://github.com/oceanroleplay/discord.ts/tree/main/packages/create-discordx).

  
# ℹ How it works

After starting cli, you will be prompted to select your platform, your favorite package manager, and even dockerfiles, if you so choose.

It will then download the files you want.

# 💻 Usage

## Node
```
npx @grammyjs/create-grammy@latest
```

Or

```
npm init @grammyjs/grammy@latest
```

## Deno

To always use the latest version, the prefetching way to start:

```
deno run --unstable --allow-env --allow-read --allow-write --allow-net --allow-run -r https://deno.land/x/create_grammy/src/index.ts
```

Or

```bash
deno install --unstable --allow-env --allow-read --allow-write --allow-net --allow-run -r -n create-grammy https://deno.land/x/create_grammy/src/index.ts

create-grammy
```

# ➕ Adding own template

## If you plan add template into this repository


1. [Fork](https://github.com/grammy/create-grammy/fork) the repository 
2. Clone your own repository
3. In your forked repository, make your changes in a new git branch:
   ```shell
   git checkout -b my-branch main
   ```
4. Create your template in templates/{PLATFORM} directory

  - We would like you to create templates for both platforms, if it's possible
  - **Node** template should contain entrypoint as `src/index.ts`
  - **Deno** template should contain entrypoint as `src/mod.ts`
  - By **default** we ship own Dockerfile, but you can write own one
  - For **node** we already have needed `tsconfig.json`, so you **don't** need to write this
  - For **node** leave **name** in *package.json* empty, because this field is automatically created at the stage of template installation

5. Push your branch to GitHub:
   ```shell
   git push origin my-branch
   ```
  
6. In GitHub, send a pull request to create-grammy:main.


## If you have own repository with template

In this case we will mount your template as git submodule. Please, open issue with choosed **Connect my own template** option.
