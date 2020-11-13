package metadata

import "github.com/thecloudmasters/uesio/pkg/reqs"

// CollectionCollection slice
type CollectionCollection []Collection

// GetName function
func (cc *CollectionCollection) GetName() string {
	return "collections"
}

// GetFields function
func (cc *CollectionCollection) GetFields() []string {
	return []string{"id", "name", "datasource", "idfield", "namefield", "collectionname"}
}

// NewItem function
func (cc *CollectionCollection) NewItem(key string) (BundleableItem, error) {
	return NewCollection(key)
}

// GetKeyPrefix function
func (cc *CollectionCollection) GetKeyPrefix(conditions reqs.BundleConditions) string {
	return ""
}

// AddItem function
func (cc *CollectionCollection) AddItem(item BundleableItem) {
	actual := *cc
	collection := item.(*Collection)
	actual = append(actual, *collection)
	*cc = actual
}

// UnMarshal function
func (cc *CollectionCollection) UnMarshal(data []map[string]interface{}) error {
	return StandardDecoder(cc, data)
}

// Marshal function
func (cc *CollectionCollection) Marshal() ([]map[string]interface{}, error) {
	return StandardEncoder(cc)
}

// GetItem function
func (cc *CollectionCollection) GetItem(index int) CollectionableItem {
	actual := *cc
	return &actual[index]
}

// Loop function
func (cc *CollectionCollection) Loop(iter func(item CollectionableItem) error) error {
	for _, item := range *cc {
		err := iter(&item)
		if err != nil {
			return err
		}
	}
	return nil
}

// Len function
func (cc *CollectionCollection) Len() int {
	return len(*cc)
}
