import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import heic2any from 'heic2any'

const LEVELS = [
  { level: 1, pieces: 4, rows: 2, cols: 2 },
  { level: 2, pieces: 6, rows: 2, cols: 3 },
  { level: 3, pieces: 6, rows: 3, cols: 2 },
  { level: 4, pieces: 9, rows: 3, cols: 3 },
  { level: 5, pieces: 12, rows: 3, cols: 4 },
  { level: 6, pieces: 12, rows: 4, cols: 3 }
]

const MAX_IMAGES = 6

export default function App() {
  const [screen, setScreen] = useState('upload')
  const [uploadedImages, setUploadedImages] = useState([])
  const [shuffledImages, setShuffledImages] = useState([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [pieces, setPieces] = useState([])
  const [availablePieces, setAvailablePieces] = useState([])
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedLevels, setCompletedLevels] = useState(new Set())
  
  const canvasRef = useRef(null)

  // Upload de imagens
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
    initializePuzzle(0, shuffled)
    setScreen('game')
  }

  const initializePuzzle = (levelIndex, images = shuffledImages) => {
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
      const gridPieces = []
      const trayPieces = []
      
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
          
          const piece = {
            id: row * level.cols + col,
            correctRow: row,
            correctCol: col,
            image: pieceCanvas.toDataURL(),
            isPlaced: false
          }
          
          gridPieces.push({ ...piece, isEmpty: true })
          trayPieces.push(piece)
        }
      }
      
      // Embaralha apenas as peças da bandeja
      const shuffled = [...trayPieces].sort(() => Math.random() - 0.5)
      
      setPieces(gridPieces)
      setAvailablePieces(shuffled)
    }
    
    img.src = image.src
  }

  const handleDragStart = (e, piece) => {
    if (piece.isPlaced) return
    setDraggedPiece(piece)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedPiece(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (targetRow, targetCol) => {
    if (!draggedPiece) return
    
    const isCorrect = draggedPiece.correctRow === targetRow && draggedPiece.correctCol === targetCol
    
    if (isCorrect) {
      // Remove da bandeja
      setAvailablePieces(prev => prev.filter(p => p.id !== draggedPiece.id))
      
      // Coloca no grid
      setPieces(prev => prev.map(p => {
        if (p.correctRow === targetRow && p.correctCol === targetCol) {
          return { ...draggedPiece, isEmpty: false, isPlaced: true }
        }
        return p
      }))
      
      // Verifica vitória
      setTimeout(() => {
        setPieces(current => {
          const allPlaced = current.every(p => p.isPlaced)
          if (allPlaced) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            })
            setCompletedLevels(prev => new Set([...prev, currentLevel]))
            setTimeout(() => setScreen('success'), 1000)
          }
          return current
        })
      }, 100)
    }
    
    setDraggedPiece(null)
  }

  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1 && currentLevel < shuffledImages.length - 1) {
      const nextLvl = currentLevel + 1
      setCurrentLevel(nextLvl)
      initializePuzzle(nextLvl)
      setScreen('game')
    } else {
      setScreen('upload')
      setUploadedImages([])
      setShuffledImages([])
    }
  }

  const resetPuzzle = () => {
    initializePuzzle(currentLevel)
  }

  const newGame = () => {
    setUploadedImages([])
    setShuffledImages([])
    setCompletedLevels(new Set())
    setScreen('upload')
  }

  // ============ TELA UPLOAD ============
  if (screen === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex flex-col items-center justify-center p-4">
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-[#2b8cee] mb-2 tracking-tight drop-shadow-sm">
              🧩 Quebra-Cabeça Mágico
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Carregue {MAX_IMAGES} fotos para começar!
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-4">
            <input
              type="file"
              id="imageUpload"
              accept="image/*,.heic"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <label
              htmlFor="imageUpload"
              className="flex items-center justify-center gap-3 w-full h-16 bg-[#2b8cee] text-white rounded-2xl cursor-pointer font-bold text-lg toy-shadow hover:bg-blue-500 active:scale-95 transition-all"
            >
              <span className="text-2xl">📸</span>
              Escolher Fotos ({uploadedImages.length}/{MAX_IMAGES})
            </label>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={img.src}
                      alt={img.name}
                      className="w-full h-full object-cover rounded-xl shadow-md"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90 transition-all font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploadedImages.length > 0 && uploadedImages.length < MAX_IMAGES && (
            <p className="text-center text-gray-600 font-semibold">
              📸 Faltam {MAX_IMAGES - uploadedImages.length} foto(s)!
            </p>
          )}

          {uploadedImages.length === MAX_IMAGES && (
            <button
              onClick={startGame}
              className="w-full h-20 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-2xl font-black text-2xl uppercase tracking-wide toy-shadow hover:from-green-500 hover:to-green-600 active:scale-95 transition-all"
            >
              🎮 Iniciar Jogo
            </button>
          )}
        </div>
      </div>
    )
  }

  // ============ TELA JOGO ============
  if (screen === 'game') {
    const level = LEVELS[currentLevel]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex flex-col">
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Header */}
        <header className="bg-white shadow-md p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={newGame}
              className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all"
            >
              <span className="text-2xl">🏠</span>
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800">
              Nível {level.level}
            </h2>
            
            <div className="flex gap-2">
              <button
                onClick={resetPuzzle}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all"
              >
                <span className="text-2xl">🔄</span>
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all"
              >
                <span className="text-2xl">{soundEnabled ? '🔊' : '🔇'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Grid do Puzzle */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div
            className="grid gap-2 bg-white/50 backdrop-blur-sm p-4 rounded-3xl shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))`,
              width: 'min(90vw, 600px)',
              aspectRatio: '4/3'
            }}
          >
            {pieces.map((piece) => (
              <div
                key={piece.id}
                className={`puzzle-slot rounded-xl border-4 ${
                  piece.isEmpty ? 'border-dashed border-gray-300 bg-white/50' : 'border-transparent'
                }`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(piece.correctRow, piece.correctCol)}
              >
                {!piece.isEmpty && (
                  <div className="relative w-full h-full">
                    <img
                      src={piece.image}
                      alt={`Peça ${piece.id}`}
                      className="w-full h-full object-cover rounded-lg"
                      draggable={false}
                    />
                    {piece.isPlaced && (
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Bandeja de Peças */}
        <footer className="bg-white shadow-lg p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Peças disponíveis
              </h3>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                {availablePieces.length} restantes
              </span>
            </div>
            <div className="piece-tray flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {availablePieces.map((piece) => (
                <div
                  key={piece.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, piece)}
                  onDragEnd={handleDragEnd}
                  className={`puzzle-piece snap-center shrink-0 w-24 h-24 bg-white rounded-xl shadow-md border-2 border-gray-100 p-1 ${
                    draggedPiece?.id === piece.id ? 'dragging' : ''
                  }`}
                >
                  <img
                    src={piece.image}
                    alt={`Peça ${piece.id}`}
                    className="w-full h-full object-cover rounded-lg"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // ============ TELA SUCESSO ============
  if (screen === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Confetes decorativos */}
        <div className="confetti bg-red-400 rotate-12 top-10 left-4 rounded-sm"></div>
        <div className="confetti bg-blue-400 -rotate-45 top-20 left-12 w-3 h-3 rounded-full"></div>
        <div className="confetti bg-yellow-400 rotate-45 top-8 left-24 w-4 h-2"></div>
        <div className="confetti bg-green-400 -rotate-12 top-12 right-6 rounded-sm"></div>
        <div className="confetti bg-purple-400 rotate-45 top-24 right-16 w-3 h-3 rounded-full"></div>
        <div className="confetti bg-pink-400 -rotate-90 top-6 right-32 w-4 h-2"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-extrabold text-[#2b8cee] mb-2 drop-shadow-sm">
              🎉 Parabéns! 🎉
            </h1>
            <p className="text-2xl font-bold text-gray-700">
              Você conseguiu!
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative w-80 aspect-[4/3] bg-white p-3 rounded-3xl shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="absolute inset-0 border-4 border-yellow-400/30 rounded-3xl pointer-events-none"></div>
              <img
                src={shuffledImages[currentLevel].src}
                alt="Puzzle completo"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl">✓</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-white/50 backdrop-blur-sm px-8 py-4 rounded-full shadow-md flex gap-4">
              <span className="text-5xl">⭐</span>
              <span className="text-6xl">⭐</span>
              <span className="text-5xl">⭐</span>
            </div>
          </div>

          <div className="space-y-4">
            {currentLevel < LEVELS.length - 1 && currentLevel < shuffledImages.length - 1 && (
              <button
                onClick={nextLevel}
                className="w-full h-16 bg-[#2b8cee] text-white rounded-2xl font-bold text-xl uppercase tracking-wide toy-shadow hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-2xl">▶️</span>
                Próxima Fase
              </button>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={newGame}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all">
                  <span className="text-3xl">🏠</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">Menu</span>
              </button>

              <button
                onClick={resetPuzzle}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all">
                  <span className="text-3xl">🔄</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">Repetir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
