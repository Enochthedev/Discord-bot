# Create-discord-ts-bot

[![npm version](https://img.shields.io/npm/v/create-discord-ts-bot.svg)](https://www.npmjs.com/package/create-discord-ts-bot)
[![Made by Wave](https://img.shields.io/badge/made%20by-wave-8a2be2)](https://wavedidwhat.xyz)
[![CLI Build](https://github.com/enochthedev/create-discord-ts-bot/actions/workflows/cli-check.yml/badge.svg)](https://github.com/enochthedev/create-discord-ts-bot/actions)

A next-gen CLI to scaffold a **full-featured TypeScript Discord bot** — ready for production, hackathons, or side projects.

---

## ✨ Features

- ⚙️ **discord.js** (v14+) with ESM and first-class slash command support
- 🧩 **Modular, domain-driven structure** (commands, handlers, middleware, utils)
- 📦 **Path aliases** for pro dev experience
- 🎨 **Chalk-powered, beautiful CLI logs** out of the box
- 🧱 Optional **Prisma + PostgreSQL** support
- 🧑‍💻 **Turbo**-compatible workflow
- 🚀 Works with `pnpm`, `yarn`, or `npm`
- 🪄 Zero config for new projects — just `npx` and go!

---

## 🚦 Quick Start

```bash
npx create-discord-ts-bot my-super-bot
cd my-super-bot
pnpm install  # or npm install or yarn

# (Optional) Set up your DB
pnpm prisma db pull         # Connect to an existing DB
# or
pnpm prisma migrate dev --name init

# Start your bot!
pnpm run dev
```

## 🏗️ Project Structure

This CLI generates a **modular, domain-driven structure** for your bot. Here’s a quick overview:

```plaintext
my-bot/
├── src/
│   ├── bot/              # Bot client, startup, deploy logic
│   ├── config/           # ENV/config loader
│   ├── domains/
│   │    ├── core/
│   │    │    └── commands/
│   │    ├── mods/
│   │    │    └── commands/
│   │    └── fun/
│   │         └── commands/
│   ├── handlers/         # Slash/modal/button handler logic
│   ├── interactions/     # Registry & shared types
│   ├── middlewares/      # Middleware flows
│   ├── utils/            # Logging, paths, helpers
│   └── prisma/           # Prisma client (if enabled)
├── prisma/schema.prisma  # (if enabled)
├── .env
├── turbo.json
├── tsconfig.json
└── package.json
```

## 🏁 Flags

 • --with-prisma   → Adds Prisma + Postgres support
 • --with-mongo    → Adds MongoDB client
 • --minimal       → Skip middleware, services, or handler scaffolding

## 🧑‍💻 Author

[![Made by Wave](https://img.shields.io/badge/made%20by-wave-8a2be2)](https://wavedidwhat.xyz)
![GitHub followers](https://img.shields.io/github/followers/Enochthedev?style=social)
![GitHub User's stars](https://img.shields.io/github/stars/Enochthedev?style=social)
Made with ⚡ by Enoch Omosebi
   • Twitter/X: [X](https://x.com/wavedidwhat)
   • GitHub: [Enochthedev](https://github.com/Enochthedev)
   • Portfolio: [wave](https://wavedidwhat.xyz)
   • Discord: [wave](https://discord.gg/._.wave)

## ✅ Maintainer Checklist (for version bumps)

 • Update version in package.json
 • Confirm .npmignore excludes generated projects
 • Run npm run build
 • Run npm publish --access public

Questions, issues, or feature requests? Open an issue or ping wave on [X](https://x.com/wavedidwhat)!
