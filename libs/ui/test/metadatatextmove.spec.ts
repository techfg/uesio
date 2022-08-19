import { moveDefinition } from "../src/bands/builder"
import { getTestPath, testTextAction } from "./utils/testmetadatatext"

const tests = [
	{
		name: "Move component within same parent",
		fromPath: `["components"]["1"]`,
		toPath: `["components"]["0"]`,
		data: `
components:
  - uesio/io.button:
      text: button1
  - uesio/io.button:
      text: button2
`,
		expected: `
components:
  - uesio/io.button:
      text: button2
  - uesio/io.button:
      text: button1
`,
	},
	{
		name: "Move component within same parent forwards by 1",
		fromPath: `["components"]["0"]`,
		toPath: `["components"]["1"]`,
		data: `
components:
  - uesio/io.button:
      text: button2
  - uesio/io.button:
      text: button1
`,
		expected: `
components:
  - uesio/io.button:
      text: button1
  - uesio/io.button:
      text: button2
`,
	},
	{
		name: "Move component within same parent forwards by 2, non existing index",
		fromPath: `["components"]["0"]`,
		toPath: `["components"]["2"]`,
		data: `
components:
  - uesio/io.button:
      text: button1
  - uesio/io.button:
      text: button2
`,
		expected: `
components:
  - uesio/io.button:
      text: button2
  - uesio/io.button:
      text: button1
`,
	},
	{
		name: "Move component to another non-existent node",
		fromPath: `["components"]["0"]["uesio/io.group"]["components"]["0"]`,
		toPath: `["components"]["1"]["uesio/io.group"]["components"]["0"]`,
		data: `
components:
  - uesio/io.group:
      components:
        - uesio/io.button:
            text: button1
  - uesio/io.group:
`,
		expected: `
components:
  - uesio/io.group:
      components: []
  - uesio/io.group:
      components:
        - uesio/io.button:
            text: button1
`,
	},
	{
		name: "Move wire",
		fromPath: `["wires"]["myotherwire"]`,
		toPath: `["wires"]["mywire"]`,
		data: `
wires:
  myotherwire:
    collection: myothercollection
    fields:
  mywire:
    collection: mycollection
    fields:
panels:
`,
		expected: `
wires:
  mywire:
    collection: mycollection
    fields:
  myotherwire:
    collection: myothercollection
    fields:
panels:
`,
	},
	{
		name: "move component different parent",
		fromPath: `["components"]["0"]["uesio/io.group"]["components"]["0"]`,
		toPath: `["components"]["1"]["uesio/io.group"]["components"]["0"]`,
		data: `
components:
  - uesio/io.group:
      components:
        - uesio/io.button:
            text: button1
        - uesio/io.button:
            text: button2
  - uesio/io.group:
      components:
        - uesio/io.button:
            text: button3
        - uesio/io.button:
            text: button4
wires:
panels:
`,
		expected: `
components:
  - uesio/io.group:
      components:
        - uesio/io.button:
            text: button2
  - uesio/io.group:
      components:
        - uesio/io.button:
            text: button1
        - uesio/io.button:
            text: button3
        - uesio/io.button:
            text: button4
wires:
panels:
`,
	},
]

tests.map(({ name, fromPath, toPath, data, expected }) =>
	test(name, () => {
		testTextAction(
			data,
			expected,
			moveDefinition({
				fromPath: getTestPath(fromPath),
				toPath: getTestPath(toPath),
			})
		)
	})
)