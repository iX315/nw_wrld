/**
 * Logger - Conditional logging utility for performance-critical code
 *
 * Console operations are synchronous and block the main thread.
 * In hot paths (MIDI handlers, animation loops), console logging can add
 * 20-40ms of latency per event when heavily used.
 *
 * Usage:
 * - Set DEBUG = true during development
 * - Set DEBUG = false for production/performance
 * - console.error is always active for critical errors
 */

const isPackaged = (() => {
  try {
    const bridge = globalThis.nwWrldBridge
    const fn = bridge?.app?.isPackaged
    if (typeof fn === 'function') return Boolean(fn())
  } catch {}
  return true
})()

const DEBUG = !isPackaged

export const logger = {
  debugEnabled: DEBUG,
  /**
   * Debug logging - disabled in production for performance
   */
  log: DEBUG ? console.log.bind(console) : () => {},

  /**
   * Warning logging - disabled in production for performance
   */
  warn: DEBUG ? console.warn.bind(console) : () => {},

  /**
   * Error logging - always enabled for critical issues
   */
  error: console.error.bind(console)
}

export default logger
