package meta

import "fmt"

// BundleDependency struct
type BundleDependency struct {
	ID          string    `uesio:"studio.id"`
	WorkspaceID string    `uesio:"studio.workspaceid"`
	Bundle      *Bundle   `uesio:"studio.bundle"`
	itemMeta    *ItemMeta `yaml:"-" uesio:"-"`
	CreatedBy   *User     `yaml:"-" uesio:"studio.createdby"`
	UpdatedBy   *User     `yaml:"-" uesio:"studio.updatedby"`
	UpdatedAt   int64     `yaml:"-" uesio:"studio.updatedat"`
	CreatedAt   int64     `yaml:"-" uesio:"studio.createdat"`
}

// GetCollectionName function
func (b *BundleDependency) GetVersionString() string {
	bundle := b.Bundle
	if bundle == nil {
		return ""
	}
	return fmt.Sprintf("v%s.%s.%s", bundle.Major, bundle.Minor, bundle.Patch)
}

// GetCollectionName function
func (b *BundleDependency) GetBundleName() string {
	if b.Bundle == nil {
		return ""
	}
	return b.Bundle.App.ID
}

// GetCollectionName function
func (b *BundleDependency) GetCollectionName() string {
	return b.GetCollection().GetName()
}

// GetCollection function
func (b *BundleDependency) GetCollection() CollectionableGroup {
	var bc BundleDependencyCollection
	return &bc
}

// SetField function
func (b *BundleDependency) SetField(fieldName string, value interface{}) error {
	return StandardFieldSet(b, fieldName, value)
}

// GetField function
func (b *BundleDependency) GetField(fieldName string) (interface{}, error) {
	return StandardFieldGet(b, fieldName)
}

// Loop function
func (b *BundleDependency) Loop(iter func(string, interface{}) error) error {
	return StandardItemLoop(b, iter)
}

// Len function
func (b *BundleDependency) Len() int {
	return StandardItemLen(b)
}

// GetItemMeta function
func (b *BundleDependency) GetItemMeta() *ItemMeta {
	return b.itemMeta
}

// SetItemMeta function
func (b *BundleDependency) SetItemMeta(itemMeta *ItemMeta) {
	b.itemMeta = itemMeta
}
