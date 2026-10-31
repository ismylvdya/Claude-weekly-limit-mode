export type Win = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'weekly-segments': { limits: Win[]; isHidden: boolean }
  }
}
