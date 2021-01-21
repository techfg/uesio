package fileadapters

import (
	"crypto/md5"
	"errors"
	"io"
	"os"

	"github.com/thecloudmasters/uesio/pkg/bundles"
	"github.com/thecloudmasters/uesio/pkg/configstore"
	"github.com/thecloudmasters/uesio/pkg/metadata"
	"github.com/thecloudmasters/uesio/pkg/secretstore"
	"github.com/thecloudmasters/uesio/pkg/sess"
)

// FileAdapter interface
type FileAdapter interface {
	Upload(fileData io.Reader, bucket string, path string, creds *Credentials) error
	Download(bucket, path string, credentials *Credentials) (io.ReadCloser, error)
	Delete(bucket, path string, credentials *Credentials) error
}

var adapterMap = map[string]FileAdapter{}

// GetFileAdapter gets an adapter of a certain type
func GetFileAdapter(adapterType string) (FileAdapter, error) {
	adapter, ok := adapterMap[adapterType]
	if !ok {
		return nil, errors.New("No adapter found of this type: " + adapterType)
	}
	return adapter, nil
}

// RegisterFileAdapter function
func RegisterFileAdapter(name string, adapter FileAdapter) {
	adapterMap[name] = adapter
}

// GetFileSourceAndCollection function
func GetFileSourceAndCollection(fileCollectionID string, session *sess.Session) (*metadata.UserFileCollection, *metadata.FileSource, error) {
	ufc, err := metadata.NewUserFileCollection(fileCollectionID)
	if err != nil {
		return nil, nil, errors.New("Failed to create file collection")
	}
	err = bundles.Load(ufc, session)
	if err != nil {
		return nil, nil, errors.New("No file collection found: " + err.Error())
	}
	fs, err := metadata.NewFileSource(ufc.FileSource)
	if err != nil {
		return nil, nil, errors.New("Failed to create file source")
	}
	err = bundles.Load(fs, session)
	if err != nil {
		return nil, nil, errors.New("No file source found")
	}
	if fs.Name == "platform" && fs.Namespace == "uesio" {
		value := os.Getenv("UESIO_LOCAL_FILES")
		if value == "true" {
			fs.TypeRef = "uesio.local"
		}
	}
	return ufc, fs, nil
}

func GetAdapterForUserFile(userFile *metadata.UserFileMetadata, session *sess.Session) (FileAdapter, string, *Credentials, error) {
	site := session.GetSite()

	ufc, fs, err := GetFileSourceAndCollection(userFile.FileCollectionID, session)
	if err != nil {
		return nil, "", nil, err
	}

	bucket, err := configstore.GetValue(ufc.Bucket, site)
	if err != nil {
		return nil, "", nil, err
	}

	fileAdapter, err := GetFileAdapter(fs.GetAdapterType())
	if err != nil {
		return nil, "", nil, err
	}
	credentials, err := GetCredentials(fs, site)
	if err != nil {
		return nil, "", nil, err
	}

	return fileAdapter, bucket, credentials, nil
}

// Credentials struct
type Credentials struct {
	Database string
	Username string
	Password string
}

// GetHash function
func (c *Credentials) GetHash() string {
	data := []byte(c.Database + ":" + c.Username + ":" + c.Password)
	sum := md5.Sum(data)
	return string(sum[:])
}

// GetCredentials function
//TODO:: Dig into what this should be
func GetCredentials(fs *metadata.FileSource, site *metadata.Site) (*Credentials, error) {
	database, err := configstore.Merge(fs.Database, site)
	if err != nil {
		return nil, err
	}
	username, err := secretstore.GetSecret(fs.Username, site)
	if err != nil {
		return nil, err
	}
	password, err := secretstore.GetSecret(fs.Password, site)
	if err != nil {
		return nil, err
	}

	return &Credentials{
		Database: database,
		Username: username,
		Password: password,
	}, nil
}
