package updater

import (
	"crypto/sha256"
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
	execPath      string
	LatestRelease *GithubRelease
}

const (
	currentVersionWillBeUsed = "current version will be used"
)

func New(path string) *Updater {
	return &Updater{execPath: path}
}

func (c *Updater) CheckHasUpdate() bool {
	c.setLatestRelease()

	if c.LatestRelease == nil {
		fmt.Printf("cannot fetch latest relase, %s", currentVersionWillBeUsed)
		return false
	}

	sha, err := c.getSelfSha256()
	if err != nil {
		fmt.Printf("cannot get executable sha256, %s\n", currentVersionWillBeUsed)
		return false
	}

	var sha256Asset *GithubReleaseAsset
	for _, a := range c.LatestRelease.Assets {
		if strings.HasSuffix(a.Name, fmt.Sprintf("%s-%s.sha256", runtime.GOOS, runtime.GOARCH)) {
			sha256Asset = a
		}
	}

	if sha256Asset == nil {
		fmt.Printf("cannot find sha256 asset in latest release, %s\n", currentVersionWillBeUsed)
		return false
	}

	res, err := http.Get(sha256Asset.DownloadUrl)
	if err != nil {
		fmt.Printf("cannot download sha256 of latest release, %s\n", currentVersionWillBeUsed)
		return false
	}

	sha256Bytes, err := io.ReadAll(res.Body)
	defer res.Body.Close()
	if err != nil {
		fmt.Printf("cannot read sha256 of latest release, %s\n", currentVersionWillBeUsed)
		return false
	}

	sha256 := string(sha256Bytes)

	return sha != sha256
}

func (c *Updater) getSelfSha256() (string, error) {
	h := sha256.New()
	data, err := os.ReadFile(c.execPath)
	if err != nil {
		return "", err
	}

	sum := string(h.Sum(data))
	return sum, nil
}

func (c *Updater) setLatestRelease() {
	if c.LatestRelease != nil {
		return
	}

	res, err := http.Get("https://api.github.com/repos/grammyjs/create-grammy/releases")
	if err != nil {
		return
	}

	bytes, err := io.ReadAll(res.Body)
	defer res.Body.Close()

	if err != nil {
		return
	}

	releases := []GithubRelease{}
	err = json.Unmarshal(bytes, &releases)
	if err != nil {
		return
	}

	if len(releases) < 1 {
		return
	}

	c.LatestRelease = &releases[0]
}

func (c *Updater) UpdateBinary() error {
	c.setLatestRelease()

	if c.LatestRelease == nil {
		return errors.New("cannot get latest release")
	}

	asset := &GithubReleaseAsset{}

	var suffix string

	if runtime.GOOS == "windows" {
		suffix = fmt.Sprintf("%s-%s.exe", runtime.GOOS, runtime.GOARCH)
	} else {
		suffix = fmt.Sprintf("%s-%s", runtime.GOOS, runtime.GOARCH)
	}

	for _, a := range c.LatestRelease.Assets {
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

func (c *Updater) RestartSelf() error {
	args := os.Args
	env := os.Environ()
	// Windows does not support exec syscall.
	if runtime.GOOS == "windows" {
		cmd := exec.Command(c.execPath, args[1:]...)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Stdin = os.Stdin
		cmd.Env = env
		defer os.Exit(0)
		return cmd.Run()
	}

	return syscall.Exec(c.execPath, args, env)
}
