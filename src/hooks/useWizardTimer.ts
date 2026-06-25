'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export type TimerPhase = 'safe' | 'warning' | 'critical' | 'expired'

interface UseWizardTimerOptions {
  durationSeconds?: number
  sessionKey?: string
  startPaused?: boolean
  onExpire?: () => void
}

interface UseWizardTimerReturn {
  secondsLeft: number
  totalSeconds: number
  progress: number
  phase: TimerPhase
  displayTime: string
  restart: () => void
  pause: () => void
  resume: () => void
}

function getPhase(secondsLeft: number): TimerPhase {
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
  sessionKey = 'wizard_session_timer',
  startPaused = false,
  onExpire,
}: UseWizardTimerOptions = {}): UseWizardTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(sessionKey)
      if (stored) {
        const startTime = parseInt(stored, 10)
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = durationSeconds - elapsed
        if (remaining > 0) return remaining
      }
    }
    return durationSeconds
  })

  const isPaused = useRef(startPaused)
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
          sessionStorage.removeItem(sessionKey)
          onExpire?.()
          clearTimer()
          return 0
        }
        return next
      })
    }, 1000)
  }, [clearTimer, sessionKey, onExpire])

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, Date.now().toString())
    }
    startTimer()
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const restart = useCallback(() => {
    expiredRef.current = false
    sessionStorage.setItem(sessionKey, Date.now().toString())
    setSecondsLeft(durationSeconds)
    isPaused.current = false
    startTimer()
  }, [durationSeconds, sessionKey, startTimer])

  const pause = useCallback(() => {
    isPaused.current = true
  }, [])

  const resume = useCallback(() => {
    isPaused.current = false
  }, [])

  const progress = Math.max(0, secondsLeft / durationSeconds)

  return {
    secondsLeft,
    totalSeconds: durationSeconds,
    progress,
    phase: getPhase(secondsLeft),
    displayTime: formatTime(secondsLeft),
    restart,
    pause,
    resume,
  }
}
