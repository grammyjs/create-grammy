package templates

import (
	"errors"
	"fmt"
	"strings"

	"github.com/grammyjs/gmy/internal/utils"
)

type Template struct {
	Name       string
	Type       string
	Owner      string
	Repository string

	Branch string
	Path   string

	Docker_prompt   bool
	TSConfig_prompt bool

	Cache_file string
}

func GetTemplates(platform string) ([]Template, error) {
	var results map[string][]Template
	url := "https://raw.githubusercontent.com/dcdunkan/gmy/main/templates.json"
	err := utils.FetchJson(url, &results)
	if err != nil {
		return nil, errors.New("failed to fetch templates")
	}
	return results[strings.ToLower(platform)], nil
}

type content struct {
	Name, Sha string
}

func GetDownloadUrl(template Template) (string, error) {
	var downloadUrl string

	switch template.Type {
	case "repository":
		downloadUrl = fmt.Sprintf(
			"https://codeload.github.com/%s/%s/tar.gz/%s",
			template.Owner, template.Repository, template.Branch,
		)

	case "subfolder":
		pathSplits := strings.Split(template.Path, "/")
		templateParentFolderPath := strings.Join(pathSplits[0:len(pathSplits)-1], "/")
		templateFolderName := pathSplits[len(pathSplits)-1]
		apiUrl := fmt.Sprintf(
			"https://api.github.com/repos/%s/%s/contents/%s",
			template.Owner, template.Repository, templateParentFolderPath,
		)
		var contents []content
		err := utils.FetchJson(apiUrl, &contents)
		if err != nil {
			return "", errors.New("failed to fetch template")
		}

		var sha string
		for _, content := range contents {
			if templateFolderName == content.Name {
				sha = content.Sha
				break
			}
		}
		downloadUrl = fmt.Sprintf(
			"https://codeload.github.com/%s/%s/tar.gz/%s",
			template.Owner, template.Repository, sha,
		)
	}

	return downloadUrl, nil
}
