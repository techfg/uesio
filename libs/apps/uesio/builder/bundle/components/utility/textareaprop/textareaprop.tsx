import { component, builder } from "@uesio/ui"

const TextAreaField = component.getUtility("uesio/io.textareafield")
const FieldWrapper = component.getUtility("uesio/io.fieldwrapper")

const TextAreaProp: builder.PropComponent<builder.TextAreaProp> = ({
	descriptor,
	valueAPI,
	context,
	path,
}) => (
	<FieldWrapper
		labelPosition="top"
		label={descriptor.label}
		context={context}
		variant="uesio/builder.propfield"
	>
		<TextAreaField
			variant="uesio/io.field:uesio/builder.propfield"
			value={valueAPI.get(path)}
			setValue={(value: string) => valueAPI.set(path, value)}
			context={context}
		/>
	</FieldWrapper>
)

export default TextAreaProp