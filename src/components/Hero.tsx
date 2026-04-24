import { ArrowRight, BookOpen } from 'lucide-react'
import heroHand from '../assets/hero-hand.png'

export default function Hero() {
  return (
    <section id="home" className="hero-gradient min-h-[calc(100vh-4rem)] flex items-center">
      <div className="max-w-[1200px] mx-auto px-8 py-12 grid md:grid-cols-2 gap-10 items-center">
        {/* Text */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 text-xs font-semibold border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.08)] rounded-full px-3.5 py-1.5 mb-5 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
            AI-powered health screening
          </span>
          <h1 className="text-5xl md:text-[3.75rem] font-heading font-bold leading-[1.08] mb-4">
            Anemia<br />
            <span className="gradient-text">Detection</span><br />
            System
          </h1>
          <p className="text-muted text-lg mb-7 max-w-md leading-relaxed">
            AI-powered health screening using <strong className="text-foreground font-semibold">palm</strong> and{' '}
            <strong className="text-foreground font-semibold">fingernail</strong> images. Non-invasive, instant, and accessible.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="#upload"
              className="btn-primary inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full"
            >
              Get Started <ArrowRight size={16} />
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 border border-border bg-card text-foreground font-medium px-7 py-3.5 rounded-full hover:border-primary hover:text-primary transition-all"
            >
              <BookOpen size={15} /> Learn more
            </a>
          </div>

          {/* Stat badges */}
          <div className="flex flex-wrap gap-3">
            {[
              { stat: '95%', label: 'Accuracy' },
              { stat: '<3s', label: 'Analysis' },
              { stat: '5', label: 'ML Models' },
            ].map(b => (
              <div key={b.label} className="bg-card border border-border rounded-xl px-5 py-3 shadow-card min-w-[90px]">
                <div className="font-heading font-bold text-xl text-foreground">{b.stat}</div>
                <div className="text-xs text-muted mt-0.5">{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div className="flex justify-end animate-float">
          <div className="relative rounded-2xl overflow-hidden border border-[hsl(var(--primary)/0.25)] shadow-primary w-full"
            style={{ background: 'linear-gradient(145deg, hsl(191 60% 18%), hsl(220 44% 10%))' }}>
            <img
              src={heroHand}
              alt="Open palm with AI scanning overlay showing feature detection points"
              className="w-full h-auto object-cover"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card/80 backdrop-blur border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-foreground">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Live AI Scanning
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

