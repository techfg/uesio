import React, { FunctionComponent, memo } from "react"
import { ButtonProps, ButtonDefinition } from "./buttondefinition"
import Button from "./button"
import ComponentMask from "./componentmask"
import { hooks } from "@uesio/ui"
import * as material from "@material-ui/core"

const useStyles = material.makeStyles(() =>
	material.createStyles({
		root: {
			position: "relative",
		},
	})
)

const ButtonBuilder: FunctionComponent<ButtonProps> = (props) => {
	const classes = useStyles()
	const uesio = hooks.useUesio(props)
	const definition = uesio.view.useDefinition(props.path) as ButtonDefinition

	return (
		<div className={classes.root}>
			<Button {...props} definition={definition} />
			<ComponentMask />
		</div>
	)
}

export default memo(ButtonBuilder, (oldProps, newProps) => {
	const sameDefinition = oldProps.definition === newProps.definition
	const sameIndex = oldProps.index === newProps.index
	const samePath = oldProps.path === newProps.path
	return sameDefinition && sameIndex && samePath
})
