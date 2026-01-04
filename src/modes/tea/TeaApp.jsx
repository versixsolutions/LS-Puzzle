import { useState, useEffect } from 'react'
import WelcomeScreen from './screens/WelcomeScreen'
import RegisterScreen from './screens/RegisterScreen'
import UploadScreen from './screens/UploadScreen'
import TransitionScreen from './screens/TransitionScreen'
import PhaseScreen from './screens/PhaseScreen'
import GameScreen from './screens/GameScreen'
import VictoryScreen from './screens/VictoryScreen'
import SettingsPanel from './components/SettingsPanel'
import { DEFAULT_SENSORY_CONFIG_TEA, LEVELS_TEA } from '../../config/constants'

export default function TeaApp({ onBack }) {
  const [screen, setScreen] = useState('welcome')
  const [showSettings, setShowSettings] = useState(false)
  const [transitionTarget, setTransitionTarget] = useState(null)
  
  // Child profile data
  const [childName, setChildName] = useState('')
  const [childAvatar, setChildAvatar] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  
  // Game state
  const [currentLevel, setCurrentLevel] = useState(0)
  const [levelProgress, setLevelProgress] = useState(() => {
    const saved = localStorage.getItem('tea_mode_progress')
    return saved ? JSON.parse(saved) : LEVELS_TEA.map(l => ({ ...l }))
  })
  
  // Sensory configuration
  const [sensoryConfig, setSensoryConfig] = useState(() => {
    const saved = localStorage.getItem('tea_sensory_config')
    return saved ? JSON.parse(saved) : DEFAULT_SENSORY_CONFIG_TEA
  })

  // Persist progress
  useEffect(() => {
    localStorage.setItem('tea_mode_progress', JSON.stringify(levelProgress))
  }, [levelProgress])

  // Persist sensory config
  useEffect(() => {
    localStorage.setItem('tea_sensory_config', JSON.stringify(sensoryConfig))
  }, [sensoryConfig])

  // Navigation handlers
  const handleStartGame = () => {
    setTransitionTarget('game')
    setScreen('transition')
  }

  const handleGameComplete = () => {
    // Update progress
    const updatedProgress = [...levelProgress]
    updatedProgress[currentLevel].stars = 3
    updatedProgress[currentLevel].completions = (updatedProgress[currentLevel].completions || 0) + 1
    setLevelProgress(updatedProgress)
    
    setScreen('victory')
  }

  const handleNextLevel = () => {
    if (currentLevel < LEVELS_TEA.length - 1) {
      setCurrentLevel(currentLevel + 1)
      setTransitionTarget('game')
      setScreen('transition')
    } else {
      setScreen('phase')
    }
  }

  const handleTransitionComplete = () => {
    if (transitionTarget) {
      setScreen(transitionTarget)
      setTransitionTarget(null)
    }
  }

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onNext={() => setScreen('register')} config={sensoryConfig} />
      
      case 'register':
        return (
          <RegisterScreen
            name={childName}
            avatar={childAvatar}
            onNameChange={setChildName}
            onAvatarChange={setChildAvatar}
            onNext={() => setScreen('upload')}
            onBack={() => setScreen('welcome')}
            config={sensoryConfig}
          />
        )
      
      case 'upload':
        return (
          <UploadScreen
            images={uploadedImages}
            onImagesChange={setUploadedImages}
            onNext={() => setScreen('phase')}
            onBack={() => setScreen('register')}
            config={sensoryConfig}
          />
        )
      
      case 'transition':
        return (
          <TransitionScreen
            targetScreen={transitionTarget}
            onComplete={handleTransitionComplete}
            config={sensoryConfig}
          />
        )
      
      case 'phase':
        return (
          <PhaseScreen
            currentLevel={currentLevel}
            levelProgress={levelProgress}
            childName={childName}
            childAvatar={childAvatar}
            onSelectLevel={(level) => {
              setCurrentLevel(level)
              handleStartGame()
            }}
            onBack={() => setScreen('upload')}
            config={sensoryConfig}
          />
        )
      
      case 'game':
        return (
          <GameScreen
            level={LEVELS_TEA[currentLevel]}
            levelIndex={currentLevel}
            image={uploadedImages[currentLevel]}
            config={sensoryConfig}
            onComplete={handleGameComplete}
            onBack={() => setScreen('phase')}
          />
        )
      
      case 'victory':
        return (
          <VictoryScreen
            level={LEVELS_TEA[currentLevel]}
            image={uploadedImages[currentLevel]}
            onNext={handleNextLevel}
            onRetry={() => {
              setTransitionTarget('game')
              setScreen('transition')
            }}
            onMenu={() => setScreen('phase')}
            config={sensoryConfig}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Back to Mode Selection Button */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-sm font-semibold"
      >
        ← Trocar Modo
      </button>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 z-50 bg-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-2xl"
        aria-label="Configurações"
      >
        ⚙️
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          config={sensoryConfig}
          onConfigChange={setSensoryConfig}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Current Screen */}
      {renderScreen()}
    </div>
  )
}
