package utils

import (
	"os/exec"
)

func IsInstalled(executable string) error {
	cmd := exec.Command(executable, "--version")
	err := cmd.Run()
	return err
}
