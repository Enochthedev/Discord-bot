#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectName = process.argv[2];

if (!projectName) {
  console.error('❌ Please provide a project name.');
  console.log('Usage: npx discord-bot <project-name>');
  process.exit(1);
}

const projectDir = path.join(process.cwd(), projectName);

if (fs.existsSync(projectDir)) {
  console.error(`❌ Directory "${projectName}" already exists.`);
  process.exit(1);
}

console.log(`🚀 Creating ${projectName}...`);
fs.mkdirSync(projectDir, { recursive: true });

// Init project
execSync(`npm init -y`, { cwd: projectDir, stdio: 'inherit' });

// Dependencies
console.log('📦 Installing dependencies...');
execSync(`npm install discord.js dotenv prisma @prisma/client zod`, { cwd: projectDir, stdio: 'inherit' });
execSync(`npm install -D typescript tsx ts-node @types/node`, { cwd: projectDir, stdio: 'inherit' });

// tsconfig
fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), `{
  "compilerOptions": {
    "target": "ES2021",
    "module": "CommonJS",
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  },
  "include": ["src"]
}`);

// .env
fs.writeFileSync(path.join(projectDir, '.env'), `BOT_TOKEN=your-token-here
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
`);

// Folder structure
const folders = [
  'src/bot', 'src/commands', 'src/handler',
  'src/middlewares', 'src/services', 'src/utils',
  'src/prisma', 'src/config', 'src/types', 'prisma'
];
folders.forEach(f => fs.mkdirSync(path.join(projectDir, f), { recursive: true }));

// bot.ts
fs.writeFileSync(path.join(projectDir, 'src/bot/bot.ts'), `import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { setupInteractionHandler } from '../handler/interactionHandler';
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(\`🤖 Logged in as \${client.user?.tag}\`);
});

setupInteractionHandler(client);
client.login(process.env.BOT_TOKEN);
`);

// interactionHandler
fs.writeFileSync(path.join(projectDir, 'src/handler/interactionHandler.ts'), `import { Client, Events } from 'discord.js';
import * as pingCommand from '../commands/ping';

export function setupInteractionHandler(client: Client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
      await pingCommand.execute(interaction);
    }
  });
}
`);

// command: ping
fs.writeFileSync(path.join(projectDir, 'src/commands/ping.ts'), `import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply('🏓 Pong!');
}
`);

// prisma client
fs.writeFileSync(path.join(projectDir, 'src/prisma/client.ts'), `import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
`);

// schema.prisma
fs.writeFileSync(path.join(projectDir, 'prisma/schema.prisma'), `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`);

// logger util
fs.writeFileSync(path.join(projectDir, 'src/utils/logger.ts'), `export function log(msg: string) {
  console.log('[LOG]', msg);
}
`);

// turbo.json
fs.writeFileSync(path.join(projectDir, 'turbo.json'), `{
  "pipeline": {
    "dev": {
      "cache": false,
      "outputs": [],
      "dependsOn": []
    }
  }
}
`);

// package.json scripts
const pkgPath = path.join(projectDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.scripts = {
  dev: 'tsx src/bot/bot.ts'
};
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// README.md
fs.writeFileSync(path.join(projectDir, 'README.md'), `# Discord Bot Scaffold

A TypeScript-ready Discord bot with Prisma, commands, and Turbo dev flow.

## 🚀 Quickstart

\`\`\`bash
pnpm install
cp .env.example .env  # or fill in .env manually
turbo run dev
\`\`\`

## ✨ Features
- Slash command ready
- Prisma support
- Turbo-compatible
`);

console.log(`✅ Project "${projectName}" is ready.`);