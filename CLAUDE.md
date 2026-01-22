# Projet Migration Magic Unipaas

## Description

Agent Claude Code specialise pour l'analyse et la migration d'applications Magic Unipaas v12.03 vers des langages modernes (TypeScript, C#, Python).

## ACTIVATION AUTOMATIQUE - Magic Router

### Detection automatique d'intention

Quand l'utilisateur pose une question sur Magic, **DETECTER automatiquement** l'intention et **ROUTER** vers le bon agent :

| Mots-cles detectes | Agent a utiliser | Action |
|-------------------|------------------|--------|
| "analyse", "comprendre", "comment fonctionne" | `magic-analyzer` | Analyse complete |
| "bug", "erreur", "ticket", "CMDS", "PMS" | `magic-debugger` | Investigation |
| "migrer", "convertir", "typescript", "c#" | `magic-migrator` | Generation code |
| "documente", "spec", "rapport" | `magic-documenter` | Documentation |
| "cherche", "trouve", "ou est" | MCP `magic_find_program` | Recherche |
| "ligne X", "tache X.Y" | MCP `magic_get_line` | Query precise |
| "ticket PMS-XXXX", "CMDS-XXXX" | Script Jira + MCP | Fetch auto + analyse |

### REGLE AUTOMATIQUE - Tickets Jira

> **REGLES CRITIQUES** (apres CHAQUE analyse de ticket) :
> 1. **LIRE LE PROTOCOLE** : `.claude/protocols/ticket-analysis.md` AVANT de commencer
> 2. **DOCUMENTER CHAQUE APPEL MCP** : Verbose mode obligatoire
> 3. **TOUJOURS commit et push automatiquement** pour que les resultats soient visibles sur https://jira.lb2i.com
> 4. **TOUJOURS verifier le deploiement avec Playwright** : `npx playwright test tests/e2e/verify-tickets.spec.ts`
> 5. Ne JAMAIS attendre que l'utilisateur demande ces actions

### PROTOCOLE D'ANALYSE (OBLIGATOIRE)

> **AVANT** toute analyse de ticket, lire `.claude/protocols/ticket-analysis.md`
> Ce protocole définit les 6 étapes obligatoires et la documentation verbeuse.

| Étape | Action | Output requis |
|-------|--------|---------------|
| 1. Contexte | Fetch Jira + extraire indices | Tableau symptôme/attendu/obtenu |
| 2. Localisation | `magic_get_position` pour CHAQUE programme | Tableau IDE vérifié |
| 3. Traçage | `magic_get_logic` + résoudre CallTask | Diagramme ASCII |
| 4. Expressions | `magic_get_expression` + décoder {N,Y} | Formule lisible avec variables |
| 5. Root Cause | Hypothèse + vérification MCP | Localisation exacte |
| 6. Solution | Avant/Après avec variables nommées | Fix précis et vérifiable |

**Template** : Copier `.openspec/tickets/TEMPLATE/analysis.md` pour chaque nouveau ticket.

**Quand un numero de ticket est mentionne (PMS-XXXX, CMDS-XXXXXX) :**

1. **TOUJOURS** fetcher les infos Jira en premier :
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File ".claude/scripts/jira-fetch.ps1" -IssueKey "PMS-XXXX"
   ```

2. **PUIS** utiliser les outils MCP pour trouver les programmes concernes

3. **CREER** le dossier ticket si inexistant : `.openspec/tickets/{KEY}/analysis.md`

**Scripts Jira disponibles :**
| Script | Usage |
|--------|-------|
| `jira-fetch.ps1 -IssueKey KEY` | Recuperer titre + description |
| `jira-fetch.ps1 -IssueKey KEY -WithComments` | Avec commentaires |
| `jira-fetch.ps1 -IssueKey KEY -WithAttachments` | Avec liste pieces jointes |
| `jira-download-attachments.ps1 -IssueKey KEY` | Telecharger les PJ |

### VALIDATION POST-ANALYSE TICKET (OBLIGATOIRE)

> **RÈGLE CRITIQUE** : Après CHAQUE analyse de ticket, effectuer ces contrôles AVANT de soumettre le rapport.

#### Checklist de validation

| # | Contrôle | Action si KO |
|---|----------|--------------|
| 1 | **Position IDE correcte** | Vérifier dans `Progs.xml > ProgramsRepositoryOutLine` |
| 2 | **Lien Jira présent** | Ajouter `[{KEY}](https://clubmed.atlassian.net/browse/{KEY})` |
| 3 | **Numérotation tâches** | Utiliser IDE.1, IDE.2 (pas ISN_2) |
| 4 | **Variables globales** | Calculer offset cumulatif (pas variables locales A,B,C) |
| 5 | **Tables avec n°** | Format "Table n°XX - Nom" |

#### Workflow de validation

```
ANALYSE TERMINÉE
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ 1. VÉRIFIER POSITION IDE                            │
│    - Lire Progs.xml > ProgramsRepositoryOutLine     │
│    - Trouver position du Program id="XX"            │
│    - Position = (ligne - première_ligne) + 1        │
│    - Prg_59.xml ≠ IDE 59 (souvent différent!)       │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ 2. VÉRIFIER CONTENU ANALYSIS.MD                     │
│    - [ ] Lien Jira en haut du fichier               │
│    - [ ] Programme: PROJET IDE XXX (pas Prg_XX)     │
│    - [ ] Tâches: XXX.1, XXX.2 (position IDE)        │
│    - [ ] Note source: "Prg_XX.xml → IDE YYY"        │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ 3. METTRE À JOUR LES DEUX INDEX.JSON                │
│    - .openspec/index.json (site jira.lb2i.com)  !!  │
│    - .openspec/tickets/index.json (local)           │
│    - Ajouter dans "active" avec "program" field     │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ 4. COMMIT & PUSH (AUTOMATIQUE)                      │
│    - git add .openspec/ (les deux index.json)       │
│    - git commit -m "docs(tickets): ..."             │
│    - git push origin master  ← OBLIGATOIRE          │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ 5. VÉRIFICATION PLAYWRIGHT (OBLIGATOIRE)            │
│    - Lancer test sur https://jira.lb2i.com          │
│    - Vérifier: ticket visible, IDE, date, status    │
│    - Si KO: corriger et re-push                     │
└─────────────────────────────────────────────────────┘
```

> **RÈGLES CRITIQUES** :
> 1. Mettre à jour `.openspec/index.json` (pas seulement tickets/index.json)
> 2. Le `git push` est OBLIGATOIRE après chaque analyse
> 3. La vérification Playwright est OBLIGATOIRE pour valider le déploiement

#### Commande de vérification position IDE

```powershell
# Trouver la position IDE d'un programme
# Exemple: Prg_59.xml dans PBG → chercher id="59" dans ProgramsRepositoryOutLine
grep -n 'id="59"' "D:\Data\Migration\XPA\PMS\PBG\Source\Progs.xml"
# Résultat ligne 251, première entrée ligne 131 → Position = 251-131+1 = 121
```

#### Exemple de header analysis.md CORRECT

```markdown
# PMS-XXXX - Titre du ticket

> **Jira** : [PMS-XXXX](https://clubmed.atlassian.net/browse/PMS-XXXX)

## Programme principal

| Projet | IDE | Nom | Public Name |
|--------|-----|-----|-------------|
| **PBG** | **121** | Validation Auto filiations | VALID_AUTO_FILIATION |

> **Note** : Fichier source `Prg_59.xml` (ISN=59) → Position IDE **121**.
```

### Agents disponibles

| Agent | Fichier | Specialite |
|-------|---------|------------|
| **magic-router** | `.claude/agents/magic-router.md` | Routage intelligent (principal) |
| **magic-analyzer** | `.claude/agents/magic-analyzer.md` | Analyse programmes |
| **magic-debugger** | `.claude/agents/magic-debugger.md` | Resolution bugs |
| **magic-migrator** | `.claude/agents/magic-migrator.md` | Generation code |
| **magic-documenter** | `.claude/agents/magic-documenter.md` | Documentation |

### Workflow automatique

```
UTILISATEUR dit quelque chose sur Magic
         │
         ▼
    DETECTER intention
         │
         ├─ Analyse ? → Lancer agent magic-analyzer
         ├─ Debug ?   → Lancer agent magic-debugger
         ├─ Migrer ?  → Lancer agent magic-migrator
         ├─ Doc ?     → Lancer agent magic-documenter
         └─ Query ?   → Appeler MCP directement
         │
         ▼
    REPONDRE en format IDE Magic (OBLIGATOIRE)
```

## Skill Principal

Ce projet utilise le skill `magic-unipaas` pour toutes les operations d'analyse et de migration.

**Localisation :** `skills/magic-unipaas/SKILL.md`

## Projets Magic Source

### REF - Composant de Reference
- **Chemin :** `D:\Data\Migration\XPA\PMS\REF\Source\`
- **Role :** Composant central contenant les definitions de tables partagees
- **Fichiers cles :**
  - `Progs.xml` - Arborescence des programmes
  - `ProgramHeaders.xml` - Metadonnees des programmes
  - `DataSources.xml` - Definition des tables
  - `Comps.xml` - Composants partages

### PBP - Projet Editions
- **Chemin :** `D:\Data\Migration\XPA\PMS\PBP\Source\`
- **Role :** Projet d'editions, exports et generation d'etats
- **Caracteristiques :**
  - ~430 programmes
  - Utilise les tables de REF via composant partage

## Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `/magic-load <path>` | Charge un projet Magic |
| `/magic-tree` | Affiche l'arborescence |
| `/magic-analyze <prg_id>` | Analyse un programme |
| `/magic-tables` | Liste les tables |
| `/magic-migrate <prg_id>` | Migre vers langage cible |
| `/magic-line <projet> <tâche> <ligne>` | Affiche Data View ET Logic pour une ligne |
| `/magic-ide-position <projet> <prg>` | Convertit références XML en positions IDE |
| `/magic-expr <id>` | Décode une expression Magic |
| `/magic-search <query>` | Recherche dans les programmes |

## Methodologie

### Apprentissage Iteratif
1. Analyser un cas simple
2. Comparer avec l'ecran Magic reel (capture fournie)
3. Corriger/enrichir le skill
4. Monter en complexite progressivement

### Niveaux de Progression
- **Niveau 1** : Programmes Browse simples
- **Niveau 2** : Programmes avec CallTask et parametres
- **Niveau 3** : Expressions IF/CASE complexes
- **Niveau 4** : Editions et exports complets

## Scope

### Phase 1 (Actuelle)
- Logique metier (programmes, taches, expressions)
- Tables et champs
- Dependances entre programmes

### Phase 2 (Future)
- UI/Ecrans (Forms.xml)
- Exports de donnees
- Editions/Etats

## RÈGLE CRITIQUE : FORMAT IDE MAGIC (JAMAIS XML)

> **CETTE RÈGLE EST NON-NÉGOCIABLE**
> Toute communication avec l'utilisateur DOIT utiliser le format IDE Magic.
> Le format XML brut (ISN, FieldID, Prg_XXX) est INTERDIT dans les réponses.

### ⚠️ WORKFLOW OBLIGATOIRE - Référence Programme

**AVANT** de mentionner un programme Magic dans une analyse ou réponse :

```
1. IDENTIFIER le fichier XML source (ex: Prg_139.xml)
2. APPELER magic_get_position(project, programId)
3. UTILISER UNIQUEMENT le résultat IDE dans la réponse
```

**JAMAIS** : Déduire que Prg_139.xml = IDE 139 (c'est FAUX dans 90% des cas !)

**Exemple** :
```
❌ INTERDIT : "PVE IDE 139" (c'est le numéro du fichier XML, pas l'IDE)
✅ CORRECT  : magic_get_position("PVE", 139) → "PVE IDE 145 - Initialization"
```

**Mapping réel (exemples PVE)** :
| Fichier XML | Position IDE | Nom |
|-------------|--------------|-----|
| Prg_139.xml | **IDE 145** | Initialization |
| Prg_180.xml | **IDE 186** | Main Sale |
| Prg_256.xml | **IDE 263** | Choix - Select AM/PM |

### 🚫 Hook de validation actif

Un hook `validate-magic-ide.ts` **BLOQUE** toute écriture dans `.openspec/tickets/` contenant :

| Pattern bloqué | Action requise |
|----------------|----------------|
| `Prg_XXX` | → `magic_get_position` |
| `{0,3}` | → Convertir en Variable X |
| `ISN`, `ISN_2` | → Format Tâche X.Y.Z |
| `FieldID` | → Nom de variable |
| `obj=XX` | → Table n°XX ou `magic_get_table` |

### Variables - CONVERSION OBLIGATOIRE

**INTERDIT : `{0,3}`, `{1,2}`, `FieldID="25"`**
**OBLIGATOIRE : Noms de variables GLOBAUX (avec offset cumulatif)**

> **RÈGLE CRITIQUE** : Les variables sont numérotées GLOBALEMENT sur tout le programme.
> Dans une sous-tâche 186.1.5.4, les variables ne commencent PAS à A !
> Elles continuent après celles de Main + 186 + 186.1 + 186.1.5.

#### ⚠️ WORKFLOW OBLIGATOIRE - Variables d'une tâche

**AVANT** de documenter les variables d'une tâche dans un rapport :

```
1. APPELER magic_get_line(project, taskPosition, lineNumber, mainOffset)
2. Le mainOffset est OBLIGATOIRE (voir tableau ci-dessous)
3. UTILISER UNIQUEMENT la variable retournée (ex: MG, WF, MK)
```

**JAMAIS** : Utiliser les variables locales de `magic_dump_dataview` (A, B, C...)
**TOUJOURS** : Utiliser `magic_get_line` avec `mainOffset` pour obtenir les vraies variables globales

**Exemple** :
```
❌ INTERDIT  : magic_dump_dataview → "Variable A (v.Date operation)"
✅ CORRECT   : magic_get_line(PVE, "87.1.1.1", 1, 143) → "Variable MK (v.Date operation)"
```

#### Offset Main par projet (VG variables)

| Projet | Main Offset | Dernière VG |
|--------|-------------|-------------|
| **ADH** | 117 | EK |
| **PVE** | 143 | EQ |
| **PBG** | 91 | CM |
| **VIL** | 52 | BA |
| **PBP** | 88 | CJ |
| **REF** | 107 | EC |

#### Calcul offset cumulatif

```
Offset = Main + Σ(Select count de chaque ancêtre dans le chemin)

Exemple PVE IDE 186.1.5.4:
  Offset = 143 (Main PVE)
         + 119 (186 main)
         + 3 (186.1 Choix Onglet)
         + 165 (186.1.5 Sales)
         = 430

Variable position 0 dans 186.1.5.4 = Index 430 = QO
Variable position 3 dans 186.1.5.4 = Index 433 = QR
```

#### Conversion {niveau,columnID} → Variable GLOBALE

1. **Trouver le chemin IDE** de la tâche (ex: 186.1.5.4)
2. **Calculer l'offset cumulatif** (Main + ancêtres)
3. **Trouver la position locale** via le Column ID dans le DataView
4. **Appliquer la formule** : `Index global = Offset + Position locale`
5. **Convertir** l'index en lettres

**Outil** : `./tools/scripts/parse-dataview.ps1 -Project PVE -PrgId 180 -TaskIsn 45 -MainOffset 143`

#### Exemple complet (PVE IDE 186.1.5.4)

DataView de la sous-tâche (offset = 430) :
```
Ligne 3:  [QO] Virtual  BP. Exit           (position 0)
Ligne 5:  [QP] Virtual  V days difference  (position 1)
Ligne 6:  [QQ] Virtual  V allow cancel     (position 2)
Ligne 7:  [QR] Virtual  V.Comment annul    (position 3)
Ligne 13: [QS] Virtual  V.PremierJour      (position 4)
```

Conversion expressions :
- `{0,7}` → Column ID 7 → Position 3 → Index 433 → **Variable QR**
- `{0,11}` → Column ID 11 → Position 4 → Index 434 → **Variable QS**

#### Table de référence Index → Lettre

| Index | Variable | Index | Variable | Index | Variable |
|-------|----------|-------|----------|-------|----------|
| 0-25 | A-Z | 26 | **BA** | 52 | CA |
| 25 | Z | 27 | BB | 53 | CB |
| | | ... | ... | ... | ... |
| | | 51 | BZ | 77 | CZ |

**Formule pour index >= 26 :**
```
Première lettre = chr(65 + (index // 26)) → B pour 26-51, C pour 52-77...
Deuxième lettre = chr(65 + (index % 26)) → A-Z
Exemple: index 26 = BA (pas AA!)
Exemple: index 52 = CA
Exemple: index 430 = QO (Q=16, O=14 → 16*26+14=430)
```

### Programmes - FORMAT IDE OBLIGATOIRE

**INTERDIT : `Prg_180`, `Prg_195`**
**OBLIGATOIRE : `[PROJET] IDE [N°] - [Nom Public]`**

| Mauvais | Bon |
|---------|-----|
| Prg_180 | PVE IDE 45 - Main Sale |
| Prg_195 | PVE IDE 52 - Discounts |
| Prg_315 | PBG IDE 24 - Import GM seminaire |

**Utiliser l'outil MCP** `magic_get_position` pour obtenir la position IDE.

### Expressions - FORMAT LISIBLE

**INTERDIT :**
```
`{0,3}*(1-{0,1}/100)`
```

**OBLIGATOIRE :**
```
D*(1-B/100)    -- Prix * (1 - %Remise/100)
```

### Exemple complet de rapport CORRECT

```markdown
## Expression 30 (PVE IDE 52 - Discounts)

IF(Val(M,'') <> 0,
   Val(M,'10.2'),        -- Si prix manuel saisi (variable M)
   D*(1-B/100))          -- Sinon: Prix(D) * (1 - Remise%(B)/100)

Variables:
- B = % Remise (index 1)
- D = Prix original (index 3)
- M = Prix manuel (index 12)
```

### Tâches et Sous-tâches - NUMÉROTATION HIÉRARCHIQUE

**Format IDE** : `[PROJET] IDE [PrgIDE].[Pos1].[Pos2].[Pos3]`

| Niveau | Format | Exemple | Description |
|--------|--------|---------|-------------|
| Programme | **186** | PVE IDE 186 | Programme principal |
| Sous-tâche niveau 1 | **186.1** | Tâche 186.1 | 1ère sous-tâche |
| Sous-tâche niveau 2 | **186.1.5** | Tâche 186.1.5 | 5ème enfant de 186.1 |
| Sous-tâche niveau 3 | **186.1.5.4** | Tâche 186.1.5.4 | 4ème enfant de 186.1.5 |

> **RÈGLE** : La position est basée sur l'ordre dans le parent, PAS sur ISN_2.
> ISN_2=45 peut correspondre à position 186.1.5.4 (pas "186.45").

**Outil** : `./tools/scripts/get-task-ide-path.ps1 -Project PVE -IdePos 186 -TaskIsn 45`

**INTERDIT** : "Tâche 186.45" (utilise ISN_2)
**CORRECT** : "Tâche 186.1.5.4" (utilise position hiérarchique)

### Opérations Logic - NOMS EXACTS

| Opération | Usage | Retour |
|-----------|-------|--------|
| **Verify Warning** | Question Yes/No avec avertissement | Variable Logical (TRUE=Yes) |
| **Verify Error** | Question Yes/No avec erreur | Variable Logical |
| **Message Box** | Affichage simple OK | Aucun |
| **Call Task** | Appel sous-tâche/programme | Selon paramètres |

**Format ligne Logic** : `Tâche 69.3 ligne 21 : Verify Warning`

### Nommage Variables Utilisateur

Les variables créées par l'utilisateur ont un préfixe descriptif :
- `v.` = Variable virtuelle : `v.Edition partielle?`
- `W.` = Variable de travail : `W.ExtraitComplet`
- `P.` = Paramètre : `P.Societe`

## Workflow Tickets Jira

### ACCÈS JIRA API (OBLIGATOIRE)

> **JAMAIS utiliser WebFetch pour Jira** - Utiliser le script PowerShell avec token API.

**Script disponible** : `.claude/scripts/jira-fetch.ps1`

**Credentials** : `.env` (JIRA_EMAIL, JIRA_TOKEN, JIRA_BASE_URL)

**Commandes :**
```powershell
# Récupérer un ticket avec commentaires
powershell -ExecutionPolicy Bypass -File ".claude/scripts/jira-fetch.ps1" -IssueKey "PMS-1402" -WithComments

# Avec pièces jointes
powershell -ExecutionPolicy Bypass -File ".claude/scripts/jira-fetch.ps1" -IssueKey "PMS-1402" -WithComments -WithAttachments

# Format JSON brut
powershell -ExecutionPolicy Bypass -File ".claude/scripts/jira-fetch.ps1" -IssueKey "PMS-1402" -Raw
```

**Autres scripts Jira :**
| Script | Usage |
|--------|-------|
| `jira-fetch.ps1` | Récupérer un ticket complet |
| `jira-list-active.ps1` | Lister tickets actifs |
| `jira-download-attachments.ps1` | Télécharger pièces jointes |
| `jira-cache-sync.ps1` | Synchroniser cache local |

---

### RÈGLE OBLIGATOIRE : Langage Magic IDE

**TOUTES les résolutions et diagnostics doivent utiliser le langage Magic IDE :**

| Élément | Format obligatoire | Exemple |
|---------|-------------------|---------|
| Programme | **[PROJET] IDE [N°] - [Nom]** | PVE IDE 45 - Main Sale |
| Table | **Table n°XX - [Nom]** | Table n°40 - operations |
| Sous-tâche | **Tâche XX.YY.Z** | Tâche 22.16.1 |
| Variable | **Variable [LETTRE]** | Variable D, Variable AE |
| Expression | **Expression n°XX** | Expression 30 |

**Structure resolution.md obligatoire :**
```markdown
## Références Magic IDE

### Tables
| N° Table | Projet | Nom Logique | Nom Physique | Description |

### Programmes
| N° Prg | Projet | Nom Public | Description | Fichier Source |
```

**Double référence autorisée** : Garder le lien XML en plus (`[Prg_69.xml](file://...)`)

### Fichier TICKETS.md à la racine

Maintenir un fichier `TICKETS.md` à la racine du projet avec liens directs vers :
- Toutes les résolutions actives
- Liens Jira et GitHub
- Statut de chaque ticket

### Analyse de bugs - Bonnes pratiques

Lors de l'analyse d'un ticket Jira, toujours documenter :

1. **Tables suspectes** : **Table n°XX** + Nom complet + champs concernés
2. **Programmes concernés** : **Programme n°XX (Projet)** avec rôle
3. **Fichiers d'import** : Nom des fichiers attendus (TXT, CSV, etc.)
4. **Données requises** : Base de données village + date précise

### EXIGENCE CRITIQUE : Precision des resolutions (OBLIGATOIRE)

**TOUTE resolution de bug ou nouvelle fonctionnalite DOIT etre precise au niveau :**

| Element | Precision requise | Exemple |
|---------|-------------------|---------|
| **Programme** | Projet + IDE + Nom | PVE IDE 181 - Main Sale-664 |
| **Sous-tache** | Numero hierarchique | Tache 181.55.3 |
| **Ligne Logic** | Numero exact | Tache 181.55 ligne 12 |
| **Expression** | Numero IDE | Expression 33 |
| **Variable fautive** | Lettre + Nom logique | Variable D (v.Compte) |
| **Variable correcte** | Lettre + Nom logique | Variable V (prix) |
| **Formule avant** | Expression lisible | `Round(D*(1-W/100), 10, arrondi)` |
| **Formule apres** | Expression lisible | `Round(V*(1-W/100), 10, arrondi)` |

**Template resolution OBLIGATOIRE :**

```markdown
## Fix technique

### Localisation
- **Programme** : [PROJET] IDE [N] - [Nom]
- **Sous-tache** : Tache X.Y.Z
- **Ligne Logic** : Tache X.Y ligne NN

### Modification Expression
| Expression | Variable | Avant (bug) | Apres (fix) |
|------------|----------|-------------|-------------|
| Expression 33 | Position 1 | Variable D (v.Compte) | Variable V (prix) |

### Formule complete (format IDE)
- **Avant** : `Round(D*(1-W/100), 10, arrondi_sys)`
- **Apres** : `Round(V*(1-W/100), 10, arrondi_sys)`

### Variables concernees
| Variable | Nom logique | Role |
|----------|-------------|------|
| D | v.Compte | Numero GM (incorrect) |
| V | prix | Prix unitaire (correct) |
| W | discount | Pourcentage remise |
```

**Cette precision est NON-NEGOCIABLE pour :**
- Permettre la revue du fix par un developpeur
- Permettre le rollback si necessaire
- Capitaliser les patterns de bugs dans la Knowledge Base

### Format de demande de données

À la fin de chaque analyse, être proactif et demander :
```
DONNÉES REQUISES POUR COMPLÉTER L'ANALYSE :
- Base de données : Village [NOM] à la date [JJ/MM/AAAA]
- Fichier(s) : [nom_fichier.ext] (import NA, export, etc.)
- Table(s) à extraire : [nom_table] (champs: x, y, z)
```

### Structure rapport d'analyse

Chaque rapport dans `.openspec/reports/` doit contenir :
- Symptôme observé
- Flux de données tracé
- Tables/champs suspects (avec noms SQL exacts)
- Hypothèses classées par probabilité
- **Section "DONNÉES REQUISES"** en fin de rapport

## Standards de Code

- **TypeScript** : Types stricts, Decimal.js pour numeriques
- **C#** : .NET 6+, DateOnly/TimeOnly
- **Python** : Type hints, Decimal

## Sources Documentation Magic

### Documentation officielle (CHM)
| Fichier | Chemin | Contenu |
|---------|--------|---------|
| **MgHelpW.chm** | `C:\Appwin\Magic\Magicxpa23\Support\` | Aide principale (380+ fonctions) |
| **Magic_xpa_Help_System.chm** | idem | Systeme d'aide complet |
| **MasteringMagicxpa.chm** | idem | Guide maitrise avance |
| **TechnicalNotes.chm** | idem | Notes techniques |

### Documentation extraite (HTML)
**Chemin**: `C:\Appwin\Magic\Magicxpa23\Support\mghelpw_extracted\`
- 484 fichiers HTM de fonctions
- `Expression_Editor/Function_Directory.htm` - Index alphabetique
- Format: Syntax, Parameters, Returns, Examples

### PDF
- `Mastering Magic xpa.pdf` - Guide complet

### References du projet
| Fichier | Contenu |
|---------|---------|
| `quick-reference-top30.md` | TOP 30 fonctions + equivalences TS/C#/Python |
| `magic-functions.md` | Reference complete des fonctions |

## Notes Techniques

### Structure des Fichiers XML Magic
Voir `skills/magic-unipaas/references/xml-format-spec.md`

### Arborescence des Programmes
- `Progs.xml` > Folders : Dossiers avec StartsAt et NumberOfEntries
- `Progs.xml` > ProgramsRepositoryOutLine : Ordre des programmes
- `ProgramHeaders.xml` : Metadonnees de chaque programme

### Types de Taches (TaskType)
- `B` : Batch/Browse
- `O` : Online/Output
- `I` : Internal

### Composants Partages
REF.ecf contient les tables partagees, accessible via Comps.xml des autres projets.
