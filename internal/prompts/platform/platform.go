package platform

import (
	"os"

	"github.com/erikgeiser/promptkit/selection"
)

func Prompt() string {
	platformPrompt := selection.New(
		" > Choose a platform:",
		selection.Choices([]string{"Deno", "Node", "Other"}),
	)
	platformPrompt.FilterPrompt = "   Platforms"
	platformPrompt.FilterPlaceholder = "Find"
	platformPrompt.PageSize = 5
	choice, err := platformPrompt.RunPrompt()
	if err != nil {
		os.Exit(1)
	}
	return choice.String
}
