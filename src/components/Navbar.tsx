import { useState } from 'react'
import { Activity, Sun, Moon, Menu, X } from 'lucide-react'

interface NavbarProps {
  dark: boolean
  onToggleDark: () => void
}

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Upload', href: '#upload' },
  { label: 'Result', href: '#result' },
  { label: 'About', href: '#about' },
]

export default function Navbar({ dark, onToggleDark }: NavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full btn-primary flex items-center justify-center shrink-0">
            <Activity size={17} className="text-white" />
          </span>
          <span className="font-heading font-bold text-[1.05rem] text-foreground tracking-tight">
            HemoScan<span className="text-primary">.AI</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className="text-sm font-medium text-muted hover:text-foreground transition-colors hover:text-primary">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-full border border-border bg-card-2 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            className="md:hidden w-9 h-9 rounded-full border border-border bg-card-2 flex items-center justify-center text-muted"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-card border-t border-border px-8 py-4 flex flex-col gap-4">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted hover:text-primary transition-colors py-0.5"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
