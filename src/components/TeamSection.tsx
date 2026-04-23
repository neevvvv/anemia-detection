import { Linkedin } from 'lucide-react'

const team = [
  { name: 'Ankit Prajapat', initials: 'AP', linkedin: '#' },
  { name: 'Neev Sahu',      initials: 'NS', linkedin: '#' },
  { name: 'Arpit Patel',    initials: 'AP', linkedin: '#' },
  { name: 'Saket Kaurav',   initials: 'SK', linkedin: '#' },
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
              <h3 className="font-heading font-semibold text-foreground mb-4">{member.name}</h3>
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
