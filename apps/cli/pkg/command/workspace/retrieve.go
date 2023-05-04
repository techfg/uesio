package workspace

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/thecloudmasters/cli/pkg/auth"
	"github.com/thecloudmasters/cli/pkg/call"
	"github.com/thecloudmasters/cli/pkg/config"
	"github.com/thecloudmasters/cli/pkg/config/ws"
	"github.com/thecloudmasters/cli/pkg/zip"
	"github.com/thecloudmasters/uesio/pkg/meta"
)

func Retrieve() error {

	fmt.Println("Running Retrieve Command")

	_, err := auth.Login()
	if err != nil {
		return err
	}

	appName, err := config.GetApp()
	if err != nil {
		return err
	}

	workspace, err := ws.GetWorkspace()
	if err != nil {
		return err
	}

	if workspace == "" {
		return errors.New("No active workspace is set. Use \"uesio work\" to set one.")
	}

	err = RetrieveBundleForAppWorkspace(appName, workspace)
	if err != nil {
		return err
	}

	fmt.Println("Retrieve Success")

	return nil
}

func RetrieveBundleForAppWorkspace(appName, workspaceName string) error {

	for _, metadataType := range meta.GetMetadataTypes() {
		// Go through the deployable folders and delete them.
		// TODO: Maybe we can do a hash-based diff rather than having to delete every file...
		path := filepath.Join("bundle", metadataType)
		// Ignore the error. If path doesn't exist, we don't care
		os.RemoveAll(path)
	}

	// Do a retrieve command and get the data.
	// TODO: Send hashes of all local files so we aren't deleting/retrieving unchanged files every time...
	url := fmt.Sprintf("workspace/%s/%s/metadata/retrieve", appName, workspaceName)

	sessid, err := config.GetSessionID()
	if err != nil {
		return err
	}

	resp, err := call.Request("GET", url, nil, sessid)
	if err != nil {
		return err
	}

	return zip.Unzip(resp.Body, "")
}