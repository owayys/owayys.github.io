import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import { registerCondition } from "./quartz/plugins/loader/conditions"

registerCondition("is-index", (props) => props.fileData.slug === "index")

componentRegistry.setOptionOverrides("@quartz-community/recent-notes", {
  filter: (f: { slug?: string }) =>
    !!f.slug && (f.slug.startsWith("thoughts/") || f.slug.startsWith("reading/")),
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
