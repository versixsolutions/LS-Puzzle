import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import heic2any from 'heic2any'
import './App.css'

const LEVELS = [
  { level: 1, pieces: 8, gridSize: 2 },
  { level: 2, pieces: 12, gridSize: 3 },
  { level: 3, pieces: 16, gridSize: 4 },
  { level: 4, pieces: 20, gridSize: 4 },
  { level: 5, pieces: 25, gridSize: 5 },
  { level: 6, pieces: 30, gridSize: 6 }
]

const MAX_IMAGES = 6

function App() {
  const [gameState, setGameState] = useState('upload') // upload, menu, playing, completed
  const [uploadedImages, setUploadedImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [pieces, setPieces] = useState([])
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedLevels, setCompletedLevels] = useState({})
  
  const audioRef = useRef({
    bgMusic: null,
    select: null,
    correct: null,
    complete: null
  })
  
  const canvasRef = useRef(null)

  // Inicializar sons
  useEffect(() => {
    audioRef.current.select = createBeep(400, 0.1, 'sine')
    audioRef.current.correct = createBeep(600, 0.2, 'triangle')
    audioRef.current.complete = createMelody()
  }, [])

  function createBeep(frequency, duration, type = 'sine') {
    return () => {
      if (!soundEnabled) return
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
    }
  }

  function createMelody() {
    return () => {
      if (!soundEnabled) return
      const notes = [523.25, 587.33, 659.25, 783.99]
      notes.forEach((freq, i) => {
        setTimeout(() => createBeep(freq, 0.3, 'sine')(), i * 150)
      })
    }
  }

  const playSound = (soundType) => {
    if (audioRef.current[soundType]) {
      audioRef.current[soundType]()
    }
  }

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    const totalImages = uploadedImages.length + files.length

    if (totalImages > MAX_IMAGES) {
      alert(`Você pode carregar no máximo ${MAX_IMAGES} imagens!`)
      return
    }

    const processedImages = await Promise.all(
      files.map(async (file) => {
        try {
          let processedFile = file

          // Converter HEIC para JPEG
          if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.9
            })
            processedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
              type: 'image/jpeg'
            })
          }

          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (event) => {
              const img = new Image()
              img.onload = () => {
                resolve({
                  src: event.target.result,
                  name: file.name,
                  width: img.width,
                  height: img.height
                })
              }
              img.src = event.target.result
            }
            reader.readAsDataURL(processedFile)
          })
        } catch (error) {
          console.error('Erro ao processar imagem:', error)
          return null
        }
      })
    )

    const validImages = processedImages.filter(img => img !== null)
    setUploadedImages(prev => [...prev, ...validImages])
  }

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const startGame = (imageIndex) => {
    setCurrentImageIndex(imageIndex)
    setGameState('menu')
  }

  const selectLevel = (levelIndex) => {
    setCurrentLevel(levelIndex)
    initializePuzzle(levelIndex)
    setGameState('playing')
  }

  const initializePuzzle = useCallback((levelIndex) => {
    const level = LEVELS[levelIndex]
    const image = uploadedImages[currentImageIndex]
    
    if (!image) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const pieceWidth = canvas.width / level.gridSize
      const pieceHeight = canvas.height / level.gridSize
      
      const newPieces = []
      
      for (let row = 0; row < level.gridSize; row++) {
        for (let col = 0; col < level.gridSize; col++) {
          const pieceCanvas = document.createElement('canvas')
          pieceCanvas.width = pieceWidth
          pieceCanvas.height = pieceHeight
          const pieceCtx = pieceCanvas.getContext('2d')
          
          pieceCtx.drawImage(
            img,
            (col * img.width) / level.gridSize,
            (row * img.height) / level.gridSize,
            img.width / level.gridSize,
            img.height / level.gridSize,
            0,
            0,
            pieceWidth,
            pieceHeight
          )
          
          newPieces.push({
            id: row * level.gridSize + col,
            correctPosition: { row, col },
            currentPosition: { row, col },
            image: pieceCanvas.toDataURL(),
            isPlaced: false
          })
        }
      }
      
      // Embaralhar peças
      const shuffled = [...newPieces].sort(() => Math.random() - 0.5)
      shuffled.forEach((piece, index) => {
        piece.currentPosition = {
          row: Math.floor(index / level.gridSize),
          col: index % level.gridSize
        }
      })
      
      setPieces(shuffled)
    }
    
    img.src = image.src
  }, [uploadedImages, currentImageIndex])

  const handlePieceClick = (piece) => {
    playSound('select')
    
    if (!selectedPiece) {
      setSelectedPiece(piece)
    } else if (selectedPiece.id === piece.id) {
      setSelectedPiece(null)
    } else {
      // Trocar posições
      const newPieces = pieces.map(p => {
        if (p.id === selectedPiece.id) {
          return { ...p, currentPosition: piece.currentPosition }
        }
        if (p.id === piece.id) {
          return { ...p, currentPosition: selectedPiece.currentPosition }
        }
        return p
      })
      
      setPieces(newPieces)
      setSelectedPiece(null)
      
      // Verificar se está correto
      const piece1Correct = selectedPiece.correctPosition.row === piece.currentPosition.row &&
                           selectedPiece.correctPosition.col === piece.currentPosition.col
      const piece2Correct = piece.correctPosition.row === selectedPiece.currentPosition.row &&
                           piece.correctPosition.col === selectedPiece.currentPosition.col
      
      if (piece1Correct && piece2Correct) {
        playSound('correct')
        
        newPieces.forEach(p => {
          if (p.id === selectedPiece.id || p.id === piece.id) {
            p.isPlaced = true
          }
        })
      }
      
      // Verificar se o puzzle está completo
      checkCompletion(newPieces)
    }
  }

  const checkCompletion = (currentPieces) => {
    const isComplete = currentPieces.every(piece => 
      piece.correctPosition.row === piece.currentPosition.row &&
      piece.correctPosition.col === piece.currentPosition.col
    )
    
    if (isComplete) {
      setTimeout(() => {
        playSound('complete')
        triggerConfetti()
        setGameState('completed')
        
        // Marcar nível como completo
        setCompletedLevels(prev => ({
          ...prev,
          [`${currentImageIndex}-${currentLevel}`]: true
        }))
      }, 300)
    }
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
    } catch (error) {
      console.error('Erro ao alternar tela cheia:', error)
    }
  }

  const resetPuzzle = () => {
    initializePuzzle(currentLevel)
    setSelectedPiece(null)
    setShowHint(false)
  }

  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      selectLevel(currentLevel + 1)
    } else {
      setGameState('menu')
    }
  }

  // Renderização do estado de upload
  if (gameState === 'upload') {
    return (
      <div className="upload-screen">
        <h1 className="title">🧩 Quebra-Cabeça Mágico ✨</h1>
        <p className="subtitle">Carregue até {MAX_IMAGES} fotos especiais!</p>
        
        <div className="upload-area">
          <input
            type="file"
            id="imageUpload"
            accept="image/*,.heic"
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="imageUpload" className="upload-button">
            📸 Escolher Fotos
          </label>
          
          <div className="image-grid">
            {uploadedImages.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img.src} alt={img.name} />
                <button onClick={() => removeImage(index)} className="remove-btn">❌</button>
                <button onClick={() => startGame(index)} className="play-btn">▶️ Jogar</button>
              </div>
            ))}
          </div>
          
          {uploadedImages.length === 0 && (
            <p className="hint-text">Nenhuma foto carregada ainda. Clique no botão acima! 👆</p>
          )}
        </div>
      </div>
    )
  }

  // Renderização do menu de níveis
  if (gameState === 'menu') {
    return (
      <div className="level-menu">
        <h1 className="title">Escolha o Nível! 🎯</h1>
        <div className="level-grid">
          {LEVELS.map((level, index) => (
            <button
              key={index}
              onClick={() => selectLevel(index)}
              className={`level-button ${completedLevels[`${currentImageIndex}-${index}`] ? 'completed' : ''}`}
            >
              <span className="level-number">Nível {level.level}</span>
              <span className="level-pieces">{level.pieces} peças</span>
              {completedLevels[`${currentImageIndex}-${index}`] && <span className="check">✅</span>}
            </button>
          ))}
        </div>
        <button onClick={() => setGameState('upload')} className="back-button">
          ⬅️ Voltar
        </button>
      </div>
    )
  }

  // Renderização do estado de completado
  if (gameState === 'completed') {
    return (
      <div className="completion-screen">
        <h1 className="celebration-title">🎉 Parabéns! 🎉</h1>
        <p className="celebration-text">Você completou o quebra-cabeça!</p>
        <div className="completed-image">
          <img src={uploadedImages[currentImageIndex].src} alt="Imagem completa" />
        </div>
        <div className="completion-buttons">
          <button onClick={resetPuzzle} className="action-button">
            🔄 Jogar Novamente
          </button>
          <button onClick={nextLevel} className="action-button primary">
            {currentLevel < LEVELS.length - 1 ? '➡️ Próximo Nível' : '🏠 Menu'}
          </button>
        </div>
      </div>
    )
  }

  // Renderização do jogo
  const level = LEVELS[currentLevel]
  
  return (
    <div className="game-screen">
      <canvas ref={canvasRef} width={800} height={600} style={{ display: 'none' }} />
      
      <div className="game-header">
        <button onClick={() => setGameState('menu')} className="header-button">
          ⬅️ Menu
        </button>
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

      <div className="puzzle-container">
        {showHint && (
          <div className="hint-overlay">
            <img src={uploadedImages[currentImageIndex].src} alt="Dica" />
          </div>
        )}
        
        <div 
          className="puzzle-grid"
          style={{
            gridTemplateColumns: `repeat(${level.gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${level.gridSize}, 1fr)`
          }}
        >
          {pieces.map((piece) => (
            <div
              key={piece.id}
              onClick={() => handlePieceClick(piece)}
              className={`puzzle-piece ${selectedPiece?.id === piece.id ? 'selected' : ''} ${piece.isPlaced ? 'placed' : ''}`}
              style={{
                gridRow: piece.currentPosition.row + 1,
                gridColumn: piece.currentPosition.col + 1
              }}
            >
              <img src={piece.image} alt={`Peça ${piece.id}`} draggable={false} />
            </div>
          ))}
        </div>
      </div>

      <div className="game-footer">
        <button 
          onClick={() => setShowHint(!showHint)}
          className="hint-button"
        >
          {showHint ? '🙈 Esconder Dica' : '💡 Ver Dica'}
        </button>
        <button onClick={resetPuzzle} className="reset-button">
          🔄 Reiniciar
        </button>
      </div>
    </div>
  )
}

export default App
