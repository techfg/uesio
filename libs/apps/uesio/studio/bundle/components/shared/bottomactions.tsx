import { FunctionComponent } from "react"
import { definition, component, hooks, styles } from "@uesio/ui"

const Button = component.getUtility("uesio/io.button")
const Icon = component.getUtility("uesio/io.icon")
const Group = component.getUtility("uesio/io.group")

const BottomActions: FunctionComponent<definition.UtilityProps> = (props) => {
	const { context } = props
	const uesio = hooks.useUesio(props)

	const classes = styles.useUtilityStyles(
		{
			root: {
				position: "absolute",
				bottom: "2px",
				right: "26px",
				left: "26px",
			},
			right: {
				justifyContent: "right",
			},
		},
		props
	)

	const toggleCode = uesio.signal.getHandler([
		{
			signal: "component/uesio/studio.runtime/TOGGLE_CODE",
		},
	])

	hooks.useHotKeyCallback("command+y", () => {
		toggleCode?.()
	})

	return (
		<div className={classes.root}>
			<Group
				className={classes.right}
				alignItems="right"
				context={context}
			>
				<Button
					context={props.context}
					label=""
					icon={<Icon context={context} icon="wysiwyg" />}
					variant="uesio/studio.minoricontoolbar"
					onClick={() => {
						uesio.signal.run(
							{ signal: "route/REDIRECT_TO_VIEW_CONFIG" },
							props.context
						)
					}}
				/>
				<Button
					context={props.context}
					label=""
					icon={<Icon context={context} icon="view_quilt" />}
					variant="uesio/studio.minoricontoolbar"
					onClick={() => {
						const workspace = props.context.getWorkspace()
						if (!workspace) {
							return
						}

						uesio.signal.run(
							{
								signal: "route/REDIRECT",
								path: `/app/${workspace.app}/workspace/${workspace.name}/views`,
							},
							props.context
						)
					}}
				/>
				<Button
					context={context}
					label=""
					icon={<Icon context={context} icon="code" />}
					variant="uesio/studio.minoricontoolbar"
					onClick={toggleCode}
				/>
			</Group>
		</div>
	)
}
BottomActions.displayName = "BottomActions"
export default BottomActions