import { definition, builder } from "@uesio/ui"

type GroupDefinition = {
	columnGap: string
	components?: definition.DefinitionList
}

interface GroupProps extends definition.BaseProps {
	definition: GroupDefinition
}

const GroupPropertyDefinition: builder.BuildPropertiesDefinition = {
	title: "Group",
	defaultDefinition: () => ({}),
	properties: [],
	sections: [],
	actions: [],
}
export { GroupProps, GroupDefinition }

export default GroupPropertyDefinition
