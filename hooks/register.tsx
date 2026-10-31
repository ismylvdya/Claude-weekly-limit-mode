import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Win } from '../types'

const limits = atom({ plugin: 'weekly-segments', key: 'limits' } as const, [])
const isHidden = atom({ plugin: 'weekly-segments', key: 'isHidden' } as const, false)

const SEGMENTS = 7
const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

function todayIndex(week: Win, now: number) {
  const resetMs = week.resetsAt ? new Date(week.resetsAt).getTime() : NaN
  if (Number.isNaN(resetMs)) return -1
  const elapsed = Math.min(WEEK_MS, Math.max(0, now - (resetMs - WEEK_MS)))
  return Math.min(SEGMENTS - 1, Math.floor(elapsed / DAY_MS))
}

// One dot for a share of its slice: ○ under 10%, ◐ from 10% to 75%, ● from 75%.
function dot(fraction: number) {
  return fraction >= 0.75 ? '●' : fraction >= 0.1 ? '◐' : '○'
}

// Status line: a dot per day, today as ten dots, each one a tenth of today's slice.
function statusText(used: number, today: number) {
  const span = 100 / SEGMENTS
  const parts: string[] = []
  for (let i = 0; i < SEGMENTS; i++) {
    const fraction = Math.min(1, Math.max(0, (used - i * span) / span))
    if (i === today) {
      let cells = ''
      for (let j = 0; j < 10; j++) cells += dot(Math.min(1, Math.max(0, fraction * 10 - j)))
      parts.push(cells)
    } else parts.push(dot(fraction))
  }
  // Fullwidth dots on both sides of today's bar, halfwidth between the single days.
  return parts.map((part, i) => (i === 0 ? part : (i === today || i - 1 === today ? ' \u30fb ' : ' \uff65 ') + part)).join('')
}

// A function that receives $ must be declared at the top level of the file.
async function refresh($: any) {
  try {
    const u = await $.session.usage()
    const next: Win[] = (u.rateLimits ?? [])
      .filter((w: any) => w.kind === 'seven_day')
      .map((w: any): Win => ({ kind: w.kind, percentUsed: w.percentUsed, resetsAt: w.resetsAt }))
    await update($, limits, () => next)
    const week = next[0]
    if (!week || (await read($, isHidden))) $.ui.status(undefined)
    else $.ui.status(statusText(week.percentUsed, todayIndex(week, await $.clock.now())))
  } catch {}
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({
        name: 'weekly-segments',
        description: 'Show or hide the weekly-limit status line',
      })
    } catch {}
    await refresh($)
    $.clock.every(30000, () => refresh($))
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  on('command.run', { command: 'weekly-segments' }, async $ => {
    const hidden = await read($, isHidden)
    await update($, isHidden, () => !hidden)
    await refresh($)
    return { text: hidden ? 'Weekly segments shown.' : 'Weekly segments hidden. /weekly-segments shows them again.' }
  })
}
