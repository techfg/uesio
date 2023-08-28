import { Context, injectDynamicContext, newContext } from "../context/context"
import { SignalDefinition, SignalDescriptor } from "../definition/signal"
import { getComponentSignalDefinition } from "../bands/component/signals"

import aiSignals from "../bands/ai/signals"
import collectionSignals from "../bands/collection/signals"
import botSignals from "../bands/bot/signals"
import routeSignals from "../bands/route/signals"
import userSignals from "../bands/user/signals"
import wireSignals from "../bands/wire/signals"
import panelSignals from "../bands/panel/signals"
import toolsSignals from "../bands/tools/signals"
import notificationSignals from "../bands/notification/signals"
import contextSignals from "../context/signals"
import debounce from "lodash/debounce"
import { getErrorString } from "../utilexports"

const registry: Record<string, SignalDescriptor> = {
	...aiSignals,
	...collectionSignals,
	...botSignals,
	...routeSignals,
	...userSignals,
	...wireSignals,
	...panelSignals,
	...toolsSignals,
	...notificationSignals,
	...contextSignals,
}

const run = (signal: SignalDefinition, context: Context) => {
	const descriptor = registry[signal.signal] || getComponentSignalDefinition()
	return descriptor.dispatcher(
		signal,
		injectDynamicContext(context, signal?.["uesio.context"])
	)
}

// TODO: write tests
const runMany = async (signals: SignalDefinition[], context: Context) => {
	for (const signal of signals) {
		// Some signal handlers don't handle errors, so we catch them here
		try {
			context = await run(signal, context)
		} catch (error) {
			context = context.addErrorFrame([getErrorString(error)])
			console.error(error)
		}

		// Any errors in this frame are the result of the signal run above,
		// but it's possible that we have already handled the errors with a notification,
		// so if the current signal being run IS a notification frame (which cannot throw errors),
		// we can skip this check.
		if (signal?.signal === "notification/ADD") continue

		const currentErrors = context.getCurrentErrors() || []

		if (currentErrors.length) {
			const signals = [
				...(signal?.onerror?.signals || []),
				...(signal.onerror?.notify === false
					? []
					: currentErrors.map((text) => ({
							signal: "notification/ADD",
							text,
							severity: "error",
							duration: "10",
					  }))),
			]
			await runMany(signals, newContext())
			if (!signal.onerror?.continue) break
		}
	}

	return context
}

const runManyThrottled = debounce(runMany, 250)

export { run, runMany, runManyThrottled, registry }
