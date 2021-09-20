package meta

import (
	"errors"
)

// NewProfile function
func NewProfile(key string) (*Profile, error) {
	namespace, name, err := ParseKey(key)
	if err != nil {
		return nil, errors.New("Bad Key for Profile")
	}
	return &Profile{
		Name:      name,
		Namespace: namespace,
	}, nil
}

// Profile struct
type Profile struct {
	ID                string          `yaml:"-" uesio:"uesio.id"`
	Name              string          `yaml:"name" uesio:"studio.name"`
	Namespace         string          `yaml:"-" uesio:"-"`
	PermissionSetRefs []string        `yaml:"permissionSets" uesio:"studio.permissionsetsrefs"`
	PermissionSets    []PermissionSet `yaml:"-" uesio:"-"`
	Workspace         *Workspace      `yaml:"-" uesio:"studio.workspace"`
	itemMeta          *ItemMeta       `yaml:"-" uesio:"-"`
	CreatedBy         *User           `yaml:"-" uesio:"uesio.createdby"`
	Owner             *User           `yaml:"-" uesio:"uesio.owner"`
	UpdatedBy         *User           `yaml:"-" uesio:"uesio.updatedby"`
	UpdatedAt         int64           `yaml:"-" uesio:"uesio.updatedat"`
	CreatedAt         int64           `yaml:"-" uesio:"uesio.createdat"`
}

// GetCollectionName function
func (p *Profile) GetCollectionName() string {
	return p.GetBundleGroup().GetName()
}

// GetCollection function
func (p *Profile) GetCollection() CollectionableGroup {
	var pc ProfileCollection
	return &pc
}

// GetConditions function
func (p *Profile) GetConditions() map[string]string {
	return map[string]string{
		"studio.name": p.Name,
	}
}

// GetBundleGroup function
func (p *Profile) GetBundleGroup() BundleableGroup {
	var pc ProfileCollection
	return &pc
}

// GetKey function
func (p *Profile) GetKey() string {
	return p.Namespace + "." + p.Name
}

// GetPath function
func (p *Profile) GetPath() string {
	return p.GetKey() + ".yaml"
}

// GetPermChecker function
func (p *Profile) GetPermChecker() *PermissionSet {
	return nil
}

// SetField function
func (p *Profile) SetField(fieldName string, value interface{}) error {
	return StandardFieldSet(p, fieldName, value)
}

// GetField function
func (p *Profile) GetField(fieldName string) (interface{}, error) {
	return StandardFieldGet(p, fieldName)
}

// GetNamespace function
func (p *Profile) GetNamespace() string {
	return p.Namespace
}

// SetNamespace function
func (p *Profile) SetNamespace(namespace string) {
	p.Namespace = namespace
}

// SetWorkspace function
func (p *Profile) SetWorkspace(workspace string) {
	p.Workspace = &Workspace{
		ID: workspace,
	}
}

// Loop function
func (p *Profile) Loop(iter func(string, interface{}) error) error {
	return StandardItemLoop(p, iter)
}

// Len function
func (p *Profile) Len() int {
	return StandardItemLen(p)
}

// GetItemMeta function
func (p *Profile) GetItemMeta() *ItemMeta {
	return p.itemMeta
}

// SetItemMeta function
func (p *Profile) SetItemMeta(itemMeta *ItemMeta) {
	p.itemMeta = itemMeta
}

// HasPermission method
func (p *Profile) HasPermission(check *PermissionSet) bool {
	return p.FlattenPermissions().HasPermission(check)
}

// FlattenPermissions returns an inclusive permissionset
// of all permissions for that profile
func (p *Profile) FlattenPermissions() *PermissionSet {
	return FlattenPermissions(p.PermissionSets)
}
