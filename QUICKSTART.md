# ⚡ Quick Start - Quebra-Cabeça Mágico

## 🚀 Deploy em 3 Minutos

### Opção 1: GitHub + Vercel (Recomendado)

```bash
# 1. Clone o projeto (ou use o código que você já tem)
cd quebra-cabeca-magico

# 2. Inicialize o Git e faça commit
git init
git add .
git commit -m "🎉 Initial commit"

# 3. Crie um repositório no GitHub e faça push
git remote add origin https://github.com/SEU-USUARIO/quebra-cabeca-magico.git
git branch -M main
git push -u origin main

# 4. Acesse vercel.com/new
# 5. Importe o repositório GitHub
# 6. Clique em "Deploy"
# ✅ PRONTO! Seu jogo está no ar!
```

### Opção 2: Testar Localmente Primeiro

```bash
# 1. Entre na pasta do projeto
cd quebra-cabeca-magico

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Abra o navegador em http://localhost:3000
```

## 📦 Estrutura do Projeto

```
quebra-cabeca-magico/
├── src/
│   ├── App.jsx          ← 🧠 Toda a lógica do jogo
│   ├── App.css          ← 🎨 Todo o visual
│   └── main.jsx         ← ⚙️ Entry point
├── public/
│   └── puzzle-icon.svg  ← 🧩 Ícone do app
├── index.html           ← 📄 HTML base
├── package.json         ← 📦 Dependências
├── vite.config.js       ← ⚡ Configuração Vite
└── vercel.json          ← 🚀 Configuração Vercel
```

## 🎯 Funcionalidades Principais

| Feature | Descrição |
|---------|-----------|
| 📸 Upload | Suporta JPG, PNG, WEBP, AVIF, HEIC |
| 🎮 6 Níveis | De 8 a 30 peças (progressivo) |
| 🎨 UX Infantil | Cores suaves, sons agradáveis |
| 💡 Sistema de Dicas | Overlay transparente da imagem |
| 🎉 Confetes | Animação de celebração ao completar |
| 📱 Responsivo | Mobile-first design |
| ⛶ Tela Cheia | Modo imersivo sem distrações |

## 🔧 Comandos Úteis

```bash
npm run dev      # Servidor de desenvolvimento (porta 3000)
npm run build    # Build de produção
npm run preview  # Preview do build de produção
npm run lint     # Verificar código
```

## 🌐 Deploy no Vercel

### Método Rápido (CLI)

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Execute o deploy
vercel

# Para produção
vercel --prod
```

### URL Gerada

Você receberá uma URL como:
- Preview: `https://quebra-cabeca-magico-abc123.vercel.app`
- Produção: `https://quebra-cabeca-magico.vercel.app`

## 🎨 Personalização Rápida

### Mudar Cores

Edite `src/App.css`:

```css
:root {
  --color-primary: #87CEEB;    /* Azul celeste */
  --color-secondary: #FFB6C1;  /* Rosa pastel */
  --color-success: #98D8C8;    /* Verde suave */
  --color-warning: #FFD700;    /* Amarelo ouro */
}
```

### Ajustar Níveis

Edite `src/App.jsx`:

```javascript
const LEVELS = [
  { level: 1, pieces: 8, gridSize: 2 },  // Fácil
  { level: 2, pieces: 12, gridSize: 3 }, // Médio
  // ... adicione mais níveis aqui
]
```

### Mudar Limite de Imagens

Edite `src/App.jsx`:

```javascript
const MAX_IMAGES = 6  // Mude para 10, 12, etc.
```

## 📱 Testar em Dispositivos Móveis

### Rede Local

```bash
# Descubra seu IP local
# Windows: ipconfig
# Mac/Linux: ifconfig

# O Vite mostra o IP automaticamente ao rodar:
npm run dev

# Acesse do celular:
# http://SEU-IP:3000
```

## 🐛 Problemas Comuns

### HEIC não funciona

**Causa**: Navegador não suporta ou biblioteca não carregada

**Solução**: Já está implementado! A biblioteca `heic2any` converte automaticamente.

### Sons não tocam

**Causa**: Política de autoplay do navegador

**Solução**: Sons só tocam após interação do usuário (já implementado no código)

### Build falha

**Causa**: Dependências desatualizadas

**Solução**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 Performance

### Métricas Esperadas

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Lighthouse Score: 95+
- Bundle Size: ~165KB (gzipped)

### Build Otimizado

O projeto já vem com:
- ✅ Code splitting automático
- ✅ Tree shaking
- ✅ Minificação (Terser)
- ✅ Cache otimizado

## 🎯 Próximos Passos

Depois do deploy:

1. ✅ Teste em diferentes dispositivos
2. ✅ Compartilhe com crianças para feedback
3. ✅ Monitore erros no Vercel Dashboard
4. ✅ Considere adicionar PWA (manifest.json)
5. ✅ Adicione analytics (Vercel Analytics)

## 📚 Documentação Completa

- **README.md** - Documentação técnica completa
- **DEPLOYMENT.md** - Guia detalhado de deploy
- **CONTRIBUTING.md** - Como contribuir

## 💡 Dicas Pro

### Domínio Customizado

Após deploy, adicione um domínio:
1. Vercel Dashboard → Settings → Domains
2. Adicione `seudominio.com`
3. Configure DNS conforme instruções

### Monitoramento

- Vercel Dashboard → Analytics
- Veja Real User Metrics
- Monitore Core Web Vitals

### Git Workflow

```bash
# Feature branch
git checkout -b feature/nova-funcao
git commit -m "✨ feat: adiciona X"
git push origin feature/nova-funcao

# Vercel gera preview automático!
# Merge → Deploy produção automático!
```

## 🎉 Pronto!

Seu Quebra-Cabeça Mágico está pronto para uso!

**Próximo passo**: Compartilhe com o mundo! 🌍

---

**❓ Dúvidas?** Consulte README.md ou DEPLOYMENT.md

**🐛 Bugs?** Abra uma issue no GitHub

**💡 Ideias?** Contribuições são bem-vindas!
