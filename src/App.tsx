import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import UploadSection from './components/UploadSection'
import AnalyzeButton from './components/AnalyzeButton'
import ResultCard from './components/ResultCard'
import AboutSection from './components/AboutSection'
import TeamSection from './components/TeamSection'
import Footer from './components/Footer'
import { useDarkMode } from './hooks/useDarkMode'
import { usePrediction } from './hooks/usePrediction'

export default function App() {
  const { dark, toggle } = useDarkMode()
  const { status, progress, statusText, result, error, run, reset } = usePrediction()

  const [palmFile, setPalmFile] = useState<File | null>(null)
  const [nailFile,  setNailFile]  = useState<File | null>(null)

  const handleReady = (palm: File | null, nail: File | null) => {
    setPalmFile(palm)
    setNailFile(nail)
  }

  const handleAnalyze = () => {
    if (palmFile && nailFile) run(palmFile, nailFile)
  }

  const handleReset = () => {
    reset()
    setPalmFile(null)
    setNailFile(null)
  }

  const ready = !!palmFile && !!nailFile

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar dark={dark} onToggleDark={toggle} />
      <main>
        <Hero />
        <UploadSection onReady={handleReady} />
        <AnalyzeButton
          ready={ready}
          loading={status === 'loading'}
          progress={progress}
          statusText={statusText}
          onAnalyze={handleAnalyze}
        />
        <ResultCard result={result} error={error} onReset={handleReset} />
        <AboutSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  )
}
