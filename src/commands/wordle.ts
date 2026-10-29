import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { normalize } from '../game/normalize.js';
import { renderBoard, renderShareable } from '../game/render.js';
import { sessions } from '../game/sessions.js';
import { WordleGame } from '../game/wordle.js';
import { SUPPORTED_LENGTHS, type WordLength, isValidWord, randomSolution } from '../game/words.js';

export const data = new SlashCommandBuilder()
  .setName('wordle')
  .setDescription('Jouer au Wordle en français')
  .addSubcommand((sub) =>
    sub
      .setName('jouer')
      .setDescription('Commencer une nouvelle partie')
      .addIntegerOption((opt) =>
        opt
          .setName('longueur')
          .setDescription('Nombre de lettres du mot (5 par défaut)')
          .addChoices(...SUPPORTED_LENGTHS.map((n) => ({ name: `${n} lettres`, value: n }))),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('essai')
      .setDescription('Proposer un mot')
      .addStringOption((opt) =>
        opt.setName('mot').setDescription('Ton mot (les accents sont ignorés)').setRequired(true),
      ),
  )
  .addSubcommand((sub) => sub.setName('abandon').setDescription('Abandonner la partie en cours'));

const ephemeral = MessageFlags.Ephemeral;

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  switch (interaction.options.getSubcommand()) {
    case 'jouer':
      return start(interaction);
    case 'essai':
      return guess(interaction);
    case 'abandon':
      return giveUp(interaction);
  }
}

async function start(interaction: ChatInputCommandInteraction): Promise<void> {
  const length = (interaction.options.getInteger('longueur') ?? 5) as WordLength;
  const game = new WordleGame(randomSolution(length));
  sessions.set(interaction.user.id, game);

  await interaction.reply({
    flags: ephemeral,
    content:
      `Nouvelle partie : trouve le mot de **${length} lettres** en ${game.maxAttempts} essais.\n` +
      `Utilise \`/wordle essai\` pour proposer un mot.\n\n${renderBoard(game)}`,
  });
}

async function guess(interaction: ChatInputCommandInteraction): Promise<void> {
  const game = sessions.get(interaction.user.id);
  if (!game || game.status !== 'playing') {
    await interaction.reply({ flags: ephemeral, content: 'Aucune partie en cours. Lance `/wordle jouer` !' });
    return;
  }

  const word = normalize(interaction.options.getString('mot', true));
  if (word.length !== game.length) {
    await interaction.reply({ flags: ephemeral, content: `Le mot doit faire **${game.length} lettres**.` });
    return;
  }
  if (!isValidWord(word)) {
    await interaction.reply({ flags: ephemeral, content: `**${word}** n’est pas dans le dictionnaire.` });
    return;
  }

  game.play(word);

  if (game.status === 'playing') {
    await interaction.reply({
      flags: ephemeral,
      content: `${renderBoard(game)}\n\nEssais restants : ${game.attemptsLeft}`,
    });
    return;
  }

  sessions.delete(interaction.user.id);
  const message =
    game.status === 'won'
      ? `🎉 Bravo, c’était bien **${game.solution}** !`
      : `😢 Perdu ! Le mot était **${game.solution}**.`;
  await interaction.reply({ flags: ephemeral, content: `${renderBoard(game)}\n\n${message}` });
  // Résultat public, sans les lettres pour ne rien dévoiler
  await interaction.followUp({ content: `${interaction.user}\n${renderShareable(game)}` });
}

async function giveUp(interaction: ChatInputCommandInteraction): Promise<void> {
  const game = sessions.get(interaction.user.id);
  if (!game) {
    await interaction.reply({ flags: ephemeral, content: 'Aucune partie en cours.' });
    return;
  }
  sessions.delete(interaction.user.id);
  await interaction.reply({ flags: ephemeral, content: `Partie abandonnée. Le mot était **${game.solution}**.` });
}
