package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
	"github.com/thecloudmasters/cli/pkg/command"
)

func init() {

	retrieveCommand := &cobra.Command{
		Use:   "retrieve",
		Short: "uesio retrieve",
		Run:   retrieve,
	}

	rootCmd.AddCommand(retrieveCommand)

}

func retrieve(cmd *cobra.Command, args []string) {
	err := command.Retrieve()
	if err != nil {
		fmt.Println("Error: " + err.Error())
		return
	}
}