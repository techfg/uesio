import { definition, component, wire } from "@uesio/ui"
import CloneKeyAction from "../../actions/clonekeyaction"
import DeleteAction from "../../actions/deleteaction"
import MoveActions from "../../actions/moveactions"
import { FullPath } from "../../api/path"
import { setSelectedPath, useSelectedPath } from "../../api/stateapi"
import BuildActionsArea from "../../helpers/buildactionsarea"
import PropertiesForm from "../../helpers/propertiesform"
import PropNodeTag from "../../utilities/propnodetag/propnodetag"
import PropertiesWrapper from "../../components/mainwrapper/propertiespanel/propertieswrapper"

export type PropertiesGetter = (
	item: wire.PlainWireRecord
) => component.ComponentProperty[]

export type PropertiesListOrGetter =
	| component.ComponentProperty[]
	| PropertiesGetter

type Props = {
	displayTemplate: string
	parentPath: FullPath
	itemProperties?: PropertiesListOrGetter
	itemPropertiesPanelTitle?: string
} & definition.UtilityComponent

const ListPropertyItem: definition.UtilityComponent<Props> = (props) => {
	const {
		context,
		parentPath,
		displayTemplate,
		itemProperties,
		itemPropertiesPanelTitle,
	} = props

	const record = context.getRecord()
	const index = context.getRecordDataIndex(record)
	const IOExpandPanel = component.getUtility("uesio/io.expandpanel")

	const viewDefId = context.getViewDefId() || ""
	if (!viewDefId || !record) return null

	const selectedPath = useSelectedPath(context)
	const listItemPath = parentPath.addLocal(`${index}`)
	const selected = selectedPath && selectedPath.equals(listItemPath)

	return (
		<PropNodeTag
			onClick={() => setSelectedPath(context, listItemPath)}
			selected={selected}
			context={context}
			popperChildren={
				itemProperties && (
					<PropertiesWrapper
						context={context}
						// className={props.className}
						path={listItemPath}
						title={itemPropertiesPanelTitle || "Properties"}
						onUnselect={() => setSelectedPath(context, parentPath)}
					>
						<PropertiesForm
							id={listItemPath.combine()}
							path={listItemPath}
							context={context}
							properties={
								typeof itemProperties === "function"
									? itemProperties(record.source)
									: itemProperties
							}
						/>
					</PropertiesWrapper>
				)
			}
		>
			<div className="tagroot">{context.merge(displayTemplate)}</div>
			<IOExpandPanel context={context} expanded={selected}>
				<BuildActionsArea context={context}>
					<DeleteAction context={context} path={listItemPath} />
					<MoveActions context={context} path={listItemPath} />
					<CloneKeyAction context={context} path={listItemPath} />
				</BuildActionsArea>
			</IOExpandPanel>
		</PropNodeTag>
	)
}

export default ListPropertyItem