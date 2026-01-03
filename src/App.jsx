import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import heic2any from 'heic2any'
import './App.css'

const LEVELS = [
  { level: 1, pieces: 4, rows: 2, cols: 2 },
  { level: 2, pieces: 6, rows: 2, cols: 3 },
  { level: 3, pieces: 6, rows: 3, cols: 2 },
  { level: 4, pieces: 9, rows: 3, cols: 3 },
  { level: 5, pieces: 12, rows: 3, cols: 4 },
  { level: 6, pieces: 12, rows: 4, cols: 3 }
]

const MAX_IMAGES = 6
const APP_VERSION = '4.0.0'

function App() {
  const [gameState, setGameState] = useState('upload')
  const [uploadedImages, setUploadedImages] = useState([])
  const [shuffledImages, setShuffledImages] = useState([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [pieces, setPieces] = useState([])
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedLevels, setCompletedLevels] = useState(new Set())
  const [updateAvailable, setUpdateAvailable] = useState(false)
  
  const audioRef = useRef({ select: null, drop: null, correct: null, complete: null })
  const canvasRef = useRef(null)

  // Verifica se há atualização disponível
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        })
        
        // Força verificação de atualização
        registration.update()
      } catch (e) {
        // Service worker não disponível
      }
    }
    
    if ('serviceWorker' in navigator && gameState === 'upload') {
      checkForUpdates()
    }
  }, [gameState])

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
      })
      window.location.reload()
    }
  }

  useEffect(() => {
    audioRef.current.select = createBeep(400, 0.1, 'sine')
    audioRef.current.drop = createBeep(500, 0.15, 'triangle')
    audioRef.current.correct = createBeep(600, 0.2, 'square')
    audioRef.current.complete = createMelody()
  }, [])

  function createBeep(frequency, duration, type = 'sine') {
    return () => {
      if (!soundEnabled) return
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = type
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (e) {
        // Audio não disponível
      }
    }
  }

  function createMelody() {
    return () => {
      if (!soundEnabled) return
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00]
      notes.forEach((freq, i) => {
        setTimeout(() => createBeep(freq, 0.25, 'sine')(), i * 120)
      })
    }
  }

  const playSound = (soundType) => {
    if (audioRef.current[soundType]) audioRef.current[soundType]()
  }

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.4 + 0.6, y: Math.random() - 0.2 } })
    }, 250)
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (uploadedImages.length + files.length > MAX_IMAGES) {
      alert(`Você pode carregar no máximo ${MAX_IMAGES} imagens!`)
      return
    }

    const processedImages = await Promise.all(
      files.map(async (file) => {
        try {
          let processedFile = file
          if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
            processedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' })
          }

          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (event) => {
              const img = new Image()
              img.onload = () => resolve({ src: event.target.result, name: file.name })
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
  }

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const startGame = () => {
    const shuffled = [...uploadedImages].sort(() => Math.random() - 0.5)
    setShuffledImages(shuffled)
    setCurrentLevel(0)
    setCompletedLevels(new Set())
    
    setTimeout(() => {
      initializePuzzle(0, shuffled)
      setGameState('playing')
    }, 100)
  }

  const initializePuzzle = useCallback((levelIndex, images = shuffledImages) => {
    const level = LEVELS[levelIndex]
    const image = images[levelIndex]
    if (!image) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const pieceWidth = canvas.width / level.cols
      const pieceHeight = canvas.height / level.rows
      const newPieces = []
      
      for (let row = 0; row < level.rows; row++) {
        for (let col = 0; col < level.cols; col++) {
          const pieceCanvas = document.createElement('canvas')
          pieceCanvas.width = pieceWidth
          pieceCanvas.height = pieceHeight
          const pieceCtx = pieceCanvas.getContext('2d')
          
          pieceCtx.drawImage(
            img,
            (col * img.width) / level.cols,
            (row * img.height) / level.rows,
            img.width / level.cols,
            img.height / level.rows,
            0, 0,
            pieceWidth, pieceHeight
          )
          
          newPieces.push({
            id: row * level.cols + col,
            correctRow: row,
            correctCol: col,
            currentRow: row,
            currentCol: col,
            image: pieceCanvas.toDataURL(),
            isPlaced: false
          })
        }
      }
      
      // Embaralha as peças no próprio grid
      const shuffled = [...newPieces]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tempRow = shuffled[i].currentRow
        const tempCol = shuffled[i].currentCol
        shuffled[i].currentRow = shuffled[j].currentRow
        shuffled[i].currentCol = shuffled[j].currentCol
        shuffled[j].currentRow = tempRow
        shuffled[j].currentCol = tempCol
      }
      
      setPieces(shuffled)
    }
    
    img.src = image.src
  }, [shuffledImages])

  const handleDragStart = (e, piece) => {
    if (piece.isPlaced) return
    setDraggedPiece(piece)
    playSound('select')
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => { e.target.style.opacity = '0.4' }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedPiece(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnPiece = (e, targetPiece) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedPiece || draggedPiece.id === targetPiece.id) return
    
    playSound('drop')
    
    // Troca as posições das peças
    setPieces(prev => prev.map(p => {
      if (p.id === draggedPiece.id) {
        const newPiece = { ...p, currentRow: targetPiece.currentRow, currentCol: targetPiece.currentCol }
        const isCorrect = newPiece.currentRow === newPiece.correctRow && newPiece.currentCol === newPiece.correctCol
        return { ...newPiece, isPlaced: isCorrect }
      }
      if (p.id === targetPiece.id) {
        const newPiece = { ...p, currentRow: draggedPiece.currentRow, currentCol: draggedPiece.currentCol }
        const isCorrect = newPiece.currentRow === newPiece.correctRow && newPiece.currentCol === newPiece.correctCol
        return { ...newPiece, isPlaced: isCorrect }
      }
      return p
    }))
    
    // Verifica se alguma peça ficou correta
    setTimeout(() => {
      setPieces(current => {
        const anyCorrect = current.some((p, idx) => {
          const oldPiece = pieces[idx]
          return !oldPiece.isPlaced && p.isPlaced
        })
        
        if (anyCorrect) {
          playSound('correct')
        }
        
        const allCorrect = current.every(p => p.isPlaced)
        if (allCorrect) {
          playSound('complete')
          triggerConfetti()
          setCompletedLevels(prev => new Set([...prev, currentLevel]))
          setTimeout(() => setGameState('completed'), 500)
        }
        
        return current
      })
    }, 100)
    
    setDraggedPiece(null)
  }

  const resetPuzzle = () => {
    initializePuzzle(currentLevel)
    setShowHint(false)
  }

  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1 && currentLevel < shuffledImages.length - 1) {
      const nextLvl = currentLevel + 1
      setCurrentLevel(nextLvl)
      initializePuzzle(nextLvl)
      setGameState('playing')
    } else {
      setGameState('upload')
      setShuffledImages([])
    }
  }

  if (gameState === 'upload') {
    return (
      <div className="upload-screen">
        {updateAvailable && (
          <div className="update-banner">
            <span>✨ Nova versão disponível!</span>
            <button onClick={handleUpdate} className="update-button">
              🔄 Atualizar Agora
            </button>
          </div>
        )}
        
        <h1 className="title">🧩 Quebra-Cabeça Mágico ✨</h1>
        <p className="subtitle">Carregue {MAX_IMAGES} fotos para começar!</p>
        
        <div className="upload-container">
          <div className="upload-area">
            <input type="file" id="imageUpload" accept="image/*,.heic" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
            <label htmlFor="imageUpload" className="upload-button">
              📸 Escolher Fotos ({uploadedImages.length}/{MAX_IMAGES})
            </label>
            
            {uploadedImages.length > 0 && (
              <div className="image-grid">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img.src} alt={img.name} />
                    <button onClick={() => removeImage(index)} className="remove-btn">❌</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {uploadedImages.length === 0 && (
            <p className="hint-text">👆 Clique no botão acima para escolher suas fotos favoritas!</p>
          )}
          
          {uploadedImages.length > 0 && uploadedImages.length < MAX_IMAGES && (
            <p className="hint-text">📸 Faltam {MAX_IMAGES - uploadedImages.length} foto(s)! Continue escolhendo!</p>
          )}
          
          {uploadedImages.length === MAX_IMAGES && (
            <div className="start-section">
              <p className="success-text">🎉 Perfeito! Todas as fotos carregadas!</p>
              <button onClick={startGame} className="start-game-button">
                🎮 INICIAR JOGO
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'completed') {
    const allCompleted = completedLevels.size === Math.min(shuffledImages.length, LEVELS.length)
    
    return (
      <div className="completion-screen">
        <h1 className="celebration-title">🎉 PARABÉNS! 🎉</h1>
        <p className="celebration-text">Você completou o Nível {currentLevel + 1}!</p>
        <div className="completed-image">
          <img src={shuffledImages[currentLevel].src} alt="Completo" />
        </div>
        <div className="completion-buttons">
          <button onClick={resetPuzzle} className="action-button big">
            🔄 Jogar Novamente
          </button>
          {!allCompleted && currentLevel < shuffledImages.length - 1 && (
            <button onClick={nextLevel} className="action-button big primary">
              ➡️ Próximo Nível
            </button>
          )}
          <button onClick={() => setGameState('upload')} className="action-button big">
            🏠 Novo Jogo
          </button>
        </div>
        {allCompleted && <p className="victory-text">🏆 VOCÊ É UM CAMPEÃO! 🏆</p>}
      </div>
    )
  }

  const level = LEVELS[currentLevel]
  
  return (
    <div className="game-screen">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="game-header">
        <button onClick={() => setGameState('upload')} className="header-button big">
          🏠 Menu
        </button>
        <h2 className="level-title">Nível {level.level}</h2>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="header-button big">
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="puzzle-area">
        {showHint && (
          <div className="hint-overlay" onClick={() => setShowHint(false)}>
            <img src={shuffledImages[currentLevel].src} alt="Dica" />
            <p className="hint-instruction">👆 Toque para esconder</p>
          </div>
        )}
        
        <div className="puzzle-grid" style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)`, gridTemplateRows: `repeat(${level.rows}, 1fr)` }}>
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className={`puzzle-piece ${piece.isPlaced ? 'correct' : ''} ${draggedPiece?.id === piece.id ? 'dragging' : ''}`}
              draggable={!piece.isPlaced}
              onDragStart={(e) => handleDragStart(e, piece)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnPiece(e, piece)}
              style={{
                gridRow: piece.currentRow + 1,
                gridColumn: piece.currentCol + 1
              }}
            >
              <img src={piece.image} alt={`Peça ${piece.id}`} draggable={false} />
              {piece.isPlaced && <div className="check-mark">✓</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="game-footer">
        <button onClick={() => setShowHint(!showHint)} className="game-button big">
          💡 {showHint ? 'Esconder' : 'Ver'} Dica
        </button>
        <button onClick={resetPuzzle} className="game-button big reset">
          🔄 Reiniciar
        </button>
      </div>
    </div>
  )
}

export default App
