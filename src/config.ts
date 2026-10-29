import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Variable d’environnement manquante : ${name} (voir .env.example)`);
    process.exit(1);
  }
  return value;
}

export const config = {
  token: required('DISCORD_TOKEN'),
  guildId: process.env.GUILD_ID || undefined,
};
