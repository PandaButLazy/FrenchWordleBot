import { Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';

import * as wordle from './commands/wordle.js';
import { config } from './config.js';

const commands = new Map([[wordle.data.name, wordle]]);

// Les slash commands n'ont besoin d'aucun intent privilégié
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (readyClient) => {
  const body = [...commands.values()].map((command) => command.data.toJSON());

  if (config.guildId) {
    await readyClient.application.commands.set(body, config.guildId);
    console.log(`Commandes enregistrées sur le serveur ${config.guildId}`);
  } else {
    await readyClient.application.commands.set(body);
    console.log('Commandes enregistrées globalement');
  }

  console.log(`Connecté en tant que ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const reply = { content: 'Oups, une erreur est survenue.', flags: MessageFlags.Ephemeral } as const;
    if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
    else await interaction.reply(reply);
  }
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    await client.destroy();
    process.exit(0);
  });
}

await client.login(config.token);
