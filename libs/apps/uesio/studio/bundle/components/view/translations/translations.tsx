import { FunctionComponent } from "react"
import { definition, hooks, wire } from "@uesio/ui"

import TranslationItem from "./translationitem"

type TranslationDefinition = {
	fieldId: string
}

interface Props extends definition.BaseProps {
	definition: TranslationDefinition
}

const Translation: FunctionComponent<Props> = (props) => {
	const { context, definition } = props
	const uesio = hooks.useUesio(props)
	const { fieldId } = definition
	const wire = context.getWire()
	const record = context.getRecord()
	const view = context.getView()

	let newContext = props.context

	if (!wire || !fieldId || !record) {
		return null
	}

	const workspaceName = view?.params?.workspacename
	const appName = view?.params?.app

	if (appName) {
		if (workspaceName) {
			newContext = context.addFrame({
				workspace: {
					name: workspaceName,
					app: appName,
				},
			})
		}
	}

	const originalValue = record.getFieldValue<wire.PlainWireRecord>(fieldId)
	const namespaces = uesio.builder.useAvailableNamespaces(newContext, "LABEL")

	if (!namespaces) return null

	return (
		<>
			{Object.keys(namespaces || {}).map((entry) => (
				<TranslationItem
					key={entry}
					value={originalValue}
					namespace={entry}
					context={newContext}
					setValue={(value: wire.PlainWireRecord): void => {
						record.update(fieldId, value)
					}}
				/>
			))}
		</>
	)
}

export default Translation