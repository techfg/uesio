package deploy

import (
	"errors"
	"fmt"
	"strings"

	"github.com/thecloudmasters/uesio/pkg/auth"
	"github.com/thecloudmasters/uesio/pkg/constant/commonfields"
	"github.com/thecloudmasters/uesio/pkg/datasource"
	"github.com/thecloudmasters/uesio/pkg/meta"
	"github.com/thecloudmasters/uesio/pkg/param"
	"github.com/thecloudmasters/uesio/pkg/sess"
	"github.com/thecloudmasters/uesio/pkg/types/exceptions"
	"github.com/thecloudmasters/uesio/pkg/types/wire"
)

type CreateSiteOptions struct {
	AppName   string
	SiteName  string
	Subdomain string
	Version   string
}

type CreateUserOptions struct {
	SiteID       string
	FirstName    string
	LastName     string
	Username     string
	Email        string
	Profile      string
	SignupMethod string
}

func NewCreateUserOptions(siteID string, params map[string]interface{}) (*CreateUserOptions, error) {
	firstName, err := param.GetRequiredString(params, "firstname")
	if err != nil {
		return nil, err
	}

	lastName, err := param.GetRequiredString(params, "lastname")
	if err != nil {
		return nil, err
	}

	username, err := param.GetRequiredString(params, "username")
	if err != nil {
		return nil, err
	}
	username = strings.ToLower(username)

	email, err := param.GetRequiredString(params, "email")
	if err != nil {
		return nil, err
	}

	profile, err := param.GetRequiredString(params, "profile")
	if err != nil {
		return nil, err
	}

	signupMethodName, err := param.GetRequiredString(params, "signupmethod")
	if err != nil {
		return nil, err
	}

	return &CreateUserOptions{
		FirstName:    firstName,
		LastName:     lastName,
		Username:     username,
		Email:        email,
		Profile:      profile,
		SignupMethod: signupMethodName,
		SiteID:       siteID,
	}, nil
}

func NewCreateSiteOptions(params map[string]interface{}) (*CreateSiteOptions, error) {

	subdomain, err := param.GetRequiredString(params, "subdomain")
	if err != nil {
		return nil, err
	}

	siteName, err := param.GetRequiredString(params, "site")
	if err != nil {
		return nil, err
	}

	appName, err := param.GetRequiredString(params, "app")
	if err != nil {
		return nil, err
	}

	version, err := param.GetRequiredString(params, "version")
	if err != nil {
		return nil, err
	}

	return &CreateSiteOptions{
		AppName:   appName,
		SiteName:  siteName,
		Subdomain: subdomain,
		Version:   version,
	}, nil
}

func CreateUser(options *CreateUserOptions, connection wire.Connection, session *sess.Session) (*meta.User, error) {
	if options == nil {
		return nil, errors.New("Invalid Create options")
	}

	firstName := options.FirstName
	lastName := options.LastName
	username := options.Username
	email := options.Email
	profile := options.Profile
	signupMethodName := options.SignupMethod
	siteID := options.SiteID

	user := &meta.User{
		FirstName: firstName,
		LastName:  lastName,
		Email:     email,
		Username:  username,
		Profile:   profile,
		Type:      "PERSON",
	}

	siteAdminSession, err := datasource.AddSiteAdminContextByID(siteID, session, connection)
	if err != nil {
		return nil, err
	}

	// Third, create the user.
	err = datasource.PlatformSaveOne(user, nil, connection, siteAdminSession)
	if err != nil {
		return nil, err
	}

	// Fourth, create a login method.
	signupMethod, err := auth.GetSignupMethod(signupMethodName, siteAdminSession)
	if err != nil {
		return nil, err
	}

	err = auth.CreateLoginWithConnection(signupMethod, map[string]interface{}{
		"username": username,
		"email":    email,
	}, connection, siteAdminSession)
	if err != nil {
		return nil, err
	}

	return user, err
}

func CreateSite(options *CreateSiteOptions, connection wire.Connection, session *sess.Session) (*meta.Site, error) {

	if options == nil {
		return nil, errors.New("Invalid Create options")
	}

	appName := options.AppName
	siteName := options.SiteName
	subdomain := options.Subdomain
	version := options.Version

	app, err := datasource.QueryAppForWrite(appName, commonfields.UniqueKey, session, connection)
	if err != nil {
		return nil, exceptions.NewForbiddenException(fmt.Sprintf("you do not have permission to create bundles for app %s", appName))
	}

	major, minor, patch, err := meta.ParseVersionString(version)
	if err != nil {
		return nil, err
	}

	bundleUniqueKey := strings.Join([]string{appName, major, minor, patch}, ":")

	site := &meta.Site{
		Name: siteName,
		Bundle: &meta.Bundle{
			BuiltIn: meta.BuiltIn{
				UniqueKey: bundleUniqueKey,
			},
		},
		App: app,
	}

	domain := &meta.SiteDomain{
		Domain: subdomain,
		Type:   "subdomain",
		Site:   site,
	}

	// First, create the site.
	err = datasource.PlatformSaveOne(site, nil, connection, session)
	if err != nil {
		return nil, err
	}

	// Second, create the domain.
	err = datasource.PlatformSaveOne(domain, nil, connection, session)
	if err != nil {
		return nil, err
	}

	return site, nil

}