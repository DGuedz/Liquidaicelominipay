# 🚀 Setup GitHub — LiquidAI

Guia rápido para publicar o projeto no GitHub e fazer o deploy.

---

## 1. Criar o Repositório no GitHub

Acesse: https://github.com/new

```
Repository name:  liquidai
Description:      Treasury Operating System for MiniPay Users · Celo Hackathon 2026
Visibility:       ✅ Public
Initialize:       ❌ NÃO marcar nada (já temos os arquivos)
```

Clique em **"Create repository"**.

---

## 2. Push Inicial (do seu terminal local)

```bash
# No diretório do projeto
git init
git add .
git commit -m "feat: initial LiquidAI MVP — Treasury OS for MiniPay · Celo Hackathon 2026"

git branch -M main
git remote add origin https://github.com/DGuedz/liquidai.git
git push -u origin main
```

---

## 3. Criar Branch develop

```bash
git checkout -b develop
git push -u origin develop
```

---

## 4. Configurar Secrets no GitHub

Acesse: `https://github.com/DGuedz/liquidai/settings/secrets/actions`

Adicione os seguintes secrets:

| Secret | Descrição |
|--------|-----------|
| `VERCEL_TOKEN` | Token da Vercel (vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | ID da org na Vercel (vercel.com/account) |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |
| `VITE_CELO_RPC_URL` | `https://forno.celo.org` |
| `VITE_WALLETCONNECT_PROJECT_ID` | Do cloud.walletconnect.com |
| `VITE_SELF_APP_ID` | Do ai.self.xyz |

---

## 5. Deploy na Vercel

### Opção A — Vercel Dashboard (mais fácil)
1. Acesse https://vercel.com/new
2. Importe o repo `DGuedz/liquidai`
3. Configure as variáveis de ambiente
4. Clique em **Deploy**

### Opção B — Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 6. Configurar GitHub Pages (alternativa gratuita)

Se preferir GitHub Pages:

```bash
# Instale gh-pages
pnpm add -D gh-pages

# Adicione no package.json:
# "deploy": "gh-pages -d dist"

pnpm build
pnpm deploy
```

Acesse: `https://DGuedz.github.io/liquidai`

---

## 7. Submeter ao Hackathon

URL do projeto para submissão:
```
https://liquidai.vercel.app
```

GitHub do projeto:
```
https://github.com/DGuedz/liquidai
```

---

## ✅ Checklist Final

- [ ] Repositório criado e código publicado
- [ ] README.md com demo link e screenshots
- [ ] Deploy funcionando (Vercel ou GitHub Pages)
- [ ] CI/CD passando (GitHub Actions)
- [ ] URL do deploy compartilhada no Discord do hackathon
- [ ] Vídeo demo de 2 minutos gravado e linkado no README
