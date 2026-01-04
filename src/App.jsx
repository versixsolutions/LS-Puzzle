import { useState } from 'react'
import ModeSelector from './shared/components/ModeSelector'
import NeurotypicalApp from './modes/neurotypical/NeurotypicalApp'
import TeaApp from './modes/tea/TeaApp'
import { MODES } from './config/constants'

function App() {
  const [selectedMode, setSelectedMode] = useState(null)

  const handleModeSelect = (mode) => {
    setSelectedMode(mode)
  }

  const handleBackToModeSelection = () => {
    setSelectedMode(null)
  }

  if (!selectedMode) {
    return <ModeSelector onModeSelect={handleModeSelect} />
  }

  if (selectedMode === MODES.NEUROTYPICAL) {
    return <NeurotypicalApp onBack={handleBackToModeSelection} />
  }

  if (selectedMode === MODES.TEA) {
    return <TeaApp onBack={handleBackToModeSelection} />
  }

  return null
}

export default App
