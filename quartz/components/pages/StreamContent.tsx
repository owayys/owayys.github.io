import { ComponentChildren } from "preact"
import { Root } from "hast"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { FullSlug, resolveRelative } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { htmlToJsx } from "../../util/jsx"
import { Date, getDate } from "../Date"
import { i18n } from "../../i18n"
import { byDateAndAlphabetical, SortFn } from "../PageList"
// @ts-ignore
import script from "../scripts/stream.inline"
import style from "../styles/stream.scss"

export interface StreamEntry {
  tree: Root
  data: QuartzPluginData
}

interface StreamContentOptions {
  entries?: StreamEntry[]
  filter?: (data: QuartzPluginData) => boolean
  sort?: SortFn
  batchSize: number
  sourceField: string
  showNumber: boolean
  title?: string | false
}

const defaultOptions: Omit<StreamContentOptions, "entries" | "filter" | "sort"> = {
  batchSize: 15,
  sourceField: "source",
  showNumber: true,
  title: "Stream",
}

const emptyRoot: Root = { type: "root", children: [] }

function getSourceUrl(data: QuartzPluginData, sourceField: string): string | undefined {
  const source = data.frontmatter?.[sourceField]
  if (typeof source === "string" && source.length > 0) {
    return source
  }
  return undefined
}

function getSourceHostname(source: string): string | undefined {
  try {
    return new URL(source).hostname
  } catch {
    return undefined
  }
}

function resolveEntries(props: QuartzComponentProps, options: StreamContentOptions): StreamEntry[] {
  if (options.entries && options.entries.length > 0) {
    return options.entries
  }

  if (!options.filter) {
    return []
  }

  const sort = options.sort ?? byDateAndAlphabetical(props.cfg)
  return props.allFiles
    .filter(options.filter)
    .sort(sort)
    .map((data) => ({
      tree: data.htmlAst ?? emptyRoot,
      data,
    }))
}

export default ((userOpts?: Partial<StreamContentOptions>) => {
  const options: StreamContentOptions = {
    ...defaultOptions,
    ...userOpts,
  }

  const StreamContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, cfg } = props
    const { batchSize, sourceField, showNumber, title } = options
    const entries = resolveEntries(props, options)
    const total = entries.length

    const intro = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    return (
      <div class={`popover-hint stream${intro ? " stream-has-intro" : ""}`}>
        {intro && <article class={classes}>{intro}</article>}
        {title && (
          <header class="stream-section-header">
            <h2 class="stream-section-title">{title}</h2>
          </header>
        )}
        <ul class="stream-list" data-batch-size={batchSize}>
          {entries.map((entry, i) => {
            const { tree: entryTree, data } = entry
            const title = data.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            const tags = data.frontmatter?.tags ?? []
            const source = getSourceUrl(data, sourceField)
            const href = source ?? resolveRelative(fileData.slug!, data.slug!)
            const isExternal = !!source
            const hostname = source ? getSourceHostname(source) : undefined
            const hasBody = entryTree.children.length > 0
            const body = hasBody ? (htmlToJsx(data.filePath!, entryTree) as ComponentChildren) : null
            const hidden = i >= batchSize

            return (
              <li class={hidden ? "stream-item stream-hidden" : "stream-item"}>
                <h2 class="stream-title">
                  <a
                    href={href}
                    class={isExternal ? "external" : "internal"}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {title}
                  </a>
                </h2>
                {body && <div class="stream-body">{body}</div>}
                <p class="stream-meta">
                  {data.dates && (
                    <>
                      <Date date={getDate(cfg, data)!} locale={cfg.locale} />
                    </>
                  )}
                  {hostname && (
                    <>
                      {(data.dates || showNumber) && <span class="stream-meta-sep"> | </span>}
                      <span class="stream-source">{hostname}</span>
                    </>
                  )}
                  {tags.length > 0 && (
                    <ul class="tags">
                      {tags.map((tag) => (
                        <li>
                          <a
                            class="internal tag-link"
                            href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                          >
                            {tag}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </p>
              </li>
            )
          })}
        </ul>
        {total > batchSize && <div class="stream-sentinel" aria-hidden="true" />}
      </div>
    )
  }

  StreamContent.css = style
  StreamContent.afterDOMLoaded = script
  return StreamContent
}) satisfies QuartzComponentConstructor
