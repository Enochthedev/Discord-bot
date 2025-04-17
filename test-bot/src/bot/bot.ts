import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { setupInteractionHandler } from '../handler/interactionHandler';
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user?.tag}`);
});

setupInteractionHandler(client);
client.login(process.env.BOT_TOKEN);
