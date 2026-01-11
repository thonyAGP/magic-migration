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

### Variables - CONVERSION OBLIGATOIRE

**INTERDIT : `{0,3}`, `{1,2}`, `FieldID="25"`**
**OBLIGATOIRE : Noms de variables en LETTRES**

| Index | Variable | Index | Variable | Index | Variable |
|-------|----------|-------|----------|-------|----------|
| 0 | A | 10 | K | 20 | U |
| 1 | B | 11 | L | 21 | V |
| 2 | C | 12 | M | 22 | W |
| 3 | D | 13 | N | 23 | X |
| 4 | E | 14 | O | 24 | Y |
| 5 | F | 15 | P | 25 | Z |
| 6 | G | 16 | Q | 26 | **BA** |
| 7 | H | 17 | R | 27 | BB |
| 8 | I | 18 | S | ... | ... |
| 9 | J | 19 | T | 51 | BZ |

**Formule pour index >= 26 :**
```
Première lettre = chr(65 + (index // 26)) → B pour 26-51, C pour 52-77...
Deuxième lettre = chr(65 + (index % 26)) → A-Z
Exemple: index 26 = BA
Exemple: index 30 = BE
Exemple: index 52 = CA
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

**Format IDE** : `[PrgID].[SubTask].[SubSubTask]`

| Niveau | Format | Exemple | Description |
|--------|--------|---------|-------------|
| Programme | **69** | ADH IDE 69 | Programme principal |
| Sous-tâche niveau 1 | **69.1** | Tâche 69.1 | 1ère sous-tâche |
| Sous-tâche niveau 2 | **69.1.1** | Tâche 69.1.1 | Sous-sous-tâche |
| Sous-tâche niveau 1 | **69.2** | Tâche 69.2 | 2ème sous-tâche |
| Sous-tâche niveau 1 | **69.3** | Tâche 69.3 | 3ème sous-tâche |

**ATTENTION** : Ne pas compter séquentiellement ! La 5ème tâche en ordre d'affichage peut être **69.3** s'il y a des sous-sous-tâches.

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
