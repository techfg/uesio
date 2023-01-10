import { FunctionComponent } from "react"
import { definition, api } from "@uesio/ui"
import ConfigFeatureFlagsItem from "./configfeatureflagsitem"

type ConfigFeatureFlagsDefinition = {
	user: string
}
interface Props extends definition.BaseProps {
	definition: ConfigFeatureFlagsDefinition
}

const ConfigFeatureFlags: FunctionComponent<Props> = (props) => {
	const { context, definition } = props
	const user = definition?.user ? context.mergeString(definition?.user) : ""

	const [values] = api.featureflag.useFeatureFlags(context, user)

	if (!values) {
		return null
	}

	const handleSet = async (key: string, value: boolean) => {
		await api.featureflag.set(context, key, value, user)
	}

	return (
		<>
			{values?.map((response, i) => {
				const key = `${response.namespace}.${response.name}`
				const value = response.value
				return (
					<ConfigFeatureFlagsItem
						key={`${key}.${i}`}
						title={key}
						value={value}
						context={context}
						handleSet={handleSet}
					/>
				)
			})}
		</>
	)
}

export default ConfigFeatureFlags
