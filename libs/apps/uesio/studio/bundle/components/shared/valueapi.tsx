import { component, hooks, util, context, definition } from "@uesio/ui"

const getValueAPI = (
	metadataType: string,
	metadataItem: string,
	selectedPath: string,
	definition: definition.DefinitionMap | undefined,
	uesio: hooks.Uesio,
	context: context.Context
) => {
	const onUpdateHook = (path: string) => {
		const pathArray = component.path.toPath(path)
		// If it was a wire update, auto-reload the wire
		if (pathArray[0] !== "wires") return
		const wireName = pathArray[1]
		if (!wireName) return

		uesio.signal.runMany(
			[
				{
					signal: "wire/INIT",
					wireDefs: [wireName],
				},
				{
					signal: "wire/LOAD",
					wires: [wireName],
				},
			],
			context
		)
	}

	return {
		get: (path: string) => util.get(definition, path),
		set: (
			path: string,
			value: string | number | null,
			autoSelect?: boolean
		) => {
			if (path === undefined) return
			uesio.builder.setDefinition(
				component.path.makeFullPath(metadataType, metadataItem, path),
				value,
				autoSelect
			)
			onUpdateHook(path)
		},
		clone: (path: string) => {
			if (path === undefined) return
			uesio.builder.cloneDefinition(
				component.path.makeFullPath(metadataType, metadataItem, path)
			)
			onUpdateHook(path)
		},
		cloneKey: (path: string) => {
			if (path === undefined) return
			uesio.builder.cloneKeyDefinition(
				component.path.makeFullPath(metadataType, metadataItem, path)
			)
			onUpdateHook(path)
		},
		add: (path: string, value: string, number?: number) => {
			if (path === undefined) return
			uesio.builder.addDefinition(
				component.path.makeFullPath(metadataType, metadataItem, path),
				value,
				number
			)
			onUpdateHook(path)
		},
		remove: (path: string) => {
			if (path === undefined) return
			uesio.builder.removeDefinition(
				component.path.makeFullPath(metadataType, metadataItem, path)
			)
			onUpdateHook(path)
		},
		changeKey: (path: string, key: string) => {
			if (path === undefined) return
			uesio.builder.changeDefinitionKey(
				component.path.makeFullPath(metadataType, metadataItem, path),
				key
			)
			onUpdateHook(path)
		},
		move: (fromPath: string, toPath: string, selectKey?: string) => {
			if (fromPath === undefined || toPath === undefined) return
			uesio.builder.moveDefinition(
				component.path.makeFullPath(
					metadataType,
					metadataItem,
					fromPath
				),
				component.path.makeFullPath(metadataType, metadataItem, toPath),
				selectKey
			)
			onUpdateHook(toPath)
		},
		select: (path: string) => {
			uesio.builder.setSelectedNode(metadataType, metadataItem, path)
		},
		isSelected: (path: string) => path === selectedPath,
		hasSelectedChild: (path: string) =>
			selectedPath.startsWith(path) && path !== selectedPath,
	}
}

export default getValueAPI