export interface TrackerOptions {
  /** Folder (relative to the content root) holding one note per trackable */
  folder: string
  /** Heading shown above the grids */
  title: string
  /** Number of weeks shown in each grid */
  weeks: number
  /** Week cells per row; the grid wraps onto further rows */
  columns: number
  /** IANA time zone used to decide what day it is at build time; defaults to the system's */
  timeZone?: string
}

export const defaultOptions: TrackerOptions = {
  folder: "trackers",
  title: "Trackers",
  weeks: 52,
  columns: 18,
}

export interface Trackable {
  slug: string
  title: string
  color?: string
  maxGap: number
  order?: number
  days: Set<string>
}

const STORE_KEY = "__trackerPlugin"

export function trackerStore(ctx: unknown): Map<string, Trackable> {
  const holder = ctx as Record<string, Map<string, Trackable> | undefined>
  return (holder[STORE_KEY] ??= new Map())
}

export function inTrackerFolder(slug: string | undefined, folder: string): slug is string {
  const prefix = folder.replace(/^\/+|\/+$/g, "") + "/"
  return !!slug && slug.startsWith(prefix)
}

export function toDay(value: unknown): string | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10)
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
    return value.trim().slice(0, 10)
  }
  return null
}

export function parseTrackable(slug: string, frontmatter: Record<string, unknown>): Trackable {
  const entries = Array.isArray(frontmatter.entries) ? frontmatter.entries : []
  const days = new Set(entries.map(toDay).filter((d): d is string => d !== null))
  const maxGap = Number(frontmatter.maxGap)
  const order = Number(frontmatter.order)
  return {
    slug,
    title:
      typeof frontmatter.title === "string" ? frontmatter.title : (slug.split("/").pop() ?? slug),
    color: typeof frontmatter.color === "string" ? frontmatter.color : undefined,
    maxGap: Number.isFinite(maxGap) && maxGap > 0 ? maxGap : 0,
    order: Number.isFinite(order) ? order : undefined,
    days,
  }
}

export function today(timeZone?: string): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date())
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function weekday(day: string): number {
  return new Date(`${day}T00:00:00Z`).getUTCDay()
}

export function currentStreak(t: Trackable, from: string): number {
  if (t.days.size === 0) return 0
  const earliest = [...t.days].sort()[0]!
  let day = t.days.has(from) ? from : addDays(from, -1)
  let streak = 0
  let gap = 0
  while (day >= earliest) {
    if (t.days.has(day)) {
      streak++
      gap = 0
    } else if (++gap > t.maxGap) {
      break
    }
    day = addDays(day, -1)
  }
  return streak
}

export function currentWeekStreak(t: Trackable, from: string): number {
  if (t.days.size === 0) return 0
  const earliest = [...t.days].sort()[0]!
  const active = (weekStart: string) =>
    [0, 1, 2, 3, 4, 5, 6].some((d) => t.days.has(addDays(weekStart, d)))
  let week = addDays(from, -weekday(from))
  if (!active(week)) week = addDays(week, -7)
  let streak = 0
  while (addDays(week, 6) >= earliest && active(week)) {
    streak++
    week = addDays(week, -7)
  }
  return streak
}
