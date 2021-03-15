import { useEffect, FunctionComponent } from "react"

import { BaseProps } from "../definition/definition"

import { useUesio } from "../hooks/hooks"
import { Context } from "../context/context"
import Route from "./route"
import routeOps from "../bands/route/operations"

const Runtime: FunctionComponent<BaseProps> = (props) => {
	const uesio = useUesio(props)
	const buildMode = uesio.builder.useMode()

	// This tells us to load in the studio main component pack if we're in buildmode
	const deps = buildMode ? ["studio.main", "io.main"] : []
	const scriptResult = uesio.component.usePacks(deps, buildMode)

	useEffect(() => {
		const toggleFunc = (event: KeyboardEvent) => {
			if (event.altKey && event.code === "KeyU") {
				uesio.builder.toggleBuildMode()
			}
		}
		// Handle swapping between buildmode and runtime
		// Option + U
		window.addEventListener("keyup", toggleFunc)

		window.onpopstate = (event: PopStateEvent) => {
			if (!event.state.path || !event.state.namespace) {
				// In some cases, our path and namespace aren't available in the history state.
				// If that is the case, then just punt and do a plain redirect.
				uesio.signal.dispatcher(
					routeOps.redirect(new Context(), document.location.pathname)
				)
				return
			}
			uesio.signal.dispatcher(
				routeOps.navigate(
					new Context([
						{
							workspace: event.state.workspace,
						},
					]),
					event.state.path,
					event.state.namespace,
					true
				)
			)
		}

		// Remove event listeners on cleanup
		return () => {
			window.removeEventListener("keyup", toggleFunc)
		}
	}, [])

	return (
		<Route
			path={props.path}
			context={props.context.addFrame({
				buildMode: buildMode && scriptResult.loaded,
			})}
		/>
	)
}

export default Runtime
