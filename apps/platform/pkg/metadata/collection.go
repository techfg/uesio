package metadata

import (
	"errors"

	"github.com/thecloudmasters/uesio/pkg/adapters"
)

// NewCollection function
func NewCollection(key string) (*Collection, error) {
	namespace, name, err := ParseKey(key)
	if err != nil {
		return nil, errors.New("Bad Key for Collection: " + key)
	}
	return &Collection{
		Name:      name,
		Namespace: namespace,
	}, nil
}

// Collection struct
type Collection struct {
	ID             string `yaml:"-" uesio:"uesio.id"`
	Name           string `yaml:"name" uesio:"uesio.name"`
	Namespace      string `yaml:"-" uesio:"-"`
	DataSourceRef  string `yaml:"dataSource" uesio:"uesio.datasource"`
	IDField        string `yaml:"idField" uesio:"uesio.idfield"`
	IDFormat       string `yaml:"idFormat,omitempty" uesio:"uesio.idformat"`
	NameField      string `yaml:"nameField" uesio:"uesio.namefield"`
	CollectionName string `yaml:"collectionName" uesio:"uesio.collectionname"`
	ReadOnly       bool   `yaml:"readOnly,omitempty" uesio:"-"`
	Workspace      string `yaml:"-" uesio:"uesio.workspaceid"`
}

// GetCollectionName function
func (c *Collection) GetCollectionName() string {
	return c.GetBundleGroup().GetName()
}

// GetCollection function
func (c *Collection) GetCollection() CollectionableGroup {
	var cc CollectionCollection
	return &cc
}

// GetConditions function
func (c *Collection) GetConditions() ([]adapters.LoadRequestCondition, error) {
	return []adapters.LoadRequestCondition{
		{
			Field: "uesio.name",
			Value: c.Name,
		},
	}, nil
}

// GetBundleGroup function
func (c *Collection) GetBundleGroup() BundleableGroup {
	var cc CollectionCollection
	return &cc
}

// GetKey function
func (c *Collection) GetKey() string {
	return c.Namespace + "." + c.Name
}

// GetPermChecker function
func (c *Collection) GetPermChecker() *PermissionSet {
	return nil
}

// SetField function
func (c *Collection) SetField(fieldName string, value interface{}) error {
	return StandardFieldSet(c, fieldName, value)
}

// GetField function
func (c *Collection) GetField(fieldName string) (interface{}, error) {
	return StandardFieldGet(c, fieldName)
}

// GetNamespace function
func (c *Collection) GetNamespace() string {
	return c.Namespace
}

// SetNamespace function
func (c *Collection) SetNamespace(namespace string) {
	c.Namespace = namespace
}

// SetWorkspace function
func (c *Collection) SetWorkspace(workspace string) {
	c.Workspace = workspace
}
