package controller

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/gorilla/mux"
	"github.com/thecloudmasters/uesio/pkg/adapt"
	"github.com/thecloudmasters/uesio/pkg/datasource"
	"github.com/thecloudmasters/uesio/pkg/logger"
	"github.com/thecloudmasters/uesio/pkg/middleware"
)

func getUesioOperatorFromPostgrestOperator(pgOp string) string {
	switch pgOp {
	case "eq":
		return "EQ"
	case "neq":
		return "NOT_EQ"
	case "lt":
		return "LT"
	case "lte":
		return "LTE"
	case "gt":
		return "GT"
	case "gte":
		return "GTE"
	case "in":
		return "IN"
	}
	return "EQ"
}

func parseConditionFromQueryValue(paramName string, paramValue string) adapt.LoadRequestCondition {

	// partial implementation of PostgREST Horizontal Filtering specification
	// https://postgrest.org/en/stable/api.html#horizontal-filtering-rows
	parts := strings.Split(paramValue, ".")
	var operator string
	var value string
	if len(parts) == 1 {
		operator = "EQ"
		value = parts[0]
	} else {
		operator = getUesioOperatorFromPostgrestOperator(parts[0])
		value = parts[1]
	}
	var useValue interface{}
	// Special value handling
	if operator == "IN" {
		// PostgREST expects values to be in format:  (1,2,3)
		// so we need to split
		useValue =
			strings.Split(strings.TrimSuffix(strings.TrimPrefix(value, "("), ")"), ",")
	} else {
		useValue = value
	}

	return adapt.LoadRequestCondition{
		Field:       paramName,
		Value:       useValue,
		ValueSource: "VALUE",
		Type:        "fieldValue",
		Operator:    operator,
	}
}

func parseLoadRequestConditionsFromQueryValues(values url.Values) []adapt.LoadRequestCondition {
	conditions := []adapt.LoadRequestCondition{}
	for queryField, values := range values {
		// Only support a single query string value per param name,
		// i.e. with "foo=bar&foo=baz" we would ignore foo=baz
		conditions = append(conditions, parseConditionFromQueryValue(queryField, values[0]))
	}
	return conditions
}

func DeleteRecordApi(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	collectionNamespace := vars["namespace"]
	collectionName := vars["name"]

	fields := []adapt.LoadRequestField{
		{
			ID: adapt.ID_FIELD,
		},
	}
	conditions := parseLoadRequestConditionsFromQueryValues(r.URL.Query())
	session := middleware.GetSession(r)

	useCollectionName := collectionNamespace + "." + collectionName

	collection := &adapt.Collection{}

	op := &adapt.LoadOp{
		WireName:       "query",
		CollectionName: useCollectionName,
		Collection:     collection,
		Fields:         fields,
		Conditions:     conditions,
		Query:          true,
	}

	_, err := datasource.Load([]*adapt.LoadOp{op}, session, nil)

	if err != nil {
		msg := "Error querying collection records to delete: " + err.Error()
		logger.LogWithTrace(r, msg, logger.ERROR)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	saveRequests := []datasource.SaveRequest{{
		Collection: useCollectionName,
		Wire:       "save",
		Deletes:    collection,
	}}
	err = datasource.Save(saveRequests, session)
	err = datasource.HandleSaveRequestErrors(saveRequests, err)
	if err != nil {
		msg := "Delete failed: " + err.Error()
		logger.LogWithTrace(r, msg, logger.ERROR)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	// TODO: optionally respond with a representation of the deleted content
	w.WriteHeader(204)
	//file.RespondJSON(w, r, op.Collection)

}