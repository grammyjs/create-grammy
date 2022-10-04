package name

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/erikgeiser/promptkit/textinput"
	"github.com/grammyjs/gmy/internal/files"
)

func Prompt() string {
	prompt := textinput.New(" > Enter a name for your project:")
	prompt.Placeholder = "Project name cannot be empty"
	prompt.Validate = ValidateProjectName
	prompt.InitialValue = "my-bot"
	input, err := prompt.RunPrompt()
	if err != nil {
		fmt.Println("There's something wrong with the input")
		os.Exit(1)
	}
	return input
}

func ValidateProjectName(name string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("empty name")
	}
	if files.Exists(name) {
		folder, err := os.ReadDir(name)
		if err != nil {
			return err
		}
		if len(folder) == 0 {
			return nil
		}
		return errors.New("directory already exists")
	}
	return nil
}
