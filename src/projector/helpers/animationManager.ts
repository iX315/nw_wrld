import TWEEN from '@tweenjs/tween.js'

/**
 * AnimationManager - Centralized requestAnimationFrame coordinator
 *
 * Consolidates multiple animation loops into a single RAF loop to prevent
 * scheduling conflicts and reduce CPU overhead when multiple modules are active.
 *
 * Performance benefits:
 * - Single RAF callback instead of N callbacks (one per module instance)
 * - Guaranteed synchronization: all modules update in the same frame
 * - Reduced browser scheduler overhead
 * - Automatic cleanup when no subscribers remain
 */
class AnimationManager {
  constructor() {
    this.subscribers = new Set()
    this.rafId = null
    this.tick = this.tick.bind(this)
  }

  /**
   * Register a callback to be called on every animation frame
   * @param {Function} callback - The animation callback to execute each frame
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.error(
        '[AnimationManager] Subscribe called with non-function:',
        callback
      )
      return
    }

    this.subscribers.add(callback)

    // Start the loop if this is the first subscriber
    if (!this.rafId) {
      this.start()
    }
  }

  /**
   * Unregister a callback from the animation loop
   * @param {Function} callback - The callback to remove
   */
  unsubscribe(callback) {
    this.subscribers.delete(callback)

    // Stop the loop if no subscribers remain
    if (this.subscribers.size === 0) {
      this.stop()
    }
  }

  /**
   * Main animation loop tick - executes all subscribed callbacks
   */
  tick() {
    // Update tweens ONCE per frame globally
    TWEEN.update()

    // Execute all subscriber callbacks
    this.subscribers.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error(
          '[AnimationManager] Error in subscriber callback:',
          error
        )
      }
    })

    this.rafId = requestAnimationFrame(this.tick)
  }

  /**
   * Start the animation loop
   */
  start() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.tick)
    }
  }

  /**
   * Stop the animation loop
   */
  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * Get current subscriber count (useful for debugging)
   */
  getSubscriberCount() {
    return this.subscribers.size
  }
}

// Singleton instance - shared across all modules
export const animationManager = new AnimationManager()
