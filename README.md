# GT Obras – GT Decorações

App de gestão de obras para vidros, espelhos, box e afins.

## Como subir no Vercel

### Opção 1 — Pelo site (mais fácil)

1. Acesse https://vercel.com e crie uma conta gratuita
2. Clique em **"Add New Project"**
3. Escolha **"Upload"** (não precisa de GitHub)
4. Faça upload desta pasta inteira (gt-obras)
5. Clique em **Deploy**
6. Pronto! Você receberá um link tipo: `gt-obras.vercel.app`

### Opção 2 — Via GitHub (recomendado para atualizações)

1. Crie conta no GitHub (github.com)
2. Crie um repositório chamado `gt-obras`
3. Faça upload dos arquivos
4. No Vercel, conecte ao repositório
5. A cada atualização no GitHub, o Vercel atualiza automaticamente

## Estrutura do projeto

```
gt-obras/
├── index.html          ← página principal
├── package.json        ← dependências
├── vite.config.js      ← configuração do bundler
├── vercel.json         ← configuração do deploy
├── public/
│   └── favicon.svg     ← ícone do app
└── src/
    ├── main.jsx        ← entrada React
    └── App.jsx         ← app completo GT Obras
```

## Rodar localmente (opcional)

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173
