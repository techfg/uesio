package systemdialect

import (
	"errors"
	"strings"

	"github.com/thecloudmasters/uesio/pkg/adapt"
	"github.com/thecloudmasters/uesio/pkg/datasource"
	"github.com/thecloudmasters/uesio/pkg/meta"
	"github.com/thecloudmasters/uesio/pkg/sess"
)

func parseUniquekeyToCollectionKey(uniquekey string) (string, error) {
	//ben/greenlink:dev:companymember to ben/greenlink.companymember
	keyArray := strings.Split(uniquekey, ":")
	if len(keyArray) != 3 {
		return "", errors.New("Invalid Collection Key: " + uniquekey)
	}

	return keyArray[0] + "." + keyArray[2], nil
}

func deleteCollectionFields(request *adapt.SaveOp, connection adapt.Connection, session *sess.Session) error {

	collectionUniqueKeys := []string{}
	for i := range request.Deletes {
		collectionUniqueKey, err := request.Deletes[i].GetOldFieldAsString("uesio/core.uniquekey")
		if err != nil {
			return err
		}
		collectionUniqueKeys = append(collectionUniqueKeys, collectionUniqueKey)
	}

	if len(collectionUniqueKeys) == 0 {
		return nil
	}

	// collection unique keys will be something like "uesio/tests:dev:rare_and_unusual_object",
	// but the "uesio/studio.collection" field for fields will be something like "uesio/tests.rare_and_unusual_object",
	// so we need to parse this
	targetCollections := []string{}
	for _, collectionUniqueKey := range collectionUniqueKeys {
		targetCollection, err := parseUniquekeyToCollectionKey(collectionUniqueKey)
		if err != nil {
			return err
		}
		targetCollections = append(targetCollections, targetCollection)
	}

	if len(targetCollections) == 0 {
		return nil
	}

	fc := meta.FieldCollection{}
	err := datasource.PlatformLoad(&fc, &datasource.PlatformLoadOptions{
		Fields: []adapt.LoadRequestField{
			{
				ID: "uesio/core.id",
			},
		},
		Conditions: []adapt.LoadRequestCondition{
			{
				Field:    "uesio/studio.collection",
				Values:   targetCollections,
				Operator: "IN",
			},
		},
		Connection: connection,
	}, session)
	if err != nil {
		return err
	}

	delIds := adapt.Collection{}
	fc.Loop(func(item meta.Item, _ string) error {
		fieldId, err := item.GetField(adapt.ID_FIELD)
		if err != nil {
			return err
		}

		fieldIdAsString, ok := fieldId.(string)
		if !ok {
			return errors.New("Delete id must be a string")
		}

		delIds = append(delIds, &adapt.Item{
			adapt.ID_FIELD: fieldIdAsString,
		})

		return nil
	})

	if len(delIds) == 0 {
		return nil
	}

	return datasource.SaveWithOptions([]datasource.SaveRequest{
		{
			Collection: "uesio/studio.field",
			Wire:       "RunCollectionAfterSaveBot",
			Deletes:    &delIds,
		},
	}, session, datasource.GetConnectionSaveOptions(connection))

}

func runCollectionAfterSaveBot(request *adapt.SaveOp, connection adapt.Connection, session *sess.Session) error {

	return deleteCollectionFields(request, connection, session)

	// I'm actually not sure we want to do this at all.
	// Maybe this functionality could be part of a generator.
	// This will cause all deployments to auto-create name fields,
	// Which for some collections, this is not what we want.
	//return nil
	/*
		var workspaceID string

		fieldChanges := adapt.Collection{}
		collectionChanges := adapt.Collection{}

		err := request.LoopChanges(func(change *adapt.ChangeItem) error {

			err := checkWorkspaceID(&workspaceID, change)
			if err != nil {
				return err
			}

			name, err := change.GetFieldAsString("uesio/studio.name")
			if err != nil {
				return err
			}

			//Creates Default Name Field for collection
			if change.IsNew {

				//TO-DO Nice way of doing
				idParts := strings.Split(workspaceID, "_")
				fieldCollection := idParts[0] + "." + name
				fieldItem := adapt.Item{
					"uesio/studio.name":       "name",
					"uesio/studio.type":       "TEXT",
					"uesio/studio.label":      "Name",
					"uesio/studio.collection": fieldCollection,
					"uesio/studio.workspace": map[string]interface{}{
						"uesio/core.id": workspaceID,
					},
				}

				fieldChanges = append(fieldChanges, fieldItem)

				namefield := idParts[0] + ".name"
				collectionItem := adapt.Item{
					"uesio/studio.namefield": namefield,
					"uesio/core.id":          change.IDValue,
				}

				collectionChanges = append(collectionChanges, collectionItem)
			}

			return nil
		})
		if err != nil {
			return err
		}

		return SaveWithOptions([]SaveRequest{
			{
				Collection: "uesio/studio.field",
				Wire:       "defaultnamefield",
				Changes:    &fieldChanges,
			},
			{
				Collection: "uesio/studio.collection",
				Wire:       "defaultnamefieldcoll",
				Changes:    &collectionChanges,
			},
		}, session, GetConnectionSaveOptions(connection))
	*/

}
