import { forwardRef, FunctionComponent } from "react"
import { definition, styles } from "@uesio/ui"

const minPagePadding = "40px"

interface DialogPlainUtilityProps extends definition.UtilityProps {
	onClose?: () => void
	width?: string
	height?: string
}

const DialogPlain: FunctionComponent<DialogPlainUtilityProps> = forwardRef<
	HTMLDivElement,
	DialogPlainUtilityProps
>((props, ref) => {
	const classes = styles.useUtilityStyles(
		{
			blocker: {
				position: "fixed",
				top: 0,
				bottom: 0,
				height: "100%",
				width: "100%",
				backdropFilter: "grayscale(50%) blur(5px) brightness(50%)",
			},
			root: {
				position: "absolute",
				top: 0,
				bottom: 0,
				height: "100%",
				width: "100%",
				display: "grid",
				gridTemplateColumns: `minmax(${minPagePadding},1fr) minmax(auto,${
					props.width || "100%"
				}) minmax(${minPagePadding},1fr)`,
				gridTemplateRows: `minmax(${minPagePadding},1fr) minmax(auto,${
					props.height || "100%"
				}) minmax(${minPagePadding},1fr)`,
				pointerEvents: "none",
			},
			inner: {
				boxShadow: "0 0 20px #0005",
				borderRadius: "4px",
				backgroundColor: "white",
				gridRow: "2 / 3",
				gridColumn: "2 / 3",
				pointerEvents: "auto",
			},
		},
		props
	)
	return (
		<>
			<div className={classes.blocker} onClick={props.onClose} />
			<div className={classes.root}>
				<div className={classes.inner} ref={ref}>
					{props.children}
				</div>
			</div>
		</>
	)
})

export { DialogPlainUtilityProps }

export default DialogPlain
