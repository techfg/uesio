import { FunctionComponent } from "react"
import { definition, styles } from "@uesio/ui"

interface TextProps extends definition.UtilityProps {
	text?: string
	element?: string
	color?: string
}

const Link: FunctionComponent<TextProps> = (props) => {
	const { text, element, color } = props
	const classes = styles.useStyles(
		{
			root: {
				...(color && {
					color: props.context.merge(color),
				}),
			},
		},
		props
	)

	const mergedText = props.context.merge(text)
	if (element === "div") {
		return <div className={classes.root}>{mergedText}</div>
	}
	return <span className={classes.root}>{mergedText}</span>
}

export default Link
