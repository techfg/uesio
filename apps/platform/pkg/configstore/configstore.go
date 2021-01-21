package configstore

import (
	"errors"

	"github.com/thecloudmasters/uesio/pkg/metadata"
	"github.com/thecloudmasters/uesio/pkg/templating"
)

// ConfigStore interface
type ConfigStore interface {
	Get(namespace, name, site string) (string, error)
	Set(namespace, name, value, site string) error
}

var configStoreMap = map[string]ConfigStore{}

// GetConfigStore gets an adapter of a certain type
func GetConfigStore(configStoreType string) (ConfigStore, error) {
	configStore, ok := configStoreMap[configStoreType]
	if !ok {
		return nil, errors.New("Invalid config store type: " + configStoreType)
	}
	return configStore, nil
}

// RegisterConfigStore function
func RegisterConfigStore(name string, store ConfigStore) {
	configStoreMap[name] = store
}

// Get key
func GetValue(key string, site *metadata.Site) (string, error) {
	if key == "" {
		return "", nil
	}

	namespace, name, err := metadata.ParseKey(key)
	if err != nil {
		return "", errors.New("Failed Parsing Config Value: " + key + " : " + err.Error())
	}

	// Only use the environment configstore for now
	store, err := GetConfigStore("environment")
	if err != nil {
		return "", err
	}

	return store.Get(namespace, name, site.Name)
}

// Merge function
func Merge(template string, site *metadata.Site) (string, error) {
	configTemplate, err := templating.NewWithFunc(template, func(m map[string]interface{}, key string) (interface{}, error) {
		return GetValue(key, site)
	})
	if err != nil {
		return "", err
	}

	value, err := templating.Execute(configTemplate, nil)
	if err != nil {
		return "", err
	}
	return value, nil
}
