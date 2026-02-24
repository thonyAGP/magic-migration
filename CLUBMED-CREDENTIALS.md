# Configuration AWS Bedrock (Club Med)

Ce projet utilise Claude Code via AWS Bedrock avec les credentials du compte Club Med.

## 📁 Fichiers

| Fichier | Description | Git |
|---------|-------------|-----|
| `.env.clubmed.local` | Credentials AWS Bedrock | ✅ Ignoré (`.gitignore`) |
| `use-clubmed-credentials.ps1` | Script de chargement PowerShell | ✅ Tracké |
| `CLUBMED-CREDENTIALS.md` | Cette documentation | ✅ Tracké |

## 🚀 Utilisation

Les credentials AWS Bedrock peuvent être utilisés de deux manières :

### 1. Pour Claude Code CLI (usage interactif)

**PowerShell (Windows)** :

```powershell
# Charger les credentials dans la session courante
. .\use-clubmed-credentials.ps1

# Lancer Claude Code
claude --dangerously-skip-permissions
```

### Bash/Zsh (Linux/Mac)

Si vous avez créé l'alias `claude-med` dans votre `.bashrc` ou `.zshrc` :

```bash
# Récupérez le token depuis .env.clubmed.local
alias claude-med="CLAUDE_CODE_USE_BEDROCK=1 AWS_REGION=\"us-east-1\" AWS_BEARER_TOKEN_BEDROCK=\"YOUR_TOKEN_HERE\" CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000 MAX_THINKING_TOKENS=31999 claude --dangerously-skip-permissions"

# Utilisation
claude-med
```

Ou sans alias, chargez directement les variables depuis le fichier `.env.clubmed.local` :

```bash
# Charger les variables depuis le fichier
set -a
source .env.clubmed.local
set +a

# Lancer Claude Code
claude --dangerously-skip-permissions
```

### 2. Pour le Dashboard Migration (backend API)

Les credentials AWS Bedrock sont **automatiquement utilisés** par le backend du dashboard quand vous sélectionnez **"Claude API (Bedrock)"** dans le dropdown d'enrichissement.

**Configuration requise** :

Le fichier `.env.clubmed.local` doit exister à la racine du projet. Le backend charge automatiquement ces variables d'environnement.

**Utilisation** :

1. Lancez le serveur dashboard :
   ```bash
   cd packages/factory-cli
   pnpm cli serve --port 3070
   ```

2. Ouvrez le dashboard : `http://localhost:3070`

3. Dans le dropdown "Mode d'enrichissement", sélectionnez **"Claude API (Bedrock)"**

4. Lancez la migration → Le backend utilisera AWS Bedrock avec les credentials Club Med

**Différence avec "Claude API (Perso)"** :
- **Claude API (Perso)** : Utilise votre clé Anthropic personnelle (`ANTHROPIC_API_KEY`)
- **Claude API (Bedrock)** : Utilise le compte AWS Club Med (facturé sur leur compte)

## 🔑 Variables d'environnement

| Variable | Valeur | Description |
|----------|--------|-------------|
| `CLAUDE_CODE_USE_BEDROCK` | `1` | Active le mode AWS Bedrock |
| `AWS_REGION` | `us-east-1` | Région AWS pour Bedrock |
| `AWS_BEARER_TOKEN_BEDROCK` | *Voir `.env.clubmed.local`* | Token d'authentification Club Med |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `64000` | Limite de tokens en sortie |
| `MAX_THINKING_TOKENS` | `31999` | Limite de tokens pour le raisonnement |

## ⚠️ Sécurité

- ✅ Le fichier `.env.clubmed.local` est **automatiquement ignoré par git** (règle `.env*.local` dans `.gitignore`)
- ✅ Les credentials ne seront **jamais commités** dans le repository
- ⚠️ **Ne partagez jamais** le contenu de `.env.clubmed.local` publiquement
- ⚠️ Si le token est compromis, contactez l'équipe AWS du Club Med pour le révoquer

## 🔄 Renouvellement du token

Si le token AWS expire ou doit être renouvelé :

1. Récupérez le nouveau token depuis Microsoft Teams ou auprès de l'équipe AWS
2. Modifiez la valeur dans `.env.clubmed.local` :
   ```bash
   AWS_BEARER_TOKEN_BEDROCK=NOUVEAU_TOKEN_ICI
   ```
3. Rechargez les credentials avec le script PowerShell

## 📊 Coûts et limites

Les coûts d'utilisation de Claude via AWS Bedrock sont facturés sur le compte Club Med :

- **Modèle** : Claude Sonnet 4.5 (via Bedrock)
- **Région** : US East (N. Virginia) - `us-east-1`
- **Limites** : 64000 tokens output, 31999 tokens thinking

Consultez le tableau de bord AWS Bedrock pour suivre l'utilisation et les coûts.

## 🆘 Support

En cas de problème :

1. Vérifiez que le fichier `.env.clubmed.local` existe et contient les bonnes valeurs
2. Vérifiez que le token n'a pas expiré
3. Consultez les logs AWS CloudWatch si disponibles
4. Contactez l'équipe AWS du Club Med

## 📝 Historique

- **2026-02-24** : Configuration initiale avec token Club Med
