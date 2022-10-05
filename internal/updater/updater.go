package updater

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"syscall"

	"github.com/minio/selfupdate"
)

type GithubReleaseAsset struct {
	Name        string `json:"name"`
	ContentType string `json:"content_type"`
	DownloadUrl string `json:"browser_download_url"`
}

type GithubRelease struct {
	TagName     string                `json:"tag_name"`
	Description string                `json:"body"`
	Assets      []*GithubReleaseAsset `json:"assets"`
}

type Updater struct {
	currentVersion string
	Release        *GithubRelease
}

func New(currentVersion string) *Updater {
	return &Updater{currentVersion: currentVersion}
}

func (c *Updater) CheckHasUpdate() bool {
	res, err := http.Get("https://api.github.com/repos/grammyjs/create-grammy/releases")
	if err != nil {
		fmt.Println("cannot fetch updates")
		return false
	}

	bytes, err := io.ReadAll(res.Body)
	defer res.Body.Close()

	if err != nil {
		fmt.Println("cannot read body of github response for update check")
		return false
	}

	releases := []GithubRelease{}
	err = json.Unmarshal(bytes, &releases)
	if err != nil {
		fmt.Println("cannot parse github response for update check")
		return false
	}

	if len(releases) < 1 {
		fmt.Println("seems like some error happend, because 0 releases found in github response")
		return false
	}

	release := releases[0]
	c.Release = &release

	if release.TagName != c.currentVersion {
		return true
	} else {
		return false
	}
}

func (c *Updater) UpdateBinary() error {
	asset := &GithubReleaseAsset{}

	var suffix string

	if runtime.GOOS == "windows" {
		suffix = fmt.Sprintf("%s-%s.exe", runtime.GOOS, runtime.GOARCH)
	} else {
		suffix = fmt.Sprintf("%s-%s", runtime.GOOS, runtime.GOARCH)
	}

	for _, a := range c.Release.Assets {
		if strings.HasSuffix(a.Name, suffix) {
			asset = a
		}
	}

	if asset == nil {
		return errors.New("cannot find release binary for your platform")
	}

	resp, err := http.Get(asset.DownloadUrl)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	err = selfupdate.Apply(resp.Body, selfupdate.Options{})

	if err != nil {
		return errors.New("cannot update binary")
	}

	return nil
}

func (c *Updater) RestartSelf(self string) error {
	args := os.Args
	env := os.Environ()
	// Windows does not support exec syscall.
	if runtime.GOOS == "windows" {
		cmd := exec.Command(self, args[1:]...)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Stdin = os.Stdin
		cmd.Env = env
		defer os.Exit(0)
		return cmd.Run()
	}

	return syscall.Exec(self, args, env)
}
