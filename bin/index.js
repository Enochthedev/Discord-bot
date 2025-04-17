#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const projectName = args._[0];

if (!projectName) {
  console.error('❌ Please provide a project name.');
  console.log('Usage: npx create-discord-ts-bot <project-name> [--with-prisma] [--with-mongo] [--minimal]');
  process.exit(1);
}

const withPrisma = args['with-prisma'] ?? false;
const withMongo = args['with-mongo'] ?? false;
const minimal = args['minimal'] ?? false;

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
execSync(`npm install discord.js dotenv zod`, { cwd: projectDir, stdio: 'inherit' });
execSync(`npm install -D typescript tsx ts-node @types/node`, { cwd: projectDir, stdio: 'inherit' });

if (withPrisma) {
  execSync(`npm install prisma @prisma/client`, { cwd: projectDir, stdio: 'inherit' });
}
if (withMongo) {
  execSync(`npm install mongodb`, { cwd: projectDir, stdio: 'inherit' });
}

// ---------- Shared Setup ----------

function write(filePath, content) {
  fs.writeFileSync(path.join(projectDir, filePath), content);
}

function createFolders(folders) {
  folders.forEach(f => fs.mkdirSync(path.join(projectDir, f), { recursive: true }));
}

// tsconfig
write('tsconfig.json', `{
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
write('.env', `BOT_TOKEN=your-token-here
${withPrisma ? 'DATABASE_URL=postgresql://user:pass@localhost:5432/dbname\n' : ''}
${withMongo ? 'MONGO_URI=mongodb://localhost:27017/mydb\n' : ''}
`);

// turbo.json
write('turbo.json', `{
  "pipeline": {
    "dev": {
      "cache": false,
      "outputs": [],
      "dependsOn": []
    }
  }
}`);

// ---------- Minimal or Full ----------

createFolders(['src/bot', 'src/commands']);

write('src/bot/bot.ts', `import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(\`🤖 Logged in as \${client.user?.tag}\`);
});

client.login(process.env.BOT_TOKEN);
`);

write('src/commands/ping.ts', `import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply('🏓 Pong!');
}
`);

if (!minimal) {
  createFolders([
    'src/handler',
    'src/middlewares',
    'src/services',
    'src/utils',
    'src/config',
    'src/types',
  ]);

  write('src/handler/interactionHandler.ts', `import { Client, Events } from 'discord.js';
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

  write('src/utils/logger.ts', `export function log(msg: string) {
  console.log('[LOG]', msg);
}`);
}

// ---------- Prisma Support ----------
if (withPrisma) {
  createFolders(['prisma', 'src/prisma']);
  write('prisma/schema.prisma', `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}`);
  write('src/prisma/client.ts', `import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();`);
}

// ---------- MongoDB Support ----------
if (withMongo) {
  createFolders(['src/mongodb']);
  write('src/mongodb/mongoClient.ts', `import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI!;
export const mongo = new MongoClient(uri);`);
}

// ---------- Package JSON Setup ----------
const pkgPath = path.join(projectDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.scripts = {
  dev: 'tsx src/bot/bot.ts'
};
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// ---------- README ----------
write('README.md', `# Discord Bot Scaffold

A CLI-generated Discord bot in TypeScript.

## Quickstart

\`\`\`bash
pnpm install
pnpm turbo run dev
\`\`\`

## Flags
- \`--minimal\`: Create a minimal bot (no services, middleware, or handler)
- \`--with-prisma\`: Add Prisma support (PostgreSQL)
- \`--with-mongo\`: Add MongoDB support

Made with ⚡ by [@wavedidwhat](https://x.com/wavedidwhat)
`);

console.log(`✅ Project "${projectName}" is ready.`);