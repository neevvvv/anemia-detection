export interface PredictionResult {
  label: 'Anemic' | 'Non-Anemic'
  confidence: number
  explanation: string
}

const ANEMIC_EXPLANATIONS = [
  'Low hemoglobin indicators detected in nail bed pallor and palm coloration. Reduced redness in the thenar eminence suggests possible iron deficiency.',
  'Pale nail bed coloration and reduced palm vascularity detected. These visual markers are consistent with low hemoglobin levels.',
  'Significant pallor observed in both nail bed and palm regions. Color histogram analysis indicates reduced red channel intensity.',
]

const NON_ANEMIC_EXPLANATIONS = [
  'Healthy pink coloration detected in nail bed and palm. Red channel intensity and texture features are within normal ranges.',
  'Strong hemoglobin indicators present. Palm vascularity and nail bed color are consistent with normal hemoglobin levels.',
  'No significant pallor detected. Color and texture features from both images suggest normal iron levels.',
]

/** Simulates a 5-model ensemble ML prediction (Decision Tree, Random Forest, KNN, Logistic Regression, SVM) */
export function predict(): PredictionResult {
  const isAnemic = Math.random() < 0.45
  const label: 'Anemic' | 'Non-Anemic' = isAnemic ? 'Anemic' : 'Non-Anemic'
  const confidence = parseFloat((Math.random() * 0.18 + 0.78).toFixed(2)) // 0.78–0.96
  const pool = isAnemic ? ANEMIC_EXPLANATIONS : NON_ANEMIC_EXPLANATIONS
  const explanation = pool[Math.floor(Math.random() * pool.length)]
  return { label, confidence, explanation }
}
