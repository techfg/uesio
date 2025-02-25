import { ReactNode, forwardRef } from "react"
import { definition, styles } from "@uesio/ui"

interface ScrollPanelProps extends definition.UtilityProps {
  header?: ReactNode
  footer?: ReactNode
}

const StyleDefaults = Object.freeze({
  root: [],
  header: [],
  footer: [],
  inner: [],
})

const ScrollPanel = forwardRef<HTMLDivElement, ScrollPanelProps>(
  (props, ref) => {
    const classes = styles.useUtilityStyleTokens(
      StyleDefaults,
      props,
      "uesio/io.scrollpanel",
    )

    return (
      <div id={props.id} ref={ref} className={classes.root}>
        <div className={classes.header}>{props.header}</div>
        <div className={classes.inner}>{props.children}</div>
        <div className={classes.footer}>{props.footer}</div>
      </div>
    )
  },
)

ScrollPanel.displayName = "ScrollPanel"

export default ScrollPanel
