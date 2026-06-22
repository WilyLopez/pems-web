'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export type TimerPhase = 'safe' | 'warning' | 'critical' | 'expired'

interface UseWizardTimerOptions {
  /** Duration in seconds. Default: 600 (10 min) */
  durationSeconds?: number
  /** Called once when timer reaches 0 */
  onExpire?: () => void
}

interface UseWizardTimerReturn {
  /** Seconds remaining */
  secondsLeft: number
  /** Total duration in seconds */
  totalSeconds: number
  /** Progress 0–1, where 1 = full time remaining */
  progress: number
  /** Current phase based on time left */
  phase: TimerPhase
  /** MM:SS formatted string */
  displayTime: string
  /** Reset and restart the timer */
  restart: () => void
  /** Pause the countdown */
  pause: () => void
  /** Resume the countdown */
  resume: () => void
}

const SESSION_KEY = 'wizard_start_time'

function getPhase(secondsLeft: number, totalSeconds: number): TimerPhase {
  if (secondsLeft <= 0) return 'expired'
  if (secondsLeft <= 60) return 'critical'
  if (secondsLeft <= 180) return 'warning'
  return 'safe'
}

function formatTime(seconds: number): string {
  const m = Math.floor(Math.max(seconds, 0) / 60)
  const s = Math.max(seconds, 0) % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function useWizardTimer({
  durationSeconds = 600,
  onExpire,
}: UseWizardTimerOptions = {}): UseWizardTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    // Restore remaining time from sessionStorage if already started
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) {
        const startTime = parseInt(stored, 10)
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = durationSeconds - elapsed
        if (remaining > 0) return remaining
      }
    }
    return durationSeconds
  })

  const isPaused = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiredRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    intervalRef.current = setInterval(() => {
      if (isPaused.current) return
      setSecondsLeft((prev) => {
        const next = prev - 1
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true
          sessionStorage.removeItem(SESSION_KEY)
          onExpire?.()
          clearTimer()
          return 0
        }
        return next
      })
    }, 1000)
  }, [clearTimer, onExpire])

  // Init sessionStorage on first mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, Date.now().toString())
    }
    startTimer()
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const restart = useCallback(() => {
    expiredRef.current = false
    sessionStorage.setItem(SESSION_KEY, Date.now().toString())
    setSecondsLeft(durationSeconds)
    isPaused.current = false
    startTimer()
  }, [durationSeconds, startTimer])

  const pause = useCallback(() => {
    isPaused.current = true
  }, [])

  const resume = useCallback(() => {
    isPaused.current = false
  }, [])

  const progress = Math.max(0, secondsLeft / durationSeconds)
  const phase = getPhase(secondsLeft, durationSeconds)

  return {
    secondsLeft,
    totalSeconds: durationSeconds,
    progress,
    phase,
    displayTime: formatTime(secondsLeft),
    restart,
    pause,
    resume,
  }
}
