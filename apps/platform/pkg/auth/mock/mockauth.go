package mock

import (
	"encoding/json"

	"github.com/thecloudmasters/uesio/pkg/adapt"
	"github.com/thecloudmasters/uesio/pkg/auth"
	"github.com/thecloudmasters/uesio/pkg/sess"
)

type Auth struct{}

func (a *Auth) GetAuthConnection(credentials *adapt.Credentials) (auth.AuthConnection, error) {

	return &Connection{
		credentials: credentials,
	}, nil
}

type Connection struct {
	credentials *adapt.Credentials
}

func (c *Connection) Verify(token string, session *sess.Session) error {
	return nil
}

func (c *Connection) Decode(token string, session *sess.Session) (*auth.AuthenticationClaims, error) {
	claim := auth.AuthenticationClaims{}
	err := json.Unmarshal([]byte(token), &claim)
	if err != nil {
		return nil, err
	}
	return &claim, nil
}
