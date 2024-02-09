function view(bot) {
	var collection = bot.params.get("collection")
	var navComponent = bot.params.get("navcomponent")
	const collectionParts = collection?.split(".")
	const collectionNamespace = collectionParts[0]
	const collectionName = collectionParts[1]
	var fields = bot.params.get("fields")
	var name = bot.params.get("name") || `${collectionName}_new`
	var wirename = collectionName || name
	var fieldsArray = fields.split(",")
	var fieldsYaml = fieldsArray.map((field) => `${field}:\n`).join("")
	var formFieldsYaml = fieldsArray
		.map((field) => `- uesio/io.field:\n    fieldId: ${field}\n`)
		.join("")

	if (!navComponent) {
		bot.runGenerator("uesio/core", "component_nav", {})
		navComponent = collectionNamespace + ".nav"
	}

	var navContent = navComponent ? `- ${navComponent}:\n` : ""

	var definition = bot.mergeYamlTemplate(
		{
			collection,
			fields: fieldsYaml,
			formFields: formFieldsYaml,
			wirename,
			navContent,
		},
		"templates/newview.yaml"
	)

	bot.runGenerator("uesio/core", "view", {
		name,
		definition,
	})
}
