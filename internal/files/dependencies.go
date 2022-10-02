package files

import (
	"os/exec"
)

func CacheDenoDeps(dir, file string) error {
	cmd := exec.Command("deno", "cache", file)
	cmd.Dir = dir
	err := cmd.Run()
	return err
}

func InstallNodeDeps(packageManager, dir string) error {
	cmd := exec.Command(packageManager, "install")
	cmd.Dir = dir
	err := cmd.Run()
	return err
}
