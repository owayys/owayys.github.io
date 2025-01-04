import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "oways",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "oways.is-a.dev",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    generateSocialImages: false,
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Mona Sans",
        body: "Mona Sans",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#fbf1c7",
          lightgray: "#ebdbb2",
          gray: "#b57614",
          darkgray: "#3c3836",
          dark: "#427b58",
          secondary: "#282828",
          tertiary: "#b57614",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#282828",
        },
        darkMode: {
          light: "#1d2021", // background
          lightgray: "#3c3836", // outlines + search
          gray: "#fabd2f", // date, x min read under header
          darkgray: "#ebdbb2", // dec date
          dark: "#8ec07c", // section
          secondary: "#fbf1c7", // header, created with etc
          tertiary: "#fabd2f", // link hover + tag desc
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fbf1c7",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({
        enableInHtmlEmbed: false,
        parseTags: false,
        mermaid: false,
      }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "absolute", lazyLoad: true }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
