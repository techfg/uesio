package bots

import (
	"github.com/thecloudmasters/uesio/pkg/adapters"
	"github.com/thecloudmasters/uesio/pkg/reqs"
)

// ChangeAPI type
type ChangeAPI struct {
	change   reqs.ChangeRequest
	metadata *adapters.CollectionMetadata
	errors   []string
}

// Get function
func (c *ChangeAPI) Get(fieldName string) interface{} {
	return c.change[fieldName]
}

// Set function
func (c *ChangeAPI) Set(fieldName string, value interface{}) {
	c.change[fieldName] = value
}

// AddError function
func (c *ChangeAPI) AddError(message string) {
	c.errors = append(c.errors, message)
}
