import { FunctionComponent } from "react"
import { definition, api, wire, collection } from "@uesio/ui"
import ReferenceField, { ReferenceFieldOptions } from "../field/reference"

interface ReferenceFilterProps extends definition.UtilityProps {
	path: string
	wire: wire.Wire
	fieldMetadata: collection.Field
	condition: wire.ValueConditionState
	options?: ReferenceFieldOptions
}

const ReferenceFilter: FunctionComponent<ReferenceFilterProps> = (props) => {
	const { wire, fieldMetadata, context, condition, options, path } = props
	const wireId = wire.getId()
	return (
		<ReferenceField
			path={path}
			mode={"EDIT"}
			fieldId={fieldMetadata.getId()}
			fieldMetadata={fieldMetadata}
			context={context}
			variant={"uesio/io.filter"}
			options={options}
			setValue={(value: wire.PlainWireRecord) => {
				api.signal.runMany(
					[
						{
							signal: "wire/SET_CONDITION",
							wire: wireId,
							condition: {
								...condition,
								value: value
									? value[collection.ID_FIELD]
									: null,
								inactive: value === null,
							},
						},
						{
							signal: "wire/LOAD",
							wires: [wireId],
						},
					],
					context
				)
			}}
		/>
	)
}

export default ReferenceFilter