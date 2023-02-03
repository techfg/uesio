import { defineConfig } from "cypress"

const studio_base_url =
	process.env.UESIO_APP_URL || `https://studio.uesio-dev.com:3000`
const automation_username = process.env.UESIO_AUTOMATION_USERNAME || "uesio"
const automation_password = process.env.UESIO_AUTOMATION_PASSWORD
const use_mock_login = process.env.UESIO_DEV

if (!use_mock_login && !automation_password) {
	throw new Error("UESIO_AUTOMATION_PASSWORD was not provided")
}

export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
		supportFile: "cypress/support/e2e.ts",
	},
	video: false,
	env: {
		studio_base_url,
		automation_password,
		automation_username,
		use_mock_login,
	},
})
