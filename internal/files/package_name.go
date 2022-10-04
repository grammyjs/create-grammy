package files

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

func UpdatePackageName(dir string) error {
	files, err := os.ReadDir(dir)
	if err != nil {
		return errors.New("failed to read project folder")
	}

	writeError := errors.New("failed to write package.json")

	for _, file := range files {
		if file.Name() == "package.json" {
			path := filepath.Join(dir, "package.json")
			bytes, err := os.ReadFile(path)
			if err != nil {
				return writeError
			}

			var packageJson map[string]interface{}
			err = json.Unmarshal(bytes, &packageJson)
			if err != nil {
				return writeError
			}

			packageJson["name"] = dir
			data, err := json.Marshal(packageJson)
			if err != nil {
				return writeError
			}
			err = os.WriteFile(path, data, 0777)
			if err != nil {
				return writeError
			}
		}
	}

	return nil
}
