package postgresio

import (
	"context"

	"github.com/francoispqt/gojay"
	"github.com/jackc/pgx/v5"
	"github.com/thecloudmasters/uesio/pkg/adapt"
	"github.com/thecloudmasters/uesio/pkg/sess"
)

const INSERT_QUERY = "INSERT INTO public.data (id,uniquekey,owner,createdby,updatedby,createdat,updatedat,collection,tenant,autonumber,fields) VALUES ($1,$2,$3,$4,$5,to_timestamp($6),to_timestamp($7),$8,$9,$10,$11)"
const UPDATE_QUERY = "UPDATE public.data SET uniquekey = $2, owner = $3, createdby = $4, updatedby = $5, createdat = to_timestamp($6), updatedat = to_timestamp($7), fields = fields || $10 WHERE id = $1 and collection = $8 and tenant = $9"
const DELETE_QUERY = "DELETE FROM public.data WHERE id = ANY($1) and collection = $2 and tenant = $3"
const TOKEN_DELETE_QUERY = "DELETE FROM public.tokens WHERE recordid = ANY($1) and collection = $2 and tenant = $3"
const TOKEN_INSERT_QUERY = "INSERT INTO public.tokens (recordid,token,collection,tenant,readonly) VALUES ($1,$2,$3,$4,$5)"

func (c *Connection) Save(request *adapt.SaveOp, session *sess.Session) error {

	db := c.GetClient()

	tenantID := session.GetTenantID()

	readWriteTokens := map[string][]string{}
	readTokens := map[string][]string{}
	resetTokenIDs := []string{}

	collectionName := request.Metadata.GetFullName()

	batch := &pgx.Batch{}

	err := request.LoopChanges(func(change *adapt.ChangeItem) error {

		fieldJSON, err := gojay.MarshalJSONObject(change)
		if err != nil {
			return err
		}

		ownerID, err := change.GetOwnerID()
		if err != nil {
			return err
		}

		createdByID, err := change.GetCreatedByID()
		if err != nil {
			return err
		}

		updatedByID, err := change.GetUpdatedByID()
		if err != nil {
			return err
		}

		createdAt, err := change.GetFieldAsInt(adapt.CREATED_AT_FIELD)
		if err != nil {
			return err
		}

		updatedAt, err := change.GetFieldAsInt(adapt.UPDATED_AT_FIELD)
		if err != nil {
			return err
		}

		fullRecordID := change.IDValue
		uniqueID := change.UniqueKey

		if change.IsNew {
			batch.Queue(INSERT_QUERY, fullRecordID, uniqueID, ownerID, createdByID, updatedByID, createdAt, updatedAt, collectionName, tenantID, change.Autonumber, fieldJSON)
		} else {
			batch.Queue(UPDATE_QUERY, fullRecordID, uniqueID, ownerID, createdByID, updatedByID, createdAt, updatedAt, collectionName, tenantID, fieldJSON)
		}

		if request.Metadata.IsWriteProtected() {
			if !change.IsNew {
				resetTokenIDs = append(resetTokenIDs, fullRecordID)
			}
			readWriteTokens[fullRecordID] = change.ReadWriteTokens
			readTokens[fullRecordID] = change.ReadTokens
		}
		return nil
	})
	if err != nil {
		return err
	}

	deleteCount := len(request.Deletes)
	if deleteCount > 0 {
		deleteIDs := make([]string, deleteCount)
		for i, delete := range request.Deletes {
			deleteIDs[i] = delete.IDValue
			// Delete all tokens associated with deleted records
			resetTokenIDs = append(resetTokenIDs, delete.IDValue)
		}
		batch.Queue(DELETE_QUERY, deleteIDs, collectionName, tenantID)
	}

	if len(resetTokenIDs) > 0 {
		batch.Queue(TOKEN_DELETE_QUERY, resetTokenIDs, collectionName, tenantID)
	}

	if len(readWriteTokens) > 0 {
		for key, tokens := range readWriteTokens {
			for _, token := range tokens {
				batch.Queue(
					TOKEN_INSERT_QUERY,
					key,
					token,
					collectionName,
					tenantID,
					false,
				)
			}
		}
	}

	if len(readTokens) > 0 {
		for key, tokens := range readTokens {
			for _, token := range tokens {
				batch.Queue(
					TOKEN_INSERT_QUERY,
					key,
					token,
					collectionName,
					tenantID,
					true,
				)
			}
		}
	}

	results := db.SendBatch(context.Background(), batch)
	execCount := batch.Len()
	for i := 0; i < execCount; i++ {
		_, err := results.Exec()
		if err != nil {
			results.Close()
			return err
		}
	}
	results.Close()

	return nil
}
