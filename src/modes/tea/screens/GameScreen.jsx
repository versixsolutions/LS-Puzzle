import { useState, useEffect, useRef } from 'react'
import {
  calculateGrid,
  splitIntoPieces,
  loadImage,
  imageToSquareCanvas
} from '../../../shared/utils/imageProcessing'

export default function GameScreen({ level, levelIndex, image, config, onComplete, onBack }) {
  const [pieces, setPieces] = useState([])
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0)
  const [placedPieces, setPlacedPieces] = useState(new Set())
  const [showGuide, setShowGuide] = useState(false)
  const [gridSize, setGridSize] = useState({ rows: 2, cols: 2 })
  const [isLoading, setIsLoading] = useState(true)
  const [startTime] = useState(Date.now())
  const inactivityTimerRef = useRef(null)

  useEffect(() => {
    if (image) {
      initializePuzzle()
    }
  }, [level, image])

  // Auto-hint timer
  useEffect(() => {
    if (config.auto_hints && !isLoading && currentPieceIndex < pieces.length) {
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      // Set new timer
      inactivityTimerRef.current = setTimeout(() => {
        setShowGuide(true)
        if (config.sfx_enabled && navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
      }, config.auto_hints_delay || 15000)
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [currentPieceIndex, isLoading, config])

  const initializePuzzle = async () => {
    try {
      setIsLoading(true)
      const img = await loadImage(image.src)
      const canvas = await imageToSquareCanvas(img)
      const { rows, cols } = calculateGrid(level.pieces, 1)
      setGridSize({ rows, cols })

      const puzzlePieces = await splitIntoPieces(canvas, rows, cols)
      setPieces(puzzlePieces)
      setIsLoading(false)
    } catch (error) {
      console.error('Error initializing puzzle:', error)
      setIsLoading(false)
    }
  }

  const handleSlotClick = (slotId) => {
    if (isLoading || currentPieceIndex >= pieces.length) return

    const currentPiece = pieces[currentPieceIndex]
    
    // Check if clicked correct slot
    if (slotId === currentPiece.id) {
      // CORRECT!
      const newPlaced = new Set(placedPieces)
      newPlaced.add(currentPiece.id)
      setPlacedPieces(newPlaced)

      // Feedback
      if (config.haptic_enabled && navigator.vibrate) {
        navigator.vibrate(50)
      }

      // Hide guide
      setShowGuide(false)

      // Move to next piece or complete
      if (currentPieceIndex === pieces.length - 1) {
        // Puzzle complete!
        setTimeout(() => {
          const totalTime = Date.now() - startTime
          console.log('Puzzle completed in', totalTime, 'ms')
          onComplete()
        }, 500)
      } else {
        setTimeout(() => {
          setCurrentPieceIndex(currentPieceIndex + 1)
        }, 300)
      }
    } else {
      // INCORRECT - gentle feedback
      if (config.haptic_enabled && navigator.vibrate) {
        navigator.vibrate([30, 100, 30])
      }
      
      // Show guide briefly
      setShowGuide(true)
      setTimeout(() => setShowGuide(false), 1500)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🧩</div>
          <p className="text-xl font-bold text-gray-600">Preparando peças...</p>
        </div>
      </div>
    )
  }

  const currentPiece = pieces[currentPieceIndex]
  const progress = ((currentPieceIndex + placedPieces.size) / pieces.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4 pb-safe">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">Fase {levelIndex + 1}</h2>
            <p className="text-sm text-gray-600">
              Peça {currentPieceIndex + 1} de {pieces.length}
            </p>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-12 h-12 rounded-full bg-yellow-400 shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
          >
            💡
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-full h-4 shadow-lg overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-400 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Guide Image (faded background) */}
      {showGuide && (
        <div className="max-w-md mx-auto mb-4">
          <div className="relative opacity-40 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={image.src}
              alt="Guia"
              className="w-full"
            />
            <div className="absolute inset-0 bg-white/30"></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            👆 Use esta imagem como guia
          </p>
        </div>
      )}

      {/* Puzzle Board */}
      <div className="max-w-md mx-auto mb-6">
        <div
          className="grid gap-2 bg-white/20 backdrop-blur p-3 rounded-3xl shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
            aspectRatio: '1 / 1'
          }}
        >
          {pieces.map((piece) => {
            const isPlaced = placedPieces.has(piece.id)
            const isActive = piece.id === currentPiece?.id

            return (
              <div
                key={piece.id}
                onClick={() => handleSlotClick(piece.id)}
                className={`
                  aspect-square rounded-xl cursor-pointer transition-all duration-200
                  ${isPlaced ? 'bg-green-200 border-4 border-green-500' : 'bg-white/80 border-4 border-gray-300'}
                  ${isActive && !isPlaced ? 'border-green-500 animate-pulse ring-4 ring-green-300' : ''}
                  ${!isPlaced && !isActive ? 'hover:bg-gray-100' : ''}
                `}
                style={{
                  gridRow: Math.floor(piece.id / gridSize.cols) + 1,
                  gridColumn: (piece.id % gridSize.cols) + 1
                }}
              >
                {isPlaced && (
                  <div className="w-full h-full relative">
                    <img
                      src={piece.image}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Piece Display */}
      {currentPiece && !placedPieces.has(currentPiece.id) && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <p className="text-center text-lg font-bold mb-4 text-gray-700">
              PEÇA ATUAL:
            </p>
            <div className="flex justify-center">
              <div className="w-40 h-40 border-4 border-green-500 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={currentPiece.image}
                  alt="Peça atual"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              👆 Toque no lugar certo no tabuleiro
            </p>
          </div>
        </div>
      )}

      {/* Completion indicator */}
      {placedPieces.size === pieces.length && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-2xl font-bold text-green-600">Completou!</p>
          </div>
        </div>
      )}
    </div>
  )
}
