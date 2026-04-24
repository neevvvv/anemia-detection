import { Activity, Github, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="max-w-[1200px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 font-heading font-bold text-foreground">
          <span className="w-8 h-8 rounded-full btn-primary flex items-center justify-center shrink-0">
            <Activity size={15} className="text-white" />
          </span>
          <span>HemoScan.AI</span>
        </div>

        <p className="text-sm text-muted text-center">
          ML Research Project © 2026
        </p>

        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="w-9 h-9 rounded-full border border-border bg-background-2 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"
          >
            <Github size={15} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-9 h-9 rounded-full border border-border bg-background-2 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"
          >
            <Linkedin size={15} />
          </a>
        </div>
      </div>
    </footer>
  )
}
