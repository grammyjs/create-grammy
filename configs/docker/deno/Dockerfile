FROM denoland/deno

RUN mkdir -p /app
WORKDIR /app

USER deno
COPY . /app

RUN deno cache src/mod.ts

CMD ["run", "--allow-all", "src/mod.ts"]