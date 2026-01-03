import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import heic2any from 'heic2any'
import './App.css'

// Ajustado para crianças de 5 anos: 4 a 12 peças
// Cada nível usa uma foto diferente (6 fotos = 6 níveis)
const LEVELS = [
  { level: 1, pieces: 4, rows: 2, cols: 2 },   // 2x2 = 4 peças (muito fácil)
  { level: 2, pieces: 6, rows: 2, cols: 3 },   // 2x3 = 6 peças (fácil)
  { level: 3, pieces: 6, rows: 3, cols: 2 },   // 3x2 = 6 peças (fácil variação)
  { level: 4, pieces: 9, rows: 3, cols: 3 },   // 3x3 = 9 peças (médio)
  { level: 5, pieces: 12, rows: 3, cols: 4 },  // 3x4 = 12 peças (difícil)
  { level: 6, pieces: 12, rows: 4, cols: 3 }   // 4x3 = 12 peças (difícil variação)
]

const MAX_IMAGES = 6

function App() {
  const [gameState, setGameState] = useState('upload')
  const [uploadedImages, setUploadedImages] = useState([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [pieces, setPieces] = useState([])
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedLevels, setCompletedLevels] = useState(new Set())
  
  const audioRef = useRef({ select: null, drop: null, correct: null, complete: null })
  const canvasRef = useRef(null)

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
        // Audio context não disponível
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

  const startLevel = (levelIndex) => {
    if (levelIndex >= uploadedImages.length) {
      alert('Carregue mais fotos para jogar este nível!')
      return
    }
    setCurrentLevel(levelIndex)
    initializePuzzle(levelIndex)
    setGameState('playing')
  }

  const generatePuzzlePath = (row, col, rows, cols) => {
    const tabSize = 0.2
    const hasTopTab = row > 0
    const hasBottomTab = row < rows - 1
    const hasLeftTab = col > 0
    const hasRightTab = col < cols - 1
    
    const topIsTab = hasTopTab && ((row + col) % 2 === 0)
    const bottomIsTab = hasBottomTab && ((row + col) % 2 === 1)
    const leftIsTab = hasLeftTab && ((row + col) % 2 === 1)
    const rightIsTab = hasRightTab && ((row + col) % 2 === 0)
    
    let path = 'M 0,0 '
    
    if (hasTopTab) {
      path += topIsTab 
        ? `L ${0.5 - tabSize},0 Q ${0.5 - tabSize},-${tabSize} 0.5,-${tabSize} Q ${0.5 + tabSize},-${tabSize} ${0.5 + tabSize},0 `
        : `L ${0.5 - tabSize},0 Q ${0.5 - tabSize},${tabSize} 0.5,${tabSize} Q ${0.5 + tabSize},${tabSize} ${0.5 + tabSize},0 `
    }
    path += 'L 1,0 '
    
    if (hasRightTab) {
      path += rightIsTab
        ? `L 1,${0.5 - tabSize} Q ${1 + tabSize},${0.5 - tabSize} ${1 + tabSize},0.5 Q ${1 + tabSize},${0.5 + tabSize} 1,${0.5 + tabSize} `
        : `L 1,${0.5 - tabSize} Q ${1 - tabSize},${0.5 - tabSize} ${1 - tabSize},0.5 Q ${1 - tabSize},${0.5 + tabSize} 1,${0.5 + tabSize} `
    }
    path += 'L 1,1 '
    
    if (hasBottomTab) {
      path += bottomIsTab
        ? `L ${0.5 + tabSize},1 Q ${0.5 + tabSize},${1 + tabSize} 0.5,${1 + tabSize} Q ${0.5 - tabSize},${1 + tabSize} ${0.5 - tabSize},1 `
        : `L ${0.5 + tabSize},1 Q ${0.5 + tabSize},${1 - tabSize} 0.5,${1 - tabSize} Q ${0.5 - tabSize},${1 - tabSize} ${0.5 - tabSize},1 `
    }
    path += 'L 0,1 '
    
    if (hasLeftTab) {
      path += leftIsTab
        ? `L 0,${0.5 + tabSize} Q ${-tabSize},${0.5 + tabSize} ${-tabSize},0.5 Q ${-tabSize},${0.5 - tabSize} 0,${0.5 - tabSize} `
        : `L 0,${0.5 + tabSize} Q ${tabSize},${0.5 + tabSize} ${tabSize},0.5 Q ${tabSize},${0.5 - tabSize} 0,${0.5 - tabSize} `
    }
    path += 'Z'
    
    return path
  }

  const initializePuzzle = useCallback((levelIndex) => {
    const level = LEVELS[levelIndex]
    const image = uploadedImages[levelIndex]
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
          const scale = 1.3
          pieceCanvas.width = pieceWidth * scale
          pieceCanvas.height = pieceHeight * scale
          const pieceCtx = pieceCanvas.getContext('2d')
          
          pieceCtx.save()
          pieceCtx.translate(pieceWidth * 0.15, pieceHeight * 0.15)
          pieceCtx.drawImage(img, (col * img.width) / level.cols, (row * img.height) / level.rows,
            img.width / level.cols, img.height / level.rows, 0, 0, pieceWidth, pieceHeight)
          pieceCtx.restore()
          
          newPieces.push({
            id: row * level.cols + col,
            correctRow: row,
            correctCol: col,
            currentRow: null,
            currentCol: null,
            image: pieceCanvas.toDataURL(),
            isPlaced: false,
            puzzlePath: generatePuzzlePath(row, col, level.rows, level.cols)
          })
        }
      }
      
      setPieces([...newPieces].sort(() => Math.random() - 0.5))
    }
    
    img.src = image.src
  }, [uploadedImages])

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

  const handleDropOnSlot = (e, targetRow, targetCol) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedPiece) return
    
    playSound('drop')
    const isCorrect = draggedPiece.correctRow === targetRow && draggedPiece.correctCol === targetCol
    
    setPieces(prev => prev.map(p => {
      if (p.id === draggedPiece.id) {
        return { ...p, currentRow: targetRow, currentCol: targetCol, isPlaced: isCorrect }
      }
      if (p.currentRow === targetRow && p.currentCol === targetCol) {
        return { ...p, currentRow: null, currentCol: null, isPlaced: false }
      }
      return p
    }))
    
    if (isCorrect) {
      playSound('correct')
      setTimeout(() => {
        setPieces(current => {
          const allCorrect = current.every(p => 
            p.currentRow === p.correctRow && p.currentCol === p.correctCol
          )
          if (allCorrect) {
            playSound('complete')
            triggerConfetti()
            setCompletedLevels(prev => new Set([...prev, currentLevel]))
            setTimeout(() => setGameState('completed'), 500)
          }
          return current
        })
      }, 100)
    }
    
    setDraggedPiece(null)
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (e) {
      console.error('Fullscreen error')
    }
  }

  const resetPuzzle = () => {
    initializePuzzle(currentLevel)
    setShowHint(false)
  }

  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1 && currentLevel < uploadedImages.length - 1) {
      startLevel(currentLevel + 1)
    } else {
      setGameState('upload')
    }
  }

  if (gameState === 'upload') {
    return (
      <div className="upload-screen">
        <h1 className="title">🧩 Quebra-Cabeça Mágico ✨</h1>
        <p className="subtitle">Carregue {MAX_IMAGES} fotos (uma para cada nível)!</p>
        
        <div className="upload-area">
          <input type="file" id="imageUpload" accept="image/*,.heic" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
          <label htmlFor="imageUpload" className="upload-button">
            📸 Escolher Fotos ({uploadedImages.length}/{MAX_IMAGES})
          </label>
          
          <div className="image-grid">
            {uploadedImages.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img.src} alt={img.name} />
                <div className="level-badge">Nível {index + 1}</div>
                <button onClick={() => removeImage(index)} className="remove-btn">❌</button>
                <button onClick={() => startLevel(index)} className="play-btn" disabled={completedLevels.has(index)}>
                  {completedLevels.has(index) ? '✅ Completo' : `▶️ Nível ${index + 1}`}
                </button>
              </div>
            ))}
          </div>
          
          {uploadedImages.length === 0 && <p className="hint-text">Clique no botão acima para carregar fotos! 👆</p>}
          {uploadedImages.length > 0 && uploadedImages.length < MAX_IMAGES && (
            <p className="hint-text">📸 Carregue mais {MAX_IMAGES - uploadedImages.length} foto(s)!</p>
          )}
          {uploadedImages.length === MAX_IMAGES && (
            <p className="success-text">🎉 Todas as fotos carregadas! Escolha um nível! 🎉</p>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'completed') {
    const allCompleted = completedLevels.size === Math.min(uploadedImages.length, LEVELS.length)
    
    return (
      <div className="completion-screen">
        <h1 className="celebration-title">🎉 Parabéns! 🎉</h1>
        <p className="celebration-text">Você completou o Nível {currentLevel + 1}!</p>
        <div className="completed-image">
          <img src={uploadedImages[currentLevel].src} alt="Completo" />
        </div>
        <div className="completion-buttons">
          <button onClick={resetPuzzle} className="action-button">🔄 Jogar Novamente</button>
          {!allCompleted && currentLevel < uploadedImages.length - 1 && (
            <button onClick={nextLevel} className="action-button primary">➡️ Próximo Nível</button>
          )}
          <button onClick={() => setGameState('upload')} className="action-button">🏠 Menu</button>
        </div>
        {allCompleted && <p className="victory-text">🏆 Todos os níveis completos! Campeão! 🏆</p>}
      </div>
    )
  }

  const level = LEVELS[currentLevel]
  const availablePieces = pieces.filter(p => p.currentRow === null)
  
  return (
    <div className="game-screen">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="game-header">
        <button onClick={() => setGameState('upload')} className="header-button">⬅️ Menu</button>
        <h2 className="level-title">Nível {level.level} - {level.pieces} peças</h2>
        <div className="header-controls">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="header-button">
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={toggleFullscreen} className="header-button">
            {isFullscreen ? '🗗' : '⛶'}
          </button>
        </div>
      </div>

      <div className="game-container">
        <div className="puzzle-section">
          {showHint && (
            <div className="hint-overlay">
              <img src={uploadedImages[currentLevel].src} alt="Dica" />
            </div>
          )}
          
          <div className="puzzle-grid" style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)`, gridTemplateRows: `repeat(${level.rows}, 1fr)` }}>
            {Array.from({ length: level.rows }).map((_, row) =>
              Array.from({ length: level.cols }).map((_, col) => {
                const piece = pieces.find(p => p.currentRow === row && p.currentCol === col)
                return (
                  <div key={`${row}-${col}`} className={`puzzle-slot ${piece?.isPlaced ? 'correct' : ''}`}
                    onDragOver={handleDragOver} onDrop={(e) => handleDropOnSlot(e, row, col)}>
                    {piece && (
                      <div className={`puzzle-piece placed ${piece.isPlaced ? 'locked' : ''}`}
                        draggable={!piece.isPlaced} onDragStart={(e) => handleDragStart(e, piece)} onDragEnd={handleDragEnd}>
                        <svg viewBox="0 0 1.3 1.3" className="piece-svg">
                          <defs>
                            <pattern id={`img-${piece.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                              <image href={piece.image} width="1.3" height="1.3" preserveAspectRatio="none" />
                            </pattern>
                            <clipPath id={`clip-${piece.id}`}>
                              <path d={piece.puzzlePath} transform="scale(1.3)" />
                            </clipPath>
                          </defs>
                          <rect width="1.3" height="1.3" fill={`url(#img-${piece.id})`} clipPath={`url(#clip-${piece.id})`} />
                          <path d={piece.puzzlePath} transform="scale(1.3)" fill="none" stroke="#333" strokeWidth="0.01" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="pieces-section">
          <h3 className="pieces-title">Arraste as peças 👇</h3>
          <div className="pieces-container">
            {availablePieces.map((piece) => (
              <div key={piece.id} className="puzzle-piece available"
                draggable onDragStart={(e) => handleDragStart(e, piece)} onDragEnd={handleDragEnd}>
                <svg viewBox="0 0 1.3 1.3" className="piece-svg">
                  <defs>
                    <pattern id={`img-av-${piece.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                      <image href={piece.image} width="1.3" height="1.3" preserveAspectRatio="none" />
                    </pattern>
                    <clipPath id={`clip-av-${piece.id}`}>
                      <path d={piece.puzzlePath} transform="scale(1.3)" />
                    </clipPath>
                  </defs>
                  <rect width="1.3" height="1.3" fill={`url(#img-av-${piece.id})`} clipPath={`url(#clip-av-${piece.id})`} />
                  <path d={piece.puzzlePath} transform="scale(1.3)" fill="none" stroke="#333" strokeWidth="0.015" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="game-footer">
        <button onClick={() => setShowHint(!showHint)} className="hint-button">
          {showHint ? '🙈 Esconder' : '💡 Dica'}
        </button>
        <button onClick={resetPuzzle} className="reset-button">🔄 Reiniciar</button>
      </div>
    </div>
  )
}

export default App
