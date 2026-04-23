import { useState, useRef } from 'react'
import { predict, PredictionResult } from '../lib/api'

type Status = 'idle' | 'loading' | 'success' | 'error'

const STATUS_STEPS = [
  'Extracting features...',
  'Running ensemble models...',
  'Generating prediction...',
]

export function usePrediction() {
  const [status, setStatus]       = useState<Status>('idle')
  const [progress, setProgress]   = useState(0)
  const [statusText, setStatusText] = useState('')
  const [result, setResult]       = useState<PredictionResult | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Animates a fake progress bar (UX feedback while the API call runs),
   * then fires the real fetch to the Flask backend.
   */
  async function run(palmFile: File, nailFile: File) {
    if (status === 'loading') return
    setStatus('loading')
    setProgress(0)
    setResult(null)
    setError(null)

    // Animate progress bar up to 85% while waiting for the API
    let tick = 0
    timerRef.current = setInterval(() => {
      tick++
      const pct = Math.min(Math.round((tick / 60) * 85), 85)
      setProgress(pct)
      if (pct < 35)       setStatusText(STATUS_STEPS[0])
      else if (pct < 70)  setStatusText(STATUS_STEPS[1])
      else                setStatusText(STATUS_STEPS[2])
    }, 40)

    try {
      const data = await predict(palmFile, nailFile)
      clearInterval(timerRef.current!)
      setProgress(100)
      setResult(data)
      setStatus('success')
    } catch (err) {
      clearInterval(timerRef.current!)
      setProgress(0)
      setError(err instanceof Error ? err.message : 'Prediction failed')
      setStatus('error')
    }
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current)
    setStatus('idle')
    setProgress(0)
    setStatusText('')
    setResult(null)
    setError(null)
  }

  return { status, progress, statusText, result, error, run, reset }
}
