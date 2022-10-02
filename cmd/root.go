package cmd

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/grammyjs/gmy/internal/files"
	t "github.com/grammyjs/gmy/internal/templates"
	"github.com/grammyjs/gmy/internal/utils"

	"github.com/cavaliergopher/grab/v3"
	"github.com/erikgeiser/promptkit/confirmation"
	"github.com/erikgeiser/promptkit/selection"
	"github.com/erikgeiser/promptkit/textinput"
	"github.com/spf13/cobra"
)

const footer = `
 + Project '%s' created successfully!
 
 Thank you for using grammY <3
 . Documentation  https://grammy.dev
 . GitHub         https://github.com/grammyjs/grammY
 . Community      https://telegram.me/grammyjs
`

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "gmy [project name]",
	Short: "Create grammY projects from the command line!",
	Long: `grammY is a framework for creating Telegram bots. It can be used from
TypeScript and JavaScript and runs on Node.js, Deno, and in the browser.
This application is a tool to generate the needed files to quickly
create a Telegram bot from several templates powered by grammY.

Feel free to add more templates to our template registry:
https://github.com/grammyjs/gmy#templates

https://grammy.dev`,
	Args: cobra.ArbitraryArgs,
	Run: func(cmd *cobra.Command, args []string) {
		var projectName string

		if len(args) > 0 {
			err := ValidateProjectName(args[0])
			if err == nil {
				projectName = args[0]
			}
		}

		if projectName == "" {
			prompt := textinput.New(" > Enter a name for your project:")
			prompt.Placeholder = "Project name cannot be empty"
			prompt.Validate = ValidateProjectName
			input, err := prompt.RunPrompt()
			if err != nil {
				os.Exit(1)
			}
			projectName = input
		}

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

		platform := choice.String
		fmt.Printf(" : Getting templates for %s...\n", platform)
		templates, err := t.GetTemplates(platform)
		if err != nil {
			fmt.Println(" ! Failed to fetch templates :(")
			os.Exit(1)
		}

		var templateChoices []string
		for i := 0; i < len(templates); i++ {
			templateChoices = append(templateChoices, templates[i].Name)
		}

		templatePrompt := selection.New(" > Choose a template:", selection.Choices(templateChoices))
		templatePrompt.FilterPrompt = "   Templates for " + platform
		templatePrompt.FilterPlaceholder = "Find"
		templatePrompt.PageSize = 5
		choice, err = templatePrompt.RunPrompt()
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

		fmt.Printf(
			" : Downloading template assets from %s/%s...\n",
			selectedTemplate.Owner, selectedTemplate.Repository,
		)

		tempDir, err := os.MkdirTemp("", "gmy-template-")
		defer os.RemoveAll(tempDir)
		if err != nil {
			fmt.Println(" ! Failed to create temporary folder :(")
			os.Exit(1)
		}

		downloadUrl, err := t.GetDownloadUrl(selectedTemplate)
		if err != nil {
			fmt.Println(" ! Failed to fetch template details :(")
			os.Exit(1)
		}

		resp, err := grab.Get(tempDir, downloadUrl)
		if err != nil {
			fmt.Printf(" ! Failed to download assets from %s\n", downloadUrl)
			os.Exit(1)
		}
		err = resp.Err()
		if err != nil {
			fmt.Printf(" ! Failed to download assets from %s\n", downloadUrl)
			os.Exit(1)
		}

		fmt.Println(" + Assets downloaded")
		fmt.Println(" : Setting up project folder...")

		file, err := os.Open(resp.Filename)
		if err != nil {
			fmt.Println(" ! Failed to extract downloaded assets: ", err)
			os.Exit(1)
		}

		err = files.Untar(projectName, file)
		if err != nil {
			fmt.Println(" ! Failed to extract downloaded assets: ", err)
			os.Exit(1)
		}

		fmt.Printf(`
 + Project folder set up successfully!
   Additional configuration options for you:

`)

		gitPrompt := confirmation.New(" ? Initialize Git repository", confirmation.Yes)
		initGit, _ := gitPrompt.RunPrompt()
		if initGit {
			err := utils.InitGit(projectName)
			if err != nil {
				fmt.Println(" - Failed to initialize Git repository.")
			} else {
				fmt.Println(" + Git repository initialized.")
			}
		}

		if selectedTemplate.TSConfig_prompt {
			tscPrompt := confirmation.New(" ? Would you like to add TypeScript configuration file", confirmation.No)
			tsc, err := tscPrompt.RunPrompt()
			if err != nil && tsc {
				_, err := grab.Get(projectName, "https://raw.githubusercontent.com/grammyjs/cli/main/configs/tsconfig.json")
				if err != nil {
					fmt.Println(" - Skipping... Failed to add a tsconfig.json.")
				}
			}
		}

		if selectedTemplate.Docker_prompt {
			dockerPrompt := confirmation.New(" ? Add Docker related files", confirmation.No)
			docker, err := dockerPrompt.RunPrompt()
			if err == nil && docker {
				err := files.AddDockerFiles(platform, projectName)
				if err != nil {
					fmt.Println(" - Failed to add Docker files.")
				}
			}
		}

		var action string

		switch platform {
		case "Deno":
			action = "Cache"
		case "Node":
			action = "Install"
		case "Other":
			fmt.Printf(footer, projectName)
			return
		}

		pkgInstallPrompt := confirmation.New(fmt.Sprintf(" ? %s dependencies", action), confirmation.Yes)
		installPkgs, err := pkgInstallPrompt.RunPrompt()

		if err != nil {
			os.Exit(1)
		}

		if installPkgs {
			if platform == "Deno" {
				fmt.Println(" : Caching dependencies...")
				err := files.CacheDenoDeps(projectName, selectedTemplate.Cache_file)
				if err != nil {
					fmt.Println(" ! Failed to cache dependencies.")
				} else {
					fmt.Println(" + Cached dependencies successfully.")
				}
			}

			if platform == "Node" {
				prompt := selection.New(
					" > Choose a package manager of your choice:",
					selection.Choices([]string{"npm", "yarn", "pnpm", "None"}),
				)
				prompt.FilterPrompt = "   Package Managers"
				prompt.FilterPlaceholder = "Find"
				prompt.PageSize = 5
				choice, err := prompt.RunPrompt()
				if err == nil && choice.String != "None" {
					packageManager := choice.String
					fmt.Println(" : Checking for package manager...")
					err := utils.IsInstalled(packageManager)

					if err != nil {
						fmt.Println(" ! Seems like the specified package manager is not installed.")
					} else {
						fmt.Println(" : Installing dependencies...")
						err := files.InstallNodeDeps(packageManager, projectName)
						if err != nil {
							fmt.Println(" ! Failed to install dependencies.")
						} else {
							fmt.Println(" + Installed dependencies successfully.")
						}
					}
				}
				fmt.Printf(" : Updating package name...\n")
				files.UpdatePackageName(projectName)
			}
		}
		fmt.Printf(footer, projectName)
	},
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

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
