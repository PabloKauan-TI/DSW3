# 📌 Projeto Laravel + Vue

Este projeto possui:
- 📦 **Back-end**: Laravel (pasta `API`)
- 🎨 **Front-end**: Vue 3 + Vite (pasta `Front-End`)

---

## ✅ **Pré-requisitos**

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/)
- [PHP](https://www.php.net/) (>= 8.0)
- [Composer](https://getcomposer.org/)

---

## ⚙️ **Passo a passo para rodar**

---

## 1️⃣ Clone o projeto (se ainda não clonou)

```bash
git clone <repo-url>
cd <nome-do-projeto>

# Vá para a pasta da API
cd API

# Instale as dependências PHP
composer install

# Copie o .env
cp .env.example .env

# Gere a chave da aplicação
php artisan key:generate

# Execute as migrations (se necessário)
php artisan migrate

# Suba o servidor Laravel
php artisan serve --host=0.0.0.0 --port=8000

# Vá para a pasta do Front-End
cd Front-End

# Instale as dependências Node
npm install

# Suba o Vite
npm run dev -- --host
