import { Context } from "../../../context/context"
import { addOrder, setOrder, removeOrder, getFullWireId } from ".."
import { ThunkFunc } from "../../../store/store"
import { MetadataKey } from "../../builder/types"

export const add =
	(
		context: Context,
		wirename: string,
		order: { field: MetadataKey; desc: boolean }
	): ThunkFunc =>
	(dispatch) => {
		const viewId = context.getViewId()
		if (viewId)
			dispatch(
				addOrder({
					entity: getFullWireId(viewId, wirename),
					order,
				})
			)
		return context
	}

export const set =
	(
		context: Context,
		wirename: string,
		order: { field: MetadataKey; desc: boolean }[]
	): ThunkFunc =>
	(dispatch) => {
		const viewId = context.getViewId()
		if (order.constructor !== Array) {
			console.error("Order should be an array")
			return context
		}
		if (viewId)
			dispatch(
				setOrder({
					entity: getFullWireId(viewId, wirename),
					order,
				})
			)
		return context
	}

export const remove =
	(context: Context, wirename: string, fields: MetadataKey[]): ThunkFunc =>
	(dispatch) => {
		const viewId = context.getViewId()
		if (viewId)
			dispatch(
				removeOrder({
					entity: getFullWireId(viewId, wirename),
					fields,
				})
			)
		return context
	}