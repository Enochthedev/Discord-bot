import { Client, Events } from 'discord.js';
import * as pingCommand from '../commands/ping';

export function setupInteractionHandler(client: Client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
      await pingCommand.execute(interaction);
    }
  });
}
