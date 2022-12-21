package meta

import (
	"errors"
	"fmt"
	"path/filepath"
	"time"

	"gopkg.in/yaml.v3"
)

func NewField(collectionKey, fieldKey string) (*Field, error) {
	namespace, name, err := ParseKey(fieldKey)
	if err != nil {
		return nil, errors.New("Bad Key for Field: " + collectionKey + " : " + fieldKey)
	}
	return &Field{
		Name:          name,
		Namespace:     namespace,
		CollectionRef: collectionKey,
	}, nil
}

func NewFields(keys map[string]bool, collectionKey string) ([]BundleableItem, error) {
	items := []BundleableItem{}

	for key := range keys {
		newField, err := NewField(collectionKey, key)
		if err != nil {
			return nil, err
		}
		items = append(items, newField)
	}

	return items, nil
}

type Field struct {
	ID                     string                  `yaml:"-" json:"uesio/core.id"`
	UniqueKey              string                  `yaml:"-" json:"uesio/core.uniquekey"`
	Name                   string                  `yaml:"name" json:"uesio/studio.name"`
	CollectionRef          string                  `yaml:"-" json:"uesio/studio.collection"`
	Namespace              string                  `yaml:"-" json:"-"`
	Type                   string                  `yaml:"type" json:"uesio/studio.type"`
	Label                  string                  `yaml:"label" json:"uesio/studio.label"`
	ReadOnly               bool                    `yaml:"readOnly,omitempty" json:"uesio/studio.readonly"`
	CreateOnly             bool                    `yaml:"createOnly,omitempty" json:"uesio/studio.createonly"`
	SelectList             string                  `yaml:"selectList,omitempty" json:"uesio/studio.selectlist"`
	Workspace              *Workspace              `yaml:"-" json:"uesio/studio.workspace"`
	Required               bool                    `yaml:"required,omitempty" json:"uesio/studio.required"`
	NumberMetadata         *NumberMetadata         `yaml:"number,omitempty" json:"uesio/studio.number"`
	FileMetadata           *FileMetadata           `yaml:"file,omitempty" json:"uesio/studio.file"`
	ReferenceMetadata      *ReferenceMetadata      `yaml:"reference,omitempty" json:"uesio/studio.reference"`
	ReferenceGroupMetadata *ReferenceGroupMetadata `yaml:"referenceGroup,omitempty" json:"uesio/studio.referencegroup"`
	ValidationMetadata     *ValidationMetadata     `yaml:"validate,omitempty" json:"uesio/studio.validate"`
	AutoNumberMetadata     *AutoNumberMetadata     `yaml:"autonumber,omitempty" json:"uesio/studio.autonumber"`
	FormulaMetadata        *FormulaMetadata        `yaml:"formula,omitempty" json:"uesio/studio.formula"`
	AutoPopulate           string                  `yaml:"autopopulate,omitempty" json:"uesio/studio.autopopulate"`
	itemMeta               *ItemMeta               `yaml:"-" json:"-"`
	CreatedBy              *User                   `yaml:"-" json:"uesio/core.createdby"`
	Owner                  *User                   `yaml:"-" json:"uesio/core.owner"`
	UpdatedBy              *User                   `yaml:"-" json:"uesio/core.updatedby"`
	UpdatedAt              int64                   `yaml:"-" json:"uesio/core.updatedat"`
	CreatedAt              int64                   `yaml:"-" json:"uesio/core.createdat"`
	SubFields              []SubField              `yaml:"subfields,omitempty" json:"uesio/studio.subfields"`
	SubType                string                  `yaml:"subtype,omitempty" json:"uesio/studio.subtype"`
	LanguageLabel          string                  `yaml:"languageLabel,omitempty" json:"uesio/studio.languagelabel"`
	ColumnName             string                  `yaml:"columnname,omitempty" json:"uesio/studio.columnname"`
}

type FieldWrapper Field

func GetFieldTypes() map[string]bool {
	return map[string]bool{
		"TEXT":           true,
		"NUMBER":         true,
		"LONGTEXT":       true,
		"CHECKBOX":       true,
		"MULTISELECT":    true,
		"SELECT":         true,
		"REFERENCE":      true,
		"FILE":           true,
		"USER":           true,
		"LIST":           true,
		"DATE":           true,
		"MAP":            true,
		"TIMESTAMP":      true,
		"EMAIL":          true,
		"AUTONUMBER":     true,
		"REFERENCEGROUP": true,
		"FORMULA":        true,
	}
}

func (f *Field) GetCollectionName() string {
	return f.GetBundleGroup().GetName()
}

func (f *Field) GetCollection() CollectionableGroup {
	return &FieldCollection{}
}

func (f *Field) GetDBID(workspace string) string {
	return fmt.Sprintf("%s:%s:%s", workspace, f.CollectionRef, f.Name)
}

func (f *Field) GetBundleGroup() BundleableGroup {
	return &FieldCollection{}
}

func (f *Field) GetKey() string {
	return fmt.Sprintf("%s:%s.%s", f.CollectionRef, f.Namespace, f.Name)
}

func (f *Field) GetPath() string {
	collectionNamespace, collectionName, _ := ParseKey(f.CollectionRef)
	nsUser, appName, _ := ParseNamespace(collectionNamespace)
	return filepath.Join(nsUser, appName, collectionName, f.Name) + ".yaml"
}

func (f *Field) GetPermChecker() *PermissionSet {
	return nil
}

func (f *Field) SetField(fieldName string, value interface{}) error {
	return StandardFieldSet(f, fieldName, value)
}

func (f *Field) GetField(fieldName string) (interface{}, error) {
	return StandardFieldGet(f, fieldName)
}

func (f *Field) GetNamespace() string {
	return f.Namespace
}

func (f *Field) SetNamespace(namespace string) {
	f.Namespace = namespace
}

func (f *Field) SetModified(mod time.Time) {
	f.UpdatedAt = mod.UnixMilli()
}

func (f *Field) Loop(iter func(string, interface{}) error) error {
	return StandardItemLoop(f, iter)
}

func (f *Field) Len() int {
	return StandardItemLen(f)
}

func (f *Field) GetItemMeta() *ItemMeta {
	return f.itemMeta
}

func (f *Field) SetItemMeta(itemMeta *ItemMeta) {
	f.itemMeta = itemMeta
}

func (f *Field) UnmarshalYAML(node *yaml.Node) error {
	err := validateNodeName(node, f.Name)
	if err != nil {
		return err
	}
	fieldType := GetNodeValueAsString(node, "type")
	_, ok := GetFieldTypes()[fieldType]
	if !ok {
		return errors.New("Invalid Field Type for Field: " + f.GetKey() + " : " + fieldType)
	}
	if f.CollectionRef == "" {
		return errors.New("Invalid Collection Value for Field: " + f.GetKey())
	}
	err = setMapNode(node, "collection", f.CollectionRef)
	if err != nil {
		return err
	}

	if fieldType == "REFERENCE" {
		err := validateReferenceField(node, f.GetKey())
		if err != nil {
			return err
		}
	}
	if fieldType == "SELECT" {
		err := validateSelectListField(node, f.GetKey())
		if err != nil {
			return err
		}
	}
	if fieldType == "NUMBER" {
		err := validateNumberField(node, f.GetKey())
		if err != nil {
			return err
		}
	}

	if fieldType == "FILE" {
		err := validateFileField(node, f.GetKey())
		if err != nil {
			return err
		}
	}
	return node.Decode((*FieldWrapper)(f))
}

func validateFileField(node *yaml.Node, fieldKey string) error {
	fileNode, err := getOrCreateMapNode(node, "file")
	if err != nil {
		return fmt.Errorf("Invalid File metadata provided for field: " + fieldKey + " : " + err.Error())
	}
	return setDefaultValue(fileNode, "filesource", "uesio/core.platform")
}

func validateNumberField(node *yaml.Node, fieldKey string) error {
	numberNode, err := GetMapNode(node, "number")
	if err != nil {
		return fmt.Errorf("Invalid Number metadata provided for field: " + fieldKey + " : " + err.Error())
	}
	decimals := GetNodeValueAsString(numberNode, "decimals")
	if decimals == "" {
		return fmt.Errorf("Invalid Number metadata provided for field: " + fieldKey + " : No decimals value provided")
	}
	return nil
}

func validateSelectListField(node *yaml.Node, fieldKey string) error {
	selectListName := GetNodeValueAsString(node, "selectList")
	if selectListName == "" {
		return fmt.Errorf("Invalid selectlist metadata provided for field: " + fieldKey + " : Missing select list name")
	}
	return nil
}

func validateReferenceField(node *yaml.Node, fieldKey string) error {
	referenceNode, err := GetMapNode(node, "reference")
	if err != nil {
		return fmt.Errorf("Invalid Reference metadata provided for field: " + fieldKey + " : " + err.Error())
	}
	referencedCollection := GetNodeValueAsString(referenceNode, "collection")
	if referencedCollection == "" {
		return fmt.Errorf("Invalid Reference metadata provided for field: " + fieldKey + " : No collection provided")
	}
	return nil
}
func (c *Field) IsPublic() bool {
	return true
}
