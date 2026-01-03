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
const APP_VERSION = '5.0.0'

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
  const [puzzleInitialized, setPuzzleInitialized] = useState(false)
  const [interactionMode, setInteractionMode] = useState('drag') // 'drag' or 'click'
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '')
  
  const saveUserName = (name) => {
    setUserName(name)
    localStorage.setItem('userName', name)
  }
  
  const audioRef = useRef({ select: null, drop: null, correct: null, complete: null })
  const canvasRef = useRef(null)

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

  const startGame = (selectedMode = null) => {
    const shuffled = [...uploadedImages].sort(() => Math.random() - 0.5)
    setShuffledImages(shuffled)
    setCurrentLevel(0)
    setCompletedLevels(new Set())
    setPuzzleInitialized(false)
    
    // Se um modo foi selecionado, define-o
    if (selectedMode) {
      setInteractionMode(selectedMode)
    }
    
    setTimeout(() => {
      initializePuzzle(0, shuffled)
      setGameState('playing')
    }, 100)
  }

  const reviewPhotos = () => {
    setUploadedImages([])
    setShuffledImages([])
    setGameState('upload')
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
      
      // Embaralha as peças
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
      setPuzzleInitialized(true)
    }
    
    img.src = image.src
  }, [shuffledImages])

  const handleDragStart = (e, piece) => {
    if (piece.isPlaced) return
    setDraggedPiece(piece)
    playSound('select')
    e.dataTransfer.effectAllowed = 'move'
    // Melhorar feedback visual para drag
    e.dataTransfer.setData('text/plain', piece.id)
    setTimeout(() => { 
      e.target.style.opacity = '0.6'
      e.target.style.transform = 'scale(1.1) rotate(5deg)'
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    e.target.style.transform = 'scale(1) rotate(0deg)'
    setDraggedPiece(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // Novo: Suporte a touch events para melhor aderência
  const handleTouchStart = (e, piece) => {
    if (piece.isPlaced || interactionMode === 'click') return
    e.preventDefault()
    setDraggedPiece(piece)
    playSound('select')
    e.target.style.opacity = '0.6'
    e.target.style.transform = 'scale(1.1) rotate(5deg)'
  }

  const handleTouchEnd = (e, piece) => {
    if (interactionMode === 'click') return
    e.preventDefault()
    e.target.style.opacity = '1'
    e.target.style.transform = 'scale(1) rotate(0deg)'
    
    // Detectar se foi solto sobre outra peça
    const touch = e.changedTouches[0]
    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY)
    if (elementAtPoint && elementAtPoint.closest('.puzzle-piece')) {
      const targetPieceId = elementAtPoint.closest('.puzzle-piece').getAttribute('data-piece-id')
      const targetPiece = pieces.find(p => p.id.toString() === targetPieceId)
      if (targetPiece && targetPiece.id !== piece.id) {
        handlePieceSwap(piece, targetPiece)
      }
    }
    
    setDraggedPiece(null)
  }

  // Novo: Modo click-to-move
  const handlePieceClick = (piece) => {
    if (!puzzleInitialized || piece.isPlaced) return
    
    if (interactionMode === 'click') {
      if (selectedPiece === null) {
        // Selecionar peça
        setSelectedPiece(piece)
        playSound('select')
      } else if (selectedPiece.id === piece.id) {
        // Desselecionar
        setSelectedPiece(null)
      } else {
        // Trocar peças
        handlePieceSwap(selectedPiece, piece)
        setSelectedPiece(null)
      }
    }
  }

  // Função auxiliar para trocar peças
  const handlePieceSwap = (draggedPiece, targetPiece) => {
    playSound('drop')
    
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
  }

  const handleDropOnPiece = (e, targetPiece) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedPiece || draggedPiece.id === targetPiece.id) return
    
    handlePieceSwap(draggedPiece, targetPiece)
    setDraggedPiece(null)
  }

  const startPuzzle = () => {
    if (!puzzleInitialized) {
      initializePuzzle(currentLevel)
    }
  }

  const resetPuzzle = () => {
    initializePuzzle(currentLevel)
    setShowHint(false)
    setSelectedPiece(null)
  }

  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1 && currentLevel < shuffledImages.length - 1) {
      const nextLvl = currentLevel + 1
      setCurrentLevel(nextLvl)
      setPuzzleInitialized(false)
      setGameState('playing')
      setSelectedPiece(null)
      setTimeout(() => initializePuzzle(nextLvl), 100)
    }
  }

  const newGame = () => {
    setUploadedImages([])
    setShuffledImages([])
    setGameState('upload')
    setPuzzleInitialized(false)
    setCompletedLevels(new Set())
  }

  if (gameState === 'upload') {
    return (
      <div className={`upload-screen ${uploadedImages.length > 0 ? 'has-photos' : ''}`}>
        {/* Botão de atualização discreto */}
        <button 
          onClick={handleUpdate} 
          className="update-app-button"
          title="Atualizar aplicativo"
        >
          🔄
        </button>
        
        {updateAvailable && (
          <div className="update-banner">
            <span>✨ Nova versão disponível!</span>
            <button onClick={handleUpdate} className="update-button">
              🔄 Atualizar Agora
            </button>
          </div>
        )}
        
        {/* Saudação personalizada */}
        {userName && (
          <div className="welcome-message">
            <h2>Olá, {userName}! 👋</h2>
            <p>Pronto para uma aventura mágica?</p>
          </div>
        )}
        
        {/* Título maior e mais chamativo - só mostra quando não há fotos carregadas */}
        {uploadedImages.length === 0 && (
          <div className="hero-section">
            <div className="logo-container">
              <div className="logo-icon">🧩</div>
              <h1 className="main-title">Quebra-Cabeça<br/>Mágico</h1>
              <div className="sparkle-effects">
                <span className="sparkle">✨</span>
                <span className="sparkle">⭐</span>
                <span className="sparkle">✨</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Campo para nome do usuário */}
        {!userName && (
          <div className="name-input-section">
            <div className="name-input-container">
              <label htmlFor="userName" className="name-label">
                <span className="name-icon">👤</span>
                Qual é o seu nome?
              </label>
              <input
                id="userName"
                type="text"
                placeholder="Digite seu nome..."
                className="name-input"
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    saveUserName(e.target.value.trim())
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('userName')
                  if (input.value.trim()) {
                    saveUserName(input.value.trim())
                  }
                }}
                className="name-confirm-button"
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        )}
        
        {/* Subtítulo - só mostra quando não há fotos carregadas */}
        {uploadedImages.length === 0 && (
          <p className="subtitle">
            <span className="camera-icon">📸</span>
            Carregue {MAX_IMAGES} fotos para começar a magia!
          </p>
        )}
        
        <div className="upload-container">
          <div className="upload-area">
            <input type="file" id="imageUpload" accept="image/*,.heic" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
            <label htmlFor="imageUpload" className="upload-button">
              <span className="upload-icon">📷</span>
              Escolher Fotos
              <span className="upload-counter">({uploadedImages.length}/{MAX_IMAGES})</span>
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
            
            {uploadedImages.length === MAX_IMAGES && (
              <div className="overlay-buttons">
                <button onClick={() => setGameState('mode-selection')} className="start-game-button-overlay">
                  <span className="play-icon">🎮</span>
                  INICIAR JOGO
                </button>
                <button onClick={reviewPhotos} className="review-photos-button">
                  <span className="review-icon">🔄</span>
                  Revisar Fotos
                </button>
              </div>
            )}
          </div>
          
          {uploadedImages.length === 0 && (
            <p className="hint-text">
              <span className="hint-icon">💡</span>
              Clique no botão acima para escolher suas fotos favoritas!
            </p>
          )}
          
          {uploadedImages.length > 0 && uploadedImages.length < MAX_IMAGES && (
            <p className="hint-text">
              <span className="hint-icon">📸</span>
              Faltam {MAX_IMAGES - uploadedImages.length} foto(s)! Continue escolhendo!
            </p>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'mode-selection') {
    return (
      <div className="upload-screen has-photos">
        {/* Botão de atualização discreto */}
        <button 
          onClick={handleUpdate} 
          className="update-app-button"
          title="Atualizar aplicativo"
        >
          🔄
        </button>
        
        {updateAvailable && (
          <div className="update-banner">
            <span>✨ Nova versão disponível!</span>
            <button onClick={handleUpdate} className="update-button">
              🔄 Atualizar Agora
            </button>
          </div>
        )}
        
        {/* Saudação personalizada */}
        {userName && (
          <div className="welcome-message">
            <h2>Olá, {userName}! 👋</h2>
            <p>Escolha como quer jogar!</p>
          </div>
        )}
        
        {/* Título da seleção de modo */}
        <div className="hero-section">
          <div className="logo-container">
            <div className="logo-icon">🎯</div>
            <h1 className="main-title">Modo de<br/>Jogo</h1>
            <div className="sparkle-effects">
              <span className="sparkle">🎮</span>
              <span className="sparkle">🎯</span>
              <span className="sparkle">🎮</span>
            </div>
          </div>
        </div>
        
        {/* Opções de modo de jogo */}
        <div className="upload-container">
          <div className="upload-area">
            <div className="mode-selection-grid">
              <div className="mode-option">
                <button onClick={() => startGame('drag')} className="mode-button drag-mode">
                  <div className="mode-icon">👆</div>
                  <h3>Modo Arrastar</h3>
                  <p>Arraste as peças para seus lugares</p>
                  <div className="mode-features">
                    <span>🖱️ Arrastar e soltar</span>
                    <span>🎯 Mais intuitivo</span>
                    <span>⚡ Rápido</span>
                  </div>
                </button>
              </div>
              
              <div className="mode-option">
                <button onClick={() => startGame('click')} className="mode-button click-mode">
                  <div className="mode-icon">🖱️</div>
                  <h3>Modo Clicar</h3>
                  <p>Clique na peça e depois no destino</p>
                  <div className="mode-features">
                    <span>👆 Dois cliques</span>
                    <span>🎯 Mais preciso</span>
                    <span>🧠 Estratégico</span>
                  </div>
                </button>
              </div>
            </div>
            
            <button onClick={() => setGameState('upload')} className="back-button">
              <span className="back-icon">⬅️</span>
              Voltar
            </button>
          </div>
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
          <button onClick={newGame} className="action-button big">
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
        <button 
          onClick={() => setShowHint(!showHint)} 
          className="header-button big hint-btn"
        >
          💡 {showHint ? 'Esconder' : 'Ver'} Dica
        </button>
        <h2 className="level-title">Nível {level.level}</h2>
        <div className="header-controls">
          <button 
            onClick={() => setInteractionMode(interactionMode === 'drag' ? 'click' : 'drag')} 
            className="header-button big icon-btn"
            title={`Modo ${interactionMode === 'drag' ? 'Arrastar' : 'Clicar'}`}
          >
            {interactionMode === 'drag' ? '👆' : '🖱️'}
          </button>
          <button onClick={resetPuzzle} className="header-button big icon-btn" title="Reiniciar">
            🔄
          </button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="header-button big icon-btn">
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      <div className="puzzle-area">
        {showHint && (
          <div className="hint-overlay" onClick={() => setShowHint(false)}>
            <img src={shuffledImages[currentLevel].src} alt="Dica" />
            <p className="hint-instruction">👆 Toque para esconder</p>
          </div>
        )}
        
        {!puzzleInitialized && (
          <div className="start-overlay">
            <button onClick={startPuzzle} className="start-puzzle-button">
              🎮 INICIAR
            </button>
          </div>
        )}
        
        <div className="puzzle-grid" style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)`, gridTemplateRows: `repeat(${level.rows}, 1fr)` }}>
          {pieces.map((piece) => (
            <div
              key={piece.id}
              data-piece-id={piece.id}
              className={`puzzle-piece ${piece.isPlaced ? 'correct' : ''} ${draggedPiece?.id === piece.id ? 'dragging' : ''} ${selectedPiece?.id === piece.id ? 'selected' : ''}`}
              draggable={interactionMode === 'drag' && !piece.isPlaced && puzzleInitialized}
              onClick={() => handlePieceClick(piece)}
              onDragStart={(e) => handleDragStart(e, piece)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnPiece(e, piece)}
              onTouchStart={(e) => handleTouchStart(e, piece)}
              onTouchEnd={(e) => handleTouchEnd(e, piece)}
              style={{
                gridRow: piece.currentRow + 1,
                gridColumn: piece.currentCol + 1
              }}
            >
              <img src={piece.image} alt={`Peça ${piece.id}`} draggable={false} />
              {piece.isPlaced && <div className="check-mark">✓</div>}
              {selectedPiece?.id === piece.id && !piece.isPlaced && (
                <div className="selection-indicator">🎯</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="game-footer">
        <button onClick={newGame} className="game-button big new-game">
          🏠 Novo Jogo
        </button>
      </div>
    </div>
  )
}

export default App
