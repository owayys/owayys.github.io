import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import {
  addDays,
  currentStreak,
  currentWeekStreak,
  defaultOptions,
  today,
  trackerStore,
  weekday,
} from "../data"
import type { Trackable, TrackerOptions } from "../data"
import style from "./styles/tracker.scss"

const CELL = 10
const GAP = 3
const PITCH = CELL + GAP

function level(done: number): number {
  if (done === 0) return 0
  if (done <= 2) return 1
  if (done <= 4) return 2
  if (done <= 6) return 3
  return 4
}

function Grid({
  t,
  start,
  end,
  weeks,
  columns,
}: {
  t: Trackable
  start: string
  end: string
  weeks: number
  columns: number
}) {
  const cols = Math.min(columns, weeks)
  const rows = Math.ceil(weeks / cols)
  const cells = []
  for (let w = 0; w < weeks; w++) {
    const weekStart = addDays(start, w * 7)
    let done = 0
    let elapsed = 0
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d)
      if (day > end) break
      elapsed++
      if (t.days.has(day)) done++
    }
    cells.push(
      <rect
        class={`l${level(done)}`}
        x={(w % cols) * PITCH}
        y={Math.floor(w / cols) * PITCH}
        width={CELL}
        height={CELL}
        rx={2}
      >
        <title>{`week of ${weekStart}: ${done}/${elapsed} days`}</title>
      </rect>,
    )
  }
  return (
    <svg
      class="tracker-grid"
      viewBox={`0 0 ${cols * PITCH - GAP} ${rows * PITCH - GAP}`}
      role="img"
      aria-label={`${t.title} activity`}
    >
      {cells}
    </svg>
  )
}

export default ((userOpts?: Partial<TrackerOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Tracker: QuartzComponent = ({ ctx, displayClass }: QuartzComponentProps) => {
    const end = today(opts.timeZone)
    const start = addDays(end, -weekday(end) - (opts.weeks - 1) * 7)

    const trackables = [...trackerStore(ctx).values()]
      .filter((t) => [...t.days].some((d) => d >= start && d <= end))
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.slug.localeCompare(b.slug))
    if (trackables.length === 0) return null

    return (
      <div class={["tracker", displayClass].filter(Boolean).join(" ")}>
        <h3>{opts.title}</h3>
        <ul>
          {trackables.map((t) => {
            const streak = currentStreak(t, end)
            const weekStreak = currentWeekStreak(t, end)
            const total = [...t.days].filter((d) => d >= start && d <= end).length
            return (
              <li style={t.color ? `--tracker-color: ${t.color}` : undefined}>
                <div class="tracker-head">
                  <span class="tracker-name">{t.title}</span>
                  <span
                    class="tracker-stats"
                    title={`${total} days in the last ${opts.weeks} weeks`}
                  >
                    {`${streak}d / ${weekStreak}w`}
                  </span>
                </div>
                <Grid t={t} start={start} end={end} weeks={opts.weeks} columns={opts.columns} />
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  Tracker.css = style
  return Tracker
}) satisfies QuartzComponentConstructor<Partial<TrackerOptions>>
