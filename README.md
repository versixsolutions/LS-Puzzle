# 🧩 Quebra-Cabeça Mágico - Arquitetura Dual TEA/Neurotípico

## 📋 Visão Geral

Este projeto implementa uma arquitetura modular dual com dois modos de jogo independentes:
- **Modo Clássico (Neurotípico)**: Interface colorida, drag & drop, múltiplas peças simultâneas
- **Modo Focado (TEA)**: Mecânica sequencial, configurações sensoriais, dashboard parental

## 🚀 Quick Start

### 1. Configurar Supabase (Free Tier)

1. Criar conta em [https://supabase.com](https://supabase.com)
2. Criar novo projeto
3. Copiar SQL do arquivo `src/config/supabase.js` e executar no SQL Editor
4. Obter credenciais: Settings → API → Project URL e anon/public key

### 2. Variáveis de Ambiente

Criar arquivo `.env` na raiz:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

### 3. Instalação

```bash
npm install
npm run dev
```

## 📁 Estrutura de Diretórios

```
src/
├── config/
│   ├── supabase.js          # Configuração Supabase + Schema SQL
│   └── constants.js          # Constantes do app
│
├── shared/                   # Código compartilhado
│   ├── components/
│   │   └── ModeSelector.jsx # Tela inicial de escolha
│   ├── hooks/
│   │   └── useLocalStorage.js
│   └── utils/
│       ├── encryption.js     # E2E encryption (crypto-js)
│       └── imageProcessing.js # Canvas utilities
│
├── modes/
│   ├── neurotypical/         # MODO CLÁSSICO
│   │   ├── NeurotypicalApp.jsx
│   │   ├── screens/
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── GameScreen.jsx
│   │   │   └── VictoryScreen.jsx
│   │   └── components/
│   │       └── PuzzleBoard.jsx
│   │
│   └── tea/                  # MODO TEA (NOVO)
│       ├── TeaApp.jsx
│       ├── screens/
│       │   ├── WelcomeScreen.jsx
│       │   ├── TransitionScreen.jsx  # Countdown 3s
│       │   ├── PhaseScreen.jsx       # Uma fase por vez
│       │   ├── GameScreen.jsx        # Mecânica sequencial
│       │   └── VictoryScreen.jsx     # Fade suave
│       ├── components/
│       │   ├── SequentialPuzzle.jsx
│       │   ├── SettingsPanel.jsx     # 7 configurações
│       │   └── ParentalDashboard.jsx
│       └── hooks/
│           ├── useTeaAnalytics.js    # Métricas terapêuticas
│           └── useSensoryConfig.js
│
├── App.jsx                   # Router de modos
└── main.jsx                  # Entry point
```

## 🎯 Implementação Passo a Passo

### FASE 1: Setup Base (FEITO ✓)

- [x] package.json com dependências
- [x] Configuração Supabase + schema SQL
- [x] Utilitários de criptografia E2E
- [x] Utilitários de processamento de imagens
- [x] Componente ModeSelector
- [x] App.jsx com roteamento

### FASE 2: Modo Neurotípico (PENDENTE)

**Tarefa:** Refatorar código original v7.2.0 em componentes modulares

1. Copiar `LS-Puzzle-main/src/App.jsx` para `modes/neurotypical/NeurotypicalApp.jsx`
2. Separar em componentes:
   - `screens/WelcomeScreen.jsx`
   - `screens/RegisterScreen.jsx`
   - `screens/UploadScreen.jsx`
   - `screens/LevelsScreen.jsx`
   - `screens/GameScreen.jsx`
   - `screens/VictoryScreen.jsx`
3. Extrair lógica compartilhada para `/shared/utils/`
4. Adicionar prop `onBack` para retornar ao ModeSelector

**Exemplo NeurotypicalApp.jsx:**

```jsx
import { useState } from 'react'
import WelcomeScreen from './screens/WelcomeScreen'
import GameScreen from './screens/GameScreen'
// ... importar outros screens

export default function NeurotypicalApp({ onBack }) {
  const [screen, setScreen] = useState('welcome')
  // ... resto do código original
  
  return (
    <div>
      {/* Botão voltar */}
      <button onClick={onBack} className="fixed top-4 left-4 z-50">
        ← Trocar Modo
      </button>
      
      {/* Screens existentes */}
      {screen === 'welcome' && <WelcomeScreen onNext={() => setScreen('register')} />}
      {/* ... */}
    </div>
  )
}
```

### FASE 3: Modo TEA - MVP (PENDENTE)

**Implementar os arquivos em `modes/tea/`:**

#### 3.1. TeaApp.jsx

```jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import WelcomeScreen from './screens/WelcomeScreen'
import TransitionScreen from './screens/TransitionScreen'
import PhaseScreen from './screens/PhaseScreen'
import GameScreen from './screens/GameScreen'
import VictoryScreen from './screens/VictoryScreen'
import SettingsPanel from './components/SettingsPanel'

export default function TeaApp({ onBack }) {
  const [screen, setScreen] = useState('welcome')
  const [currentLevel, setCurrentLevel] = useState(0)
  const [childProfile, setChildProfile] = useState(null)
  const [sensoryConfig, setSensoryConfig] = useState(null)

  // Load sensory config from Supabase
  useEffect(() => {
    if (childProfile) {
      loadSensoryConfig()
    }
  }, [childProfile])

  const loadSensoryConfig = async () => {
    const { data } = await supabase
      .from('sensory_configs')
      .select('*')
      .eq('child_id', childProfile.id)
      .single()
    
    setSensoryConfig(data)
  }

  return (
    <div>
      <button onClick={onBack} className="fixed top-4 left-4 z-50">
        ← Trocar Modo
      </button>

      {screen === 'welcome' && <WelcomeScreen onNext={() => setScreen('phase')} />}
      {screen === 'transition' && <TransitionScreen targetScreen="game" onComplete={() => setScreen('game')} />}
      {screen === 'phase' && <PhaseScreen onStart={() => setScreen('transition')} />}
      {screen === 'game' && <GameScreen level={currentLevel} config={sensoryConfig} onComplete={() => setScreen('victory')} />}
      {screen === 'victory' && <VictoryScreen onNext={() => setScreen('phase')} />}
    </div>
  )
}
```

#### 3.2. screens/TransitionScreen.jsx

```jsx
import { useState, useEffect } from 'react'
import { TRANSITION_DURATION_MS } from '../../../config/constants'

export default function TransitionScreen({ targetScreen, onComplete }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
      {/* Countdown Circle */}
      <div className="w-48 h-48 rounded-full border-8 border-orange-400 flex items-center justify-center mb-8">
        <span className="text-8xl font-bold text-orange-500">{countdown}</span>
      </div>

      {/* Next Screen Preview */}
      <div className="text-center">
        <p className="text-xl text-gray-700 mb-2">Em {countdown} segundos você vai para:</p>
        <p className="text-2xl font-bold text-orange-600">
          {targetScreen === 'game' ? 'Começar Jogo' : 'Próxima Tela'}
        </p>
      </div>
    </div>
  )
}
```

#### 3.3. screens/GameScreen.jsx (Mecânica Sequencial)

```jsx
import { useState, useEffect } from 'react'
import { calculateGrid, splitIntoPieces, loadImage } from '../../../shared/utils/imageProcessing'

export default function GameScreen({ level, config, images, onComplete }) {
  const [pieces, setPieces] = useState([])
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0)
  const [placedPieces, setPlacedPieces] = useState([])

  useEffect(() => {
    initializePuzzle()
  }, [level])

  const initializePuzzle = async () => {
    const img = await loadImage(images[level])
    const canvas = await imageToSquareCanvas(img)
    const { rows, cols } = calculateGrid(level.pieces, 1)
    const puzzlePieces = await splitIntoPieces(canvas, rows, cols)
    setPieces(puzzlePieces)
  }

  const handleSlotClick = (slotIndex) => {
    const currentPiece = pieces[currentPieceIndex]
    
    if (slotIndex === currentPiece.id) {
      // Correct placement
      setPlacedPieces([...placedPieces, currentPiece])
      
      if (config?.haptic_enabled && navigator.vibrate) {
        navigator.vibrate(50)
      }

      if (currentPieceIndex === pieces.length - 1) {
        // Puzzle complete
        setTimeout(onComplete, 1000)
      } else {
        setCurrentPieceIndex(currentPieceIndex + 1)
      }
    } else {
      // Incorrect - gentle feedback, no punishment
      if (config?.haptic_enabled && navigator.vibrate) {
        navigator.vibrate([30, 100, 30])
      }
    }
  }

  const currentPiece = pieces[currentPieceIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      {/* Progress */}
      <div className="text-center mb-4">
        <p className="text-lg font-bold">Peça {currentPieceIndex + 1} de {pieces.length}</p>
      </div>

      {/* Guide Image (faded) */}
      <div className="mb-4 opacity-30">
        <img src={images[level]} alt="Guide" className="w-full max-w-sm mx-auto rounded-lg" />
      </div>

      {/* Puzzle Board */}
      <div className="grid gap-2 max-w-sm mx-auto mb-8" style={{
        gridTemplateColumns: `repeat(${Math.sqrt(pieces.length)}, 1fr)`
      }}>
        {pieces.map((_, index) => {
          const isPlaced = placedPieces.find(p => p.id === index)
          const isActive = index === currentPiece?.id

          return (
            <div
              key={index}
              onClick={() => handleSlotClick(index)}
              className={`
                aspect-square rounded-lg border-4 cursor-pointer transition-all
                ${isPlaced ? 'bg-green-200 border-green-500' : 'bg-white border-gray-300'}
                ${isActive ? 'border-green-500 animate-pulse ring-4 ring-green-300' : ''}
              `}
            >
              {isPlaced && (
                <img src={isPlaced.image} alt="" className="w-full h-full object-cover rounded" />
              )}
            </div>
          )
        })}
      </div>

      {/* Current Piece */}
      <div className="text-center">
        <p className="text-lg font-bold mb-2">PEÇA ATUAL:</p>
        {currentPiece && (
          <div className="inline-block w-32 h-32 border-4 border-green-500 rounded-lg overflow-hidden shadow-xl">
            <img src={currentPiece.image} alt="Current" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 3.4. components/SettingsPanel.jsx

```jsx
import { useState } from 'react'
import { supabase } from '../../../config/supabase'

export default function SettingsPanel({ childId, config, onUpdate }) {
  const [localConfig, setLocalConfig] = useState(config)

  const handleToggle = async (key) => {
    const newConfig = { ...localConfig, [key]: !localConfig[key] }
    setLocalConfig(newConfig)

    // Save to Supabase
    await supabase
      .from('sensory_configs')
      .update(newConfig)
      .eq('child_id', childId)

    onUpdate(newConfig)
  }

  const handleVolumeChange = async (value) => {
    const newConfig = { ...localConfig, volume: value / 100 }
    setLocalConfig(newConfig)

    await supabase
      .from('sensory_configs')
      .update({ volume: value / 100 })
      .eq('child_id', childId)

    onUpdate(newConfig)
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Configurações Sensoriais</h2>

      {/* Music Toggle */}
      <div className="mb-6">
        <label className="flex items-center justify-between">
          <span className="font-semibold">Música de Fundo</span>
          <input
            type="checkbox"
            checked={localConfig.music_enabled}
            onChange={() => handleToggle('music_enabled')}
            className="w-12 h-6"
          />
        </label>
        <p className="text-sm text-gray-500 mt-1">Padrão: desligado</p>
      </div>

      {/* SFX Toggle */}
      <div className="mb-6">
        <label className="flex items-center justify-between">
          <span className="font-semibold">Efeitos Sonoros</span>
          <input
            type="checkbox"
            checked={localConfig.sfx_enabled}
            onChange={() => handleToggle('sfx_enabled')}
            className="w-12 h-6"
          />
        </label>
      </div>

      {/* Volume Slider */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Volume</label>
        <input
          type="range"
          min="0"
          max="100"
          value={localConfig.volume * 100}
          onChange={(e) => handleVolumeChange(e.target.value)}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">{Math.round(localConfig.volume * 100)}%</p>
      </div>

      {/* Haptic Toggle */}
      <div className="mb-6">
        <label className="flex items-center justify-between">
          <span className="font-semibold">Vibração Tátil</span>
          <input
            type="checkbox"
            checked={localConfig.haptic_enabled}
            onChange={() => handleToggle('haptic_enabled')}
            className="w-12 h-6"
          />
        </label>
      </div>

      {/* High Contrast */}
      <div className="mb-6">
        <label className="flex items-center justify-between">
          <span className="font-semibold">Alto Contraste</span>
          <input
            type="checkbox"
            checked={localConfig.high_contrast}
            onChange={() => handleToggle('high_contrast')}
            className="w-12 h-6"
          />
        </label>
      </div>

      {/* Reduced Motion */}
      <div className="mb-6">
        <label className="flex items-center justify-between">
          <span className="font-semibold">Animações Reduzidas</span>
          <input
            type="checkbox"
            checked={localConfig.reduced_motion}
            onChange={() => handleToggle('reduced_motion')}
            className="w-12 h-6"
          />
        </label>
      </div>

      {/* Auto Hints */}
      <div className="mb-6">
        <label className="flex items-center justify-between">
          <span className="font-semibold">Dicas Automáticas</span>
          <input
            type="checkbox"
            checked={localConfig.auto_hints}
            onChange={() => handleToggle('auto_hints')}
            className="w-12 h-6"
          />
        </label>
        <p className="text-sm text-gray-500 mt-1">Após 15 segundos de inatividade</p>
      </div>
    </div>
  )
}
```

## 📊 Banco de Dados Supabase

### Schema SQL

Executar no Supabase SQL Editor (já incluído em `src/config/supabase.js`):
- Tabelas: profiles, children, sensory_configs, sessions, analytics_events, encrypted_images, level_progress
- Row Level Security (RLS) habilitado
- Indexes para performance

### Queries Úteis

```sql
-- Ver todas as crianças de um pai
SELECT * FROM children WHERE parent_id = 'user-uuid';

-- Ver configurações sensoriais
SELECT * FROM sensory_configs WHERE child_id = 'child-uuid';

-- Analytics de uma sessão
SELECT * FROM analytics_events WHERE session_id = 'session-uuid' ORDER BY created_at;

-- Progresso por nível
SELECT * FROM level_progress WHERE child_id = 'child-uuid' AND mode = 'tea';
```

## 🔐 Segurança

### Criptografia E2E

Todas as fotos são criptografadas no cliente antes de upload:

```js
import { encryptImage, decryptImage } from './shared/utils/encryption'

// Encrypt before upload
const { encryptedData, iv } = encryptImage(imageBase64, parentalPIN, childId)

// Save to Supabase
await supabase.from('encrypted_images').insert({
  child_id: childId,
  encrypted_data: encryptedData,
  iv: iv
})

// Decrypt when needed
const decrypted = decryptImage(encryptedData, iv, parentalPIN, childId)
```

### Row Level Security (RLS)

Pais só acessam dados de seus próprios filhos:
- Policies automáticas por tabela
- `auth.uid()` sempre verifica ownership
- Zero chance de vazamento entre famílias

## 🚢 Deploy

### GitHub

```bash
git init
git add .
git commit -m "Initial commit - Dual architecture TEA/Neurotypical"
git branch -M main
git remote add origin https://github.com/versixsolutions/LS-Puzzle.git
git push -u origin main
```

### Vercel (Free Tier)

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push

## 📈 Próximos Passos

### Sprint 1 (Semanas 2-3)
- [ ] Implementar todos os screens do Modo TEA
- [ ] Mecânica sequencial completa
- [ ] SettingsPanel funcional com persistência

### Sprint 2 (Semanas 4-5)
- [ ] Dashboard parental com gráficos (recharts)
- [ ] Analytics terapêutico (Supabase)
- [ ] Exportação PDF de relatórios

### Sprint 3 (Semana 6)
- [ ] Fluxo de consentimento parental
- [ ] Moderação de imagens (API externa)
- [ ] Testes E2E (Cypress)

### Sprint 4 (Semanas 7-10)
- [ ] Beta testing com 30 crianças TEA
- [ ] Coleta de feedback
- [ ] Ajustes finais

## 📚 Recursos

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vite**: https://vitejs.dev

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verificar `.env` tem as credenciais corretas do Supabase
- Restartar servidor de desenvolvimento (`npm run dev`)

### Erro: "RLS policy violation"
- Verificar que usuário está autenticado
- Verificar policies no Supabase Dashboard

### Imagens não carregam
- Verificar CORS no Supabase Storage
- Verificar tamanho < 5MB

## 📞 Suporte

- Issues: GitHub Issues
- Docs: Este README
- Team: versix@solutions.com

---

**Versix Team Developers © 2026**
