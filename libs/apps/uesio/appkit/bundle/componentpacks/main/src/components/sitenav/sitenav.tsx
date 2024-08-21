import { component, definition } from "@uesio/ui"
import groupBy from "lodash/groupBy"

const getAssignmentButton = (
	collection: string,
	icon: string,
	viewtype: string
) => ({
	"uesio/io.button": {
		"uesio.variant": "uesio/appkit.navicon_small",
		icon,
		signals: [
			{
				signal: "route/NAVIGATE_TO_ASSIGNMENT",
				preventLinkTag: true,
				collection,
				viewtype,
			},
		],
	},
})

type SiteNavDefinition = {
	title?: string
	excludeCollections?: string[]
}

const SiteNav: definition.UC<SiteNavDefinition> = (props) => {
	const { context, path, definition } = props

	const routeAssignments = context.getRouteAssignments()

	const assignmentsByCollection = groupBy(routeAssignments, "collection")

	return (
		<component.Component
			path={path}
			context={context}
			componentType="uesio/io.navsection"
			definition={{
				title: definition.title,
				content: Object.entries(assignmentsByCollection).map(
					([collection, assignments]) => {
						if (
							definition.excludeCollections &&
							definition.excludeCollections.includes(collection)
						) {
							return null
						}
						const assignmentsByType = groupBy(assignments, "type")
						const listAssignment = assignmentsByType.list?.[0]
						const createNewAssignment =
							assignmentsByType.createnew?.[0]
						const consoleAssignment = assignmentsByType.console?.[0]
						const primaryAssignment =
							listAssignment || assignments[0]

						return {
							"uesio/appkit.icontile": {
								tileVariant: "uesio/io.nav",
								title: primaryAssignment.collectionPluralLabel,
								icon:
									primaryAssignment.collectionIcon ||
									"view_list",
								signals: listAssignment
									? [
											{
												signal: "route/NAVIGATE_TO_ASSIGNMENT",
												collection,
											},
										]
									: undefined,
								actions: [
									...(consoleAssignment
										? [
												getAssignmentButton(
													collection,
													"dock_to_right",
													"console"
												),
											]
										: []),
									...(createNewAssignment
										? [
												getAssignmentButton(
													collection,
													"add",
													"createnew"
												),
											]
										: []),
								],
							},
						}
					}
				),
			}}
		/>
	)
}

export default SiteNav
