import { FunctionComponent } from "react"
import { definition, api, wire, collection } from "@uesio/ui"
import CheckboxField from "../field/checkbox"
import ToggleField from "../field/toggle"

interface CheckboxFilterProps extends definition.UtilityProps {
	path: string
	wire: wire.Wire
	fieldMetadata: collection.Field
	condition: wire.ValueConditionState
	displayAs?: string
}

const CheckboxFilter: FunctionComponent<CheckboxFilterProps> = (props) => {
	const { wire, fieldMetadata, context, displayAs, condition } = props
	const wireId = wire.getId()

	return displayAs === "TOGGLE" ? (
		<ToggleField
			fieldMetadata={fieldMetadata}
			context={context}
			variant={"uesio/io.filter"}
			value={condition.value || ""}
			setValue={(value: boolean) => {
				api.signal.runMany(
					[
						{
							signal: "wire/SET_CONDITION",
							wire: wireId,
							condition: {
								...condition,
								value,
								active: !!value,
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
	) : (
		<CheckboxField
			context={context}
			variant={"uesio/io.filter"}
			value={condition.value || ""}
			setValue={(value: boolean) => {
				api.signal.runMany(
					[
						{
							signal: "wire/SET_CONDITION",
							wire: wireId,
							condition: {
								...condition,
								value,
								active: !!value,
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

export default CheckboxFilter