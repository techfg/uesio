package postgresio

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/lib/pq"
	"github.com/thecloudmasters/uesio/pkg/adapt"
	"github.com/thecloudmasters/uesio/pkg/meta/loadable"
)

type DataScanner struct {
	Item       *loadable.Item
	Field      *adapt.FieldMetadata
	References *adapt.ReferenceRegistry
	Index      *int
	BatchSize  int
}

func (ds *DataScanner) Scan(src interface{}) error {

	// Skip the last one
	if ds.BatchSize == *ds.Index {
		return nil
	}

	fieldMetadata := ds.Field
	if src == nil {
		return (*ds.Item).SetField(fieldMetadata.GetFullName(), src)
	}

	if fieldMetadata.Type == "MAP" {
		var mapdata map[string]interface{}
		err := json.Unmarshal(src.([]byte), &mapdata)
		if err != nil {
			return errors.New("Postgresql map Unmarshal error: " + fieldMetadata.GetFullName() + " : " + err.Error())
		}
		return (*ds.Item).SetField(fieldMetadata.GetFullName(), mapdata)
	}
	if fieldMetadata.Type == "LIST" {
		var arraydata []interface{}
		err := json.Unmarshal(src.([]byte), &arraydata)
		if err != nil {
			return errors.New("Postgresql map Unmarshal error: " + fieldMetadata.GetFullName() + " : " + err.Error())
		}
		return (*ds.Item).SetField(fieldMetadata.GetFullName(), arraydata)
	}

	if adapt.IsReference(fieldMetadata.Type) {

		// Handle foreign key value
		reference, ok := (*ds.References)[fieldMetadata.ReferenceMetadata.Collection]
		if !ok {
			return nil
		}

		// If we didn't request any additional fields here, then we don't need to
		// do a query, just set the ID field of our reference object
		if len(reference.Fields) == 0 {
			refItem := adapt.Item{}
			err := refItem.SetField(reference.Metadata.IDField, src)
			if err != nil {
				return err
			}
			return (*ds.Item).SetField(fieldMetadata.GetFullName(), refItem)
		}

		reference.AddID(src, adapt.ReferenceLocator{
			RecordIndex: *ds.Index,
			Field:       fieldMetadata,
		})

		return nil
	}

	return (*ds.Item).SetField(fieldMetadata.GetFullName(), src)
}

//GetBytes interface to bytes function
func GetBytes(key interface{}) ([]byte, error) {
	buf, ok := key.([]byte)
	if !ok {
		return nil, errors.New("GetBytes Error")
	}

	return buf, nil
}

func getFieldNameWithAlias(fieldMetadata *adapt.FieldMetadata) string {
	fieldName := getFieldName(fieldMetadata)
	return fieldName + " AS \"" + fieldMetadata.GetFullName() + "\""
}

func getFieldName(fieldMetadata *adapt.FieldMetadata) string {
	fieldName := fieldMetadata.GetFullName()
	switch fieldMetadata.Type {
	case "CHECKBOX":
		return "(fields->>'" + fieldName + "')::boolean"
	case "TIMESTAMP":
		return "(fields->>'" + fieldName + "')::bigint"
	case "NUMBER":
		return "(fields->>'" + fieldName + "')::numeric"
	case "MAP", "LIST":
		// Return just as bytes
		return "fields->'" + fieldName + "'"
	default:
		// Cast to string
		return "fields->>'" + fieldName + "'"
	}
}

func loadOne(
	ctx context.Context,
	db *sql.DB,
	op *adapt.LoadOp,
	metadata *adapt.MetadataCache,
	ops []adapt.LoadOp,
	tenantID string,
	userTokens []string,
) error {
	collectionMetadata, err := metadata.GetCollection(op.CollectionName)
	if err != nil {
		return err
	}

	nameFieldMetadata, err := collectionMetadata.GetNameField()
	if err != nil {
		return err
	}

	nameFieldDB := getFieldName(nameFieldMetadata)

	fieldMap, referencedCollections, err := adapt.GetFieldsMap(op.Fields, collectionMetadata, metadata)
	if err != nil {
		return err
	}

	fieldIDs, err := fieldMap.GetUniqueDBFieldNames(getFieldNameWithAlias)
	if err != nil {
		return err
	}

	collectionName, err := getDBCollectionName(collectionMetadata, tenantID)
	if err != nil {
		return err
	}

	loadQuery := "SELECT " + strings.Join(fieldIDs, ",") + " FROM public.data WHERE "
	conditionStrings := []string{
		"collection = $1",
	}

	paramCounter := NewParamCounter(2)
	values := []interface{}{
		collectionName,
	}

	for _, condition := range op.Conditions {

		if condition.Type == "SEARCH" {
			searchToken := condition.Value.(string)
			if searchToken == "" {
				continue
			}
			colValeStr := ""
			colValeStr = "%" + fmt.Sprintf("%v", searchToken) + "%"
			conditionStrings = append(conditionStrings, nameFieldDB+" ILIKE "+paramCounter.get())
			values = append(values, colValeStr)
			continue
		}

		fieldMetadata, err := collectionMetadata.GetField(condition.Field)
		if err != nil {
			return err
		}
		fieldName := getFieldName(fieldMetadata)

		conditionValue, err := adapt.GetConditionValue(condition, op, metadata, ops)
		if err != nil {
			return err
		}

		if condition.Operator == "IN" {
			conditionStrings = append(conditionStrings, fieldName+" = ANY("+paramCounter.get()+")")
			values = append(values, pq.Array(conditionValue))
		} else {
			conditionStrings = append(conditionStrings, fieldName+" = "+paramCounter.get())
			values = append(values, conditionValue)
		}
	}

	// UserTokens query
	if collectionMetadata.Access == "protected" {
		conditionStrings = append(conditionStrings, "id IN (SELECT recordid FROM public.tokens WHERE token = ANY("+paramCounter.get()+"))")
		values = append(values, pq.Array(userTokens))
	}

	loadQuery = loadQuery + strings.Join(conditionStrings, " AND ")

	orders := make([]string, len(op.Order))
	for i, order := range op.Order {
		fieldMetadata, err := collectionMetadata.GetField(order.Field)
		if err != nil {
			return err
		}
		fieldName := getFieldName(fieldMetadata)
		if err != nil {
			return err
		}
		if order.Desc {
			orders[i] = fieldName + " desc"
			continue
		}
		orders[i] = fieldName + " asc"
	}

	if len(op.Order) > 0 {
		loadQuery = loadQuery + " order by " + strings.Join(orders, ",")
	}
	if op.BatchSize == 0 || op.BatchSize > adapt.MAX_BATCH_SIZE {
		op.BatchSize = adapt.MAX_BATCH_SIZE
	}
	loadQuery = loadQuery + " limit " + strconv.Itoa(op.BatchSize+1)
	if op.BatchNumber != 0 {
		loadQuery = loadQuery + " offset " + strconv.Itoa(op.BatchSize*op.BatchNumber)
	}

	rows, err := db.Query(loadQuery, values...)
	if err != nil {
		return errors.New("Failed to load rows in PostgreSQL:" + err.Error() + " : " + loadQuery)
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return errors.New("Failed to load columns in PostgreSQL:" + err.Error())
	}

	var item loadable.Item
	index := 0
	scanners := make([]interface{}, len(cols))

	for i, name := range cols {
		scanners[i] = &DataScanner{
			Item:       &item,
			Field:      fieldMap[name],
			References: &referencedCollections,
			Index:      &index,
			BatchSize:  op.BatchSize,
		}
	}

	for rows.Next() {
		item = op.Collection.NewItem()
		err := rows.Scan(scanners...)
		if err != nil {
			return err
		}
		index++
	}
	err = rows.Err()
	if err != nil {
		return err
	}

	// Check to see if we loaded in a full amount
	if op.Collection.Len() == op.BatchSize+1 {
		op.HasMoreBatches = true
		// Remove the last item
		op.Collection.Slice(0, op.BatchSize)
	}

	return adapt.HandleReferences(func(ops []adapt.LoadOp) error {
		return loadMany(ctx, db, ops, metadata, tenantID, userTokens)
	}, op.Collection, referencedCollections)
}

// Load function
func (a *Adapter) Load(ops []adapt.LoadOp, metadata *adapt.MetadataCache, credentials *adapt.Credentials, userTokens []string) error {

	if len(ops) == 0 {
		return nil
	}

	ctx := context.Background()

	db, err := connect(credentials)
	if err != nil {
		return errors.New("Failed to connect PostgreSQL:" + err.Error())
	}

	return loadMany(ctx, db, ops, metadata, credentials.GetTenantID(), userTokens)
}

func loadMany(
	ctx context.Context,
	db *sql.DB,
	ops []adapt.LoadOp,
	metadata *adapt.MetadataCache,
	tenantID string,
	userTokens []string,
) error {
	for i := range ops {
		err := loadOne(ctx, db, &ops[i], metadata, ops, tenantID, userTokens)
		if err != nil {
			return err
		}
	}
	return nil
}
