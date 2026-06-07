import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { ProcessedContent, QuartzPluginData, defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FullSlug, pathToRoot } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents, streamFilter } from "../../../quartz.layout"
import { StreamContent } from "../../components"
import { byDateAndAlphabetical, SortFn } from "../../components/PageList"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { StaticResources } from "../../util/resources"

interface StreamPageOptions extends Partial<FullPageLayout> {
  slug: FullSlug
  filter: (data: QuartzPluginData) => boolean
  sort?: SortFn
  batchSize?: number
  sourceField?: string
  showNumber?: boolean
}

const defaultStreamPageOptions = {
  slug: "stream/index" as FullSlug,
  batchSize: 15,
  sourceField: "source",
  showNumber: true,
}

function buildStreamContentOpts(
  userOpts: StreamPageOptions,
  entries: { tree: ProcessedContent[0]; data: QuartzPluginData }[],
) {
  return {
    entries,
    batchSize: userOpts.batchSize ?? defaultStreamPageOptions.batchSize,
    sourceField: userOpts.sourceField ?? defaultStreamPageOptions.sourceField,
    showNumber: userOpts.showNumber ?? defaultStreamPageOptions.showNumber,
  }
}

function collectStreamEntries(
  content: ProcessedContent[],
  filter: (data: QuartzPluginData) => boolean,
  slug: FullSlug,
  sort: SortFn,
): { tree: ProcessedContent[0]; data: QuartzPluginData }[] {
  return content
    .filter(([_, file]) => {
      const fileSlug = file.data.slug
      return fileSlug && fileSlug !== slug && filter(file.data)
    })
    .sort(([_, a], [__, b]) => sort(a.data, b.data))
    .map(([tree, file]) => ({ tree, data: file.data }))
}

function getPageContent(content: ProcessedContent[], slug: FullSlug): ProcessedContent {
  const existing = content.find(([_, file]) => file.data.slug === slug)
  if (existing) {
    return existing
  }

  return defaultProcessedContent({
    slug,
    frontmatter: {
      title: "Stream",
      tags: [],
    },
  })
}

async function processStreamPage(
  ctx: BuildCtx,
  pageContent: ProcessedContent,
  allFiles: QuartzPluginData[],
  opts: FullPageLayout,
  resources: StaticResources,
) {
  const slug = pageContent[1].data.slug!
  const cfg = ctx.cfg.configuration
  const externalResources = pageResources(pathToRoot(slug), resources)
  const [tree, file] = pageContent
  const componentData: QuartzComponentProps = {
    ctx,
    fileData: file.data,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }

  const content = renderPage(cfg, slug, componentData, opts, externalResources)
  return write({
    ctx,
    content,
    slug,
    ext: ".html",
  })
}

export const StreamPage: QuartzEmitterPlugin<Partial<StreamPageOptions>> = (userOpts) => {
  const streamOpts: StreamPageOptions = {
    ...defaultStreamPageOptions,
    filter: streamFilter,
    ...userOpts,
  } as StreamPageOptions

  const contentOpts = buildStreamContentOpts(streamOpts, [])
  const baseLayout: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: StreamContent(contentOpts),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, afterBody, left, right, footer: Footer } = baseLayout
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "StreamPage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        baseLayout.pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map((c) => c[1].data)
      const sort = streamOpts.sort ?? byDateAndAlphabetical(ctx.cfg.configuration)
      const slug = streamOpts.slug
      const entries = collectStreamEntries(content, streamOpts.filter, slug, sort)
      const pageContent = getPageContent(content, slug)

      const emitLayout: FullPageLayout = {
        ...baseLayout,
        pageBody: StreamContent(buildStreamContentOpts(streamOpts, entries)),
      }

      yield processStreamPage(ctx, pageContent, allFiles, emitLayout, resources)
    },
    async *partialEmit(ctx, content, resources, changeEvents) {
      const allFiles = content.map((c) => c[1].data)
      const sort = streamOpts.sort ?? byDateAndAlphabetical(ctx.cfg.configuration)
      const slug = streamOpts.slug

      let shouldRebuild = false
      for (const changeEvent of changeEvents) {
        if (!changeEvent.file) continue
        const fileSlug = changeEvent.file.data.slug
        if (fileSlug === slug || streamOpts.filter(changeEvent.file.data)) {
          shouldRebuild = true
          break
        }
      }

      if (!shouldRebuild) {
        return
      }

      const entries = collectStreamEntries(content, streamOpts.filter, slug, sort)
      const pageContent = getPageContent(content, slug)

      const emitLayout: FullPageLayout = {
        ...baseLayout,
        pageBody: StreamContent(buildStreamContentOpts(streamOpts, entries)),
      }

      yield processStreamPage(ctx, pageContent, allFiles, emitLayout, resources)
    },
  }
}
