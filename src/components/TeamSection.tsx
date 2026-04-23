import { Linkedin } from 'lucide-react'

const team = [
  { name: 'Ankit Prajapat', initials: 'AP', scholar: '2311401129', linkedin: 'https://www.linkedin.com/in/ankit-prajapat/' },
  { name: 'Neev Sahu',      initials: 'NS', scholar: '2311401128', linkedin: 'https://www.linkedin.com/in/neev-sahu/' },
  { name: 'Arpit Patel',    initials: 'AP', scholar: '2311401137', linkedin: 'https://www.linkedin.com/in/arpit-patel-072a352a7/' },
  { name: 'Saket Kourav',   initials: 'SK', scholar: '2311401116', linkedin: 'https://www.linkedin.com/in/saket-kourav-1a5806286/' },
]

export default function TeamSection() {
  return (
    <section id="team" className="py-16 bg-background">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.18em] text-primary mb-3">THE TEAM</p>
          <h2 className="text-4xl font-heading font-bold text-foreground mb-3">Our Team</h2>
          <p className="text-muted max-w-md mx-auto leading-relaxed">
            The researchers and developers behind the Anemia Detection System.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-card border border-border rounded-2xl p-6 shadow-card card-hover flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl btn-primary flex items-center justify-center mb-4 text-white font-heading font-bold text-xl">
                {member.initials}
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">{member.name}</h3>
              <p className="text-xs text-muted mb-4">{member.scholar}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"
                aria-label={`${member.name} LinkedIn`}
              >
                <Linkedin size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
