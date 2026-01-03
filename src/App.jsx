import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import heic2any from 'heic2any'

const LEVELS = [
  { level: 1, pieces: 8, rows: 2, cols: 4, stars: 0 },
  { level: 2, pieces: 12, rows: 3, cols: 4, stars: 0 },
  { level: 3, pieces: 15, rows: 3, cols: 5, stars: 0 },
  { level: 4, pieces: 20, rows: 4, cols: 5, stars: 0 },
  { level: 5, pieces: 24, rows: 4, cols: 6, stars: 0 },
  { level: 6, pieces: 30, rows: 5, cols: 6, stars: 0 }
]

const ALPHABET = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

// URLs de imagens aleatórias (Unsplash Random)
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
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [backgroundMusic, setBackgroundMusic] = useState(null)
  
  const canvasRef = useRef(null)
  const audioContextRef = useRef(null)

  // Sistema de áudio
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    
    // Trilha sonora de fundo (loop simples)
    if (soundEnabled && screen === 'welcome') {
      playBackgroundMusic()
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.stop()
      }
    }
  }, [screen, soundEnabled])

  const playBackgroundMusic = () => {
    if (!audioContextRef.current || backgroundMusic) return
    
    try {
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      
      oscillator.start()
      setBackgroundMusic(oscillator)
    } catch (e) {
      console.log('Audio não disponível')
    }
  }

  const playBeep = (frequency = 440, duration = 0.1) => {
    if (!soundEnabled || !audioContextRef.current) return
    
    try {
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (e) {
      console.log('Audio não disponível')
    }
  }

  const playApplause = () => {
    if (!soundEnabled) return
    
    // Simula aplausos com ruído branco
    try {
      const ctx = audioContextRef.current
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = buffer.getChannelData(0)
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }
      
      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = buffer
      
      const gainNode = ctx.createGain()
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2)
      
      whiteNoise.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      whiteNoise.start()
      whiteNoise.stop(ctx.currentTime + 2)
    } catch (e) {
      console.log('Audio não disponível')
    }
  }

  // ===== TELA 1: BEM-VINDO =====
  const WelcomeScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
      <div className="floating-card max-w-sm w-full p-8 text-center">
        <div className="flex justify-between items-center mb-6">
          <button className="icon-btn">
            <span className="text-2xl">⚙️</span>
          </button>
          <button 
            onClick={() => {
              setSoundEnabled(!soundEnabled)
              if (soundEnabled && backgroundMusic) {
                backgroundMusic.stop()
                setBackgroundMusic(null)
              } else {
                playBackgroundMusic()
              }
            }}
            className="icon-btn"
          >
            <span className="text-2xl">{soundEnabled ? '🎵' : '🔇'}</span>
          </button>
        </div>
        
        <h1 className="text-4xl font-black mb-2">
          Foto<span className="text-pink-400">Puzzle</span>
        </h1>
        <p className="text-gray-600 mb-8">Monte sua diversão!</p>
        
        <div className="mascot mb-8 bg-gradient-to-b from-blue-200 to-blue-300 rounded-3xl p-8">
          <div className="text-8xl">🧩</div>
        </div>
        
        <button 
          onClick={() => {
            playBeep(600, 0.2)
            setScreen('register')
          }} 
          className="btn-primary w-full text-lg"
        >
          ▶️ JOGAR
        </button>
        <p className="text-sm text-gray-400 mt-4">Toque para começar</p>
      </div>
    </div>
  )

  // ===== TELA 2: CADASTRO =====
  const RegisterScreen = () => {
    const [tempName, setTempName] = useState('')
    const fileInputRef = useRef(null)

    const handleAvatarUpload = async (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setPlayerAvatar(event.target.result)
          playBeep(700, 0.15)
        }
        reader.readAsDataURL(file)
      }
    }

    const handleKeyPress = (letter) => {
      if (tempName.length < 10) {
        setTempName(tempName + letter)
        playBeep(500, 0.05)
      }
    }

    const handleBackspace = () => {
      setTempName(tempName.slice(0, -1))
      playBeep(400, 0.1)
    }

    const handleContinue = () => {
      if (tempName.trim()) {
        setPlayerName(tempName)
        playBeep(800, 0.2)
        setScreen('upload')
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'}}>
        <div className="floating-card max-w-md w-full p-8">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setScreen('welcome')} className="icon-btn">
              <span className="text-2xl">←</span>
            </button>
            <h2 className="text-2xl font-bold flex-1 text-center">Quem é você?</h2>
            <button className="icon-btn bg-cyan-100">
              <span className="text-2xl">ℹ️</span>
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="avatar-circle mb-4 relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {playerAvatar ? (
                <img src={playerAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">👤</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex gap-3 mb-4">
              <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center text-white shadow-lg hover:scale-110 transition">
                📷
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center text-white shadow-lg hover:scale-110 transition">
                🖼️
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-2">Toque para escolher</p>
            <div className="bg-white border-2 border-gray-200 rounded-2xl px-6 py-3 min-w-[200px] text-center">
              <span className="text-2xl font-bold">{tempName || '_____'}</span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-6">
            {ALPHABET.map(letter => (
              <button
                key={letter}
                onClick={() => handleKeyPress(letter)}
                className="keyboard-btn text-lg"
              >
                {letter}
              </button>
            ))}
            <button onClick={handleBackspace} className="keyboard-btn col-span-2 bg-red-50 text-red-500">
              ⌫
            </button>
            <button onClick={() => setTempName('')} className="keyboard-btn col-span-2 bg-gray-50">
              🔄
            </button>
          </div>

          <button onClick={handleContinue} className="btn-yellow w-full text-lg font-bold">
            JOGAR AGORA! ▶️
          </button>
        </div>
      </div>
    )
  }

  // ===== TELA 3: UPLOAD DE FOTOS =====
  const UploadScreen = () => {
    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files)
      if (uploadedImages.length + files.length > 6) {
        alert('Máximo 6 fotos!')
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
                img.onload = () => resolve({ 
                  src: event.target.result, 
                  name: file.name,
                  type: file.type.split('/')[1].toUpperCase()
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
      playBeep(600, 0.15)
    }

    const generateRandomImages = async () => {
      const randomImages = await Promise.all(
        RANDOM_IMAGES.slice(0, 6 - uploadedImages.length).map((url, idx) => 
          new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = 800
              canvas.height = 600
              const ctx = canvas.getContext('2d')
              ctx.drawImage(img, 0, 0, 800, 600)
              resolve({
                src: canvas.toDataURL('image/jpeg'),
                name: `random-${idx + 1}.jpg`,
                type: 'JPG'
              })
            }
            img.onerror = () => resolve(null)
            img.src = url
          })
        )
      )
      
      setUploadedImages(prev => [...prev, ...randomImages.filter(img => img !== null)])
      playBeep(700, 0.2)
    }

    const removeImage = (index) => {
      setUploadedImages(prev => prev.filter((_, i) => i !== index))
      playBeep(400, 0.1)
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'}}>
        <div className="floating-card max-w-md w-full p-8">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setScreen('register')} className="icon-btn">
              <span className="text-2xl">←</span>
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-xl font-bold">Personalizar Quebra-Cabeça</h2>
              <p className="text-sm text-gray-500">Ajuda</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2 text-center">Escolha suas Fotos</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Adicione fotos do seu dispositivo ou gere imagens aleatórias
          </p>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {['JPG', 'PNG', 'JPEG', 'WEBP', 'HEIC', 'AVIF'].map(format => (
              <button key={format} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-purple-100 transition">
                {format}
              </button>
            ))}
          </div>

          {uploadedImages.length < 6 && (
            <button 
              onClick={generateRandomImages}
              className="w-full mb-4 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl font-bold hover:scale-105 transition"
            >
              ✨ Gerar Foto Aleatória ({6 - uploadedImages.length} restantes)
            </button>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="photo-slot relative">
                {uploadedImages[index] ? (
                  <>
                    <img src={uploadedImages[index].src} alt={`Foto ${index + 1}`} />
                    <div className="badge">{uploadedImages[index].type.slice(0,3)}</div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.heic,.avif"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <span className="text-4xl mb-2">+</span>
                    <span className="text-xs text-gray-500">FOTO {index + 1}</span>
                  </label>
                )}
              </div>
            ))}
          </div>

          {uploadedImages.length === 6 && (
            <button 
              onClick={() => {
                playBeep(800, 0.2)
                setScreen('levels')
              }} 
              className="btn-primary w-full text-lg"
            >
              🔒 Salvar e Jogar
            </button>
          )}
        </div>
      </div>
    )
  }

  // ===== TELA 4: SELEÇÃO DE FASES =====
  const LevelsScreen = () => {
    const totalProgress = (levelProgress.filter(l => l.stars > 0).length / LEVELS.length) * 100

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
        <div className="floating-card max-w-md w-full p-8">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setScreen('upload')} className="icon-btn">
              <span className="text-2xl">←</span>
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-xl font-bold">Mapa de Aventura</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="avatar-circle !w-20 !h-20">
              {playerAvatar ? (
                <img src={playerAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Vamos jogar!</h3>
              <p className="text-sm text-gray-500">Escolha um nível para começar</p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Seu Progresso</span>
              <span className="text-lg font-bold text-purple-600">⭐ {totalProgress.toFixed(0)}/100</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${totalProgress}%`}}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {LEVELS.map((level, idx) => (
              <div
                key={idx}
                className={`level-card cursor-pointer ${idx > 0 && levelProgress[idx - 1].stars === 0 ? 'locked' : ''}`}
                onClick={() => {
                  if (idx === 0 || levelProgress[idx - 1].stars > 0) {
                    playBeep(600, 0.15)
                    setCurrentLevel(idx)
                    setScreen('game')
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    idx === 0 || levelProgress[idx - 1].stars > 0 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {idx === 0 || levelProgress[idx - 1].stars > 0 ? '🧩' : '🔒'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Nível {level.level}</p>
                    <p className="text-xs text-gray-500">{level.pieces} Peças</p>
                  </div>
                </div>
                <div className="flex gap-1 justify-center">
                  {[1,2,3].map(star => (
                    <span key={star} className={levelProgress[idx].stars >= star ? 'star' : 'star empty'}>⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bottom-nav flex justify-around">
            <button className="nav-btn active">
              <span className="text-2xl">🏠</span>
              <span className="text-xs font-semibold">Fases</span>
            </button>
            <button className="nav-btn">
              <span className="text-2xl">📋</span>
              <span className="text-xs font-semibold">História</span>
            </button>
            <button className="nav-btn">
              <span className="text-2xl">⚙️</span>
              <span className="text-xs font-semibold">Opções</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== TELA 5: JOGO =====
  const GameScreen = () => {
    const level = LEVELS[currentLevel]
    const progress = pieces.filter(p => p.isPlaced).length
    const total = level.pieces

    useEffect(() => {
      initializePuzzle()
    }, [currentLevel])

    const initializePuzzle = () => {
      const image = uploadedImages[currentLevel]
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
        
        // Embaralha
        const shuffled = [...newPieces]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const temp = shuffled[i].currentRow
          const tempCol = shuffled[i].currentCol
          shuffled[i].currentRow = shuffled[j].currentRow
          shuffled[i].currentCol = shuffled[j].currentCol
          shuffled[j].currentRow = temp
          shuffled[j].currentCol = tempCol
        }
        
        setPieces(shuffled)
      }
      
      img.src = image.src
    }

    const handleDragStart = (e, piece) => {
      if (piece.isPlaced) return
      setDraggedPiece(piece)
      playBeep(400, 0.05)
      e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragEnd = () => {
      setDraggedPiece(null)
    }

    const handleDragOver = (e) => {
      e.preventDefault()
    }

    const handleDrop = (e, targetPiece) => {
      e.preventDefault()
      if (!draggedPiece || draggedPiece.id === targetPiece.id) return
      
      playBeep(500, 0.1)
      
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
            return !oldPiece?.isPlaced && p.isPlaced
          })
          
          if (anyCorrect) {
            playBeep(700, 0.2)
          }
          
          const allCorrect = current.every(p => p.isPlaced)
          if (allCorrect) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
            playApplause()
            setLevelProgress(prev => {
              const updated = [...prev]
              updated[currentLevel].stars = 3
              return updated
            })
            setTimeout(() => setScreen('victory'), 1000)
          }
          return current
        })
      }, 100)
      
      setDraggedPiece(null)
    }

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
      playBeep(600, 0.15)
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="floating-card max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setScreen('levels')} className="icon-btn">
              <span className="text-2xl">←</span>
            </button>
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-gray-500">Progresso</p>
              <p className="text-2xl font-bold">{progress}/{total}</p>
            </div>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="icon-btn">
              <span className="text-2xl">{soundEnabled ? '🔊' : '🔇'}</span>
            </button>
          </div>

          <div className="progress-bar mb-6">
            <div className="progress-fill" style={{width: `${(progress/total)*100}%`}}></div>
          </div>

          {showHint && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setShowHint(false)}>
              <div className="max-w-2xl">
                <img src={uploadedImages[currentLevel].src} alt="Dica" className="rounded-3xl shadow-2xl" />
                <p className="text-white text-center mt-4 text-lg font-bold">👆 Toque para fechar</p>
              </div>
            </div>
          )}

          <div
            className="grid gap-2 bg-white/20 backdrop-blur p-4 rounded-3xl mb-6"
            style={{
              gridTemplateColumns: `repeat(${level.cols}, 1fr)`,
              aspectRatio: '4/3'
            }}
          >
            {pieces.map((piece) => (
              <div
                key={piece.id}
                draggable={!piece.isPlaced}
                onDragStart={(e) => handleDragStart(e, piece)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, piece)}
                className={`puzzle-piece-3d relative rounded-xl overflow-hidden bg-white shadow-lg ${
                  draggedPiece?.id === piece.id ? 'dragging' : ''
                } ${piece.isPlaced ? 'ring-4 ring-green-400' : ''}`}
                style={{
                  gridRow: piece.currentRow + 1,
                  gridColumn: piece.currentCol + 1
                }}
              >
                <img src={piece.image} alt={`Peça ${piece.id}`} className="w-full h-full object-cover" draggable={false} />
                {piece.isPlaced && (
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                setShowHint(true)
                playBeep(600, 0.15)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-800 rounded-full font-bold shadow-lg hover:scale-105 transition"
            >
              💡 Dica
            </button>
            <button 
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full font-bold shadow-lg hover:scale-105 transition"
            >
              ⛶ Tela Cheia
            </button>
            <button 
              onClick={() => {
                initializePuzzle()
                playBeep(500, 0.15)
              }}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:scale-110 transition"
            >
              <span className="text-2xl">🔄</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== TELA 6: VITÓRIA =====
  const VictoryScreen = () => {
    useEffect(() => {
      const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf']
      const end = Date.now() + 3000
      
      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        })
        
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
      
      playApplause()
    }, [])

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'}}>
        <div className="floating-card max-w-md w-full p-8 text-center relative overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                background: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0'
              }}
            />
          ))}

          <h1 className="text-5xl font-black text-purple-600 mb-2">Parabéns!</h1>
          <p className="text-xl font-bold text-gray-700 mb-8">Você conseguiu!</p>

          <div className="relative inline-block mb-8">
            <div className="w-64 h-48 bg-white rounded-2xl shadow-2xl p-3 transform rotate-1 hover:rotate-0 transition">
              <img
                src={uploadedImages[currentLevel]?.src}
                alt="Puzzle completo"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">✓</span>
              </div>
            </div>
            <div className="absolute inset-0 border-4 border-yellow-300 rounded-2xl pointer-events-none"></div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <span className="text-5xl animate-bounce" style={{animationDelay: '0s'}}>⭐</span>
            <span className="text-6xl animate-bounce" style={{animationDelay: '0.1s'}}>⭐</span>
            <span className="text-5xl animate-bounce" style={{animationDelay: '0.2s'}}>⭐</span>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-8">PONTUAÇÃO MÁXIMA</p>

          <button 
            onClick={() => {
              playBeep(800, 0.2)
              if (currentLevel < LEVELS.length - 1) {
                setCurrentLevel(currentLevel + 1)
                setScreen('game')
              } else {
                setScreen('levels')
              }
            }}
            className="btn-primary w-full text-xl mb-4"
          >
            {currentLevel < LEVELS.length - 1 ? 'PRÓXIMA FASE' : 'VER MAPA'}
          </button>

          <div className="flex gap-8 justify-center">
            <button onClick={() => {
              playBeep(600, 0.15)
              setScreen('levels')
            }} className="flex flex-col items-center gap-1">
              <div className="icon-btn">
                <span className="text-2xl">🏠</span>
              </div>
              <span className="text-xs font-semibold text-gray-600">Menu</span>
            </button>
            <button onClick={() => {
              playBeep(600, 0.15)
              setScreen('game')
            }} className="flex flex-col items-center gap-1">
              <div className="icon-btn">
                <span className="text-2xl">🔄</span>
              </div>
              <span className="text-xs font-semibold text-gray-600">Repetir</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {screen === 'welcome' && <WelcomeScreen />}
      {screen === 'register' && <RegisterScreen />}
      {screen === 'upload' && <UploadScreen />}
      {screen === 'levels' && <LevelsScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'victory' && <VictoryScreen />}
    </>
  )
}
