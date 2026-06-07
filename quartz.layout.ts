import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"
import { QuartzPluginData } from "./quartz/plugins/vfile"

const recentNotes = Component.RecentNotes({
  title: "Recent",
  limit: 3,
  filter: (f) => f.slug!.startsWith("thoughts/") || f.slug!.startsWith("reading/"),
  linkToMore: "thoughts/" as SimpleSlug,
})

export const streamFilter = (f: QuartzPluginData) =>
  f.slug!.startsWith("stream/") && f.slug !== "stream/index"

const stream = Component.StreamContent({
  filter: streamFilter,
})

export const contentPageBody = Component.Flex({
  direction: "column",
  gap: "0",
  components: [
    {
      Component: Component.ConditionalRender({
        component: stream,
        condition: (page) => page.fileData.slug === "index",
      }),
    },
    {
      Component: Component.ConditionalRender({
        component: Component.Content(),
        condition: (page) => page.fileData.slug !== "index",
      }),
    },
  ],
})

const isNotHome = (page: { fileData: { slug?: string } }) => page.fileData.slug !== "index"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.MobileOnly(recentNotes)],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/owayys/owayys.github.io",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: isNotHome,
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: isNotHome,
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: isNotHome,
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: isNotHome,
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
      ],
    }),
    Component.DesktopOnly(recentNotes),
    // Component.Constants(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
      ],
    }),
    Component.DesktopOnly(recentNotes),
    // Component.Constants(),
  ],
  right: [Component.DesktopOnly(Component.TableOfContents())],
}
