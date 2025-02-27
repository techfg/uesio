import { definition, styles, context, collection, wire } from "@uesio/ui"
import { ApplyChanges } from "../../components/field/field"
import { useControlledInputNumber } from "../../shared/useControlledFieldValue"
import ReadOnlyField from "./readonly"

export type NumberFieldOptions = {
  step?: number
  max?: number
  min?: number
}

interface NumberFieldProps {
  applyChanges?: ApplyChanges
  setValue: (value: wire.FieldValue) => void
  value: wire.FieldValue
  fieldMetadata: collection.Field
  mode?: context.FieldMode
  options?: NumberFieldOptions
  placeholder?: string
  type?: "number" | "range"
  focusOnRender?: boolean
  readonly?: boolean
}

const StyleDefaults = Object.freeze({
  input: [],
  readonly: [],
  wrapper: ["flex"],
  rangevalue: ["p-2"],
})

const NumberField: definition.UtilityComponent<NumberFieldProps> = (props) => {
  const {
    applyChanges,
    context,
    fieldMetadata,
    focusOnRender = false,
    id,
    mode,
    options,
    placeholder,
    setValue,
    type = "number",
    variant,
  } = props

  const value = props.value as number
  const readOnly = mode === "READ" || props.readonly
  const numberOptions = fieldMetadata?.getNumberMetadata()
  const decimals = numberOptions?.decimals ?? 2
  const initialValue = typeof value === "number" ? value : parseFloat(value)

  const controlledInputProps = useControlledInputNumber({
    value: initialValue,
    setValue,
    applyChanges,
    readOnly,
  })

  const classes = styles.useUtilityStyleTokens(
    StyleDefaults,
    props,
    "uesio/io.field",
  )
  if (readOnly) {
    return (
      <ReadOnlyField variant={variant} context={context} id={id}>
        {Intl.NumberFormat(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value)}
      </ReadOnlyField>
    )
  }
  return (
    <div className={classes.wrapper}>
      <input
        id={id}
        className={styles.cx(classes.input, readOnly && classes.readonly)}
        {...controlledInputProps}
        type={type}
        disabled={readOnly}
        placeholder={placeholder}
        step={options?.step}
        min={options?.min}
        max={options?.max}
        title={`${controlledInputProps.value}`}
        autoFocus={focusOnRender}
      />
      {type === "range" ? (
        <span className={classes.rangevalue}>{controlledInputProps.value}</span>
      ) : null}
    </div>
  )
}

export default NumberField
