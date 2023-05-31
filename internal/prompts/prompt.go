package prompts

import "github.com/erikgeiser/promptkit/selection"

func Prompt(message string, choices []string, filter string) (string, error) {
	prompt := selection.New(message, choices)
	if filter != "" {
		prompt.FilterPrompt = filter
	}
	prompt.FilterPlaceholder = "Find"
	prompt.PageSize = 5
	return prompt.RunPrompt()
}
