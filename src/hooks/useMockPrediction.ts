import { useState, useRef } from 'react'
import { predict, PredictionResult } from '../lib/mockML'

type Status = 'idle' | 'loading' | 'success'

const STATUS_STEPS = [
  'Extracting features...',
  'Running ensemble models...',
  'Generating prediction...',
]

export function useMockPrediction() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [result, setResult] = useState<PredictionResult | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function run() {
    if (status === 'loading') return
    setStatus('loading')
    setProgress(0)
    setResult(null)

    const totalMs = 2400
    const intervalMs = 40
    const steps = totalMs / intervalMs
    let tick = 0

    timerRef.current = setInterval(() => {
      tick++
      const pct = Math.min(Math.round((tick / steps) * 100), 100)
      setProgress(pct)

      // Cycle status text at 0%, 40%, 75%
      if (pct < 40) setStatusText(STATUS_STEPS[0])
      else if (pct < 75) setStatusText(STATUS_STEPS[1])
      else setStatusText(STATUS_STEPS[2])

      if (pct >= 100) {
        clearInterval(timerRef.current!)
        setResult(predict())
        setStatus('success')
      }
    }, intervalMs)
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current)
    setStatus('idle')
    setProgress(0)
    setStatusText('')
    setResult(null)
  }

  return { status, progress, statusText, result, run, reset }
}
