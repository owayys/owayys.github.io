import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

const recentNotes = Component.RecentNotes({
  title: "Recent",
  limit: 3,
  filter: (f) => f.slug!.startsWith("thoughts/") || f.slug!.startsWith("reading/"),
  linkToMore: "thoughts/" as SimpleSlug,
})

const isNotHome = (page: { fileData: { slug?: string } }) => page.fileData.slug !== "index"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.MobileOnly(recentNotes)],
  footer: Component.Footer({
    links: {
      github: "https://github.com/owayys",
      email: "mailto:owais.ahsan@hotmail.com"
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
