import React, { FC, Fragment } from "react"
import { component, definition, hooks } from "@uesio/ui"
import ToolbarTitle from "../toolbartitle"
import ExpandPanel from "../expandpanel/expandpanel"
import PropNodeTag from "../../buildpropitem/propnodetag"
import DragIndicator from "@material-ui/icons/DragIndicator"

interface Props extends definition.BaseProps {
	selectedNode: string
}

interface filteredListInterface {
	namespace: string
	names: string[]
}

const ComponentsToolbar: FC<Props> = (props) => {
	const uesio = hooks.useUesio(props)
	const onDragStart = (e: React.DragEvent) => {
		const target = e.target as HTMLDivElement
		if (target && target.dataset.type) {
			uesio.builder.setDragNode(target.dataset.type)
		}
	}
	const onDragEnd = () => {
		uesio.builder.setDragNode("")
		uesio.builder.setDropNode("")
	}

	const filteredList: Array<filteredListInterface> = []

	component.registry.getBuilderNamespaces().map((namespace: string) => {
		const filteredListItem = {} as filteredListInterface
		filteredListItem.namespace = namespace
		filteredListItem.names = []

		component.registry
			.getBuilderComponents(namespace)
			.map((name: string) => {
				const definition = component.registry.getPropertiesDefinition(
					namespace,
					name
				)
				if (
					definition &&
					definition.traits &&
					definition.traits.includes("uesio.standalone")
				) {
					filteredListItem.names.push(name)
				}
			})
		if (filteredListItem.names.length) {
			filteredList.push(filteredListItem)
		}
	})

	return (
		<Fragment>
			<ToolbarTitle title="Components"></ToolbarTitle>
			<div
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				style={{
					overflow: "auto",
					flex: "1",
				}}
			>
				{filteredList.map(
					(value: filteredListInterface, index: number) => {
						return (
							<ExpandPanel
								title={filteredList[index].namespace}
								defaultExpanded={true}
								key={index}
							>
								<div>
									{filteredList[index].names.map(
										(value: string, indexTag: number) => {
											return (
												<PropNodeTag
													draggable={component.dragdrop.createComponentBankKey(
														filteredList[index]
															.namespace,
														value
													)}
													title={value}
													icon={DragIndicator}
													key={indexTag}
												></PropNodeTag>
											)
										}
									)}
								</div>
							</ExpandPanel>
						)
					}
				)}
			</div>
		</Fragment>
	)
}

export default ComponentsToolbar
