import { FunctionComponent } from "react"
import { DefinitionMap, BaseProps } from "../definition/definition"
import { Context, ContextFrame } from "../context/context"
import { getLoader } from "./registry"
import NotFound from "../components/notfound"
import { ComponentVariant } from "../bands/viewdef/types"
import { parseKey } from "./path"
import { shouldDisplay } from "./display"

/**
 * Returns a new object that has a deep merge where source overrides
 * destination, but ignoring empty values in source
 * @param destDef
 * @param sourceDef
 */
function mergeDefinitionMaps(
	destDef: DefinitionMap,
	sourceDef: DefinitionMap,
	context: Context | undefined
) {
	//const key = JSON.stringify([destDef, sourceDef])
	//if (cache[key]) return cache[key]
	const destClone = JSON.parse(JSON.stringify(destDef))
	const result = mergeDeep(destClone, sourceDef, context)
	//cache[key] = result
	return result
}

/**
 * Will ignore null/undefined/empty string in the src obj
 * @param dest
 * @param src
 */
function mergeDeep(
	dest: DefinitionMap,
	src: DefinitionMap,
	context: Context | undefined
): DefinitionMap {
	const srcKeys = Object.keys(src)
	for (const key of srcKeys) {
		if (typeof src[key] === "object" && src[key] !== null) {
			if (!dest[key] || typeof dest[key] !== "object") {
				dest[key] = {}
			}
			mergeDeep(
				dest[key] as DefinitionMap,
				src[key] as DefinitionMap,
				context
			)
			continue
		}

		if (src[key] !== null && src[key] !== undefined && src[key] !== "") {
			// Merge src key base on theme
			const value = src[key]
			dest[key] =
				typeof value === "string" && context
					? context.merge(value)
					: value
		}
	}
	return dest
}

function additionalContext(context: Context, definition?: DefinitionMap) {
	const additionalContext = definition?.["uesio.context"] as ContextFrame
	if (additionalContext) {
		const frame: ContextFrame = {}
		const workspace = additionalContext.workspace
		if (workspace) {
			frame.workspace = {
				name: context.merge(workspace.name),
				app: context.merge(workspace.app),
			}
		}
		const wire = additionalContext.wire
		if (wire) {
			frame.wire = wire
		}
		return context.addFrame(frame)
	}
	return context
}

const Component: FunctionComponent<BaseProps> = (props) => {
	const { componentType, path } = props
	return <ComponentInternal {...props} path={`${path}["${componentType}"]`} />
}

function getVariantStyles(
	componentType: string,
	variant: ComponentVariant | undefined,
	context: Context
): DefinitionMap {
	if (!variant) return {}
	const variantStyles = variant.definition?.["uesio.styles"] as DefinitionMap
	const theme = context.getTheme()
	const overrides = theme?.definition?.variantOverrides
	const override = overrides?.[componentType]?.[variant.name] as DefinitionMap
	return override
		? mergeDefinitionMaps(variantStyles, override, context)
		: variantStyles
}

function mergeInVariants(
	definition: DefinitionMap | undefined,
	componentType: string,
	variant: ComponentVariant | undefined,
	context: Context
): DefinitionMap | undefined {
	if (!definition) return definition

	const variantStyles = getVariantStyles(componentType, variant, context)
	const explicitStyles = definition["uesio.styles"] as DefinitionMap

	return mergeDefinitionMaps(
		definition,
		{
			"uesio.styles": explicitStyles
				? mergeDefinitionMaps(variantStyles, explicitStyles, context)
				: variantStyles,
		},
		context
	)
}

function mergeContextVariants(
	definition: DefinitionMap | undefined,
	componentType: string,
	context: Context
): DefinitionMap | undefined {
	if (!definition) return definition
	const variantName = definition["uesio.variant"] as string
	const [namespace] = parseKey(componentType)

	return mergeInVariants(
		definition,
		componentType,
		context.getComponentVariant(
			componentType,
			variantName || `${namespace}.default`
		),
		context
	)
}

function render(
	loader: FunctionComponent<BaseProps>,
	componentType: string,
	props: BaseProps
) {
	const { context, definition } = props
	if (!shouldDisplay(context, definition)) return null
	const mergedDefinition = mergeContextVariants(
		definition,
		componentType,
		context
	)
	const Loader = loader
	return (
		<Loader
			{...{ ...props, definition: mergedDefinition }}
			context={additionalContext(context, mergedDefinition)}
		/>
	)
}

const ComponentInternal: FunctionComponent<BaseProps> = (props) => {
	const { componentType, context } = props
	if (!componentType) return <NotFound {...props} />
	const loader =
		getLoader(componentType, !!context.getBuildMode()) || NotFound
	return render(loader, componentType, props)
}

export {
	ComponentInternal,
	Component,
	render,
	mergeInVariants,
	mergeDefinitionMaps,
}
