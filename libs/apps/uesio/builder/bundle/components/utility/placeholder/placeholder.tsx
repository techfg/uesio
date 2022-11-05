import { definition, styles } from "@uesio/ui"

import { FC } from "react"

interface T extends definition.UtilityProps {
	isHovering: boolean
	index: number
	label?: string
	message?: string
	hideIfNotLast?: boolean
	direction?: "HORIZONTAL" | "VERTICAL"
}
const PlaceHolder: FC<T> = (props) => {
	const {
		isHovering,
		label = "Empty Component Area",
		message,
		index,
		hideIfNotLast,
		direction,
	} = props

	const isVertical = direction !== "HORIZONTAL"

	const classes = styles.useStyles(
		{
			label: {
				opacity: 0.4,
				fontSize: "0.7em",
				textAlign: "center",
				transition: "all 0.125s ease",
				...(isHovering && {
					opacity: 0.6,
				}),
			},
			message: {
				opacity: 0.3,
				fontSize: "0.6em",
				textAlign: "center",
				padding: "4px",
				transition: "all 0.125s ease",
				...(isHovering && {
					opacity: 0.5,
				}),
			},
			placeholder: {
				borderRadius: "6px",
				border: "1px dashed #eee",
				transition: "all 0.125s ease",
				...(isHovering && {
					border: "1px dashed #ccc",
					backgroundColor: "#e5e5e5",
				}),
				display: "grid",
				alignItems: "center",
				justifyItems: "center",
			},
			wrapper: {
				padding: "6px",
				minWidth: "52px",
				minHeight: "52px",
				display: "grid",
				...(hideIfNotLast && {
					display: "none",
					"&:last-child": {
						display: "grid",
					},
				}),
			},
		},
		props
	)
	return (
		<div
			className={classes.wrapper}
			data-placeholder="true"
			data-index={index}
		>
			<div className={classes.placeholder}>
				{isVertical && (
					<div>
						{label && <div className={classes.label}>{label}</div>}
						{message && (
							<div className={classes.message}>{message}</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default PlaceHolder