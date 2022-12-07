import { wire } from "@uesio/ui"
import { getCategoryKey, getLabels, LabelsDefinition } from "./labels"

type Buckets = Record<string, number>

type SeriesDefinition = {
	name: string
	label: string
	valueField: string // this is what determines the total value on the y axis
	categoryField: string // This is what determines what bucket the data point goes into
	wire: string
}

export const CHART_COLORS = {
	red: "rgb(255, 99, 132)",
	orange: "rgb(255, 159, 64)",
	yellow: "rgb(255, 205, 86)",
	green: "rgb(75, 192, 192)",
	blue: "rgb(54, 162, 235)",
	purple: "rgb(153, 102, 255)",
	grey: "rgb(201, 203, 207)",
}

const aggregate = (
	wires: { [k: string]: wire.Wire | undefined },
	labels: LabelsDefinition,
	serieses: SeriesDefinition[]
) => {
	const categories = getLabels(wires, labels, serieses)
	const datasets = serieses.flatMap((series, index) => {
		const wire = wires[series.wire]
		if (!wire) return []
		const bucketField = wire?.getCollection().getField(series.categoryField)
		if (!bucketField) {
			throw new Error("Invalid Category Field")
		}

		const buckets: Buckets = Object.fromEntries(
			Object.entries(categories).map(([key]) => [key, 0])
		)

		wire?.getData().forEach((record) => {
			const category = getCategoryKey(record, labels, bucketField)
			const aggValue =
				record.getFieldValue<number>(series.valueField) || 0
			const currentValue = buckets[category]
			buckets[category] = currentValue + aggValue
		})
		return [
			{
				label: series.label,
				cubicInterpolationMode: "monotone" as const,
				data: Object.values(buckets),
				backgroundColor: Object.values(CHART_COLORS)[index],
				borderColor: Object.values(CHART_COLORS)[index],
			},
		]
	})

	return [datasets, categories] as const
}

export { aggregate, SeriesDefinition }