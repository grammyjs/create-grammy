package platform

import (
	"os"

	"github.com/grammyjs/create-grammy/internal/prompts"
)

func Prompt() string {
	choice, err := prompts.Prompt(
		" > Choose a platform:",
		[]string{"Deno", "Node", "Other"},
		"   Platforms",
	)
	if err != nil {
		os.Exit(1)
	}
	return choice
}
