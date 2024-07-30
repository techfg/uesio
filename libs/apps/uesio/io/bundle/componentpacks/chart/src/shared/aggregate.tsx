import { wire, context } from "@uesio/ui"
import { getCategoryFunc, getLabels, LabelsDefinition } from "./labels"

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
	serieses: SeriesDefinition[],
	context: context.Context
) => {
	const categories = getLabels(wires, labels, serieses, context)
	const datasets = serieses.flatMap((series, index) => {
		const { wire: wireName, valueField, categoryField, label } = series
		const wire = wires[wireName]
		if (!wire) return []
		const collection = wire.getCollection()
		const bucketField = collection.getField(categoryField)
		const dataField = collection.getField(valueField)
		if (!bucketField || !dataField) {
			return []
		}
		const isNumericDataField = dataField.getType() === "NUMBER"

		const buckets: Buckets = Object.fromEntries(
			Object.entries(categories).map(([key]) => [key, 0])
		)

		const categoryFunc = getCategoryFunc(labels, bucketField)

		wire?.getData().forEach((record) => {
			const category = categoryFunc(record)
			const currentValue = buckets[category]
			if (isNumericDataField) {
				const aggValue = record.getFieldValue<number>(valueField) || 0
				buckets[category] = currentValue + aggValue
			} else {
				// For non-numeric fields, default to doing a count,
				// so only increment the bucket if there's a value
				const val = record.getFieldValue(valueField)
				if (val !== undefined && val !== null) {
					buckets[category] = currentValue + 1
				}
			}
		})
		const color = Object.values(CHART_COLORS)[index]
		return [
			{
				label: context.mergeString(label),
				cubicInterpolationMode: "monotone" as const,
				data: Object.values(buckets),
				backgroundColor: color,
				borderColor: color,
			},
		]
	})

	return [datasets, categories] as const
}

export { aggregate }

export type { SeriesDefinition }
