import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { flashingChannelsAtom } from "../shared/atoms";

export const useFlashingChannels = () => {
  const [flashingChannels, setFlashingChannels] = useAtom(flashingChannelsAtom)
  const activeFlashesRef = useRef(new Set())
  const pendingUpdatesRef = useRef(new Set())
  const rafIdRef = useRef<number | null>(null)
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const scheduleUpdate = useCallback(() => {
    if (rafIdRef.current !== null) return

    rafIdRef.current = requestAnimationFrame(() => {
      const hasChanges = pendingUpdatesRef.current.size > 0
      pendingUpdatesRef.current.clear()
      rafIdRef.current = null

      if (hasChanges) {
        setFlashingChannels(new Set(activeFlashesRef.current))
      }
    });
  }, [setFlashingChannels])

  const flashChannel = useCallback(
    (channelName: string, duration = 100) => {
      const isAlreadyFlashing = activeFlashesRef.current.has(channelName)

      const existingTimeout = timeoutsRef.current.get(channelName)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      if (!isAlreadyFlashing) {
        activeFlashesRef.current.add(channelName)
        pendingUpdatesRef.current.add(channelName)
        scheduleUpdate()
      }

      const timeoutId = setTimeout(() => {
        activeFlashesRef.current.delete(channelName)
        pendingUpdatesRef.current.add(channelName)
        timeoutsRef.current.delete(channelName)
        scheduleUpdate()
      }, duration)

      timeoutsRef.current.set(channelName, timeoutId)
    },
    [scheduleUpdate]
  )

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
      timeoutsRef.current.clear()
    }
  }, [])

  return [flashingChannels, flashChannel]
}