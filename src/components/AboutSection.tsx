import { ImageIcon, Layers, BarChart2, AlertTriangle } from 'lucide-react'

const pipeline = [
  {
    icon: <ImageIcon size={20} className="text-white" />,
    title: 'Image Processing',
    desc: 'Color, texture and intensity features are extracted from the palm and nail bed regions using OpenCV-based pipelines.',
  },
  {
    icon: <Layers size={20} className="text-white" />,
    title: 'Feature Engineering',
    desc: 'Hand-crafted features replace heavy CNNs — making the model lightweight, explainable and edge-deployable.',
  },
  {
    icon: <BarChart2 size={20} className="text-white" />,
    title: 'Ensemble Prediction',
    desc: 'Multiple ML models vote on the final prediction to maximize reliability and reduce false negatives.',
  },
]

const models = ['Decision Tree', 'Random Forest', 'K-Nearest Neighbors', 'Logistic Regression', 'SVM']

export default function AboutSection() {
  return (
    <section id="about" className="py-16 section-alt">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.18em] text-primary mb-3">ABOUT</p>
          <h2 className="text-4xl font-heading font-bold text-foreground mb-3">How it works</h2>
          <p className="text-muted max-w-lg mx-auto leading-relaxed">
            A non-invasive screening pipeline powered by classical and quantum machine learning.
          </p>
        </div>

        {/* Pipeline cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          {pipeline.map(p => (
            <div key={p.title} className="bg-card border border-border rounded-2xl p-6 shadow-card card-hover">
              <div className="w-11 h-11 rounded-xl btn-primary flex items-center justify-center mb-4">
                {p.icon}
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Models + disclaimer */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Models used</h3>
          <div className="flex flex-wrap gap-2.5 mb-5">
            {models.map(m => (
              <span key={m} className="inline-flex items-center gap-1.5 border border-border bg-background-2 rounded-full px-3.5 py-1.5 text-sm text-foreground font-medium">
                <span className="w-2 h-2 rounded-full bg-accent" />
                {m}
              </span>
            ))}
          </div>
          <div className="flex gap-3 text-sm text-muted bg-background-2 rounded-xl p-4 border border-border">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This tool is a research demo for academic purposes only and is not a substitute for professional medical
              diagnosis. Please consult a qualified healthcare provider for any health concerns.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
