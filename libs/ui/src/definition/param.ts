import { MetadataType } from "../bands/builder/types"

export type ParamCondition = {
	param: string
	value?: string | boolean | number
	type: "fieldValue" | "hasValue" | "hasNoValue"
}

type ParamBase = {
	name: string
	type:
		| "RECORD"
		| "TEXT"
		| "METADATA"
		| "METADATAMULTI"
		| "METADATANAME"
		| "NUMBER"
		| "CHECKBOX"
	required?: boolean
	default?: string
	prompt?: string
	conditions?: ParamCondition[]
}

type RecordParam = ParamBase & {
	type: "RECORD"
	collection: string
}

type TextParam = ParamBase & {
	type: "TEXT"
	defaultValue: string
}

type NumberParam = ParamBase & {
	type: "NUMBER"
	defaultValue: number
}

type CheckboxParam = ParamBase & {
	type: "CHECKBOX"
	defaultValue: boolean
}

type MetadataParam = ParamBase & {
	type: "METADATA"
	metadataType: MetadataType
	grouping?: string
}

type MetadataMultiParam = ParamBase & {
	type: "METADATAMULTI"
	metadataType: MetadataType
	grouping?: string
}

type MetadataNameParam = ParamBase & {
	type: "METADATANAME"
}

export type ParamDefinition =
	| RecordParam
	| TextParam
	| CheckboxParam
	| NumberParam
	| MetadataParam
	| MetadataMultiParam
	| MetadataNameParam
