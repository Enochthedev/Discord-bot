// lib/templates.js

export const tsconfig = () => `
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@utils/*": ["src/utils/*"],
      "@bot/*": ["src/bot/*"],
      "@config/*": ["src/config/*"],
      "@domains/*": ["src/domains/*"],
      "@handlers/*": ["src/handlers/*"],
      "@interactions/*": ["src/interactions/*"],
      "@middlewares/*": ["src/middlewares/*"]
    }
  },
  "include": ["src"]
}
`;

export const env = ({ withPrisma, withMongo }) => `
BOT_TOKEN=your-token-here
CLIENT_ID=your-client-id
GUILD_ID=your-guild-id
GLOBAL_COMMANDS=false
WEBHOOK_PORT=5001
${withPrisma ? 'DATABASE_URL=postgresql://user:pass@localhost:5432/dbname\n' : ''}
${withMongo ? 'MONGO_URI=mongodb://localhost:27017/mydb\n' : ''}
`;

export const turbo = () => `
{
  "pipeline": {
    "dev": {
      "cache": false,
      "outputs": [],
      "dependsOn": []
    }
  }
}
`;

export const config = () => `
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN!,
  clientId: process.env.CLIENT_ID!,
  guildId: process.env.GUILD_ID,
  useGlobalCommands: process.env.GLOBAL_COMMANDS === 'true',
  webhookPort: parseInt(process.env.WEBHOOK_PORT ?? '5001', 10),
  version: '0.0.1'
};
`;

export const pathsUtil = () => `
import { fileURLToPath } from 'url';
import path from 'path';

export function getDirname(metaUrl: string) {
  return path.dirname(fileURLToPath(metaUrl));
}
`;

export const shared = () => `
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export interface SlashCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  meta?: {
    requiredRole?: string;
    [key: string]: any;
  };
}
`;

export const commandsRegistry = (domains) => `
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { getDirname } from '@utils/paths';
import type { SlashCommand } from '@interactions/shared';
import chalk from 'chalk';

const DOMAINS: string[] = ${JSON.stringify(domains)};

export async function loadCommands(): Promise<SlashCommand[]> {
  const commands: SlashCommand[] = [];
  console.log(chalk.cyanBright('🗂️  Loading slash commands from domains: ' + DOMAINS.join(', ')));
  for (const domain of DOMAINS) {
    const commandsDir = path.resolve(process.cwd(), 'src/domains', domain, 'commands');
    if (!fs.existsSync(commandsDir)) continue;
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    for (const file of files) {
      try {
        const fullPath = path.join(commandsDir, file);
        const mod = await import(pathToFileURL(fullPath).href);
        if (!mod.data || !mod.execute) {
          console.warn(chalk.yellow(\`⚠️  Skipping invalid command: \${domain}/\${file}\`));
          continue;
        }
        commands.push({
          data: mod.data,
          execute: mod.execute,
          meta: mod.meta || {}
        });
        console.log(chalk.green(\`  ✔ Loaded command: \${domain}/\${file}\`));
      } catch (err) {
        console.error(chalk.red(\`❌ Error loading command \${domain}/\${file}: \${err instanceof Error ? err.message : err}\`));
      }
    }
  }
  console.log(chalk.cyanBright(\`✨ Loaded \${commands.length} command(s) from \${DOMAINS.length} domain(s).\`));
  return commands;
}
`;

export const commandsHandler = () => `
import { Client, Events, ChatInputCommandInteraction, Interaction } from 'discord.js';
import { loadCommands } from '@interactions/registry/commands';
import type { SlashCommand } from '@interactions/shared';
import chalk from 'chalk';

export async function registerCommandHandler(client: Client) {
  const commands = await loadCommands();
  const commandMap: Record<string, SlashCommand> = {};
  for (const cmd of commands) {
    commandMap[cmd.data.name] = cmd;
  }

  console.log(chalk.cyan('💡 Slash command handler initialized. Ready for interactions.'));

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commandMap[interaction.commandName];
    if (!command) {
      console.warn(
        chalk.yellow(\`⚠️  Unknown command: /\${chalk.bold(interaction.commandName)}\`)
      );
      await interaction.reply({ content: 'Command not found.', ephemeral: true });
      return;
    }
    console.log(
      chalk.green(
        \`📥 /\${chalk.bold(interaction.commandName)} triggered by \${chalk.magentaBright(interaction.user.tag)} (\${interaction.user.id})\`
      )
    );
    try {
      await command.execute(interaction as ChatInputCommandInteraction);
      console.log(
        chalk.green(
          \`✅ Successfully executed /\${interaction.commandName} for \${chalk.magentaBright(interaction.user.tag)}\`
        )
      );
    } catch (error) {
      console.error(
        chalk.red(
          \`❌ Error in /\${interaction.commandName}: \${error instanceof Error ? error.message : String(error)}\`
        )
      );
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: '❌ Something went wrong.' });
      } else {
        await interaction.reply({ content: '❌ Something went wrong.', ephemeral: true });
      }
    }
  });
}
`;

export const client = () => `
import { Client, GatewayIntentBits } from 'discord.js';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});
`;

export const deploy = () => `
import { REST, Routes } from 'discord.js';
import { loadCommands } from '@interactions/registry/commands';
import { config } from '@config/index';
import chalk from 'chalk';

export async function deployCommands() {
  const commands = await loadCommands();
  const rest = new REST({ version: '10' }).setToken(config.botToken);

  try {
    const body = commands.map((c) => c.data.toJSON());
    const scope = config.useGlobalCommands ? chalk.magentaBright('global') : chalk.cyanBright(\`guild (\${config.guildId})\`);
    console.log(\`🌍 Using \${scope} commands...\`);
    if (body.length === 0) {
      console.log(chalk.yellowBright('⚠️  No commands to deploy! Did you add any commands?'));
      return;
    }
    console.log(chalk.blue('📜 Commands to be deployed:'), chalk.bold(body.map(cmd => cmd.name).join(', ')));

    if (!config.useGlobalCommands && !config.guildId) {
      throw new Error('GUILD_ID must be set in .env or config to deploy guild commands');
    }

    await (config.useGlobalCommands
      ? rest.put(Routes.applicationCommands(config.clientId), { body })
      : rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId!), { body })
    );
    console.log(chalk.greenBright('✅ Commands deployed successfully!'));
  } catch (err) {
    console.error(chalk.red('❌ Failed to deploy commands:'), err instanceof Error ? err.message : err);
  }
}
`;


export const bot = () => `
import { client } from '@bot/client';
import { config } from '@config/index';
import { registerCommandHandler } from '@handlers/commands';
import { deployCommands } from '@bot/deploy';
import chalk from 'chalk';

console.log(chalk.cyanBright('🚀 Starting Discord bot...'));

client.once('ready', async () => {
  console.log(chalk.blueBright('🔄 Initializing handlers and deploying commands...'));

  await registerCommandHandler(client);
  await deployCommands();

  console.log(
    chalk.greenBright(
      '\\n🤖 Logged in as ' + chalk.bold(client.user?.tag ?? 'Unknown') + '\\n' +
      '💻 Client ID: ' + chalk.bold(client.user?.id ?? 'Unknown') + '\\n' +
      '🌐 Version: ' + chalk.bold(config.version) + '\\n'
    )
  );
});

client.login(config.botToken);

console.log(chalk.cyan('🤖 Bot is running...'));
`;

export const pingCommand = () => `
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply('🏓 Pong!');
}
`;

export const prismaSchema = () => `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`;

export const prismaClient = () => `
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
`;

export const mongoClient = () => `
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI!;
export const mongo = new MongoClient(uri);
`;

export const readme = () => `
# Discord Bot Scaffold

A CLI-generated Discord bot in TypeScript with domain-based modular structure.

## Quickstart

\`\`\`bash
pnpm install
pnpm run dev
\`\`\`

## Add a new command
Add a file to \`src/domains/{domain}/commands/\`, then run:

\`\`\`bash
pnpm run deploy
\`\`\`

## Flags
- \`--minimal\`: Minimal bot (no services, middleware, or handler)
- \`--with-prisma\`: Add Prisma support (PostgreSQL)
- \`--with-mongo\`: Add MongoDB support

Made with ⚡ by [@wavedidwhat](https://x.com/wavedidwhat)
`;