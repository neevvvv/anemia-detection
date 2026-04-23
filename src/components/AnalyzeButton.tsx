import { Zap } from 'lucide-react'

interface AnalyzeButtonProps {
  ready: boolean
  loading: boolean
  progress: number
  statusText: string
  onAnalyze: () => void
}

export default function AnalyzeButton({ ready, loading, progress, statusText, onAnalyze }: AnalyzeButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <button
        onClick={onAnalyze}
        disabled={!ready || loading}
        aria-label="Analyze uploaded images"
        className={`inline-flex items-center gap-2.5 font-heading font-semibold px-12 py-4 rounded-full transition-all text-base
          ${ ready && !loading
            ? 'btn-primary animate-pulse-glow'
            : 'bg-card border border-border text-muted cursor-not-allowed opacity-50'
          }`}
      >
        <Zap size={17} />
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {loading && (
        <div className="w-full max-w-xs animate-fade-in">
          <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(191 91% 65%))'
              }}
            />
          </div>
          <p className="text-xs text-muted text-center tracking-wide">{statusText}</p>
        </div>
      )}

      {!ready && !loading && (
        <p className="text-xs text-muted">Upload both images to enable analysis.</p>
      )}
    </div>
  )
}
