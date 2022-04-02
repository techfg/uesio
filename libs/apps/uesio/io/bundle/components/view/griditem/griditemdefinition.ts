import { definition, builder } from "@uesio/ui"

type GridItemDefinition = {
	column?: string
	area?: string
}

interface GridItemProps extends definition.BaseProps {
	definition?: GridItemDefinition
}

const GridItemPropertyDefinition: builder.BuildPropertiesDefinition = {
	title: "Grid Item",
	description: "Grid Item",
	link: "https://docs.ues.io/",
	defaultDefinition: () => ({
		components: [],
	}),
	sections: [],
	classes: ["root"],
	type: "component",
}
export { GridItemProps, GridItemDefinition }

export default GridItemPropertyDefinition