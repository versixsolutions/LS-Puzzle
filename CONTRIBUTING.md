# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Quebra-Cabeça Mágico! Este documento fornece diretrizes para contribuições.

## 🎯 Como Contribuir

### Reportar Bugs

Encontrou um bug? Por favor, crie uma issue incluindo:

- **Descrição clara** do problema
- **Passos para reproduzir** o comportamento
- **Comportamento esperado** vs **comportamento atual**
- **Screenshots** (se aplicável)
- **Ambiente**: navegador, versão, dispositivo

### Sugerir Melhorias

Ideias para novas funcionalidades são bem-vindas! Crie uma issue descrevendo:

- **Motivação**: Por que esta feature é útil?
- **Proposta**: Como funcionaria?
- **Alternativas**: Outras abordagens consideradas?

## 🔧 Processo de Desenvolvimento

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU-USUARIO/LS-Puzzle.git
cd LS-Puzzle

# Adicione o upstream
git remote add upstream https://github.com/versixsolutions/LS-Puzzle.git
```

### 2. Crie uma Branch

```bash
# Atualize main
git checkout main
git pull upstream main

# Crie uma branch descritiva
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/correcao-do-bug
```

### 3. Desenvolva

```bash
# Instale dependências
npm install

# Inicie o dev server
npm run dev

# Faça suas alterações
# ...

# Execute lint
npm run lint
```

### 4. Commit

Siga o padrão de commits semânticos:

```bash
# Tipos de commit:
# ✨ feat: Nova funcionalidade
# 🐛 fix: Correção de bug
# 📝 docs: Documentação
# 💄 style: Formatação, CSS
# ♻️ refactor: Refatoração
# ⚡ perf: Performance
# ✅ test: Testes
# 🔧 chore: Manutenção

git add .
git commit -m "✨ feat: adiciona nivel bonus"
```

### 5. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Abra um Pull Request no GitHub
# Descreva suas alterações claramente
```

## 📋 Checklist do Pull Request

Antes de submeter, verifique:

- [ ] ✅ Código segue os padrões do ESLint
- [ ] ✅ Build passa sem erros (`npm run build`)
- [ ] ✅ Funcionalidade testada em múltiplos navegadores
- [ ] ✅ Testado em dispositivos móveis
- [ ] ✅ Documentação atualizada (se necessário)
- [ ] ✅ Commits semânticos e descritivos
- [ ] ✅ Não quebra funcionalidades existentes

## 🎨 Padrões de Código

### JavaScript/React

```javascript
// ✅ BOM
const handleClick = useCallback(() => {
  setCount(prev => prev + 1)
}, [])

// ❌ EVITE
function handleClick() {
  setCount(count + 1)
}
```

### CSS

```css
/* ✅ BOM - Use variáveis CSS */
.button {
  background: var(--color-primary);
  border-radius: var(--border-radius);
}

/* ❌ EVITE - Valores hardcoded */
.button {
  background: #87CEEB;
  border-radius: 20px;
}
```

### Nomenclatura

- **Componentes**: PascalCase (`PuzzleGrid`)
- **Funções**: camelCase (`handlePieceClick`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_IMAGES`)
- **CSS Classes**: kebab-case (`puzzle-piece`)

## 🧪 Testes

Atualmente o projeto não tem testes automatizados, mas contribuições nesta área são muito bem-vindas!

Sugestões:
- Vitest para testes unitários
- React Testing Library para testes de componentes
- Playwright para testes E2E

## 📖 Documentação

Ao adicionar features:

1. **Atualize o README.md** se necessário
2. **Adicione comentários** em lógica complexa
3. **Documente props** de novos componentes

## 🚀 Ideias para Contribuições

### Funcionalidades Fáceis
- [ ] Adicionar mais temas de cores
- [ ] Timer opcional para desafios
- [ ] Histórico de puzzles completados
- [ ] Compartilhamento de conquistas

### Funcionalidades Médias
- [ ] Modo multiplayer local
- [ ] Sistema de conquistas/badges
- [ ] Galeria de imagens predefinidas
- [ ] Filtros de imagem (preto e branco, sepia)

### Funcionalidades Avançadas
- [ ] PWA com offline support
- [ ] Testes automatizados completos
- [ ] I18n (internacionalização)
- [ ] Backend para salvar progresso

## ❓ Dúvidas?

Abra uma [issue de discussão](https://github.com/REPO/quebra-cabeca-magico/issues/new) ou entre em contato com os mantenedores.

## 📜 Código de Conduta

Seja respeitoso, construtivo e empático. Estamos construindo algo para crianças - vamos manter um ambiente positivo!

---

**Obrigado por contribuir! 🎉**
