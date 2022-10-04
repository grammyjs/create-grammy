package template

import (
	"fmt"
	"os"

	"github.com/erikgeiser/promptkit/selection"
	t "github.com/grammyjs/gmy/internal/templates"
)

func Prompt(platform string) t.Template {
	fmt.Printf(" : Getting templates for %s...\n", platform)
	templates, err := t.GetTemplates(platform)
	if err != nil {
		fmt.Println(" ! Failed to fetch templates :(")
		os.Exit(1)
	}

	var templateChoices []string
	for _, template := range templates {
		templateChoices = append(templateChoices, template.Name)
	}

	templatePrompt := selection.New(" > Choose a template:", selection.Choices(templateChoices))
	templatePrompt.FilterPrompt = "   Templates for " + platform
	templatePrompt.FilterPlaceholder = "Find"
	templatePrompt.PageSize = 5
	choice, err := templatePrompt.RunPrompt()
	if err != nil {
		os.Exit(1)
	}

	var selectedTemplate t.Template
	for _, template := range templates {
		if template.Name == choice.String {
			selectedTemplate = template
			break
		}
	}
	return selectedTemplate
}
