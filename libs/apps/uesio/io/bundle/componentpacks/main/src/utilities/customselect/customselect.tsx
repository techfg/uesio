import { FunctionComponent, ReactNode } from "react"
import { useCombobox } from "downshift"
import { definition, styles, component } from "@uesio/ui"
import Icon from "../icon/icon"
import { autoPlacement, useFloating, autoUpdate } from "@floating-ui/react"

type CustomSelectProps<T> = {
	value: T
	setValue: (value: T) => void
	items: T[]
	itemToString: (item: T) => string
	allowSearch?: true
	itemRenderer: (
		item: T,
		index: number,
		highlightedIndex: number
	) => ReactNode
	tagRenderer: (item: T) => ReactNode
} & definition.BaseProps

const CustomSelect: FunctionComponent<CustomSelectProps<unknown>> = (props) => {
	const {
		allowSearch = true,
		items = [],
		setValue,
		value,
		itemToString,
		itemRenderer = (item) => <div>{itemToString(item)}</div>,
		tagRenderer = (item) => <div>{itemToString(item)}</div>,
		context,
	} = props

	const classes = styles.useUtilityStyles(
		{
			root: {},
			input: {},
			readonly: {},
			menu: {
				backgroundColor: "white",
				fontSize: "10pt",
				border: "1px solid #ccc",
				borderRadius: "4px",
				overflow: "hidden",
				boxShadow: "0 0 4px #00000033",
			},
			menuitem: {
				cursor: "pointer",
			},
			editbutton: {
				color: "#444",
				border: "none",
				outline: "none",
				padding: "0px 3px 0px 0",
				backgroundColor: "transparent",
				fontSize: "initial",
				cursor: "pointer",
			},
			displayarea: {
				flex: 1,
			},
			label: {
				display: "flex",
				alignItems: "center",
				border: "1px solid #00000044",
				cursor: "pointer",
				padding: "3px",
			},
			searchbox: {
				minWidth: "200px",
				borderRadius: "4px",
				margin: "6px",
				padding: "6px",
				border: "1px solid #00000044",
				"::placeholder": {
					fontSize: "9pt",
					color: "#999",
				},
			},
		},
		props
	)

	const {
		isOpen,
		getMenuProps,
		getComboboxProps,
		getLabelProps,
		highlightedIndex,
		getItemProps,
		getInputProps,
		inputValue,
		openMenu,
	} = useCombobox({
		items,
		selectedItem: value || "",
		onSelectedItemChange: (changes) => {
			const selectedItem = changes.selectedItem
			selectedItem && setValue(selectedItem)
		},
	})

	const { x, y, strategy, refs } = useFloating({
		placement: "bottom-start",
		middleware: [
			autoPlacement({ allowedPlacements: ["top-start", "bottom-start"] }),
		],
		whileElementsMounted: autoUpdate,
	})

	return (
		<div style={{ position: "relative" }} ref={refs.setReference}>
			<div onClick={() => openMenu()} className={classes.label}>
				<div
					onFocus={openMenu}
					tabIndex={isOpen ? -1 : 0}
					className={classes.displayarea}
				>
					{tagRenderer}
				</div>

				<button className={classes.editbutton} type="button">
					<Icon icon="expand_more" context={context} />
				</button>
			</div>
			<component.Panel>
				<div
					ref={refs.setFloating}
					style={{
						...(!isOpen && { visibility: "hidden" }),
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
						width: "max-content",
					}}
					className={classes.menu}
				>
					<div {...getMenuProps()}>
						<div {...getComboboxProps()}>
							<label {...getLabelProps()}>
								<input
									type="text"
									//autoFocus
									className={classes.searchbox}
									placeholder="Search..."
									style={{
										display: allowSearch ? "auto" : "none",
									}}
									{...getInputProps()}
								/>
							</label>
						</div>
						{items.map((item: string, index) => {
							// hacky, but downshift needs the index in order to determine what element this is.
							// That's why we can't filter the items array beforehand.
							if (allowSearch && !item.includes(inputValue))
								return null
							return (
								<div
									className={classes.menuitem}
									key={index}
									{...getItemProps({
										item,
										index,
									})}
								>
									{itemRenderer(
										item,
										index,
										highlightedIndex
									)}
								</div>
							)
						})}
					</div>
				</div>
			</component.Panel>
		</div>
	)
}

export default CustomSelect
