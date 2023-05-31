package template

import (
	"fmt"
	"os"

	"github.com/grammyjs/create-grammy/internal/prompts"
	t "github.com/grammyjs/create-grammy/internal/templates"
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

	choice, err := prompts.Prompt(" > Choose a template:", templateChoices, "   Templates for "+platform)
	if err != nil {
		os.Exit(1)
	}

	var selectedTemplate t.Template
	for _, template := range templates {
		if template.Name == choice {
			selectedTemplate = template
			break
		}
	}
	return selectedTemplate
}
