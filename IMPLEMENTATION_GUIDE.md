# 🚀 Guia de Implementação Rápida

## Status do Projeto

### ✅ COMPLETO (Pronto para uso)
- [x] Arquitetura base modular
- [x] Configuração Supabase + schema SQL completo
- [x] Utilitários de criptografia E2E (crypto-js)
- [x] Utilitários de processamento de imagens (Canvas API)
- [x] Componente ModeSelector (tela inicial funcional)
- [x] Roteamento App.jsx
- [x] Configurações Vite, Tailwind, PostCSS
- [x] package.json com todas as dependências
- [x] .gitignore, .env.example

### 🟡 PENDENTE (Implementar)
- [ ] Modo Neurotípico (copiar código original)
- [ ] Modo TEA (seguir exemplos do README)

## Próximos Passos (Em Ordem)

### 1. Setup Inicial (15 minutos)

```bash
cd LS-Puzzle-Refactored
npm install
```

Criar `.env` na raiz:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

Configurar Supabase:
1. Criar conta em supabase.com
2. Criar novo projeto
3. Copiar SQL de `src/config/supabase.js`
4. Executar no SQL Editor do Supabase
5. Copiar credenciais para `.env`

### 2. Testar Arquitetura Base (5 minutos)

```bash
npm run dev
```

Deve abrir navegador em `localhost:3000` com:
- Tela de seleção de modos funcionando ✓
- Botão "Modo Clássico" leva a placeholder
- Botão "Modo Focado" leva a placeholder
- Botão "Qual modo escolher?" mostra info

### 3. Implementar Modo Neurotípico (2 horas)

**Arquivo:** `src/modes/neurotypical/NeurotypicalApp.jsx`

Copiar código original:
```bash
# Do projeto original LS-Puzzle-main
cp LS-Puzzle-main/src/App.jsx src/modes/neurotypical/NeurotypicalApp.jsx
```

Modificar:
1. Adicionar prop `{ onBack }` ao componente
2. Adicionar botão "← Trocar Modo" que chama `onBack()`
3. Substituir imports de utilitários para usar `/shared/utils/`

**Exemplo:**
```jsx
// Antes
const calculateGrid = (pieceCount, aspectRatio) => { ... }

// Depois
import { calculateGrid } from '../../shared/utils/imageProcessing'
```

### 4. Implementar Modo TEA - Básico (4 horas)

**Arquivos a criar em `src/modes/tea/screens/`:**

#### TransitionScreen.jsx
Ver código completo no README seção 3.2

#### GameScreen.jsx (versão mínima)
```jsx
import { useState } from 'react'

export default function GameScreen({ onComplete }) {
  const [currentPiece, setCurrentPiece] = useState(0)
  const totalPieces = 9 // 3x3 para teste

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <h2>Modo TEA - Peça {currentPiece + 1} de {totalPieces}</h2>
      
      {/* TODO: Implementar grid sequencial */}
      <button onClick={() => {
        if (currentPiece < totalPieces - 1) {
          setCurrentPiece(currentPiece + 1)
        } else {
          onComplete()
        }
      }}>
        Próxima Peça
      </button>
    </div>
  )
}
```

### 5. Integrar Supabase (2 horas)

**Exemplo de uso:**
```jsx
import { supabase } from '../../config/supabase'

// Criar perfil de criança
const { data, error } = await supabase
  .from('children')
  .insert({
    parent_id: user.id,
    name: 'Lucas',
    mode_preference: 'tea'
  })

// Salvar configuração sensorial
await supabase
  .from('sensory_configs')
  .insert({
    child_id: childId,
    music_enabled: false,
    sfx_enabled: true,
    volume: 0.3
  })

// Analytics de jogo
await supabase
  .from('analytics_events')
  .insert({
    session_id: sessionId,
    event_type: 'piece_placed',
    time_ms: 2500,
    accuracy_first_try: true
  })
```

## Recursos Essenciais

### Código Completo no README

Procure no `README.md` por:
- `#### 3.1. TeaApp.jsx` → App principal do modo TEA
- `#### 3.2. screens/TransitionScreen.jsx` → Countdown 3s
- `#### 3.3. screens/GameScreen.jsx` → Mecânica sequencial
- `#### 3.4. components/SettingsPanel.jsx` → Painel de config

### Utilitários Disponíveis

```jsx
// Criptografia
import { encryptImage, decryptImage } from './shared/utils/encryption'

// Processamento de imagens
import {
  calculateGrid,
  splitIntoPieces,
  shufflePieces,
  loadImage,
  createFallbackImage
} from './shared/utils/imageProcessing'
```

### Supabase Queries

```sql
-- Ver crianças
SELECT * FROM children WHERE parent_id = auth.uid();

-- Analytics de sessão
SELECT 
  event_type,
  COUNT(*) as count,
  AVG(time_ms) as avg_time
FROM analytics_events
WHERE session_id = 'uuid'
GROUP BY event_type;
```

## Troubleshooting

### "Module not found: crypto-js"
```bash
npm install crypto-js
```

### "Supabase error: Invalid API key"
Verificar `.env` tem credenciais corretas do Supabase

### "React is not defined"
Adicionar `import React from 'react'` no início do arquivo

### Build falha
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Deploy Rápido

```bash
# Vercel
npm i -g vercel
vercel --prod

# Ou conectar GitHub repo no dashboard Vercel
```

## Checklist de Qualidade

Antes de considerar completo:

### Modo Neurotípico
- [ ] Todas as 6 telas funcionando
- [ ] Upload de imagens OK
- [ ] Jogo completo (drag & drop)
- [ ] Confetes na vitória
- [ ] Progressão salva em localStorage

### Modo TEA
- [ ] Transição com countdown 3s
- [ ] Mecânica sequencial (uma peça por vez)
- [ ] Configurações sensoriais persistem no Supabase
- [ ] Dashboard parental mostra dados reais
- [ ] Analytics capturando eventos

### Geral
- [ ] Seleção de modo funciona
- [ ] Botão "voltar" em ambos os modos
- [ ] Sem erros no console
- [ ] Responsivo (mobile + desktop)
- [ ] Performance >90 no Lighthouse

---

**Estimativa total:** 8-12 horas de desenvolvimento
**Prioridade:** Modo Neurotípico primeiro (usar código existente)
