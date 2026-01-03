# Geração de Ícones PWA

Para gerar os ícones PNG necessários para o PWA, você tem duas opções:

## Opção 1: Online (Mais Fácil)
1. Acesse: https://realfavicongenerator.net/
2. Faça upload do arquivo `puzzle-icon.svg`
3. Baixe os ícones gerados
4. Renomeie para `icon-192.png` e `icon-512.png`
5. Coloque na pasta `/public`

## Opção 2: Local (ImageMagick ou Inkscape)

Se você tem ImageMagick instalado:
```bash
convert -background none -resize 192x192 puzzle-icon.svg icon-192.png
convert -background none -resize 512x512 puzzle-icon.svg icon-512.png
```

Se você tem Inkscape instalado:
```bash
inkscape puzzle-icon.svg -w 192 -h 192 -o icon-192.png
inkscape puzzle-icon.svg -w 512 -h 512 -o icon-512.png
```

## Nota
Os ícones são necessários apenas para a funcionalidade PWA (instalação no celular).
O jogo funcionará normalmente mesmo sem eles!
