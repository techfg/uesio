import { FunctionComponent, ComponentType } from "react"
import { definition, builder } from "@uesio/ui"
import PropListSection from "./proplistsection"
import FieldsSection from "./fieldssection"
import ConditionsSection from "./conditionssection"
import SignalsSection from "./signalssection"
import StylesSection from "./stylessection"
import { SectionRendererProps } from "./sectionrendererdefinition"

const SECTION_TO_COMPONENT: {
	[K in builder.PropertySection["type"]]: ComponentType<SectionRendererProps>
} = {
	FIELDS: FieldsSection,
	CONDITIONS: ConditionsSection,
	SIGNALS: SignalsSection,
	PROPLIST: PropListSection,
	STYLES: StylesSection,
}

const BuildSection: FunctionComponent<SectionRendererProps> = ({
	section,
	propsDef,
	context,
	path,
	definition,
}) => {
	const SectionHandler = SECTION_TO_COMPONENT[section.type]
	return (
		<SectionHandler
			section={section}
			propsDef={propsDef}
			path={path}
			definition={definition}
			context={context}
		/>
	)
}

export default BuildSection
