import { context, wire } from "@uesio/ui"
import { get } from "./defapi"
import { FullPath } from "./path"

const getAvailableWireIds = (context: context.Context) =>
	Object.keys(getAvailableWires(context))

const getAvailableWires = (context: context.Context) => {
	const result = get(
		context,
		new FullPath("viewdef", context.getViewDefId(), '["wires"]')
	) as wire.WireDefinitionMap
	return result
}

export { getAvailableWireIds, getAvailableWires }