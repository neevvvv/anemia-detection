export interface PredictionResult {
  label: 'Anemic' | 'Non-Anemic'
  confidence: number
  explanation: string
  model_votes?: number
  total_models?: number
  per_model?: Record<string, { prediction: string; confidence: number }>
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

/**
 * Sends palm + nail images to the Flask backend and returns the ensemble prediction.
 * The backend replicates the exact Colab feature extraction pipeline
 * (CLAHE → hand segmentation → color/texture/LBP/Hu features)
 * and runs all 5 trained sklearn models (LR, SVM, RF, DT, KNN).
 */
export async function predict(palmFile: File, nailFile: File): Promise<PredictionResult> {
  const form = new FormData()
  form.append('palm', palmFile)
  form.append('nail', nailFile)

  const res = await fetch(`${API_BASE}/predict`, { method: 'POST', body: form })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }

  const data = await res.json()
  return {
    label:        data.label,
    confidence:   data.confidence,
    explanation:  data.explanation,
    model_votes:  data.model_votes,
    total_models: data.total_models,
    per_model:    data.per_model,
  }
}
