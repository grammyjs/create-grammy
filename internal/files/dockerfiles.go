package files

import (
	"errors"
	"os"
	"path/filepath"
)

var (
	Deno_Dockerfile = []byte(`FROM denoland/deno

RUN mkdir -p /app
WORKDIR /app

USER deno
COPY . /app

RUN deno cache src/mod.ts

CMD ["run", "--unstable", "--allow-all", "src/mod.ts"]`)
	Node_Dockerfile = []byte(`FROM node:lts-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app

RUN npm run build

CMD ["node", "dist/index.js"]`)
	Node_DockerIgnore = []byte(`node_modules
build
dist
dest`)
)

func AddDockerFiles(platform, dir string) error {
	switch platform {
	case "Node":
		err1 := os.WriteFile(filepath.Join(dir, "Dockerfile"), Node_Dockerfile, 0777)
		err2 := os.WriteFile(filepath.Join(dir, ".dockerignore"), Node_DockerIgnore, 0777)
		if err1 != nil || err2 != nil {
			return errors.New("failed to write Node files")
		}
	case "Deno":
		err := os.WriteFile(filepath.Join(dir, "Dockerfile"), Deno_Dockerfile, 0777)
		if err != nil {
			return errors.New("failed to write Node files")
		}
	}
	return nil
}
