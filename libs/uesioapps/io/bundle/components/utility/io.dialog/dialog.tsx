import { forwardRef, FunctionComponent, ReactNode } from "react"
import { definition, styles, component } from "@uesio/ui"
import { GroupUtilityProps } from "../io.group/group"
import { DialogPlainUtilityProps } from "../io.dialogplain/dialogplain"
import { IconButtonUtilityProps } from "../io.iconbutton/iconbutton"

const TitleBar = component.registry.getUtility("io.titlebar")
const IconButton =
	component.registry.getUtility<IconButtonUtilityProps>("io.iconbutton")
const Grid = component.registry.getUtility("io.grid")
const Group = component.registry.getUtility<GroupUtilityProps>("io.group")
const IODialogPlain =
	component.registry.getUtility<DialogPlainUtilityProps>("io.dialogplain")

interface DialogUtilityProps extends definition.UtilityProps {
	onClose?: () => void
	width?: string
	height?: string
	title?: string
	actions?: ReactNode
}

const Dialog: FunctionComponent<DialogUtilityProps> = forwardRef<
	HTMLDivElement,
	DialogUtilityProps
>((props, ref) => {
	const classes = styles.useUtilityStyles(
		{
			root: {
				gridTemplateRows: "auto 1fr auto",
				height: "100%",
			},
			content: {
				padding: "20px",
				overflow: "auto",
			},
		},
		props
	)
	const { context, title, onClose, width, height, children, actions } = props
	return (
		<IODialogPlain
			context={props.context}
			height={height}
			width={width}
			onClose={onClose}
		>
			<Grid className={classes.root} context={context}>
				<TitleBar
					title={title}
					variant="io.dialog"
					context={context}
					actions={
						<IconButton
							icon="close"
							onClick={onClose}
							context={context}
						/>
					}
				/>
				<div ref={ref} className={classes.content}>
					{children}
				</div>
				<Group
					styles={{
						root: {
							justifyContent: "end",
							padding: "20px",
						},
					}}
					context={context}
				>
					{actions}
				</Group>
			</Grid>
		</IODialogPlain>
	)
})
export { DialogUtilityProps }

export default Dialog
