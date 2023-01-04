package meta

import (
	"errors"

	"gopkg.in/yaml.v3"
)

func NewIntegration(key string) (*Integration, error) {
	namespace, name, err := ParseKey(key)
	if err != nil {
		return nil, errors.New("Bad Key for Integration: " + key)
	}
	return NewBaseIntegration(namespace, name), nil
}

func NewBaseIntegration(namespace, name string) *Integration {
	return &Integration{BundleableBase: NewBase(namespace, name)}
}

type Integration struct {
	Type           string            `yaml:"type" json:"uesio/studio.type"`
	Credentials    string            `yaml:"credentials" json:"uesio/studio.credentials"`
	Headers        map[string]string `yaml:"headers" json:"uesio/studio.headers"`
	BaseURL        string            `yaml:"baseUrl" json:"uesio/studio.baseurl"`
	BuiltIn        `yaml:",inline"`
	BundleableBase `yaml:",inline"`
}

type IntegrationWrapper Integration

func (i *Integration) GetCollectionName() string {
	return INTEGRATION_COLLECTION_NAME
}

func (i *Integration) GetBundleFolderName() string {
	return INTEGRATION_FOLDER_NAME
}

func (i *Integration) SetField(fieldName string, value interface{}) error {
	return StandardFieldSet(i, fieldName, value)
}

func (i *Integration) GetField(fieldName string) (interface{}, error) {
	return StandardFieldGet(i, fieldName)
}

func (i *Integration) Loop(iter func(string, interface{}) error) error {
	return StandardItemLoop(i, iter)
}

func (i *Integration) Len() int {
	return StandardItemLen(i)
}

func (i *Integration) UnmarshalYAML(node *yaml.Node) error {
	err := validateNodeName(node, i.Name)
	if err != nil {
		return err
	}
	return node.Decode((*IntegrationWrapper)(i))
}
