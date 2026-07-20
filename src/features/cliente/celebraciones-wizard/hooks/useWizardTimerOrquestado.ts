'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useWizardTimer } from './useWizardTimer'

const WIZARD_DURATION = 600

export function useWizardTimerOrquestado(
  paso: 1 | 2 | 3 | 4,
  pausadoPorModal: boolean
) {
  const [timerExpired, setTimerExpired] = useState(false)
  const prevPasoRef = useRef<1 | 2 | 3 | 4>(1)

  const {
    secondsLeft,
    progress: timerProgress,
    phase: timerPhase,
    displayTime: timerDisplay,
    restart: restartTimer,
    pause: pauseTimer,
    resume: resumeTimer,
  } = useWizardTimer({
    durationSeconds: WIZARD_DURATION,
    sessionKey: 'evento_wizard_timer',
    startPaused: true,
    onExpire: () => setTimerExpired(true),
  })

  useEffect(() => {
    const prev = prevPasoRef.current
    prevPasoRef.current = paso

    if (paso === 2 && prev === 1) {
      restartTimer()
    } else if (paso === 1) {
      pauseTimer()
    } else {
      resumeTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso])

  useEffect(() => {
    if (pausadoPorModal) pauseTimer()
    else if (paso > 1) resumeTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pausadoPorModal])

  useEffect(() => {
    if (secondsLeft === 180) {
      toast.warning('Te quedan 3 minutos para completar tu solicitud', {
        duration: 8000,
      })
    }
    if (secondsLeft === 60) {
      toast.error('Solo queda 1 minuto. Completa tu solicitud pronto.', {
        duration: 15000,
      })
    }
  }, [secondsLeft])

  return {
    secondsLeft,
    timerProgress,
    timerPhase,
    timerDisplay,
    restartTimer,
    timerExpired,
    setTimerExpired,
  }
}
