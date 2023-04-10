package command

import (
	"fmt"

	"github.com/thecloudmasters/cli/pkg/auth"
	"github.com/thecloudmasters/cli/pkg/config/host"
	"github.com/thecloudmasters/cli/pkg/config/ws"
	"github.com/thecloudmasters/cli/pkg/print"
)

func Status() error {

	fmt.Println("Running Status Command")

	user, err := auth.Check()
	if err != nil {
		return err
	}

	host, err := host.GetHost()
	if err != nil {
		return err
	}

	workspace, err := ws.GetWorkspace()
	if err != nil {
		return err
	}

	print.PrintHost(host)
	print.PrintUser(user)
	print.PrintWorkspace(workspace)

	return nil
}