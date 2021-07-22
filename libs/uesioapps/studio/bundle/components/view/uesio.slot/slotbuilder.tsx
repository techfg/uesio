import { definition, component, hooks, styles } from "@uesio/ui"
import { FunctionComponent, DragEvent } from "react"
import {
	handleDrop,
	getDropIndex,
	isDropAllowed,
	isNextSlot,
} from "../../shared/dragdrop"

type SlotDefinition = {
	items: definition.DefinitionList
	accepts: string[]
	direction?: string
}

interface SlotProps extends definition.BaseProps {
	definition: SlotDefinition
}

const SlotBuilder: FunctionComponent<SlotProps> = (props) => {
	const {
		definition: { accepts, direction },
		path,
		context,
	} = props

	const items = props.definition.items || []

	const uesio = hooks.useUesio(props)

	const [dragType, dragItem, dragPath] = uesio.builder.useDragNode()
	const [dropType, dropItem, dropPath] = uesio.builder.useDropNode()
	const fullDragPath = component.path.makeFullPath(
		dragType,
		dragItem,
		dragPath
	)
	const isStructureView = uesio.builder.useIsStructureView()

	const size = items.length

	const viewDefId = context.getViewDefId()

	if (!path || !viewDefId) return null

	const isDragging = !!dragType && !!dragItem

	const onDragOver = (e: DragEvent) => {
		let target = e.target as Element | null
		if (!isDropAllowed(accepts, fullDragPath)) {
			return
		}
		e.preventDefault()
		e.stopPropagation()

		while (
			target !== null &&
			target !== e.currentTarget &&
			target?.parentElement !== e.currentTarget
		) {
			target = target?.parentElement || null
		}

		const isCoverall = !!target?.getAttribute("data-coverall")
		// Find the direct child
		if (target === e.currentTarget || isCoverall) {
			if (size === 0) {
				uesio.builder.setDropNode("viewdef", viewDefId, `${path}["0"]`)
			}
		}

		const dataIndex = target?.getAttribute("data-index")

		if (target?.parentElement === e.currentTarget && dataIndex) {
			const index = parseInt(dataIndex, 10)
			const bounds = target.getBoundingClientRect()
			const dropIndex = isNextSlot(
				bounds,
				direction || "vertical",
				e.pageX,
				e.pageY
			)
				? index + 1
				: index
			let usePath = `${path}["${dropIndex}"]`

			if (usePath === component.path.getParentPath(dragPath)) {
				// Don't drop on ourselfs, just move to the next index
				usePath = `${path}["${dropIndex + 1}"]`
			}

			if (usePath !== dropPath) {
				uesio.builder.setDropNode("viewdef", viewDefId, usePath)
			}
		}
	}

	const onDrop = (e: DragEvent) => {
		if (!isDropAllowed(accepts, fullDragPath)) {
			return
		}
		e.preventDefault()
		e.stopPropagation()
		const index = component.path.getIndexFromPath(dropPath) || 0
		const fullDropPath = component.path.makeFullPath(
			"viewdef",
			viewDefId,
			path
		)
		handleDrop(
			fullDragPath,
			fullDropPath,
			getDropIndex(fullDragPath, fullDropPath, index),
			uesio
		)
	}

	const classes = styles.useStyles(
		{
			root: {
				display: "contents",
			},
			coverall: {
				...(size > 0 && {
					position: "absolute",
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
				}),
				...(size === 0 &&
					isDropAllowed(accepts, fullDragPath) && {
						minWidth: "40px",
						minHeight: "40px",
					}),
				...(size === 0 &&
					dropPath === `${path}["0"]` && {
						border: "1px dashed #ccc",
						backgroundColor: "#e5e5e5",
					}),
			},
		},
		props
	)

	return (
		<div onDragOver={onDragOver} onDrop={onDrop} className={classes.root}>
			{isDragging && isStructureView && (
				<div className={classes.coverall} data-coverall="true" />
			)}
			{items.map((itemDef, index) => {
				const [componentType, unWrappedDef] =
					component.path.unWrapDefinition(itemDef)
				return (
					<component.Component
						definition={unWrappedDef}
						componentType={componentType}
						index={index}
						path={`${path}["${index}"]`}
						context={context}
					/>
				)
			})}
		</div>
	)
}

export default SlotBuilder
