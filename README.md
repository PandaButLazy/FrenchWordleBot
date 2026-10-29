# FrenchWordleBot

Un bot Discord pour jouer au Wordle, mais en français :) 🥖

## Commandes

| Commande | Effet |
| --- | --- |
| `/wordle jouer [longueur]` | Lance une partie (5, 6 ou 7 lettres, 5 par défaut) |
| `/wordle essai mot:<mot>` | Propose un mot (les accents sont ignorés : « élève » = « ELEVE ») |
| `/wordle abandon` | Abandonne et révèle le mot |

La grille avec les lettres n’est visible que par le joueur. À la fin de la partie, le résultat est posté publiquement dans le salon, sans les lettres (🟩🟨⬛).

## 1. Créer le bot sur Discord

1. Va sur le [Discord Developer Portal](https://discord.com/developers/applications) et clique sur **New Application**.
2. Onglet **Bot** : clique sur **Reset Token** et copie le token. **Ne le partage jamais et ne le commite pas.**
3. Onglet **OAuth2 > URL Generator** : coche les scopes `bot` et `applications.commands`, puis la permission `Send Messages`. Ouvre l’URL générée pour inviter le bot sur ton serveur.

Le bot n’a besoin d’aucun « Privileged Gateway Intent ».

## 2. Configuration

Copie `.env.example` en `.env`, puis remplis-le :

```
DISCORD_TOKEN=ton_token
GUILD_ID=id_de_ton_serveur_de_test   # optionnel
```

Avec `GUILD_ID`, les commandes apparaissent tout de suite sur ce serveur. Sans `GUILD_ID`, elles sont globales et peuvent mettre jusqu’à une heure à apparaître. Pour copier l’ID d’un serveur, active le mode développeur de Discord, puis fais un clic droit sur le serveur et choisis **Copier l’identifiant**.

## 3. Lancer en local

Il faut [Node.js](https://nodejs.org) 20 ou plus.

```bash
npm install
npm run dev        # mode développement : redémarre à chaque modification
```

Ou en mode production :

```bash
npm run build
npm start
```

Ou avec Docker : le bot redémarre automatiquement s’il plante ou si la machine redémarre.

```bash
docker compose up -d --build
docker compose logs -f
```

## 4. Héberger depuis GitHub

Le dépôt contient un `Dockerfile`, que la plupart des hébergeurs détectent tout seuls. Exemple avec [Railway](https://railway.app) :

1. **New Project > Deploy from GitHub repo**, puis choisis ce dépôt.
2. Dans **Variables**, ajoute `DISCORD_TOKEN` (et `GUILD_ID` si tu veux).
3. Chaque `git push` sur `main` redéploie le bot.

Ça fonctionne aussi sur Fly.io, Render (en « Background Worker », pas en « Web Service ») ou sur n’importe quel VPS avec `docker compose up -d`.

À chaque push et pull request, la CI GitHub (`.github/workflows/ci.yml`) vérifie les types, lance les tests et construit l’image Docker.

## Développement

```bash
npm test           # tests de la logique du jeu
npm run typecheck  # vérification TypeScript
```

```
src/
  index.ts              démarrage du bot et routage des commandes
  config.ts             lecture des variables d’environnement
  commands/wordle.ts    commande /wordle
  game/                 logique du jeu (indépendante de Discord)
data/
  solutions-N.txt       mots pouvant être tirés comme solution (édite-les librement)
  valides-N.txt         mots acceptés comme essais (générés)
scripts/generate-words.mjs
```

### Modifier les mots

- **Solutions** : édite `data/solutions-5.txt`, `solutions-6.txt` ou `solutions-7.txt`, avec un mot par ligne. Les accents sont autorisés.
- **Mots acceptés** : après avoir modifié les solutions, lance `npm run words` pour régénérer `data/valides-*.txt`.

Les mots acceptés viennent du paquet [an-array-of-french-words](https://github.com/words/an-array-of-french-words), sous licence MIT.

Les parties en cours sont gardées en mémoire, donc elles sont perdues quand le bot redémarre.
