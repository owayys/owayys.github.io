import type { BuildCtx, ProcessedContent, QuartzFilterPlugin } from "@quartz-community/types"
import { defaultOptions, inTrackerFolder, parseTrackable, trackerStore } from "./data"
import type { TrackerOptions } from "./data"

const TrackerFilter: QuartzFilterPlugin<Partial<TrackerOptions>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "TrackerFilter",
    shouldPublish(ctx: BuildCtx, [, vfile]: ProcessedContent) {
      const slug = vfile.data?.slug as string | undefined
      if (!inTrackerFolder(slug, opts.folder)) return true

      if (!slug.endsWith("/index")) {
        const frontmatter = (vfile.data?.frontmatter ?? {}) as Record<string, unknown>
        trackerStore(ctx).set(slug, parseTrackable(slug, frontmatter))
      }
      return false
    },
  }
}

export default TrackerFilter
export type { TrackerOptions } from "./data"
