package routing

import "encoding/json"

type LoginResponse struct {
	User                   *UserMergeData `json:"user"`
	RedirectPath           string         `json:"redirectPath,omitempty"`
	RedirectRouteName      string         `json:"redirectRouteName,omitempty"`
	RedirectRouteNamespace string         `json:"redirectRouteNamespace,omitempty"`
}

type RouteMergeData struct {
	View         string              `json:"view"`
	Params       map[string]string   `json:"params"`
	Namespace    string              `json:"namespace"`
	Path         string              `json:"path"`
	Workspace    *WorkspaceMergeData `json:"workspace"`
	Theme        string              `json:"theme"`
	Dependencies *PreloadMetadata    `json:"dependencies"`
}

type UserMergeData struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Profile   string `json:"profile"`
	Site      string `json:"site"`
	ID        string `json:"id"`
	PictureID string `json:"picture"`
	Language  string `json:"language"`
}

type SiteMergeData struct {
	Name      string `json:"name"`
	App       string `json:"app"`
	Version   string `json:"version"`
	Domain    string `json:"domain"`
	Subdomain string `json:"subdomain"`
}

type WorkspaceMergeData struct {
	Name string `json:"name"`
	App  string `json:"app"`
}

type ComponentMergeData struct {
	ID            string      `json:"id"`
	ComponentType string      `json:"componentType"`
	View          string      `json:"view"`
	State         interface{} `json:"state"`
}

type ComponentsMergeData struct {
	IDs      []string                      `json:"ids"`
	Entities map[string]ComponentMergeData `json:"entities"`
}

type MergeData struct {
	Route     *RouteMergeData      `json:"route"`
	User      *UserMergeData       `json:"user"`
	Site      *SiteMergeData       `json:"site"`
	Workspace *WorkspaceMergeData  `json:"workspace,omitempty"`
	Component *ComponentsMergeData `json:"component,omitempty"`
	*PreloadMetadata
}

// String function controls how MergeData is marshalled
// This is actually pretty silly but I did it to make the output
// look pretty in the html source.
func (md MergeData) String() string {
	// Remove the component pack dep info because we don't need it on the client
	md.ComponentPack = nil

	json, err := json.MarshalIndent(md, "        ", "  ")
	//json, err := json.Marshal(md)
	if err != nil {
		return ""
	}
	return string(json)
}