package datasource

import (
	"github.com/thecloudmasters/uesio/pkg/adapt"
)

// DeletesAPI type
type DeletesAPI struct {
	deletes *adapt.ChangeItems
}

// Get function
func (d *DeletesAPI) Get() []string {
	ids := []string{}

	for _, delete := range *d.deletes {

		idValue, err := delete.FieldChanges.GetField(adapt.ID_FIELD)
		if err != nil {
			continue
		}
		ids = append(ids, idValue.(string))
	}

	return ids
}
