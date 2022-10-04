package files

import (
	"fmt"
	"os"

	"github.com/cavaliergopher/grab/v3"
	t "github.com/grammyjs/create-grammy/internal/templates"
)

func SetupFiles(projectName string, template t.Template) {
	fmt.Printf(
		" : Downloading template assets from %s/%s...\n",
		template.Owner, template.Repository,
	)

	tempDir, err := os.MkdirTemp("", "gmy-template-")
	defer os.RemoveAll(tempDir)
	if err != nil {
		fmt.Println(" ! Failed to create temporary folder :(")
		os.Exit(1)
	}

	downloadUrl, err := t.GetDownloadUrl(template)
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

	err = Untar(projectName, file)
	if err != nil {
		fmt.Println(" ! Failed to extract downloaded assets: ", err)
		os.Exit(1)
	}
}
