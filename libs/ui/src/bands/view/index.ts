import { createSlice } from "@reduxjs/toolkit"
import { parseKey } from "../../component/path"

import viewAdapter from "./adapter"

import loadViewOp from "./operations/load"
import { set as routeSet } from "../route"

const viewSlice = createSlice({
	name: "view",
	initialState: viewAdapter.getInitialState(),
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadViewOp.fulfilled, viewAdapter.upsertOne)
		builder.addCase(loadViewOp.pending, (state, { meta: { arg } }) => {
			const context = arg.context
			const viewDefId = context.getViewDefId()
			if (!viewDefId) {
				return
			}
			const [namespace, name] = parseKey(viewDefId)

			viewAdapter.upsertOne(state, {
				namespace,
				name,
				path: arg.path,
				params: arg.params,
				loaded: false,
			})
		})
		// Clear out all views on navigation
		builder.addCase(routeSet, () => ({
			ids: [],
			entities: {},
		}))
	},
})

export default viewSlice.reducer
