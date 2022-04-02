package creds

import (
	"github.com/thecloudmasters/uesio/pkg/adapt"
	"github.com/thecloudmasters/uesio/pkg/bundle"
	"github.com/thecloudmasters/uesio/pkg/configstore"
	"github.com/thecloudmasters/uesio/pkg/meta"
	"github.com/thecloudmasters/uesio/pkg/secretstore"
	"github.com/thecloudmasters/uesio/pkg/sess"
)

// GetCredentials function
func GetCredentials(key string, session *sess.Session) (*adapt.Credentials, error) {
	credmap := adapt.Credentials{}

	// Always add the tenant id to credentials
	credmap.SetTenantID(session)

	if key == "" {
		return &credmap, nil
	}

	mergedKey, err := configstore.Merge(key, session)
	if err != nil {
		return nil, err
	}

	credential, err := meta.NewCredential(mergedKey)
	if err != nil {
		return nil, err
	}

	err = bundle.Load(credential, session)
	if err != nil {
		return nil, err
	}

	for key, entry := range credential.Entries {
		var value string
		if entry.Type == "secret" {
			value, err = secretstore.GetSecretFromKey(entry.Value, session)
			if err != nil {
				return nil, err
			}
		} else if entry.Type == "configvalue" {
			value, err = configstore.GetValueFromKey(entry.Value, session)
			if err != nil {
				return nil, err
			}
		} else if entry.Type == "merge" {
			value, err = configstore.Merge(entry.Value, session)
			if err != nil {
				return nil, err
			}
		}
		credmap[key] = value
	}

	return &credmap, nil
}