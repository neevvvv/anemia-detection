import { AlertCircle, CheckCircle, RotateCcw, TrendingUp } from 'lucide-react'
import { PredictionResult } from '../lib/api'

interface ResultCardProps {
  result: PredictionResult | null
  error: string | null
  onReset: () => void
}

export default function ResultCard({ result, error, onReset }: ResultCardProps) {
  const isAnemic = result?.label === 'Anemic'

  return (
    <section id="result" className="py-16 bg-background">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-[0.18em] text-primary mb-3">STEP 02</p>
          <h2 className="text-4xl font-heading font-bold text-foreground mb-2">Prediction result</h2>
          <p className="text-muted">AI-driven assessment based on your uploaded images.</p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card p-8 shadow-card animate-scale-in">

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle size={26} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Prediction failed</p>
                <p className="text-sm text-muted max-w-sm">{error}</p>
              </div>
              <button onClick={onReset} className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-5 py-2.5 rounded-full hover:border-primary hover:text-primary transition-all">
                <RotateCcw size={14} /> Try Again
              </button>
            </div>
          )}

          {/* Idle state */}
          {!result && !error && (
            <div className="flex flex-col items-center gap-4 py-10 text-muted">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center">
                <TrendingUp size={26} className="text-primary" />
              </div>
              <p className="text-sm">Your prediction will appear here after analysis.</p>
            </div>
          )}

          {/* Result state */}
          {result && !error && (
            <div className="animate-fade-up">
              {/* Result banner */}
              <div className={`flex items-center gap-4 mb-6 p-5 rounded-xl border ${
                isAnemic
                  ? 'bg-red-500/8 border-red-500/20 dark:bg-red-500/10'
                  : 'bg-emerald-500/8 border-emerald-500/20 dark:bg-emerald-500/10'
              }`}>
                {isAnemic
                  ? <AlertCircle size={40} className="text-red-500 shrink-0" />
                  : <CheckCircle size={40} className="text-emerald-500 shrink-0" />
                }
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Ensemble Prediction</p>
                  <p className={`text-4xl font-heading font-bold ${isAnemic ? 'text-red-500' : 'text-emerald-500'}`}>
                    {result.label}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <p className="text-muted text-sm leading-relaxed mb-6 p-4 bg-background-2 rounded-xl border border-border">
                {result.explanation}
              </p>

              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-6 py-2.5 rounded-full hover:border-primary hover:text-primary transition-all"
              >
                <RotateCcw size={14} /> Analyze Again
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
