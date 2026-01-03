# 🚀 Guia de Deployment - Quebra-Cabeça Mágico

## 📋 Pré-requisitos

- [x] Código fonte no GitHub
- [x] Conta no Vercel (gratuita)
- [x] Node.js 18+ instalado localmente (para testes)

## 🌐 Deploy no Vercel (Método Recomendado)

### Opção 1: Deploy via Interface Web (Mais Simples)

#### Passo 1: Preparar o Repositório GitHub

```bash
# Inicialize o repositório Git (se ainda não fez)
cd quebra-cabeca-magico
git init

# Adicione todos os arquivos
git add .

# Faça o commit inicial
git commit -m "🎉 Initial commit - Quebra-Cabeça Mágico"

# Conecte ao repositório oficial
git remote add origin https://github.com/versixsolutions/LS-Puzzle.git
git branch -M main
git push -u origin main
```

#### Passo 2: Deploy no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório `versixsolutions/LS-Puzzle`
5. Configure o projeto:
   - **Project Name**: `quebra-cabeca-magico` (ou personalizado)
   - **Framework Preset**: `Vite` (detectado automaticamente)
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: `npm run build` (já configurado)
   - **Output Directory**: `dist` (já configurado)
   - **Install Command**: `npm install` (já configurado)
6. Clique em **"Deploy"**

#### Passo 3: Aguardar Build

O Vercel irá:
- ✅ Instalar dependências (~30 segundos)
- ✅ Executar o build (~20 segundos)
- ✅ Fazer deploy (~10 segundos)
- ✅ Gerar URL de produção

**URL de Produção**: `https://quebra-cabeca-magico.vercel.app`

---

### Opção 2: Deploy via CLI (Para Desenvolvedores)

```bash
# Instale a CLI do Vercel globalmente
npm install -g vercel

# Entre na pasta do projeto
cd quebra-cabeca-magico

# Execute o deploy (primeira vez)
vercel

# Responda as perguntas:
# ? Set up and deploy? [Y/n] Y
# ? Which scope? [Seu usuário]
# ? Link to existing project? [N]
# ? What's your project's name? quebra-cabeca-magico
# ? In which directory is your code located? ./

# Deploy para produção
vercel --prod
```

---

## 🔧 Configurações Avançadas

### Domínio Customizado

1. Acesse o projeto no dashboard do Vercel
2. Vá em **Settings** → **Domains**
3. Adicione seu domínio customizado (ex: `quebracabeca.com.br`)
4. Configure os DNS conforme instruções

### Variáveis de Ambiente

Se precisar adicionar variáveis de ambiente:

1. Dashboard do Vercel → **Settings** → **Environment Variables**
2. Adicione as variáveis necessárias
3. Re-deploy para aplicar

### Analytics (Opcional)

```bash
# Adicione o pacote @vercel/analytics
npm install @vercel/analytics

# Em src/main.jsx, adicione:
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
)
```

---

## 🔄 CI/CD Automático

Após o deploy inicial, qualquer push para a branch `main` dispara:

1. **Preview Deploy**: Branches de feature geram URLs de preview
2. **Production Deploy**: Push em `main` atualiza produção
3. **Rollback Instantâneo**: Pode voltar para versões anteriores

### Workflow Recomendado

```bash
# Crie uma branch para nova feature
git checkout -b feature/nova-funcionalidade

# Faça suas alterações e commit
git add .
git commit -m "✨ Adiciona nova funcionalidade"

# Push para GitHub
git push origin feature/nova-funcionalidade

# Vercel gera URL de preview automaticamente
# Ex: quebra-cabeca-magico-git-feature-nova-funcionalidade.vercel.app

# Após aprovação, merge para main
git checkout main
git merge feature/nova-funcionalidade
git push origin main

# Deploy automático para produção! 🚀
```

---

## 📊 Monitoramento e Logs

### Acessar Logs de Build

1. Dashboard do Vercel → Seu Projeto
2. Clique em **"Deployments"**
3. Selecione o deployment específico
4. Veja **"Build Logs"** e **"Runtime Logs"**

### Métricas de Performance

- Dashboard → **Analytics** (se habilitado)
- Veja Core Web Vitals
- Monitore tempos de carregamento

---

## 🐛 Troubleshooting

### Build Falha com Erro de Módulo

**Problema**: `Cannot find module 'heic2any'`

**Solução**:
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "🔧 Fix dependencies"
git push
```

### Imagens não Carregam em Produção

**Problema**: Imagens funcionam localmente mas não em produção

**Solução**:
- Verifique se as imagens estão em `/public`
- Use caminhos absolutos: `/puzzle-icon.svg` em vez de `./puzzle-icon.svg`

### Erro 404 ao Recarregar Página

**Problema**: SPA retorna 404 em rotas diretas

**Solução**: O arquivo `vercel.json` já tem o rewrite configurado:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔒 Segurança

### Headers de Segurança (Já Configurados)

O arquivo `vercel.json` inclui:

- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`

### HTTPS

- ✅ Vercel provê HTTPS automático com certificado Let's Encrypt
- ✅ Renovação automática de certificados

---

## 📱 PWA (Progressive Web App) - Opcional

Para transformar em PWA instalável:

### 1. Crie `manifest.json` em `/public`

```json
{
  "name": "Quebra-Cabeça Mágico",
  "short_name": "Quebra-Cabeça",
  "description": "Jogo educativo de quebra-cabeça para crianças",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#87CEEB",
  "theme_color": "#87CEEB",
  "icons": [
    {
      "src": "/puzzle-icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

### 2. Adicione no `index.html`

```html
<link rel="manifest" href="/manifest.json">
```

### 3. Service Worker (Opcional)

Use Vite PWA Plugin:
```bash
npm install vite-plugin-pwa -D
```

---

## 📈 Otimização de Performance

### Lighthouse Score Target

- Performance: 95+
- Accessibility: 100
- Best Practices: 95+
- SEO: 90+

### Checklist de Otimização

- [x] Code splitting configurado
- [x] Minificação de JS/CSS
- [x] Compressão gzip/brotli (automático no Vercel)
- [x] Lazy loading de componentes
- [x] Cache headers otimizados
- [ ] Image optimization (considere usar Vercel Image Optimization)

---

## 🎯 Checklist Final de Deploy

Antes de considerar o deploy completo:

- [ ] ✅ Build local sem erros (`npm run build`)
- [ ] ✅ Preview funciona (`npm run preview`)
- [ ] ✅ Lint sem warnings (`npm run lint`)
- [ ] ✅ Código commitado no GitHub
- [ ] ✅ Deploy no Vercel concluído
- [ ] ✅ URL de produção acessível
- [ ] ✅ Teste em dispositivo mobile
- [ ] ✅ Teste upload de imagens HEIC
- [ ] ✅ Teste todos os níveis
- [ ] ✅ Teste modo tela cheia
- [ ] ✅ Teste sons (com permissão)

---

## 📞 Suporte

- **Documentação Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Status Vercel**: [vercel-status.com](https://www.vercel-status.com/)
- **Comunidade**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**🎉 Parabéns! Seu Quebra-Cabeça Mágico está no ar!**

Compartilhe a URL com o mundo: `https://quebra-cabeca-magico.vercel.app`
