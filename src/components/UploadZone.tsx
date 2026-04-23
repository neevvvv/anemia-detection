import { useRef, useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'

interface UploadZoneProps {
  label: string
  hint: string
  icon: React.ReactNode
  onFileSelect: (file: File | null) => void
  previewUrl: string | null
}

export default function UploadZone({ label, hint, icon, onFileSelect, previewUrl }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => onFileSelect(file)
    reader.readAsDataURL(file)
  }, [onFileSelect])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Upload zone for ${label}`}
      onClick={() => !previewUrl && inputRef.current?.click()}
      onKeyDown={e => e.key === 'Enter' && !previewUrl && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[260px] p-8
        ${dragging
          ? 'border-primary bg-[hsl(var(--primary)/0.08)] shadow-primary'
          : 'border-border bg-card hover:border-[hsl(var(--primary)/0.6)] hover:bg-[hsl(var(--primary)/0.04)] shadow-card'
        }
        ${previewUrl ? 'cursor-default' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
        aria-label={`File input for ${label}`}
      />

      {previewUrl ? (
        <>
          <img src={previewUrl} alt={`Preview of ${label}`} className="w-full h-48 object-cover rounded-xl" />
          <button
            onClick={e => { e.stopPropagation(); onFileSelect(null); if (inputRef.current) inputRef.current.value = '' }}
            aria-label="Remove image"
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"
          >
            <X size={13} />
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.12)] flex items-center justify-center mb-5 text-primary border border-[hsl(var(--primary)/0.2)]">
            {icon}
          </div>
          <p className="font-heading font-semibold text-foreground mb-1.5">{label}</p>
          <p className="text-xs text-muted mb-3">{hint}</p>
          <p className="text-xs text-muted">
            <span className="text-primary font-semibold">Click to upload</span> or drag &amp; drop
          </p>
          <Upload size={13} className="text-muted/50 mt-2" />
        </>
      )}
    </div>
  )
}
