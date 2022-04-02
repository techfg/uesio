import { definition, builder } from "@uesio/ui"
import { GridDefinition } from "../grid/griddefinition"
import { ListDefinition } from "../list/listdefinition"

type DeckDefinition = GridDefinition &
	ListDefinition &
	definition.BaseDefinition

interface DeckProps extends definition.BaseProps {
	definition: DeckDefinition
}

const DeckPropertyDefinition: builder.BuildPropertiesDefinition = {
	title: "Deck",
	description: "Deck",
	link: "https://docs.ues.io/",
	defaultDefinition: () => ({}),
	properties: [],
	sections: [],
	actions: [],
	type: "component",
	classes: ["root"],
}
export { DeckProps, DeckDefinition }

export default DeckPropertyDefinition