package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/icza/session"
	"github.com/thecloudmasters/uesio/pkg/bulk"
	"github.com/thecloudmasters/uesio/pkg/logger"
	"github.com/thecloudmasters/uesio/pkg/metadata"
	"github.com/thecloudmasters/uesio/pkg/middlewares"
)

// BatchResponse struct
type BatchResponse struct {
	ID string `json:"id"`
}

// BulkBatch is good
func BulkBatch(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	jobID := vars["job"]

	site := r.Context().Value(middlewares.SiteKey).(*metadata.Site)
	sess := r.Context().Value(middlewares.SessionKey).(*session.Session)

	batchID, err := bulk.NewBatch(r.Body, jobID, site, sess)
	if err != nil {
		msg := "Failed Creating New Batch: " + err.Error()
		logger.LogWithTrace(r, msg, logger.ERROR)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	batchResponse := &BatchResponse{
		ID: batchID,
	}

	err = json.NewEncoder(w).Encode(batchResponse)
	if err != nil {
		logger.LogErrorWithTrace(r, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
