const os = require("os");
const { Binary } = require("./binary_install");

function getPlatform() {
  const operatingSystem = os.type();
  const architecture = os.arch();

  const NODEJS_OS_TO_GOOS = {
    Linux: "linux",
    Darwin: "darwin",
    Windows_NT: "windows",
  };
  const NODEJS_ARCH_TO_GOARCH = { x64: "amd64", arm64: "arm64", ia32: "386" };

  const platform = NODEJS_OS_TO_GOOS[operatingSystem];
  const arch = NODEJS_ARCH_TO_GOARCH[architecture];

  if (platform || arch) {
    throw "This operating system and architecure combination is not supported";
  }
  return {
    platform,
    arch,
  };
}

function getBinary() {
  const { platform, arch } = getPlatform();
  const exeExtension = platform === "windows" ? ".exe" : "";
  const version = require("../package.json").version;
  const url = `https://github.com/grammyjs/create-grammy/releases/download/v${version}/create-grammy-${platform}_${arch}${exeExtension}`;
  const name = `create-grammy-${platform}_${arch}${exeExtension}`;
  return new Binary(name, url);
}

module.exports = getBinary;
