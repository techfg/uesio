import { definition, component, hooks } from "@uesio/ui"
import React, { ReactElement, SyntheticEvent } from "react"
import BuildBorder from "../buildborder/buildborder"
import { makeStyles, createStyles } from "@material-ui/core"
import { handleDrop, getDropIndex, isDropAllowed, isNextSlot } from "./dragdrop"

interface SlotItemProps extends definition.BaseProps {
	isExpanded: boolean
	direction: string
	size: number
	accepts: string[]
	dragNode: string
	dropNode: string
}

const useStyles = makeStyles(() =>
	createStyles({
		root: {
			userSelect: "none",
			position: "relative",
			transition: "max-height 0.2s ease, max-width 0.2s ease",
		},
		horizontal: {
			display: "flex",
			width: "unset",
			"&$expanded": {
				padding: "0px 8px 0px 0px",
			},
			"&$isLast": {
				padding: "0",
			},
		},
		vertical: {
			display: "block",
			width: "100%",
			"&$expanded": {
				padding: "0px 0px 8px 0px",
			},
			"&$isLast": {
				padding: "0",
			},
		},
		expanded: {},
		isLast: {},
		isDragging: {
			"&$vertical::before": {
				display: "block",
			},
			"&$horizontal::before": {
				display: "flex",
				width: "0px",
				alignSelf: "stretch",
			},
			"&::before": {
				content: "''",
				transition: "padding 0.2s ease",
			},
			maxHeight: "100%",
			maxWidth: "100%",
		},
		placeHolder: {
			"&$vertical::before": {
				paddingTop: "40px",
				marginBottom: "8px",
			},
			"&$horizontal::before": {
				paddingLeft: "120px",
				marginRight: "8px",
			},
			"&::before": {
				backgroundColor: "#f4f4f4",
				border: "1px solid #EEE",
			},
		},
	})
)

function SlotItem(props: SlotItemProps): ReactElement | null {
	const wrapperPath = props.path
	const index = props.index || 0
	const path = `${wrapperPath}["${index}"]`
	const context = props.context
	const direction = props.direction
	const definition = props.definition as definition.DefinitionMap
	const defKey = component.path.getDefinitionKey(definition)
	const fullPath = `${path}["${defKey}"]`
	const dropNode = props.dropNode
	const dragNode = props.dragNode
	const accepts = props.accepts

	const uesio = hooks.useUesio(props)
	const nodeState = uesio.builder.useNodeState(fullPath)
	const isActive = nodeState === "active" || nodeState === "activeChild"
	const isSelected = nodeState === "selected" || nodeState === "selectedChild"
	const isExpanded = props.isExpanded
	const size = props.size || 0
	const isLast = index === size - 1

	const propDef = component.registry.getPropertiesDefinitionFromPath(fullPath)

	const addPlaceholder = path === dropNode

	const classes = useStyles(props)
	const classNames = [classes.root]

	if (!!dragNode) {
		classNames.push(classes.isDragging)
	}

	if (addPlaceholder) {
		classNames.push(classes.placeHolder)
	}

	if (isExpanded) {
		classNames.push(classes.expanded)
	}

	if (isLast) {
		classNames.push(classes.isLast)
	}

	classNames.push(
		direction === "horizontal" ? classes.horizontal : classes.vertical
	)

	const onDragOver = (e: React.DragEvent) => {
		if (!isDropAllowed(accepts, dragNode)) {
			return
		}
		e.preventDefault()
		e.stopPropagation()
		const currentTarget = e.currentTarget as HTMLDivElement
		const bounds = currentTarget.getBoundingClientRect()
		const dropIndex = isNextSlot(bounds, direction, e.pageX, e.pageY)
			? index + 1
			: index
		let usePath = `${wrapperPath}["${dropIndex}"]`

		if (usePath === component.path.getParentPath(dragNode)) {
			// Don't drop on ourselfs, just move to the next index
			usePath = `${wrapperPath}["${dropIndex + 1}"]`
		}

		if (usePath !== dropNode) {
			uesio.builder.setDropNode(usePath)
		}
	}

	const onDragStart = (e: React.DragEvent) => {
		const target = e.target as HTMLDivElement
		setTimeout(() => {
			target.style.visibility = "hidden"
			target.style.maxHeight = "0px"
			target.style.maxWidth = "0px"
			target.style.padding = "0px"
			target.style.margin = "0px"
		}, 1)
	}

	const onDragEnd = (e: React.DragEvent) => {
		const target = e.target as HTMLDivElement
		target.style.removeProperty("visibility")
		target.style.removeProperty("max-height")
		target.style.removeProperty("max-width")
		target.style.removeProperty("padding")
		target.style.removeProperty("margin")
		uesio.builder.setDragNode("")
		uesio.builder.setDropNode("")
	}

	const onDrop = (e: React.DragEvent) => {
		if (!isDropAllowed(accepts, dragNode)) {
			return
		}
		e.preventDefault()
		e.stopPropagation()
		const currentTarget = e.currentTarget as HTMLDivElement
		const bounds = currentTarget.getBoundingClientRect()
		const halfWay = bounds.y + bounds.height / 2
		const dropIndex = e.pageY < halfWay ? index : index + 1

		handleDrop(
			dragNode,
			wrapperPath,
			getDropIndex(dragNode, wrapperPath, dropIndex),
			uesio
		)
	}

	return (
		<div
			onDragOver={onDragOver}
			onDrop={onDrop}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			className={classNames.join(" ")}
			draggable={dragNode === fullPath}
		>
			<BuildBorder
				{...{
					isExpanded,
					isActive,
					isSelected,
					onClick: (event: SyntheticEvent): void => {
						!isSelected && uesio.builder.setSelectedNode(fullPath)
						event.stopPropagation()
					},
					onMouseEnter: (): void => {
						!isActive && uesio.builder.setActiveNode(fullPath)
					},
					onMouseLeave: (): void => {
						isActive && uesio.builder.setActiveNode("")
					},
					setDragging: (): void => {
						if (dragNode !== fullPath) {
							uesio.builder.setDragNode(fullPath)
						}
					},
					title: propDef ? propDef.title : "Unknown",
				}}
			>
				{component.create(definition, index, path, context)}
			</BuildBorder>
		</div>
	)
}

export default SlotItem
