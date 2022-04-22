package controller

import (
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/thecloudmasters/uesio/pkg/adapt"
	"github.com/thecloudmasters/uesio/pkg/datasource"
	"github.com/thecloudmasters/uesio/pkg/logger"
	"github.com/thecloudmasters/uesio/pkg/middleware"
)

func Rest(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	collectionNamespace := vars["namespace"]
	collectionName := vars["name"]

	fields := []adapt.LoadRequestField{
		{
			ID: adapt.ID_FIELD,
		},
	}

	queryFields, ok := r.URL.Query()["fields"]
	if ok {
		for _, fieldList := range queryFields {
			fieldArray := strings.Split(fieldList, ",")
			for _, field := range fieldArray {
				fields = append(fields, adapt.LoadRequestField{
					ID: field,
				})
			}
		}
	}

	session := middleware.GetSession(r)

	op := &adapt.LoadOp{
		WireName:       "RestWire",
		CollectionName: collectionNamespace + "." + collectionName,
		Collection:     &adapt.Collection{},
		Fields:         fields,
		Query:          true,
	}

	_, err := datasource.Load([]*adapt.LoadOp{op}, session, nil)
	if err != nil {
		msg := "Load Failed: " + err.Error()
		logger.LogWithTrace(r, msg, logger.ERROR)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	respondJSON(w, r, op.Collection)

}