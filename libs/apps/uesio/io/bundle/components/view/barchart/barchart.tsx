import { FC } from "react"
import { styles, hooks } from "@uesio/ui"
import { Props } from "./barchartdefinition"

import { Bar } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
import { getDataSets, getLabels } from "../../shared/chart"
Chart.register(...registerables)

const ChartComponent: FC<Props> = (props) => {
	const { definition } = props
	if (!definition) {
		console.warn("missing definition for chart")
		return null
	}

	const classes = styles.useStyles(
		{
			root: {},
			title: {},
			chart: {},
		},
		props
	)

	const uesio = hooks.useUesio(props)

	// Get a list of all wires used
	const wireNames: string[] = []

	definition.series.forEach((series) => {
		wireNames.push(series.wire)
	})

	const wires = uesio.wire.useWires(wireNames)

	const categories = getLabels(wires, definition.labels, definition.series)

	const datasets = getDataSets(
		wires,
		categories,
		definition.labels,
		definition.series
	)

	const labels = Object.values(categories)

	return (
		<div className={classes.root}>
			{definition.title && (
				<h3 className={classes.title}>{definition.title}</h3>
			)}
			<div className={classes.chart}>
				<Bar
					data={{
						datasets,
						labels,
					}}
					options={{
						maintainAspectRatio: false,
					}}
				/>
			</div>
		</div>
	)
}

export default ChartComponent