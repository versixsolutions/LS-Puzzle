import { useState, useEffect, useRef } from 'react'

// ===== CONSTANTES E CONFIGURAÇÕES =====

// NÍVEIS: 10 Fases (Progressão Lenta e Gradual)
const LEVELS = [
  { level: 1, pieces: 4, stars: 0 },  // 2x2
  { level: 2, pieces: 4, stars: 0 },  // 2x2
  { level: 3, pieces: 4, stars: 0 },  // 2x2
  { level: 4, pieces: 9, stars: 0 },  // 3x3
  { level: 5, pieces: 9, stars: 0 },  // 3x3
  { level: 6, pieces: 9, stars: 0 },  // 3x3
  { level: 7, pieces: 16, stars: 0 }, // 4x4
  { level: 8, pieces: 16, stars: 0 }, // 4x4
  { level: 9, pieces: 16, stars: 0 }, // 4x4
  { level: 10, pieces: 25, stars: 0 } // 5x5
]

const ALPHABET = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

// 10 Imagens filtradas APENAS por: Toys, Puppy, Kitten
const RANDOM_IMAGES = [
  'https://loremflickr.com/800/800/toys?random=1',
  'https://loremflickr.com/800/800/puppy?random=2',
  'https://loremflickr.com/800/800/kitten?random=3',
  'https://loremflickr.com/800/800/toys?random=4',
  'https://loremflickr.com/800/800/puppy?random=5',
  'https://loremflickr.com/800/800/kitten?random=6',
  'https://loremflickr.com/800/800/toys?random=7',
  'https://loremflickr.com/800/800/puppy?random=8',
  'https://loremflickr.com/800/800/kitten?random=9',
  'https://loremflickr.com/800/800/toys?random=10'
]

// Áudios em Base64
const AUDIO_SRC = {
  BEEP: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  MUSIC: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuByO/aiTYIGGS57OihUBELTKXh8LJnHgU2jdT0yoAsBSF0wu/glEILElyx6OyqWBUIRJzd87ppIgYugcXu24k2Bxdju+vooVETDE6k4fK0aR8FNoLS9ciALgcfdcLu35VFDRFYrOfulV8YCkCY2vO9cyMGK37C7tuLOQkaaLno7KFRGAxMouHz',
  APPLAUSE: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgoSGiImIh4aFg4GAfn18e3l4dnV0cnFvbm1samspaWhmbGBhYmNkZWZnaGlqbG1ub3Bxc3R2d3l6fH1/gIKEhYeIiYqLjI2Oj5CRkpOUlJWWl5iZmpqbm5yam5qbmpqampmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoF/fn18enl3dnRzcG9ubGtpaWhnam5wcnR2eHp8foCChIaIi42PkpSXmp2gpa+9ys/U2Nzf4eTn6uzv8fT2+fv9/v/+/fv5'
}

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [playerName, setPlayerName] = useState('')
  const [playerAvatar, setPlayerAvatar] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const [currentLevel, setCurrentLevel] = useState(0)
  
  // Persistência de Dados
  const [levelProgress, setLevelProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('foto_puzzle_progress')
      return saved ? JSON.parse(saved) : LEVELS.map(l => ({ ...l }))
    } catch (e) {
      return LEVELS.map(l => ({ ...l }))
    }
  })

  const [pieces, setPieces] = useState([])
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [swapMode, setSwapMode] = useState('drag')
  const [imageAspectRatio, setImageAspectRatio] = useState(1)
  const [isShuffling, setIsShuffling] = useState(false)
  
  // Detecção de Orientação
  const [isWrongOrientation, setIsWrongOrientation] = useState(false)
  
  // Refs
  const bgMusicRef = useRef(new Audio(AUDIO_SRC.MUSIC))
  const applauseRef = useRef(new Audio(AUDIO_SRC.APPLAUSE))
  const beepRef = useRef(new Audio(AUDIO_SRC.BEEP))
  const touchStartRef = useRef(null) 

  // ===== EFEITOS =====
  
  useEffect(() => {
    localStorage.setItem('foto_puzzle_progress', JSON.stringify(levelProgress))
  }, [levelProgress])

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMobile = window.innerWidth > window.innerHeight && window.innerHeight < 500
      setIsWrongOrientation(isLandscapeMobile)
    }
    window.addEventListener('resize', checkOrientation)
    checkOrientation()
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  useEffect(() => {
    bgMusicRef.current.loop = true
    bgMusicRef.current.volume = 0.1
    applauseRef.current.volume = 0.3
    beepRef.current.volume = 0.2

    return () => {
      bgMusicRef.current.pause()
      applauseRef.current.pause()
    }
  }, [])

  useEffect(() => {
    if (soundEnabled && screen === 'welcome') {
      bgMusicRef.current.play().catch(() => {})
    } else {
      bgMusicRef.current.pause()
    }
  }, [screen, soundEnabled])

  // ===== HELPERS =====

  const playBeep = () => {
    if (!soundEnabled) return
    if (beepRef.current.paused) {
        beepRef.current.play().catch(() => {})
    } else {
        beepRef.current.currentTime = 0
    }
  }

  const playApplause = () => {
    if (soundEnabled) {
      applauseRef.current.currentTime = 0
      applauseRef.current.play().catch(() => {})
    }
  }

  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(50)
  }

  const resetProgress = () => {
    if(confirm('Tem certeza que quer apagar todo o progresso?')) {
      localStorage.removeItem('foto_puzzle_progress')
      setLevelProgress(LEVELS.map(l => ({ ...l })))
      playBeep()
    }
  }

  const getFallbackImage = (width, height, text) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C']
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 40px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('?', width/2, height/2)
    return canvas.toDataURL('image/jpeg')
  }

  // ===== LÓGICA DO JOGO =====
  
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

  useEffect(() => {
    if (screen === 'game') {
      initializePuzzle()
    } else {
      setIsShuffling(false)
      setPieces([])
      setSelectedPiece(null)
      setShowHint(false)
      touchStartRef.current = null
    }
  }, [screen, currentLevel])

  const initializePuzzle = () => {
    const image = uploadedImages[currentLevel]
    if (!image) return 

    setIsShuffling(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onerror = () => {
      console.warn("Imagem falhou, usando fallback gerado.")
      const fallbackSrc = getFallbackImage(800, 800, '?')
      const newImages = [...uploadedImages]
      newImages[currentLevel] = { ...newImages[currentLevel], src: fallbackSrc }
      setUploadedImages(newImages)
      img.src = fallbackSrc 
    }

    img.onload = () => {
      const targetAspectRatio = 1
      setImageAspectRatio(targetAspectRatio)
      
      const level = LEVELS[currentLevel]
      const { rows, cols } = calculateGrid(level.pieces, targetAspectRatio)
      
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 800 
      
      const pieceWidth = canvas.width / cols
      const pieceHeight = canvas.height / rows
      const newPieces = []

      const minSize = Math.min(img.width, img.height)
      const sourceX = (img.width - minSize) / 2
      const sourceY = (img.height - minSize) / 2
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pieceCanvas = document.createElement('canvas')
          pieceCanvas.width = pieceWidth
          pieceCanvas.height = pieceHeight
          const pieceCtx = pieceCanvas.getContext('2d')
          
          pieceCtx.drawImage(
            img,
            sourceX + (col * minSize) / cols, sourceY + (row * minSize) / rows,
            minSize / cols, minSize / rows,
            0, 0,
            pieceWidth, pieceHeight
          )
          
          newPieces.push({
            id: row * cols + col,
            correctRow: row,
            correctCol: col,
            currentRow: row,
            currentCol: col,
            image: pieceCanvas.toDataURL('image/jpeg', 0.8),
            isPlaced: false
          })
        }
      }
      
      const shuffled = [...newPieces].sort(() => Math.random() - 0.5)
      
      const piecesWithPos = shuffled.map((p, index) => ({
        ...p,
        currentRow: Math.floor(index / cols),
        currentCol: index % cols
      }))

      setPieces(piecesWithPos)
      setIsShuffling(false)
    }
    
    img.src = image.src
  }

  const swapPieces = (pieceA, pieceB) => {
    if(!pieceA || !pieceB || pieceA.id === pieceB.id) return
    
    const tempRow = pieceA.currentRow
    const tempCol = pieceA.currentCol
    
    setPieces(prev => {
      const newPieces = prev.map(p => {
        if (p.id === pieceA.id) {
          const updated = { ...p, currentRow: pieceB.currentRow, currentCol: pieceB.currentCol }
          updated.isPlaced = updated.currentRow === updated.correctRow && updated.currentCol === updated.correctCol
          return updated
        }
        if (p.id === pieceB.id) {
          const updated = { ...p, currentRow: tempRow, currentCol: tempCol }
          updated.isPlaced = updated.currentRow === updated.correctRow && updated.currentCol === updated.correctCol
          return updated
        }
        return p
      })
      
      const allCorrect = newPieces.every(p => p.isPlaced)
      if (allCorrect) {
        handleVictory()
      }
      return newPieces
    })
    
    vibrate()
  }

  // --- HANDLERS ---
  const handleDragStart = (e, piece) => {
    if (piece.isPlaced || swapMode !== 'drag') return
    e.dataTransfer.effectAllowed = 'move'
    try {
        e.dataTransfer.setData('text/plain', piece.id.toString())
    } catch(err) { /* ignore */ }
    setSelectedPiece(piece)
    playBeep()
  }

  const handleDrop = (e, targetPiece) => {
    e.preventDefault()
    if (swapMode !== 'drag') return
    let sourcePiece = selectedPiece
    if (!sourcePiece) {
       const sourceId = parseInt(e.dataTransfer.getData('text/plain'))
       sourcePiece = pieces.find(p => p.id === sourceId)
    }
    if (sourcePiece && sourcePiece.id !== targetPiece.id) {
        swapPieces(sourcePiece, targetPiece)
    }
    setSelectedPiece(null)
  }

  const handleTouchStart = (e, piece) => {
    if (piece.isPlaced || swapMode !== 'drag') return
    touchStartRef.current = piece
    setSelectedPiece(piece)
    playBeep()
  }

  const handleTouchMove = (e) => {
     if (swapMode !== 'drag' || !touchStartRef.current) return
     if(e.cancelable) e.preventDefault()
  }

  const handleTouchEnd = (e) => {
    if (swapMode !== 'drag' || !touchStartRef.current) return
    const touch = e.changedTouches[0]
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY)
    const targetDiv = targetElement?.closest('[data-piece-id]')
    
    if (targetDiv) {
        const targetId = parseInt(targetDiv.getAttribute('data-piece-id'))
        const targetPiece = pieces.find(p => p.id === targetId)
        if (targetPiece) {
            swapPieces(touchStartRef.current, targetPiece)
        }
    }
    touchStartRef.current = null
    setSelectedPiece(null)
  }

  const handlePieceClick = (piece) => {
    if (piece.isPlaced) return
    playBeep()
    if (swapMode === 'click') {
      if (!selectedPiece) {
        setSelectedPiece(piece)
      } else {
        swapPieces(selectedPiece, piece)
        setSelectedPiece(null)
      }
    }
  }

  const handleVictory = async () => {
    const confetti = (await import('canvas-confetti')).default
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    playApplause()
    setLevelProgress(prev => {
      const updated = [...prev]
      updated[currentLevel].stars = 3
      return updated
    })
    setTimeout(() => setScreen('victory'), 1000)
  }

  // ===== TELAS =====

  const RotateDevicePrompt = () => (
    <div className="fixed inset-0 bg-blue-600 z-[100] flex flex-col items-center justify-center text-white p-6 text-center">
      <div className="text-6xl mb-4 animate-bounce">📱</div>
      <h2 className="text-2xl font-bold mb-2">Por favor, gire o celular</h2>
      <p>O jogo funciona melhor com o celular em pé!</p>
    </div>
  )

  const WelcomeScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
      <div className="floating-card max-w-sm w-full p-6 sm:p-8 text-center">
        <div className="flex justify-between items-center mb-6">
          <button aria-label="Configurações (Resetar)" onClick={resetProgress} className="icon-btn text-xs"><span className="text-xl sm:text-2xl">⚙️</span></button>
          <button aria-label="Ligar/Desligar Som" onClick={() => setSoundEnabled(!soundEnabled)} className="icon-btn">
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
            <button aria-label="Voltar" onClick={() => setScreen('welcome')} className="icon-btn"><span className="text-xl sm:text-2xl">←</span></button>
            <h2 className="text-lg sm:text-2xl font-bold flex-1 text-center">Quem é você?</h2>
            <button aria-label="Informações" className="icon-btn bg-cyan-100"><span className="text-xl sm:text-2xl">ℹ️</span></button>
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
              <button aria-label="Tirar Foto" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-400 flex items-center justify-center text-white shadow-lg hover:scale-110 transition">📷</button>
              <button aria-label="Escolher da Galeria" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-400 flex items-center justify-center text-white shadow-lg hover:scale-110 transition">🖼️</button>
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
            <button aria-label="Apagar" onClick={() => { setTempName(tempName.slice(0, -1)); playBeep() }} className="keyboard-btn col-span-2 bg-red-50 text-red-500 text-sm sm:text-base">⌫</button>
            <button aria-label="Limpar tudo" onClick={() => { setTempName(''); playBeep() }} className="keyboard-btn col-span-2 bg-gray-50 text-sm sm:text-base">🔄</button>
          </div>
          <button onClick={() => { if (tempName.trim()) { setPlayerName(tempName); playBeep(); setScreen('upload') }}} className="btn-yellow w-full text-base sm:text-lg font-bold">JOGAR AGORA! ▶️</button>
        </div>
      </div>
    )
  }

  const UploadScreen = () => {
    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files)
      if (uploadedImages.length + files.length > 10) {
        alert('Máximo 10 fotos!')
        return
      }

      const processedImages = await Promise.all(
        files.map(async (file) => {
          try {
            let processedFile = file
            if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
              const heic2any = (await import('heic2any')).default
              const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
              processedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' })
            }

            return new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = (event) => {
                const img = new Image()
                img.onload = () => resolve({ 
                  src: event.target.result, 
                  name: file.name,
                  type: file.type.split('/')[1].toUpperCase(),
                  width: img.width,
                  height: img.height,
                  aspectRatio: img.width / img.height
                })
                img.src = event.target.result
              }
              reader.readAsDataURL(processedFile)
            })
          } catch (error) {
            return null
          }
        })
      )
      setUploadedImages(prev => [...prev, ...processedImages.filter(img => img !== null)])
      playBeep()
    }

    const generateRandomImages = async () => {
      const randomImages = await Promise.all(
        RANDOM_IMAGES.slice(0, 10 - uploadedImages.length).map((url, idx) => 
          new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = 800
              canvas.height = 800
              const ctx = canvas.getContext('2d')
              ctx.drawImage(img, 0, 0, 800, 800)
              resolve({
                src: canvas.toDataURL('image/jpeg'),
                name: `random-${idx + 1}.jpg`,
                type: 'JPG',
                width: 800,
                height: 800,
                aspectRatio: 1
              })
            }
            img.onerror = () => {
                 resolve({
                    src: getFallbackImage(800, 800, '!'),
                    name: `fallback-${idx}.jpg`,
                    type: 'GEN',
                    width: 800,
                    height: 800,
                    aspectRatio: 1
                 })
            }
            img.src = url
          })
        )
      )
      setUploadedImages(prev => [...prev, ...randomImages.filter(img => img !== null)])
      playBeep()
    }

    const removeImage = (index) => {
      setUploadedImages(prev => prev.filter((_, i) => i !== index))
      playBeep()
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'}}>
        <div className="floating-card max-w-4xl w-full p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <button aria-label="Voltar" onClick={() => setScreen('register')} className="icon-btn"><span className="text-xl sm:text-2xl">←</span></button>
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-bold">Personalizar Quebra-Cabeça</h2>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center">Escolha suas Fotos</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 text-center">Adicione fotos do seu dispositivo ou gere imagens aleatórias</p>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {['JPG', 'PNG', 'JPEG', 'WEBP', 'HEIC', 'AVIF'].map(format => (
              <button key={format} className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">{format}</button>
            ))}
          </div>
          
          {uploadedImages.length < 10 && (
            <button onClick={generateRandomImages} className="w-full mb-4 py-2 sm:py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl text-sm sm:text-base font-bold hover:scale-105 transition">
              ✨ Gerar Foto Aleatória ({10 - uploadedImages.length} restantes)
            </button>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="photo-slot relative aspect-square">
                {uploadedImages[index] ? (
                  <>
                    <img src={uploadedImages[index].src} alt={`Foto ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    <div className="badge">{uploadedImages[index].type.slice(0,3)}</div>
                    <button aria-label="Remover Foto" onClick={() => removeImage(index)} className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs sm:text-base">✕</button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <input type="file" accept="image/*,.heic,.avif" onChange={handleImageUpload} className="hidden" />
                    <span className="text-2xl sm:text-4xl mb-1 sm:mb-2">+</span>
                    <span className="text-xs text-gray-500">FOTO {index + 1}</span>
                  </label>
                )}
              </div>
            ))}
          </div>
          {uploadedImages.length === 10 && (
            <button onClick={() => { playBeep(); setScreen('levels') }} className="btn-primary w-full text-base sm:text-lg">🔒 Salvar e Jogar</button>
          )}
        </div>
      </div>
    )
  }

  const LevelsScreen = () => {
    const totalProgress = (levelProgress.filter(l => l.stars > 0).length / LEVELS.length) * 100

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
        <div className="floating-card max-w-md w-full p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <button aria-label="Voltar" onClick={() => setScreen('upload')} className="icon-btn"><span className="text-xl sm:text-2xl">←</span></button>
            <div className="flex-1 text-center"><h2 className="text-lg sm:text-xl font-bold">Mapa de Aventura</h2></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div style={{
              width: 'min(80px, 15vw)', height: 'min(80px, 15vw)', borderRadius: '50%', border: '6px solid #f6d365',
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              {playerAvatar ? (<img src={playerAvatar} alt="Avatar" className="w-full h-full object-cover" />) : (<span className="text-2xl sm:text-3xl">👤</span>)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold">Vamos jogar!</h3>
              <p className="text-xs sm:text-sm text-gray-500">Escolha um nível para começar</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-semibold">Seu Progresso</span>
              <span className="text-base sm:text-lg font-bold text-purple-600">⭐ {totalProgress.toFixed(0)}/100</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${totalProgress}%`}}></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 max-h-60 overflow-y-auto">
            {LEVELS.map((level, idx) => (
              <div key={idx} className={`level-card cursor-pointer ${idx > 0 && levelProgress[idx - 1].stars === 0 ? 'locked' : ''}`}
                onClick={() => {
                  if (idx === 0 || levelProgress[idx - 1].stars > 0) {
                    playBeep()
                    setCurrentLevel(idx)
                    setScreen('game')
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl ${idx === 0 || levelProgress[idx - 1].stars > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {idx === 0 || levelProgress[idx - 1].stars > 0 ? '🧩' : '🔒'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold">Nível {level.level}</p>
                    <p className="text-xs text-gray-500">{level.pieces} Peças</p>
                  </div>
                </div>
                <div className="flex gap-1 justify-center">
                  {[1,2,3].map(star => (<span key={star} className={`text-base sm:text-xl ${levelProgress[idx].stars >= star ? 'text-yellow-400' : 'text-gray-300'}`}>⭐</span>))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold mb-3 text-center text-gray-700">Modo de Jogo</p>
            <div className="flex gap-2">
              <button aria-label="Modo Arrastar" onClick={() => { setSwapMode('drag'); playBeep() }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${swapMode === 'drag' ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}>🖐️ Arrastar</button>
              <button aria-label="Modo Clicar" onClick={() => { setSwapMode('click'); playBeep() }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${swapMode === 'click' ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}>👆 Clicar</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderGameScreen = () => {
    const level = LEVELS[currentLevel]
    const { rows, cols } = calculateGrid(level.pieces, 1) // Force 1:1 ratio
    const progress = pieces.filter(p => p.isPlaced).length

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="floating-card w-full max-w-4xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button aria-label="Voltar aos Níveis" onClick={() => setScreen('levels')} className="icon-btn"><span className="text-xl sm:text-2xl">←</span></button>
            <div className="flex-1 text-center">
              {/* INDICADOR DE NÍVEL ADICIONADO AQUI */}
              <h2 className="text-xl sm:text-2xl font-black text-purple-600 mb-1">NÍVEL {level.level}</h2>
              <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                 <span className="text-xs font-semibold text-gray-500">Peças:</span>
                 <span className="text-sm font-bold text-gray-800">{progress}/{level.pieces}</span>
              </div>
            </div>
            <button aria-label="Ligar/Desligar Som" onClick={() => setSoundEnabled(!soundEnabled)} className="icon-btn">
              <span className="text-xl sm:text-2xl">{soundEnabled ? '🔊' : '🔇'}</span>
            </button>
          </div>
          <div className="progress-bar mb-4 sm:mb-6">
            <div className="progress-fill" style={{width: `${(progress/level.pieces)*100}%`}}></div>
          </div>
          {showHint && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setShowHint(false)}>
              <div className="max-w-2xl w-full">
                <img src={uploadedImages[currentLevel].src} alt="Dica" className="rounded-3xl shadow-2xl w-full aspect-square object-cover" />
                <p className="text-white text-center mt-4 text-sm sm:text-lg font-bold">👆 Toque para fechar</p>
              </div>
            </div>
          )}
          {isShuffling ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-purple-600 text-xl font-bold animate-pulse">Embaralhando peças...</div>
            </div>
          ) : (
            <div
              className="grid gap-1 sm:gap-2 bg-white/20 backdrop-blur p-2 sm:p-4 rounded-3xl mb-4 sm:mb-6 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                aspectRatio: '1 / 1',
                width: 'min(90vw, 600px)'
              }}
            >
              {pieces.map((piece) => (
                <div
                  key={piece.id}
                  data-piece-id={piece.id}
                  draggable={!piece.isPlaced && swapMode === 'drag'}
                  onDragStart={(e) => handleDragStart(e, piece)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, piece)}
                  onTouchStart={(e) => handleTouchStart(e, piece)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => handlePieceClick(piece)}
                  className={`puzzle-piece-3d relative rounded-lg overflow-hidden bg-white shadow-lg cursor-pointer transition-all duration-200
                    ${selectedPiece?.id === piece.id ? 'ring-4 ring-fuchsia-500 z-50 scale-110 shadow-2xl' : ''} 
                    ${piece.isPlaced ? 'ring-4 ring-green-400 z-0' : ''}`}
                  style={{
                    backgroundImage: `url(${piece.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: piece.isPlaced ? 1 : (selectedPiece?.id === piece.id ? 1 : 1),
                    gridRow: piece.currentRow + 1,
                    gridColumn: piece.currentCol + 1,
                    touchAction: 'none'
                  }}
                >
                  {piece.isPlaced && (
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <button aria-label="Mostrar Dica" onClick={() => { setShowHint(true); playBeep() }} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-yellow-400 text-gray-800 rounded-full text-sm sm:text-base font-bold shadow-lg hover:scale-105 transition">💡 Dica</button>
            <button aria-label="Tela Cheia" onClick={() => { if(!document.fullscreenElement) { document.documentElement.requestFullscreen() } else { document.exitFullscreen() }; playBeep() }} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-full text-sm sm:text-base font-bold shadow-lg hover:scale-105 transition">⛶ Tela Cheia</button>
            <button aria-label="Reiniciar Nível" onClick={() => { initializePuzzle(); playBeep() }} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:scale-110 transition"><span className="text-xl sm:text-2xl">🔄</span></button>
          </div>
        </div>
      </div>
    )
  }

  const VictoryScreen = () => {
    useEffect(() => {
      const runConfetti = async () => {
        const confetti = (await import('canvas-confetti')).default
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf']
        const end = Date.now() + 3000
        const frame = () => {
          confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: colors })
          confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: colors })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
      }
      runConfetti()
    }, [])

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'}}>
        <div className="floating-card max-w-md w-full p-6 sm:p-8 text-center relative overflow-hidden">
          <h1 className="text-4xl sm:text-5xl font-black text-purple-600 mb-2">Parabéns!</h1>
          <p className="text-lg sm:text-xl font-bold text-gray-700 mb-6 sm:mb-8">Você conseguiu!</p>
          <div className="relative inline-block mb-6 sm:mb-8">
            <div className="w-56 h-42 sm:w-64 sm:h-64 bg-white rounded-2xl shadow-2xl p-2 sm:p-3 transform rotate-1 hover:rotate-0 transition">
              <img src={uploadedImages[currentLevel]?.src} alt="Puzzle completo" className="w-full h-full object-cover rounded-xl" />
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"><span className="text-white text-lg sm:text-2xl">✓</span></div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mb-6 sm:mb-8">
            {[1,2,3].map(i => (<span key={i} className="text-4xl sm:text-5xl animate-bounce" style={{animationDelay: `${(i-1)*0.1}s`}}>⭐</span>))}
          </div>
          <button onClick={() => { playBeep(); if (currentLevel < LEVELS.length - 1) { setCurrentLevel(currentLevel + 1); setScreen('game') } else { setScreen('levels') } }} className="btn-primary w-full text-lg sm:text-xl mb-4">
            {currentLevel < LEVELS.length - 1 ? 'PRÓXIMA FASE' : 'VER MAPA'}
          </button>
          <div className="flex gap-6 sm:gap-8 justify-center">
            <button aria-label="Voltar aos Níveis" onClick={() => { playBeep(); setScreen('levels') }} className="flex flex-col items-center gap-1"><span className="text-2xl">🏠</span><span className="text-xs font-semibold">Menu</span></button>
            <button aria-label="Jogar Novamente" onClick={() => { playBeep(); setScreen('game') }} className="flex flex-col items-center gap-1"><span className="text-2xl">🔄</span><span className="text-xs font-semibold">Repetir</span></button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {isWrongOrientation && <RotateDevicePrompt />}
      {screen === 'welcome' && <WelcomeScreen />}
      {screen === 'register' && <RegisterScreen />}
      {screen === 'upload' && <UploadScreen />}
      {screen === 'levels' && <LevelsScreen />}
      {screen === 'game' && renderGameScreen()}
      {screen === 'victory' && <VictoryScreen />}
    </>
  )
}