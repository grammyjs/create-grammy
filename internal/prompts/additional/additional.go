package additional

import (
	"fmt"
	"os"

	"github.com/cavaliergopher/grab/v3"
	"github.com/erikgeiser/promptkit/confirmation"
	"github.com/erikgeiser/promptkit/selection"
	"github.com/grammyjs/create-grammy/internal/files"
	"github.com/grammyjs/create-grammy/internal/utils"

	t "github.com/grammyjs/create-grammy/internal/templates"
)

func Prompt(name string, platform string, template t.Template) {
	gitPrompt := confirmation.New(" ? Initialize Git repository", confirmation.Yes)
	initGit, _ := gitPrompt.RunPrompt()
	if initGit {
		err := utils.InitGit(name)
		if err != nil {
			fmt.Println(" - Failed to initialize Git repository.")
		} else {
			fmt.Println(" + Git repository initialized.")
		}
	}

	if template.TSConfig_prompt {
		tscPrompt := confirmation.New(" ? Would you like to add TypeScript configuration file", confirmation.No)
		tsc, err := tscPrompt.RunPrompt()
		if err != nil && tsc {
			_, err := grab.Get(name, "https://raw.githubusercontent.com/grammyjs/create-grammy/main/configs/tsconfig.json")
			if err != nil {
				fmt.Println(" - Skipping... Failed to add a tsconfig.json.")
			}
		}
	}

	if template.Docker_prompt {
		dockerPrompt := confirmation.New(" ? Add Docker related files", confirmation.No)
		docker, err := dockerPrompt.RunPrompt()
		if err == nil && docker {
			err := files.AddDockerFiles(platform, name)
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
			err := files.CacheDenoDeps(name, template.Cache_file)
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
					err := files.InstallNodeDeps(packageManager, name)
					if err != nil {
						fmt.Println(" ! Failed to install dependencies.")
					} else {
						fmt.Println(" + Installed dependencies successfully.")
					}
				}
			}
			fmt.Printf(" : Updating package name...\n")
			files.UpdatePackageName(name)
		}
	}
}
