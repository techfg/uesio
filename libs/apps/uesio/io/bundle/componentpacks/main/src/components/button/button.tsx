import { api, styles, component, signal, definition } from "@uesio/ui"
import { useState } from "react"
import { default as IOButton } from "../../utilities/button/button"
import Icon from "../../utilities/icon/icon"

type ButtonDefinition = {
	text?: string
	icon?: string
	signals?: signal.SignalDefinition[]
	hotkey?: string
}

const Button: definition.UC<ButtonDefinition> = (props) => {
	const { definition, context } = props
	const classes = styles.useStyleTokens(
		{
			root: [],
			label: [],
			selected: [],
			icon: [],
		},
		props
	)
	const isSelected = component.shouldHaveClass(
		context,
		"selected",
		definition
	)

	const [isPending, setPending] = useState<boolean>(false)

	let { signals } = definition

	// If we have a custom slot context, don't run signals.
	// TODO: Move this out of runtime, and add a way TO run the signals via a Keyboard Shortcut
	// or via a property on the button Definition.
	const slotWrapper = context.getCustomSlot()
	if (slotWrapper) {
		signals = []
	}

	const [link, handler] = api.signal.useLinkHandler(
		signals,
		context,
		setPending
	)

	api.signal.useRegisterHotKey(definition.hotkey, signals, context)

	return (
		<IOButton
			id={api.component.getComponentIdFromProps(props)}
			variant={definition["uesio.variant"]}
			classes={classes}
			disabled={isPending}
			label={definition.text}
			link={link}
			onClick={handler}
			context={context}
			isSelected={isSelected}
			icon={
				definition.icon ? (
					<Icon
						classes={{
							root: classes.icon,
						}}
						context={context}
						icon={context.mergeString(definition.icon)}
					/>
				) : undefined
			}
		/>
	)
}

export default Button
