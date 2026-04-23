import { useState } from 'react'
import { Hand, Pill } from 'lucide-react'
import UploadZone from './UploadZone'

interface UploadSectionProps {
  onReady: (palmFile: File | null, nailFile: File | null) => void
}

export default function UploadSection({ onReady }: UploadSectionProps) {
  const [palmFile, setPalmFile] = useState<File | null>(null)
  const [nailFile, setNailFile] = useState<File | null>(null)
  const [palmPreview, setPalmPreview] = useState<string | null>(null)
  const [nailPreview, setNailPreview] = useState<string | null>(null)

  const handlePalm = (file: File | null) => {
    setPalmFile(file)
    setPalmPreview(file ? URL.createObjectURL(file) : null)
    onReady(file, nailFile)
  }

  const handleNail = (file: File | null) => {
    setNailFile(file)
    setNailPreview(file ? URL.createObjectURL(file) : null)
    onReady(palmFile, file)
  }

  return (
    <section id="upload" className="py-16 section-alt">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.18em] text-primary mb-3">STEP 01</p>
          <h2 className="text-4xl font-heading font-bold text-foreground mb-3">Upload your images</h2>
          <p className="text-muted max-w-md mx-auto leading-relaxed">
            Provide a clear photo of your palm and one fingernail. Both are required for analysis.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <UploadZone
            label="Palm Image"
            hint="Open palm, well lit, no filters"
            icon={<Hand size={28} />}
            onFileSelect={handlePalm}
            previewUrl={palmPreview}
          />
          <UploadZone
            label="Fingernail Image"
            hint="Close-up of one finger nail bed"
            icon={<Pill size={28} />}
            onFileSelect={handleNail}
            previewUrl={nailPreview}
          />
        </div>
      </div>
    </section>
  )
}
