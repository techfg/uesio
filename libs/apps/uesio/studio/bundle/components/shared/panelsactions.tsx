import { FunctionComponent } from "react"
import { definition, styles, component, hooks } from "@uesio/ui"

const Button = component.registry.getUtility("uesio/io.button")
const Icon = component.registry.getUtility("uesio/io.icon")

const PanelsActions: FunctionComponent<definition.UtilityProps> = (props) => {
	const { context } = props
	const uesio = hooks.useUesio(props)
	const metadataType = "viewdef"
	const metadataItem = uesio.getViewDefId() || ""
	const localPath = '["panels"]'
	const path = component.path.makeFullPath(
		metadataType,
		metadataItem,
		localPath
	)
	const classes = styles.useStyles(
		{
			wrapper: {
				display: "flex",
				justifyContent: "space-around",
				padding: "8px",
				position: "relative",
				backgroundColor: "#fcfcfc",
			},
		},
		props
	)
	return (
		<div className={classes.wrapper}>
			<Button
				context={context}
				variant="uesio/studio.actionbutton"
				icon={
					<Icon
						context={context}
						icon="add"
						variant="uesio/studio.actionicon"
					/>
				}
				label="New Panel"
				onClick={() =>
					uesio.builder.addDefinitionPair(
						path,
						{
							"uesio.type": "uesio/io.dialog",
							components: [],
						},
						"newpanel" + (Math.floor(Math.random() * 60) + 1),
						"panel"
					)
				}
			/>
		</div>
	)
}
PanelsActions.displayName = "PanelsActions"

export default PanelsActions