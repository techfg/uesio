import { StrictMode } from "react"
import ReactDOM from "react-dom"
import Runtime from "../components/runtime"
import { Platform } from "../platform/platform"
import { Context } from "../context/context"
import { Provider, create, InitialState } from "../store/store"

class Loader {
	constructor(platform: Platform) {
		this.platform = platform
	}

	platform: Platform

	load(element: HTMLElement, initialState: InitialState) {
		ReactDOM.render(
			<StrictMode>
				<Provider store={create(this.platform, initialState)}>
					<Runtime path="" context={new Context()} />
				</Provider>
			</StrictMode>,
			element
		)
	}
}

export { Loader }
