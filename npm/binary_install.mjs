import { spawnSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import got from "got";
import { pipeline as streamPipeline } from "node:stream/promises";
import { join } from "path";

const error = (msg) => {
  console.error(msg);
  process.exit(1);
};

class Binary {
  constructor(name, url) {
    let errors = [];
    if (typeof url !== "string") {
      errors.push("url must be a string");
    } else {
      try {
        new URL(url);
      } catch (e) {
        errors.push(e);
      }
    }
    if (name && typeof name !== "string") {
      errors.push("name must be a string");
    }

    if (!name) {
      errors.push("You must specify the name of your binary");
    }
    if (errors.length > 0) {
      let errorMsg =
        "One or more of the parameters you passed to the Binary constructor are invalid:\n";
      errors.forEach((error) => {
        errorMsg += error;
      });
      errorMsg +=
        '\n\nCorrect usage: new Binary("my-binary", "https://example.com/binary/download.tar.gz")';
      error(errorMsg);
    }
    this.url = url;
    this.name = name;
    this.installDirectory = join(__dirname, "node_modules", ".bin");

    if (!existsSync(this.installDirectory)) {
      mkdirSync(this.installDirectory, { recursive: true });
    }

    this.binaryPath = join(this.installDirectory, this.name);
  }

  exists() {
    return existsSync(this.binaryPath);
  }

  async install(suppressLogs = false) {
    if (this.exists()) {
      if (!suppressLogs) {
        console.error(
          `${this.name} is already installed, skipping installation.`
        );
      }
      return Promise.resolve();
    }

    if (existsSync(this.installDirectory)) {
      rimraf.sync(this.installDirectory);
    }

    mkdirSync(this.installDirectory, { recursive: true });

    if (suppressLogs) {
      console.error(`Downloading release from ${this.url}`);
    }
    try {
      return await streamPipeline(
        got.stream(this.url),
        createWriteStream(this.binaryPath)
      );
    } catch (error) {
      throw "An error occured while downloading the package";
    }
  }

  run() {
    if (!this.exists()) {
      this.install(true);
    }

    const [, , ...args] = process.argv;

    const options = { cwd: process.cwd(), stdio: "inherit" };

    const result = spawnSync(this.binaryPath, args, options);

    if (result.error) {
      error(result.error);
    }

    process.exit(result.status);
  }
}

const _Binary = Binary;
export { _Binary as Binary };
