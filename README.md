# Create-discord-ts-bot

[![npm version](https://img.shields.io/npm/v/create-discord-ts-bot.svg)](https://www.npmjs.com/package/create-discord-ts-bot)
[![Made by Wave](https://img.shields.io/badge/made%20by-wave-8a2be2)](https://wavedidwhat.xyz)
[![CLI Build](https://github.com/enochthedev/create-discord-ts-bot/actions/workflows/cli-check.yml/badge.svg)](https://github.com/enochthedev/create-discord-ts-bot/actions)

A CLI tool to scaffold a full-featured TypeScript Discord bot with:

- ⚙️ `discord.js` + ready-to-run slash command support  
- 🧠 Clean architecture (commands, handlers, services, middleware)  
- 🧱 Prisma + PostgreSQL setup  
- 🚀 Turbo-compatible dev workflow  
- 📦 Built for production but beginner friendly

---

## 🔧 Usage

```bash
npx create-discord-ts-bot my-bot
cd my-bot
pnpm install

# Pull schema from an existing DB OR run your first migration
pnpm prisma db pull
# or
pnpm prisma migrate dev --name init

# Run your bot
pnpm turbo run dev
```

If you don’t have Turbo globally:

``` bash
pnpm add -g turbo
```

## 📁 What You Get

```plaintext
my-bot/
├── src/
│   ├── bot/             # Bot client + startup
│   ├── commands/        # Slash commands
│   ├── handler/         # Interaction dispatcher
│   ├── services/        # Core logic (e.g. tickets)
│   ├── middlewares/     # Role checks, validations
│   ├── utils/           # Logging, helpers
│   ├── prisma/          # Prisma client
│   ├── config/          # ENV loader
│   └── types/           # Shared types
├── prisma/schema.prisma
├── .env
├── turbo.json
└── tsconfig.json
```

## 📤 Publish This CLI Yourself

```bash
npm login
npm run build
npm publish --access public
```

## 🚀 Final Steps Checklist Before `npm publish`

✅ JS file uses `#!/usr/bin/env node`  
✅ You’ve tested with:

```bash
npm link
npx create-discord-ts-bot my-bot
```

## 🧑‍💻 Author

[![Made by Wave](https://img.shields.io/badge/made%20by-wave-8a2be2)](https://wavedidwhat.xyz)
![GitHub followers](https://img.shields.io/github/followers/Enochthedev?style=social)
![GitHub User's stars](https://img.shields.io/github/stars/Enochthedev?style=social)
Made with ⚡ by Enoch Omosebi
   • Twitter/X: [X](https://x.com/wavedidwhat)
   • GitHub: [itsdwave](https://github.com/Enochthedev)
   • Portfolio: [wave](https://wavedidwhat.xyz)
   • Discord: [wave](https://discord.gg/._.wave)

## ✅ Maintainer Checklist (for version bumps)

 • Update version in package.json
 • Confirm .npmignore excludes generated projects
 • Run npm run build
 • Run npm publish --access public
