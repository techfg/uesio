package postgresio

import (
	"fmt"
	"strings"

	"github.com/lib/pq"
	"github.com/thecloudmasters/uesio/pkg/adapt"
)

func idConditionOptimization(condition *adapt.LoadRequestCondition, collectionName string) ([]string, []interface{}, error) {
	if condition.Operator != "IN" {
		return []string{"id = $1"}, []interface{}{fmt.Sprintf("%s:%s", collectionName, condition.Value)}, nil
	}

	values := condition.Value.([]string)
	if len(values) == 1 {
		return []string{"id = $1"}, []interface{}{fmt.Sprintf("%s:%s", collectionName, values[0])}, nil
	}

	appendedValues := make([]string, len(values))
	for i, v := range values {
		appendedValues[i] = fmt.Sprintf("%s:%s", collectionName, v)
	}
	return []string{"id = ANY($1)"}, []interface{}{pq.Array(appendedValues)}, nil
}

func getConditions(
	op *adapt.LoadOp,
	metadata *adapt.MetadataCache,
	collectionMetadata *adapt.CollectionMetadata,
	ops []*adapt.LoadOp,
	tenantID string,
	userTokens []string,
) ([]string, []interface{}, error) {

	collectionName, err := getDBCollectionName(collectionMetadata, tenantID)
	if err != nil {
		return nil, nil, err
	}

	// Shortcut optimization when we only ask for the id field
	if len(op.Conditions) == 1 && op.Conditions[0].Field == "uesio.id" {
		return idConditionOptimization(&op.Conditions[0], collectionName)
	}

	conditionStrings := []string{"collection = $1"}

	paramCounter := NewParamCounter(2)
	values := []interface{}{collectionName}

	for _, condition := range op.Conditions {

		if condition.Type == "SEARCH" {
			nameFieldMetadata, err := collectionMetadata.GetNameField()
			if err != nil {
				return nil, nil, err
			}

			nameFieldDB := getFieldName(nameFieldMetadata)

			searchToken := condition.Value.(string)
			if searchToken == "" {
				continue
			}
			searchFields := map[string]bool{
				nameFieldDB: true,
			}
			for _, field := range condition.SearchFields {
				fieldMetadata, err := collectionMetadata.GetField(field)
				if err != nil {
					return nil, nil, err
				}
				searchFields[getFieldName(fieldMetadata)] = true
			}
			// Split the search token on spaces to tokenize the search
			tokens := strings.Fields(searchToken)
			for _, token := range tokens {
				searchConditions := []string{}
				paramNumber := paramCounter.get()
				for field := range searchFields {
					searchConditions = append(searchConditions, field+" ILIKE "+paramNumber)
				}
				values = append(values, fmt.Sprintf("%%%v%%", token))
				conditionStrings = append(conditionStrings, "("+strings.Join(searchConditions, " OR ")+")")
			}

			continue
		}

		fieldMetadata, err := collectionMetadata.GetField(condition.Field)
		if err != nil {
			return nil, nil, err
		}
		fieldName := getFieldName(fieldMetadata)

		conditionValue, err := adapt.GetConditionValue(condition, op, metadata, ops)
		if err != nil {
			return nil, nil, err
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
	if collectionMetadata.Access == "protected" && userTokens != nil {
		conditionStrings = append(conditionStrings, "id IN (SELECT recordid FROM public.tokens WHERE token = ANY("+paramCounter.get()+"))")
		values = append(values, pq.Array(userTokens))
	}

	return conditionStrings, values, nil
}