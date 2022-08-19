package controller

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/thecloudmasters/uesio/pkg/logger"
	"github.com/thecloudmasters/uesio/pkg/middleware"
	"github.com/thecloudmasters/uesio/pkg/routing"
)

func BuilderMetadata(w http.ResponseWriter, r *http.Request) {

	session := middleware.GetSession(r)

	vars := mux.Vars(r)
	namespace := vars["namespace"]
	name := vars["name"]

	depsCache, err := routing.GetBuilderDependencies(namespace, name, session)
	if err != nil {
		msg := "Failed Getting Builder Metadata: " + err.Error()
		logger.LogWithTrace(r, msg, logger.ERROR)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	respondJSON(w, r, &depsCache)

}