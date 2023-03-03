import { api, component, context, wire, definition } from "@uesio/ui"
import { MutableRefObject, useEffect } from "react"

interface DynamicTableProps extends definition.UtilityProps {
	path: string
	fields: Record<string, wire.ViewOnlyField>
	initialValues: Record<string, wire.PlainWireRecord>
	mode?: context.FieldMode
	onUpdate?: (
		field: string,
		value: wire.FieldValue,
		recordId: string,
		record: wire.PlainWireRecord
	) => void
	wireRef?: MutableRefObject<wire.Wire | undefined>
}

const DynamicTable: definition.UtilityComponent<DynamicTableProps> = (
	props
) => {
	const {
		context,
		id,
		fields,
		path,
		onUpdate,
		initialValues,
		wireRef,
		mode,
	} = props

	const dynamicWireName = "dynamicwire:" + id

	const wire = api.wire.useDynamicWire(
		dynamicWireName,
		{
			viewOnly: true,
			fields,
			init: {
				create: false,
			},
		},
		context
	)

	// Set the passed in ref to the wire, so our
	// parent component can use this wire.
	if (wireRef) wireRef.current = wire

	const currentValuesString = JSON.stringify(initialValues)

	useEffect(() => {
		if (!wire || !initialValues) return
		const records = wire.getData()
		if (
			JSON.stringify(records.map((r) => r.source)) === currentValuesString
		)
			return
		if (!records.length) {
			Object.entries(initialValues).forEach(
				([recordId, initialValue]) => {
					wire.createRecord(initialValue, false, recordId)
				}
			)
		}
	}, [!!wire, currentValuesString])

	api.event.useEvent(
		"wire.record.updated",
		(e) => {
			if (!onUpdate || !e.detail || !wire) return
			const { wireId, recordId, field, value, record } = e.detail
			if (wireId !== wire?.getFullId()) return
			onUpdate?.(field, value, recordId, record)
		},
		[wire]
	)

	if (!wire) return null

	return (
		<component.Component
			componentType="uesio/io.table"
			path={path}
			definition={{
				wire: dynamicWireName,
				columns: Object.entries(fields).map(([fieldId, fieldDef]) => ({
					field: fieldId,
					...fieldDef,
				})),
				mode,
				"uesio.id": id,
				"uesio.variant": "uesio/io.default",
			}}
			context={context}
		/>
	)
}

export default DynamicTable