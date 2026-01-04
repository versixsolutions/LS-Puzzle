import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import heic2any from 'heic2any'

// NÍVEIS: 4 até 16 peças
const LEVELS = [
  { level: 1, pieces: 4, stars: 0 },
  { level: 2, pieces: 6, stars: 0 },
  { level: 3, pieces: 9, stars: 0 },
  { level: 4, pieces: 12, stars: 0 },
  { level: 5, pieces: 15, stars: 0 },
  { level: 6, pieces: 16, stars: 0 }
]

const ALPHABET = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

const RANDOM_IMAGES = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/800/600?random=5',
  'https://picsum.photos/800/600?random=6'
]

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [playerName, setPlayerName] = useState('')
  const [playerAvatar, setPlayerAvatar] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [levelProgress, setLevelProgress] = useState(LEVELS.map(l => ({ ...l })))
  const [pieces, setPieces] = useState([])
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [swapMode, setSwapMode] = useState('drag')
  const [imageAspectRatio, setImageAspectRatio] = useState(4/3)
  const [isShuffling, setIsShuffling] = useState(false)
  
  const canvasRef = useRef(null)
  const bgMusicRef = useRef(null)
  const applauseRef = useRef(null)
  const hasInitialized = useRef(false)

  // Áudios
  useEffect(() => {
    const bgMusic = new Audio()
    bgMusic.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuByO/aiTYIGGS57OihUBELTKXh8LJnHgU2jdT0yoAsBSF0wu/glEILElyx6OyqWBUIRJzd87ppIgYugcXu24k2Bxdju+vooVETDE6k4fK0aR8FNoLS9ciALgcfdcLu35VFDRFYrOfulV8YCkCY2vO9cyMGK37C7tuLOQkaaLno7KFRGAxMouHz'
    bgMusic.loop = true
    bgMusic.volume = 0.1
    bgMusicRef.current = bgMusic

    const applause = new Audio()
    applause.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgoSGiImIh4aFg4GAfn18e3l4dnV0cnFvbm1samspaWhmbGBhYmNkZWZnaGlqbG1ub3Bxc3R2d3l6fH1/gIKEhYeIiYqLjI2Oj5CRkpOUlJWWl5iZmpqbm5yam5qbmpqampmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoF/fn18enl3dnRzcG9ubGtpaWhnam5wcnR2eHp8foCChIaIi42PkpSXmp2gpa+9ys/U2Nzf4eTn6uzv8fT2+fv9/v/+/fv5'
    applause.volume = 0.3
    applauseRef.current = applause

    return () => {
      if (bgMusicRef.current) bgMusicRef.current.pause()
      if (applauseRef.current) applauseRef.current.pause()
    }
  }, [])

  useEffect(() => {
    if (soundEnabled && screen === 'welcome' && bgMusicRef.current) {
      bgMusicRef.current.play().catch(() => {})
    } else if (bgMusicRef.current) {
      bgMusicRef.current.pause()
    }
  }, [screen, soundEnabled])

  const playBeep = () => {
    if (!soundEnabled) return
    const beep = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
    beep.volume = 0.2
    beep.play().catch(() => {})
  }

  const playApplause = () => {
    if (!soundEnabled || !applauseRef.current) return
    applauseRef.current.currentTime = 0
    applauseRef.current.play().catch(() => {})
  }

  const calculateGrid = (pieceCount, aspectRatio) => {
    let bestCols = 2
    let bestRows = 2
    let minDiff = Infinity
    
    for (let cols = 2; cols <= pieceCount; cols++) {
      if (pieceCount % cols === 0) {
        const rows = pieceCount / cols
        const gridRatio = cols / rows
        const diff = Math.abs(gridRatio - aspectRatio)
        
        if (diff < minDiff) {
          minDiff = diff
          bestCols = cols
          bestRows = rows
        }
      }
    }
    
    return { rows: bestRows, cols: bestCols }
  }

  // Tela 1: Welcome
  const WelcomeScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
      <div className="floating-card max-w-sm w-full p-6 sm:p-8 text-center">
        <div className="flex justify-between items-center mb-6">
          <button className="icon-btn"><span className="text-xl sm:text-2xl">⚙️</span></button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="icon-btn">
            <span className="text-xl sm:text-2xl">{soundEnabled ? '🎵' : '🔇'}</span>
          </button>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Foto<span className="text-pink-400">Puzzle</span></h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Monte sua diversão!</p>
        
        <div className="mascot mb-6 sm:mb-8 bg-gradient-to-b from-blue-200 to-blue-300 rounded-3xl p-6 sm:p-8">
          <div className="text-6xl sm:text-8xl">🧩</div>
        </div>
        
        <button onClick={() => { playBeep(); setScreen('register') }} className="btn-primary w-full text-base sm:text-lg">▶️ JOGAR</button>
        <p className="text-xs sm:text-sm text-gray-400 mt-4">Toque para começar</p>
      </div>
    </div>
  )

  // Tela 2: Register (omitido por brevidade - usa mesmo código)
  const RegisterScreen = () => {
    const [tempName, setTempName] = useState('')
    const fileInputRef = useRef(null)

    const handleAvatarUpload = async (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setPlayerAvatar(event.target.result)
          playBeep()
        }
        reader.readAsDataURL(file)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'}}>
        <div className="floating-card max-w-md w-full p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <button onClick={() => setScreen('welcome')} className="icon-btn"><span className="text-xl sm:text-2xl">←</span></button>
            <h2 className="text-lg sm:text-2xl font-bold flex-1 text-center">Quem é você?</h2>
            <button className="icon-btn bg-cyan-100"><span className="text-xl sm:text-2xl">ℹ️</span></button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()} style={{
              width: 'min(200px, 40vw)', height: 'min(200px, 40vw)', borderRadius: '50%', border: '6px solid #f6d365',
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              {playerAvatar ? (<img src={playerAvatar} alt="Avatar" className="w-full h-full object-cover" />) : (<span className="text-4xl sm:text-6xl">👤</span>)}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            
            <div className="flex gap-3 mb-4">
              <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-400 flex items-center justify-center text-white shadow-lg hover:scale-110 transition">📷</button>
              <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-400 flex items-center justify-center text-white shadow-lg hover:scale-110 transition">🖼️</button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mb-2">Toque para escolher</p>
            <div className="bg-white border-2 border-gray-200 rounded-2xl px-4 sm:px-6 py-2 sm:py-3 min-w-[180px] sm:min-w-[200px] text-center">
              <span className="text-xl sm:text-2xl font-bold">{tempName || '_____'}</span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-4 sm:mb-6">
            {ALPHABET.map(letter => (
              <button key={letter} onClick={() => { if (tempName.length < 10) { setTempName(tempName + letter); playBeep() }}} className="keyboard-btn text-sm sm:text-lg">{letter}</button>
            ))}
            <button onClick={() => { setTempName(tempName.slice(0, -1)); playBeep() }} className="keyboard-btn col-span-2 bg-red-50 text-red-500 text-sm sm:text-base">⌫</button>
            <button onClick={() => { setTempName(''); playBeep() }} className="keyboard-btn col-span-2 bg-gray-50 text-sm sm:text-base">🔄</button>
          </div>

          <button onClick={() => { if (tempName.trim()) { setPlayerName(tempName); playBeep(); setScreen('upload') }}} className="btn-yellow w-full text-base sm:text-lg font-bold">JOGAR AGORA! ▶️</button>
        </div>
      </div>
    )
  }

  // Telas 3, 4, 5, 6 - código completo está muito longo
  // Vou continuar no próximo arquivo
