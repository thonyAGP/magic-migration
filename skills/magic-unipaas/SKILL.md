---
name: magic-unipaas
description: Analyse et migration de code Magic Unipaas v12.03 vers TypeScript, C# ou Python. Utiliser pour lire, comprendre et convertir des applications Magic.
---

<objective>
Migrer des applications Magic Unipaas v12.03 vers des langages modernes (TypeScript, C#, Python)
en preservant la logique metier, les structures de donnees et les flux d'execution.

Ce skill fournit une connaissance complete du format XML Magic et des patterns de conversion.
</objective>

<quick_start>
<workflow>
1. **Charger** : `/magic-load <chemin>` - Charger un projet Magic
2. **Explorer** : `/magic-tree` - Voir l'arborescence des programmes
3. **Analyser** : `/magic-analyze <id>` - Analyser un programme en detail
4. **Tables** : `/magic-tables [id]` - Lister les tables (detail si id fourni)
5. **Migrer** : `/magic-migrate <id> --target=ts|cs|py` - Generer le code cible
6. **Decoder** : `/magic-expr <expression>` - Decoder une expression Magic
7. **Chercher** : `/magic-search <terme>` - Rechercher dans les programmes
8. **Couverture** : `/magic-coverage [module]` - Afficher la matrice de couverture migration
</workflow>

<example_usage>
Analyser un programme Magic:
```
/magic-load D:\Data\Migration\XPA\PMS\PBP\Source
/magic-tree
/magic-analyze 671
```

Migrer vers TypeScript:
```
/magic-migrate 671 --target=ts
```

Decoder une expression:
```
/magic-expr "IF({0,1} > 10, 'Yes', 'No')"
```

Rechercher une fonction:
```
/magic-search GetParam
```
</example_usage>
</quick_start>

<mandatory_communication>
## FORMAT OBLIGATOIRE POUR COMMUNIQUER AVEC L'UTILISATEUR

**TOUJOURS utiliser ce format pour referencer une tache ou un element XML :**

```
XX.XX.X Nom : [nom de la tache] Ligne : XX
```

**Exemples corrects :**
- `112.2.9 Nom : Creation Versement v1 Ligne : 32`
- `102 Nom : Maj lignes saisies archive V3 Ligne : 22`
- `112.2.11 Nom : MAJ CMP Ligne : 7`

**Regles :**
- Programme sans sous-tache : `102` (PAS `102.1`)
- Programme avec sous-taches : `112.2.9` (hierarchie complete)
- TOUJOURS inclure le nom de la tache
- TOUJOURS inclure le numero de ligne si on parle d'un element specifique
- L'utilisateur ne lit PAS le XML - il voit l'IDE Magic
- Etre clair pour L'UTILISATEUR, pas pour l'agent
</mandatory_communication>

<mcp_tools_obligatoire>
## OUTILS MCP MAGIC INTERPRETER (OBLIGATOIRE)

**TOUJOURS utiliser les outils MCP pour les tâches déterministes :**

| Tâche | Outil MCP | Exemple |
|-------|-----------|---------|
| Position IDE programme/tâche | `magic_get_position` | `magic_get_position(project="ADH", programId=121, isn2=7)` |
| Arborescence tâches | `magic_get_tree` | `magic_get_tree(project="ADH", programId=121)` |
| DataView (Main/Links/Range) | `magic_get_dataview` | `magic_get_dataview(project="ADH", programId=121, isn2=1)` |
| Contenu expression | `magic_get_expression` | `magic_get_expression(project="ADH", programId=121, expressionId=5)` |
| Logique (opérations) | `magic_get_logic` | `magic_get_logic(project="ADH", programId=121, isn2=7)` |

### POURQUOI OBLIGATOIRE ?

```
SANS MCP : Claude lit XML → interprète → ERREUR 30% des cas
AVEC MCP : Claude appelle outil → résultat déterministe → 0% erreur
```

### QUAND UTILISER ?

| Situation | Action |
|-----------|--------|
| "Quelle est la position IDE de..." | → `magic_get_position` |
| "Montre l'arbre des tâches" | → `magic_get_tree` |
| "Quelle table utilise..." | → `magic_get_dataview` |
| "Que contient l'expression #X" | → `magic_get_expression` |
| "Quelles opérations dans la tâche..." | → `magic_get_logic` |

### PROJETS DISPONIBLES

| Projet | Programmes | Statut |
|--------|------------|--------|
| PBP | 419 | ✅ Indexé |
| REF | 900 | ✅ Indexé |
| VIL | 222 | ✅ Indexé |
| PBG | 394 | ✅ Indexé |
| PVE | 448 | ✅ Indexé |
| ADH | - | ⚠️ XML invalide (à corriger) |

**RÈGLE D'OR : Ne JAMAIS calculer manuellement ce qu'un outil MCP peut fournir.**
</mcp_tools_obligatoire>

<knowledge_base_tools>
## KNOWLEDGE BASE (KB) - Recherche Avancée

**La Knowledge Base est une base SQLite (~210 MB) indexant tous les programmes Magic (5,843 fichiers) avec recherche FTS5.**

### Outils KB Disponibles

| Outil | Description | Exemple |
|-------|-------------|---------|
| `magic_kb_search` | Recherche full-text (programmes, expressions, colonnes) | `magic_kb_search(query="ouverture caisse")` |
| `magic_kb_callers` | Qui appelle ce programme ? | `magic_kb_callers(project="ADH", idePosition=122)` |
| `magic_kb_callees` | Quels programmes sont appelés ? | `magic_kb_callees(project="ADH", idePosition=122)` |
| `magic_kb_callgraph` | Graphe d'appels complet (callers + callees) | `magic_kb_callgraph(project="ADH", idePosition=122)` |
| `magic_kb_table_usage` | Où est utilisée cette table ? | `magic_kb_table_usage(tableName="caisse_session")` |
| `magic_kb_field_usage` | Où est utilisé ce champ ? | `magic_kb_field_usage(fieldName="SOCIETE")` |
| `magic_kb_table_info` | Info sur une table (stats R/W/M/D/L) | `magic_kb_table_info(idePosition=123)` |
| `magic_kb_search_tables` | Chercher des tables par nom | `magic_kb_search_tables(query="caisse")` |
| `magic_kb_stats` | Statistiques KB | `magic_kb_stats()` |
| `magic_kb_update` | Mise à jour incrémentale (<5s) | `magic_kb_update()` |
| `magic_kb_reindex` | Réindexation complète | `magic_kb_reindex()` |

### Quand utiliser la KB ?

| Situation | Outil |
|-----------|-------|
| "Trouve tous les programmes qui appellent X" | → `magic_kb_callers` |
| "Que fait ce programme ? Qui l'appelle ?" | → `magic_kb_callgraph` |
| "Où est modifiée la table Y ?" | → `magic_kb_table_usage` |
| "Cherche 'GetParam SOCIETE' dans le code" | → `magic_kb_search(scope="expressions")` |
| "Statistiques du projet" | → `magic_kb_stats` |

### Exemple d'investigation bug

```
# 1. Chercher le programme
magic_kb_search(query="ouverture caisse")
→ ADH IDE 122 - Ouverture_Session_Caisse (score: 95)

# 2. Voir qui appelle ce programme
magic_kb_callers(project="ADH", idePosition=122)
→ ADH IDE 121 (ligne 45) - Menu_Caisse_GM
→ ADH IDE 162 (ligne 12) - Main_Caisse

# 3. Voir les tables impactées
magic_kb_table_usage(tableName="caisse_session")
→ [WRITE] ADH IDE 122.3 - Création session
→ [READ] ADH IDE 131.5 - Lecture pour fermeture
```
</knowledge_base_tools>

<critical_rule_xml_to_ide>
## RÈGLE CRITIQUE : Identification Programme IDE

**AVANT de présenter un cas, TOUJOURS vérifier ces 3 éléments :**

### 1. PROJET (ADH, PBP, REF, VIL, PBG, PVE)

- **TOUJOURS préciser** le projet source
- Ne JAMAIS assumer que c'est PBP ou ADH
- Demander à l'utilisateur s'il n'est pas clair quel projet il consulte

### 2. NUMÉRO IDE (pas id XML !)

**L'id XML d'un fichier Prg_XXX.xml n'est PAS toujours le numéro IDE !**

- **PBP** : Numéro IDE = position dans `Progs.xml > ProgramsRepositoryOutLine`
- **ADH** : Numéro IDE ≈ id XML (mais vérifier quand même)
- **Autres** : Toujours vérifier dans `Progs.xml`

### 3. NOM DU PROGRAMME (MANDATORY)

**Format obligatoire** : `[Projet] [Numéro IDE] Nom : [Description exacte du XML]`

Exemples :
- ✅ `ADH 31 Nom : Write histo_Fus_Sep_Det`
- ✅ `PBP 31 Nom : Edit securite equipage must C2`
- ❌ `Programme 31` (manque projet et nom)
- ❌ `31 Nom : ...` (manque projet)

### Procédure OBLIGATOIRE :

1. **Identifier** le PROJET source (ADH, PBP, etc.)
2. **Lire** la Description dans `<Header Description="...">` du fichier Prg_XXX.xml
3. **Calculer** le numéro IDE (position dans Progs.xml ou id selon projet)
4. **Communiquer** : `[PROJET] [N°IDE] Nom : [Description]`

### Erreurs typiques à éviter :

| Erreur | Correction |
|--------|------------|
| Mauvais projet | Toujours vérifier/demander le projet |
| id XML comme numéro | Calculer la position dans Progs.xml |
| Pas de nom | TOUJOURS inclure Description |
| Programme sans I/O | Vérifier qu'il a bien des I/O avant de poser la question |
</critical_rule_xml_to_ide>

<context>
<magic_version>Magic Unipaas 12.03 (Version val="12030")</magic_version>

<supported_files>
| Fichier | Role |
|---------|------|
| `Progs.xml` | Arborescence des programmes (Folders + ProgramsRepositoryOutLine) |
| `ProgramHeaders.xml` | Index et metadonnees des programmes |
| `Prg_XXX.xml` | Code source des programmes (taches, logique) |
| `DataSources.xml` | Definition des tables et champs |
| `DataSourcesIndex.xml` | Index rapide des tables |
| `Models.xml` | Modeles UI reutilisables |
| `Menus.xml` | Structure des menus applicatifs |
| `Comps.xml` | Composants partages (.ecf) et assemblies .NET |
</supported_files>

<target_languages>
- TypeScript (avec types stricts, Decimal.js pour numeriques)
- C# (.NET 6+, DateOnly/TimeOnly)
- Python (avec type hints, Decimal)
</target_languages>

<current_scope>
**Phase 1** : Logique metier - programmes, taches, expressions, tables [COMPLET]
**Phase 2** : UI/Ecrans, Exports, Editions [COMPLET - 2025-12-24]
**Phase 3 (future)** : Generateurs de code (TypeScript, C#, Python)
</current_scope>

<project_architecture>
**Architecture des projets PMS :**
```
REF (Reference)     <- Tables partagees (~1000 tables via REF.ecf)
 ├── ADH (Adherents) <- 350 programmes, utilise REF.ecf
 ├── PBP (Editions)  <- 430 programmes, utilise REF.ecf + ADH.ecf
 ├── PBG (Batch)     <- 200 programmes, tables Memory locales
 └── PVE (Ventes)    <- A explorer
```

**Composants partages (.ecf) :**
- `REF.ecf` : ~1000 tables, ~30 programmes utilitaires
- `ADH.ecf` : 30 programmes partages (Caisse, Solde, Impression)
- `UTILS.ecf` : Composants .NET (Calendrier)
</project_architecture>
</context>

<detailed_references>
Pour une comprehension approfondie, consulter les fichiers de reference :

**Format XML Magic**
- [xml-format-spec.md](references/xml-format-spec.md) - Structure complete des fichiers XML
- [arborescence.md](references/arborescence.md) - Logique Progs.xml/ProgramHeaders.xml
- [io-forms-exports.md](references/io-forms-exports.md) - Details I/O, FormIO, Range dynamique (reference complementaire)

**Structure Logic et Identifiants**
- [logic-structure.md](references/logic-structure.md) - Structure Task/Record Prefix/Main/Suffix
- [identifiers-mapping.md](references/identifiers-mapping.md) - Mapping Task ID, comp, obj, FieldID
- [data-view-structure.md](references/data-view-structure.md) - Main Source, Link Query, Link Join, Range, Locate
- [logic-operations.md](references/logic-operations.md) - **Operations logiques** (CallTask, Update, Evaluate, STP, FormIO)

**Syntaxe et Types**
- [expressions-syntax.md](references/expressions-syntax.md) - Syntaxe des expressions Magic
- [data-types-mapping.md](references/data-types-mapping.md) - Correspondances de types
- [events-handlers.md](references/events-handlers.md) - Evenements et handlers
- [magic-functions.md](references/magic-functions.md) - **Reference complete des fonctions Magic** (200+ fonctions)
- [advanced-patterns.md](references/advanced-patterns.md) - **Patterns avances** (DSOURCE, PROG, DbDel, RangeAdd, DataViewToText)

**Exports, Editions, Ecrans (Phase 2)**
- [exports-guide.md](references/exports-guide.md) - **Guide complet des exports** (IO, Media T/G/S/R, FormIO, FORM_TEXT)
- [editions-guide.md](references/editions-guide.md) - **Guide des rapports** (Area H/F/N/G, Groups, Counter, Page)
- [ecrans-guide.md](references/ecrans-guide.md) - **Guide des ecrans** (17 controles GUI, Events, Forms, DLU conversion)
- [gaps-analysis-complete.md](references/gaps-analysis-complete.md) - Analyse complete 40 fichiers XML
- [xml-structure-guide.md](references/xml-structure-guide.md) - Guide structure XML pour conversion
- [VALIDATION-REQUISE.md](references/VALIDATION-REQUISE.md) - Points a valider

**Migration et Couverture**
- [adh-coverage-matrix.md](references/adh-coverage-matrix.md) - **Matrice de couverture ADH** (322 programmes, 27 modules, endpoints/ecrans)

**Generateurs de Code** (Phase 3 - a creer)
- generators/typescript-patterns.md
- generators/csharp-patterns.md
- generators/python-patterns.md
</detailed_references>

<program_structure>
Structure d'un programme Magic (Prg_XXX.xml) :

```
Task (MainProgram="Y/N")
├── Header
│   ├── id, Description, TaskType
│   ├── Parameters (TSK_PARAMS, ParametersAttributes)
│   └── LastModified
│
├── Resource
│   ├── DB (DataObject references - tables utilisees)
│   └── Columns (variables et champs)
│
├── Information
│   ├── Key, Sort (index et tri)
│   ├── TaskProperties (transactions, locking, cache)
│   └── Permissions (SIDE_WIN - AllowModify, AllowCreate, etc.)
│
└── TaskLogic
    └── LogicUnit (Level: R=Record, T=Task, H=Handler)
        ├── Event (EventType: S=Start, F=Finish, R=Record, U=User)
        └── LogicLines
            ├── Select (selection de donnees)
            ├── CallTask (appel de programme/tache)
            ├── Update (mise a jour de champ)
            ├── RaiseEvent (lever un evenement)
            ├── Remark (commentaire)
            └── DATAVIEW_SRC (source de vue)
```
</program_structure>

<key_concepts>
**Arborescence des Programmes**
- `Progs.xml` > Folders : definit les dossiers avec StartsAt (position) et NumberOfEntries
- `Progs.xml` > ProgramsRepositoryOutLine : liste ordonnee des ID de programmes
- `ProgramHeaders.xml` : metadonnees de chaque programme (id, Description, TaskType, Parameters)

**Types de Taches (TaskType)**
- `B` : Batch/Browse - traitement par lot
- `O` : Online/Output - interactif ou edition
- `I` : Internal - tache interne

**Niveaux de Logique (Level)**
- `R` (Record) : execute pour chaque enregistrement
- `T` (Task) : execute une fois par tache
- `H` (Handler) : gestionnaire d'evenement specifique

**Structure Logic (Level + Type)**
| Vue IDE | Level | Type | Description |
|---------|-------|------|-------------|
| Task Prefix | T | P | Initialisation de la tache |
| Task Suffix | T | S | Finalisation de la tache |
| Record Prefix | R | P | Avant chaque enregistrement |
| Record Main | R | M | Traitement principal |
| Record Suffix | R | S | Apres chaque enregistrement |

**Logic Units - Documentation Officielle Magic Software**

Source: [Logic Units (Magic xpa)](https://kb.magicsoftware.com/articles/Knowledge/Logic-Units-xpa), [Engine Execution Rules](https://magicsoftware.my.salesforce-sites.com/PublicKnowledge/articles/bl_Reference/Engine-Execution-Rules-xpa)

| Type | Niveau | Déclencheur | Description |
|------|--------|-------------|-------------|
| Task Prefix | Task | Démarrage tâche | Opérations d'initialisation |
| Task Suffix | Task | Fin tâche | Mise à jour params, totaux rapport |
| Record Prefix | Record | Après lecture record | Avant interaction utilisateur |
| Record Suffix | Record | Avant sauvegarde | Si record modifié (ou Force=Yes) |
| Control Prefix | Control | Curseur entre | Online/Rich Client uniquement |
| Control Suffix | Control | Curseur sort | Après édition du control |
| Group Prefix | Group | Changement valeur rupture | En-têtes rapport (Batch) |
| Group Suffix | Group | Avant nouveau groupe | Pieds de page (Batch) |

**Règle d'imbrication (officielle) :**
> "A Control logic unit can only be executed inside a Record logic unit cycle, and a Record logic unit can only be executed inside a Task logic unit."

**Format XML interne - NON DOCUMENTÉ PUBLIQUEMENT**

Le format des fichiers XML internes (Prg_XXX.xml, DataSources.xml, etc.) n'est **PAS documenté officiellement** par Magic Software. Cette connaissance provient de :
- Reverse-engineering des fichiers exportés
- Expérience communautaire ([magicu-l.groups.io](https://magicu-l.groups.io))
- Analyse des outils tiers ([Magic Optimizer](https://www.magic-optimizer.com))

**Identifiants Composants (comp)**
- `comp="-1"` : Composant local (meme projet)
- `comp="2"` : Composant externe (ex: REF dans PBP)

**Types d'Evenements (EventType)**
- `S` : Start - demarrage
- `F` : Finish - fin
- `R` : Record - traitement enregistrement
- `U` : User - evenement utilisateur
- `M` : Menu - selection menu
- `P` : Program - evenement programme
- `I` : Internal - evenement interne systeme (Zoom, Exit, etc.)

**User Actions et Handlers (valide Session 5)**

Dans l'IDE Magic, les evenements utilisateur sont affiches comme :
| Type IDE | Description | Exemple |
|----------|-------------|---------|
| User Action X | Evenement utilisateur numerote | User Action 4 |
| Nom personnalise | User Event avec nom lisible | "Ouverture de Caisse" |
| Zoom on: [Control] | Evenement Zoom sur un controle | Zoom on: Bouton Pointage |
| Ctrl+X | Raccourci clavier | Ctrl+J |
| Internal | Evenement systeme | Zoom, Exit |

**Scope des handlers :**
| Scope | XML | IDE | Signification |
|-------|-----|-----|---------------|
| Task | `T` | Task | Handler actif dans cette tache seulement |
| SubTree | `S` | SubTree | Handler actif dans toute l'arborescence descendante |

**Structure Handler dans le XML :**
```xml
<LogicUnit id="12" propagate="78">
  <Level val="H"/>           <!-- H = Handler -->
  <Type val="U"/>            <!-- U = User Event -->
  <Scope val="T"/>           <!-- T = Task, S = SubTree -->
  <Event>
    <EventType val="I"/>     <!-- I = Internal -->
    <InternalEventID val="222"/>  <!-- Numero evenement interne -->
  </Event>
  <LogicLines>
    <CallTask>...</CallTask>
  </LogicLines>
</LogicUnit>
```

**Call SubTask vs Call Program vs Raise Event :**

| Operation | Wait disponible | Comportement |
|-----------|-----------------|--------------|
| **Call SubTask** | ❌ Non | **Toujours synchrone** - attend la fin de la sous-tache |
| **Call Program** | ❌ Non | **Toujours synchrone** - attend la fin du programme |
| **Raise Event** | ✅ Oui/No | **Peut etre asynchrone** - Wait=Yes attend, Wait=No continue |

**Proprietes par type d'operation :**

| Propriete | Call SubTask | Call Program | Raise Event |
|-----------|-------------|--------------|-------------|
| Condition | ✅ | ✅ | ✅ |
| Task ID | ✅ (local) | ❌ | ❌ |
| Program ID | ❌ | ✅ | ❌ |
| Event ID | ❌ | ❌ | ✅ |
| Arguments | ✅ | ✅ | ✅ |
| Result | ✅ | ❌ | ❌ |
| Retain focus | ✅ | ✅ | ❌ |
| Lock | ❌ | ✅ | ❌ |
| Sync data | ✅ | ✅ | ❌ |
| **Wait** | ❌ | ❌ | ✅ |

**Important - Task ID dans Call SubTask :**
- Le Task ID est un numero **LOCAL** dans la tache parente (1, 2, 3...)
- Ce n'est **PAS** le ISN_2 global du fichier XML
- Exemple : Call SubTask avec Task ID=2 → 2eme sous-tache directe

**RaiseEvent (Declenchement d'evenement) :**
- Un handler peut declencher un autre evenement via `Raise Event`
- Permet le chainage d'evenements (ex: Raise Event User Action 4 → declenche fermeture)
- Attribut `Wait` : Yes = attend la fin du handler, No = asynchrone (execution continue)

**Composants Partages**
- REF.ecf : composant de reference contenant les tables partagees
- Visible par tous les projets via Comps.xml

**Media Types (IO)**
| Media | Description | Usage |
|-------|-------------|-------|
| `T` | Text | Export fichier TXT/CSV |
| `G` | Graphic | Impression graphique |
| `S` | Screen | Apercu ecran |
| `R` | Requester | Rapport structure |
| `N` | Null | Traitement silencieux |

**Area Types (Rapports)**
| Area | Zone | Description |
|------|------|-------------|
| `H` | Header | En-tete de page |
| `F` | Footer | Pied de page |
| `N` | Normal | Corps/Detail |
| `G` | Group | Rupture de groupe |

**Controles GUI principaux**
- `CTRL_GUI0_EDIT` : Champ de saisie
- `CTRL_GUI0_STATIC` : Texte statique
- `CTRL_GUI0_PUSH_BUTTON` : Bouton
- `CTRL_GUI0_TABLE` : Tableau/Grille
- `CTRL_GUI0_CHECKBOX` : Case a cocher
- `CTRL_GUI0_RADIO` : Bouton radio
- `CTRL_GUI0_COMBO` : Liste deroulante
- `CTRL_GUI0_SUBFORM` : Sous-formulaire

**Window Types (WindowType val=X)**
| Val | Type | Comportement |
|-----|------|--------------|
| 1 | MDI Child | Fenetre enfant dans conteneur MDI |
| 2 | SDI | Fenetre autonome independante (principale) |
| 3 | Child | Enfant du parent, suit son cycle de vie |
| 5 | Floating | Peut etre deplacee hors du MDI |
| 6 | Modal | **BLOQUANT** - arrete le flux, attend fermeture |
| 8 | Tool | Petite fenetre outil |
| 9 | Fit-to-MDI | S'adapte a l'espace MDI |
| 10 | MDI Child (explicit) | Enfant MDI explicite |

**Ordre d'execution des taches (FONDAMENTAL)**

Source: [Magic Software Knowledge Base](https://kb.magicsoftware.com/articles/bl_Reference/Record-Level-xpa)

```
Task Prefix   → UNE fois a l'initialisation
   │
   │  Le moteur Magic:
   │  1. Ouvre les tables de la base
   │  2. Initialise les variables virtuelles (Init expressions)
   │  3. Cree le DataView (structure) avec Range/Locate
   │  ⚠️ MAIS les RECORDS ne sont PAS encore lus!
   ↓
┌─────────────────────────────────────────────────────┐
│  BOUCLE RECORDS (autant de fois que la selection)  │
│                                                     │
│  1. Fetch record from data source                   │
│  2. Execute data source links (Link Query)          │
│  3. Evaluate End Task condition (si "Before")       │
│       ↓                                             │
│  Record Prefix  → "immediately after the record     │
│                    is read from the data source"    │
│       ↓                                             │
│  Record Main    → Traitement principal/interaction  │
│       ↓                                             │
│  Record Suffix  → Apres commit des modifications    │
└─────────────────────────────────────────────────────┘
   ↓
Task Suffix   → UNE fois a la fin (APRES tous les records)
```

**REGLE CRITIQUE : Disponibilite des donnees**

| Section | Ce qui se passe | Donnees disponibles |
|---------|-----------------|---------------------|
| Task Prefix | Tables ouvertes, Virtuels initialises, DataView CREE | Parametres, variables globales. **PAS de colonnes record!** |
| Record Prefix | Record LU depuis data source, Links executes | **Colonnes DataView disponibles** (Main Source + Link Query) |
| Record Main | Interaction utilisateur | Colonnes DataView disponibles |
| Record Suffix | Apres modifications commitees | Colonnes DataView disponibles |
| Task Suffix | Tous records traites | Derniers resultats, totaux |

**Consequences directes :**
- Un `Update` dans **Task Prefix** ne peut PAS lire les colonnes du DataView - le record n'est pas encore lu!
- Pour acceder a `montant` d'un Link Query, l'Update DOIT etre dans Record Prefix/Main/Suffix
- Les expressions dans Task Prefix servent a l'**INITIALISATION** (valeurs par defaut avant la boucle)
- Si vous voulez lire des donnees record, placez la logique dans Record Prefix ou Suffix

**Erreur classique :** Mettre un Update avec une colonne DataView dans Task Prefix - la valeur sera toujours nulle ou par defaut!

**Fonctions/Events et portee**
- Une fonction ou event doit etre **declare dans la tache ou au-dessus** pour etre "trappee"
- Les handlers d'evenements sont definis au niveau Task (Level="H")
- Les events peuvent etre leves via `RaiseEvent` avec `InternalEventID`

**InternalEventID courants**
| ID | Action |
|----|--------|
| 14 | Exit/Fermer |
| 28 | Exit Application |
| 34 | OK/Valider |
| 42 | Custom Event |
| 219 | Annuler |
| 220 | Continuer |

**Programmes Residents**
- `Resident val="Y"` : Programme charge une fois en memoire, reutilise
- Variables conservees entre les appels
- Performance optimisee pour appels frequents (sous-routines communes)

**Fonctions de Rapport**
- `Page(0,1)` : Numero de page courant
- `Counter(0)` : Compteur global
- `Counter(1)` : Compteur de groupe
- `Str(val, format)` : Formatage nombre

**IMPORTANT : Update With et Expressions (ATTENTION!)**

Dans une operation `Update`, le champ `With: X` fait reference a **Expression X**, PAS a la colonne X !

```
Ligne 2: Update Variable EU  With: 11  Default: 0
                              │
                              └─→ Expression 11 (PAS colonne 11!)
```

**Chaque tache a son propre panneau Expression Rules** avec des expressions numerotees localement :
```
Expression Rules: 22.16.1.1
# | Expression
1 | CA
2 | EY
3 | EZ-1
...
11| 0           ← C'est cette valeur qui sera assignee!
```

**Pour analyser un Update :**
1. Noter le numero `With: X`
2. Ouvrir le panneau "Expression Rules" de la MEME tache
3. Trouver Expression X pour connaitre la valeur reelle
4. Les expressions peuvent contenir : colonnes (CA, EY), litteraux (0, 'F'), formulas (IF(...))

**Erreur frequente :** Confondre `With: 11` avec "colonne 11" du DataView.
C'est TOUJOURS une reference a Expression 11 de la tache courante!

**References de champs avec Generation {X,Y}**

Source: [Task Functions (Magic xpa 3.x)](https://magicsoftware.my.salesforce-sites.com/PublicKnowledge/articles/bl_Reference/Task-Functions-xpa-3x)

| Syntaxe | Signification |
|---------|---------------|
| {0,Y} | Champ Y dans la tache **courante** |
| {1,Y} | Champ Y dans la tache **parente** (generation 1) |
| {2,Y} | Champ Y dans la **grand-parente** (generation 2) |
| {3,Y} | Champ Y dans l'**arriere-grand-parente** (generation 3) |

**Exemple :**
```
IF(Trim({1,2})='COFFRE 2', Str({3,2},'3P0'), Trim({1,2}))
         │                      │
         └── Champ 2 du parent  └── Champ 2 de l'arriere-grand-parent
```

**Update avec Parent :**
```xml
<Update>
  <Parent val="1"/>      <!-- Met a jour generation 1 = parent -->
  <FieldID val="81"/>    <!-- Champ 81 du parent -->
  <WithValue val="11"/>  <!-- Expression 11 locale -->
</Update>
```

**Numérotation des Lignes IDE - VALIDÉ PAR SCREENSHOTS (2025-01-05)**

La numérotation des lignes dans le panneau Logic IDE est **CONTINUE** et inclut plusieurs éléments :

| Élément | Consomme une ligne ? | Exemple |
|---------|---------------------|---------|
| Header de section (Task Prefix, Record Suffix...) | **OUI** | Ligne 1: "Task Prefix" |
| LogicLine (Update, Call, Block...) | **OUI** | Ligne 2: Update Variable |
| Remark (commentaire) | **OUI** | Ligne 3: Remark "Init vars" |
| Ligne vide | **OUI** | Ligne 4: (vide) |
| BLOCK (IF/ELSE) | **OUI** | Ligne 5: IF condition... |
| EndBlock | **OUI** | Ligne 6: EndBlock |

**Ordre des LogicUnits dans une tâche (validé) :**
```
Ligne 1-N    : Task Prefix (header + opérations)
Ligne N+1-M  : Task Suffix (header + opérations)
Ligne M+1-P  : Record Suffix (header + opérations)
Ligne P+1... : Autres LogicUnits
```

**ATTENTION :** L'ordre dans l'IDE dépend de l'ordre dans le XML, PAS du type de LogicUnit !
- Si le XML liste Record Main avant Task Prefix, l'IDE l'affichera dans cet ordre
- Le XML reflète l'ordre ORIGINAL de création, pas l'ordre logique d'exécution

**Exemple réel (VIL Task 22.16.1) - Screenshot :**
```
Ligne  | Type            | Contenu
-------|-----------------|------------------
1      | Task Prefix     | (header de section)
2      | Update          | Variable CA...
3      | Remark          | "Calcul initial"
4      | (vide)          |
5-8    | ...             | autres opérations
9      | Record Suffix   | (header de section)
10-14  | ...             | opérations Record Suffix
14     | Update          | v.Ecart F.D.R. COFFRE2 With: 32
...
18     | Update          | v.Ecart F.D.R. RECEPTION With: 32
```

**FlowIsn ≠ Ligne IDE**

`FlowIsn` dans le XML est un **ID interne unique**, PAS le numéro de ligne IDE !
- FlowIsn peut avoir des valeurs non-séquentielles (329, 301, 302, 197...)
- L'ordre d'apparition dans le XML = ordre d'affichage dans l'IDE
- Pour trouver la ligne IDE : compter les LogicLine dans l'ordre du XML

**Correspondance XML ↔ IDE (Expression IDs) - CONFIRMÉ**

Les IDs d'expression dans le XML peuvent avoir des **trous** (ex: id=1,2,3,13).
L'IDE Magic **RENUMÉROTE SÉQUENTIELLEMENT** pour l'affichage (1,2,3,4).

**Exemple vérifié (Prg 22, Task 22.16.1.1.1):**
| XML id | IDE # | Expression |
|--------|-------|------------|
| id="1" | 1 | EY |
| id="2" | 2 | FC |
| id="3" | 3 | 'F' |
| id="13" | 4 | FP (montant_monnaie FF) |

**Règle:** `WithValue val="4"` dans le XML référence **Expression #4 dans l'IDE** (le numéro affiché).

**Pour analyser un Update:**
1. Ouvrir "Expression Rules" de la tâche dans l'IDE
2. `WithValue val="N"` = Expression #N (numéro affiché dans la colonne #)

**Structure XML du DataView (FONDAMENTAL)**

Le DataView est compose de plusieurs elements XML qui definissent les sources de donnees :

**DATAVIEW_SRC - Source principale du DataView**
```xml
<DATAVIEW_SRC FlowIsn="57" Type="M">
  <Condition val="N"/>
  <Modifier val="B"/>      <!-- B=Browse -->
  <Direction val="C"/>     <!-- C=Current (normale) -->
</DATAVIEW_SRC>
```
| Attribut | Valeurs | Description |
|----------|---------|-------------|
| Type | M | Main Source (table principale) |
| IDX | 1,2,3... | Numero d'index utilise |
| Modifier | B=Browse | Type d'acces |

**LNK - Link Query (jointures vers tables liees)**
```xml
<LNK Direction="A" EVL_CND="R" FlowIsn="67" Key="1" Mode="R" SortType="16" VIEW="8" VIEWS="3">
  <DB comp="2" obj="66"/>      <!-- Table: composant 2, objet 66 -->
  <Expanded val="1"/>
  <Condition val="Y"/>
</LNK>
```
| Attribut | Valeurs | Description |
|----------|---------|-------------|
| Direction | A=Ascending, D=Descending | Sens de lecture |
| EVL_CND | R=Runtime | Evaluation de la condition |
| Key | 1,2... | Numero de cle/index a utiliser |
| Mode | **R, W, A, O** | **Type de lien (voir tableau ci-dessous)** |

**Valeurs Mode pour LNK (CONFIRMEES 2026-01-05) :**
| Mode | Type IDE | Description |
|------|----------|-------------|
| R | Link Query | Lecture seule (jointure en lecture) |
| W | Link Write | Ecriture (modification de la table liee) |
| A | Link Create | Creation (insertion dans la table liee) |
| O | Link O. Join | Left Outer Join (jointure externe gauche) |
| VIEW | 1-N | Position dans la liste des vues |
| VIEWS | N | Nombre total de vues |
| DB comp/obj | | Reference a la table (comp=-1=local, comp=2=REF) |

**Select - Colonnes du DataView**
```xml
<Select FieldID="7" FlowIsn="68" id="7">
  <Column val="1"/>           <!-- Position dans la vue -->
  <Type val="R"/>             <!-- R=Real (table), V=Virtual (variable) -->
  <IsParameter val="N"/>      <!-- Y=Parametre, N=Non -->
  <Locate MAX="1" MIN="1"/>   <!-- Segment de cle pour recherche -->
</Select>
```
| Attribut | Valeurs | Description |
|----------|---------|-------------|
| Type | **V=Virtual** (variable locale), **R=Real** (colonne de table) | Source de la donnee |
| IsParameter | Y/N | Est-ce un parametre d'entree |
| Column | 1-N | Position de la colonne dans la vue |
| Locate MAX/MIN | 1-N | **Segment de cle** (position dans l'index pour la recherche) |

**BLOCK - Blocs conditionnels**
```xml
<BLOCK EndBlock="62" EndBlockSegment="62" FlowIsn="271" Type="I">
  <Condition Exp="6"/>        <!-- Expression de condition -->
</BLOCK>
<!-- ... code si vrai ... -->
<BLOCK EndBlock="68" EndBlockSegment="68" FlowIsn="201" Type="E">
  <!-- ELSE -->
</BLOCK>
<!-- ... code sinon ... -->
<EndBlock id="68"/>
```
| Type | Signification |
|------|---------------|
| I | IF - Debut de bloc conditionnel |
| E | ELSE - Branche alternative |
| EndBlock | ID de la ligne de fin de bloc |

**Locate - Segments de cle pour recherche**

Les segments `Locate MAX/MIN` definissent comment la valeur est utilisee dans l'index :
- `MIN="1" MAX="1"` = Premier segment de la cle composee
- `MIN="2" MAX="2"` = Deuxieme segment
- `MIN="1" MAX="3"` = Segments 1 a 3 (recherche partielle)

Exemple avec cle composee (Societe, Compte, Filiation) :
```xml
<Select FieldID="1"><Locate MAX="1" MIN="1"/></Select>  <!-- Societe -->
<Select FieldID="2"><Locate MAX="2" MIN="2"/></Select>  <!-- Compte -->
<Select FieldID="3"><Locate MAX="3" MIN="3"/></Select>  <!-- Filiation -->
```

**STP - Verify Operation (Messages/Alertes) - CONFIRME 2026-01-05**
```xml
<STP Buttons="K" DefaultButton="1" Image="E" Mode="W" TXT="Message..." TitleTxt="Warning" VR_DISP="B">
  <RetValVar val="31"/>        <!-- Variable pour stocker la reponse -->
  <Condition Exp="19"/>
</STP>
```

**Attribut Buttons (boutons affiches) :**
| XML | IDE | Description |
|-----|-----|-------------|
| O | OK | Bouton OK seul |
| K | OK Cancel | Boutons OK et Annuler |
| N | Yes No | Boutons Oui et Non |

**Attribut Image (icone affichee) :**
| XML | IDE | Description |
|-----|-----|-------------|
| C | Critical | Panneau rouge (erreur critique) |
| E | Exclamation | Triangle jaune (avertissement) |
| Q | Question | Point d'interrogation |
| I | Information | Icone info |
| N | None | Pas d'icone |

**Attribut Mode (type de message) :**
| XML | IDE |
|-----|-----|
| E | Error |
| W | Warning |

**Update vs Evaluate - CONFIRME 2026-01-05**

| Operation | XML | Usage |
|-----------|-----|-------|
| **Update** | `<Update FieldID="X" WithValue="Y"/>` | Affecter une valeur a une variable |
| **Evaluate** | `<Evaluate Exp="X"/>` | Executer une expression pour ses effets de bord (resultat optionnel) |

**Quand utiliser Evaluate :**
- Fonctions sans resultat utile : `Delay()`, `INIPut()`
- Combiner plusieurs fonctions : Return code = True si TOUTES reussissent
- Appeler un programme sans recuperer le retour

```xml
<!-- Update : stocke le resultat dans variable 25 -->
<Update FieldID="25" WithValue="18"/>

<!-- Evaluate : execute l'expression 42, ignore le resultat -->
<Evaluate Exp="42"/>

<!-- Evaluate avec resultat optionnel stocke dans variable 31 -->
<Evaluate Exp="42" Result="31"/>
```
</key_concepts>

<variable_naming_convention>
## Convention de Nommage des Variables dans la DataView

Dans l'IDE Magic, les variables de la DataView sont nommees avec des lettres :

| Plage | Positions | Calcul |
|-------|-----------|--------|
| A-Z | 1-26 | Position directe |
| AA-AZ | 27-52 | 1*26 + (1-26) |
| BA-BZ | 53-78 | 2*26 + (1-26) |
| ... | ... | ... |
| ZA-ZZ | 677-702 | 26*26 + (1-26) |
| AAA-ZZZ | 703+ | 27*26 + ... |

### Decoder un Nom de Variable (IDE → Position)

**Formule pour 2 lettres (AA-ZZ) :**
```
Position = (premiere_lettre - A + 1) * 26 + (deuxieme_lettre - A + 1)
```

**Exemples :**
- `DK` = (D=4)*26 + (K=11) = 104 + 11 = **115**
- `EU` = (E=5)*26 + (U=21) = 130 + 21 = **151**
- `AA` = (A=1)*26 + (A=1) = 26 + 1 = **27**

### Tracer une Variable (XML → IDE)

Pour identifier une variable dans le XML et son nom IDE :

1. **Compter les Select** dans la DataView (Task Prefix + Record Main)
2. L'ordre d'apparition = position dans la DataView
3. Convertir la position en nom de variable

**Exemple de trace :**
```xml
<!-- DataView de la tache -->
<Select FieldID="1">...  <!-- Position 1 = A -->
<Select FieldID="2">...  <!-- Position 2 = B -->
...
<Select FieldID="81">... <!-- Position 115 = DK (si 115eme Select) -->
```

### Correspondance XML ↔ IDE

| XML | IDE | Description |
|-----|-----|-------------|
| `{0,4}` | Variable selon position du Field 4 | Champ de la tache courante |
| `{1,2}` | Variable selon position du Field 2 | Champ de la tache parent |
| `{2,5}` | Variable selon position du Field 5 | Champ de la tache grand-parent |

**Note :** Le FieldID XML (ex: 81) n'est PAS la position dans la DataView. Il faut compter les Select pour trouver la position.
</variable_naming_convention>

<dead_code_detection>
## Detection du Code Desactive (OBLIGATOIRE)

**Principe :** Avant toute analyse ou migration, identifier et EXCLURE le code mort pour optimiser le travail.

### Programmes Vides (ISEMPTY_TSK)
Dans `ProgramHeaders.xml`, les programmes marques avec `ISEMPTY_TSK="1"` sont des coquilles vides :

```xml
<Header ISEMPTY_TSK="1" ISN_2="1" LastIsn="1" id="4">
  <Description fld="1" val="Programme vide"/>
</Header>
```

**Programmes vides identifies (ADH) :**
| Prg ID | Raison |
|--------|--------|
| 4, 19, 26 | Placeholders non implementes |
| 41, 88, 156 | Fonctionnalites abandonnees |
| 176, 186, 221 | Code obsolete |

### Lignes de Logique Desactivees
Dans les fichiers `Prg_XXX.xml`, les lignes avec `<Disabled val="1"/>` sont desactivees :

```xml
<LogicLine id="5">
  <Operation val="CallTask"/>
  <Disabled val="1"/>           <!-- LIGNE DESACTIVEE -->
  <TaskID comp="-1" obj="34"/>
</LogicLine>
```

**Detection via Grep :**
```bash
# Compter les programmes avec lignes desactivees
grep -l "Disabled val=\"1\"" Prg_*.xml | wc -l

# Compter total de lignes desactivees
grep -c "Disabled val=\"1\"" Prg_*.xml
```

**Statistiques ADH (2025-01-04) :**
- 70 fichiers contiennent des lignes desactivees
- 354 lignes de logique desactivees au total
- Principalement des CallTask et Update abandonnes

### Regles d'Exclusion
1. **Ne JAMAIS migrer** un programme avec `ISEMPTY_TSK="1"`
2. **Ignorer** les operations avec `<Disabled val="1"/>`
3. **Signaler** dans la matrice de couverture (colonne "Statut")
4. **Documenter** la raison si connue (obsolete, remplace par, etc.)

### Integration dans /magic-analyze
```
/magic-analyze 162
...
[INFO] 1 ligne desactivee detectee (CallTask vers Prg_34)
[SKIP] Operation ignoree - code desactive
```

### Impact sur la Couverture
| Statut | Description | Action |
|--------|-------------|--------|
| EMPTY | Programme vide (ISEMPTY_TSK) | Exclure du scope |
| DISABLED | Lignes desactivees | Ignorer ces lignes |
| ACTIVE | Code actif | Migrer normalement |
| PARTIAL | Mix actif/desactive | Migrer uniquement l'actif |
</dead_code_detection>

<debugging_troubleshooting>
## Debugging et Troubleshooting (Bonnes Pratiques)

Cette section documente les techniques d'analyse de bugs dans les programmes Magic, basees sur des cas reels.

### Expressions Non Referencees (Dead Expressions)

**Probleme :** Une expression peut exister dans le XML mais n'etre JAMAIS utilisee.

**Cas reel (VIL Prg_558) :**
```xml
<!-- Expression 38 existe mais n'est JAMAIS referencee -->
<Expression id="38">
  <ExpSyntax val="{0,4}&lt;>{0,81}"/>  <!-- FDR Initial <> FDR Previous -->
</Expression>

<!-- Les Updates utilisent Expression 32 au lieu de 38 -->
<Update FlowIsn="329">
  <FieldID val="78"/>
  <WithValue val="32"/>   <!-- BUG! Devrait etre 38 -->
</Update>
```

**Detection :**
```bash
# 1. Trouver toutes les expressions definies
grep -o 'Expression id="[0-9]*"' Prg_XXX.xml | sort -u

# 2. Verifier quelles expressions sont referencees
grep -E 'WithValue val="|Condition Exp="' Prg_XXX.xml | grep -oP '\d+' | sort -u

# 3. Comparer les deux listes - les expressions absentes sont du code mort
```

**Regle :** Toujours verifier qu'une expression est effectivement utilisee avant de conclure sur son role.

### Fonction ExpCalc (Expression Calling Expression)

**Syntaxe :** `ExpCalc('N'EXP)` appelle l'Expression N comme sous-expression.

```xml
<Expression id="32">
  <!-- Somme de champs + resultat d'Expression 8 -->
  <ExpSyntax val="{0,4}+ExpCalc('8'EXP)+{0,8}+{0,10}"/>
</Expression>

<Expression id="8">
  <!-- Sous-calcul appele par Expression 32 -->
  <ExpSyntax val="{0,3}*{0,7}"/>
</Expression>
```

**Implications :**
1. Tracer TOUTES les expressions appelees via ExpCalc
2. Les expressions ne sont pas toujours utilisees directement
3. L'ordre d'evaluation suit les appels ExpCalc imbriques

### Elements Remark comme Indices

**Les Remark sont des commentaires precieux** laisses par les developpeurs originaux :

```xml
<Remark>FDR Final lors de la derniere fermeture</Remark>
<Select FieldID="81" FlowIsn="266" id="81">
  <Column val="20"/>
  <Type val="V"/>  <!-- Variable virtuelle -->
</Select>
```

**Bonnes pratiques :**
1. Lire TOUS les Remark avant d'analyser un bloc de code
2. Le Remark decrit souvent l'INTENTION, pas l'implementation
3. Comparer le Remark avec l'expression reellement utilisee peut reveler des bugs

### Tracage WithValue (Methodologie)

**Objectif :** Verifier que le champ utilise la BONNE expression.

**Etapes :**
1. Identifier le champ d'affichage (ex: Field 78 pour les etoiles)
2. Trouver tous les Updates de ce champ
3. Noter les WithValue references
4. Lire les expressions correspondantes
5. Comparer avec la regle metier attendue

**Exemple de trace :**
```
Regle metier : Etoiles si FDR Initial <> FDR Previous

Recherche:
  → Field 78 = Variable pour stocker le flag etoiles
  → Update FieldID="78" WithValue="32"
  → Expression 32 = {0,4}+ExpCalc('8'EXP)+... (calcul complexe)
  → Expression 38 = {0,4}<>{0,81} (comparaison simple)

Conclusion : Expression 32 ne correspond PAS a la regle!
             Expression 38 correspond EXACTEMENT mais n'est pas utilisee.
             → BUG confirme: WithValue devrait etre 38
```

### Checklist Debugging Bug Metier

| Etape | Action | Verification |
|-------|--------|--------------|
| 1 | Identifier la regle metier | Documentation ou Remark |
| 2 | Trouver le champ d'affichage | FieldID dans les expressions d'affichage |
| 3 | Tracer les Updates | grep FieldID="N" |
| 4 | Lire les WithValue | Expression referencee |
| 5 | Comparer a la regle | Match ou mismatch? |
| 6 | Chercher alternatives | Expressions non referencees |
| 7 | Confirmer le fix | WithValue correct identifie |

### Pieges Courants

| Piege | Description | Solution |
|-------|-------------|----------|
| Expression morte | Expression creee mais jamais connectee | Verifier WithValue/Condition |
| Mauvaise renumérotation | IDE renumérote sequentiellement, XML garde les ID originaux | Tracer par ID XML, pas numero IDE |
| ExpCalc masque | Expression utilisee indirectement via ExpCalc | Tracer toute la chaine |
| Remark obsolete | Commentaire ne correspond plus au code | Se fier au code, pas au Remark |
| BLOCK conditionnel | Code execute uniquement si condition vraie | Tracer le chemin d'execution |

### Format de Communication des Corrections (OBLIGATOIRE)

**Ne JAMAIS communiquer en termes XML** (lignes, id). Utiliser le format IDE Magic :

**Format standard :**
```
Tâche XX.YY.Z.W ligne NN, remplacer expression AA (description_AA) par BB (description_BB)
```

**Exemple reel (bug VIL etoiles F.D.R.) :**
```
Tâche 22.16.1 ligne 14, remplacer expression 32 par 38 (v.FDR_Initial <> v.FDR_Previous)
Tâche 22.16.1 ligne 18, remplacer expression 32 par 38 (v.FDR_Initial <> v.FDR_Previous)
```

**Elements du format :**
| Element | Source | Exemple |
|---------|--------|---------|
| Tâche XX.YY.Z.W | Hierarchie dans l'IDE (titre de fenetre) | 22.16.1 |
| ligne NN | Numero de ligne AFFICHE dans l'IDE (colonne gauche) | ligne 14 |
| expression AA | Numero affiche dans colonne "With:" de l'IDE | expression 32 |
| (description) | Resume lisible de l'expression | (v.FDR_Initial <> v.FDR_Previous) |

**ATTENTION CRITIQUE - Expressions PROGRAMME vs TACHE :**

| Niveau | Scope | Explication |
|--------|-------|-------------|
| Programme (Prg_XXX.xml) | Global | Expressions partagees par toutes les taches |
| Tache (Task XX.YY.Z) | Local | Expressions PROPRES a cette tache, numerotation SEPAREE |

**ERREUR FREQUENTE :** Lire Expression id="38" dans le XML programme et croire qu'elle existe dans la tache.
CHAQUE TACHE a sa propre liste d'expressions avec sa propre numerotation !

**Correspondance XML vs IDE :**
| XML | IDE | Explication |
|-----|-----|-------------|
| FlowIsn="329" | ≠ ligne 329 | FlowIsn est un ID interne, PAS le numero de ligne |
| Expression id="38" (programme) | ≠ Expression 38 (tache) | SCOPES DIFFERENTS ! |
| LogicLine id="5" | ligne 5 ? | Verifier visuellement dans l'IDE |

**MAPPING EXPRESSIONS - XML id vs Position IDE (VALIDÉ PAR SCREENSHOTS) :**

**RÈGLE FONDAMENTALE :** `WithValue` dans le XML référence le **numéro séquentiel IDE**, PAS l'attribut XML id !

L'IDE Magic renumérote les expressions **SÉQUENTIELLEMENT** (1,2,3...) dans le panneau "Expression Rules".
Le XML conserve les attributs `id` originaux qui peuvent avoir des **TROUS**.

**Correspondance confirmée :**
```
WithValue val="N" dans XML  →  Expression #N dans l'IDE (colonne With:)
                            →  Expression à la Nème position dans "Expression Rules"
```

**Exemple vérifié (VIL Prg_558, Task 22.16.1) - Screenshots 2025-01-05 :**
```
IDE "Expression Rules: 22.16.1"
# | Expression              | Description
---+-------------------------+--------------------
31 | DK+ExpCalc('10'EXP)+... | Somme complexe (INCORRECTE pour les étoiles)
32 | DK<>EU                  | FDR Initial <> FDR Previous (CORRECTE!)
```

L'Update avec `With: 32` dans l'IDE utilise **Expression 32** = `DK<>EU`, qui EST la formule correcte !

**Méthode de mapping XML → IDE :**
1. Ouvrir le panneau "Expression Rules: XX.YY.Z" de la TÂCHE concernée
2. Le numéro affiché dans la colonne "#" = numéro IDE
3. `WithValue val="N"` dans XML = Expression #N dans ce panneau

**Ce que le XML conserve (pour info) :**
```xml
<!-- Les id XML peuvent avoir des trous (1,2,3,30,6,7,35...) -->
<Expression id="32">...  <!-- Peut être IDE #31 ou autre selon l'ordre -->
<Expression id="38">...  <!-- Peut être IDE #32 ou autre selon l'ordre -->
```

**ATTENTION :** L'attribut `id` dans le XML n'est PAS le numéro IDE !

**Vocabulaire pour les corrections :**
| Action | Format | Exemple |
|--------|--------|---------|
| Utiliser existante | "utiliser expression XX (existante)" | utiliser expression 32 (existante) |
| Modifier existante | "modifier expression XX pour [formule]" | modifier expression 32 pour DK<>DL |
| Creer nouvelle | "creer expression XX : [formule]" | creer expression 35 : v.FDR_Init<>v.FDR_Prev |

**Regles :**
1. **TOUJOURS verifier dans l'IDE** la liste des expressions de la TACHE concernee
2. **Ligne** = Numero AFFICHE dans la colonne de gauche de l'IDE
3. **Expression** = Numero dans la fenetre "Expression Rules: XX.YY.Z"
4. **Ne JAMAIS deduire** depuis le XML programme seul - ouvrir l'IDE !
</debugging_troubleshooting>

<chunked_analysis>
## Analyse par Tronçons (Fichiers Volumineux)

**Problème :** Les fichiers Prg_XXX.xml peuvent dépasser 256KB (limite de lecture), parfois jusqu'à 500KB+.

**Solution :** Découper l'analyse en tronçons séquentiels.

### Stratégie de découpage

| Tronçon | Lignes | Contenu | Objectif |
|---------|--------|---------|----------|
| 1 | 1-150 | Header, DB, Columns | Paramètres, tables |
| 2 | 150-350 | Information, Range | Index, filtres |
| 3 | Variable | TaskLogic | Logique métier |
| 4 | Variable | Expressions | Formules |
| 5+ | Variable | Sous-tâches | Tâches imbriquées |

### Commandes de découpage

```bash
# Tronçon 1 : Header et structure
Read file_path=Prg_XXX.xml offset=1 limit=150

# Tronçon 2 : Recherche ciblée CallTask
Grep pattern="CallTask|CallProg" path=Prg_XXX.xml

# Tronçon 3 : Sous-tâches
Grep pattern="Header Description=.*ISN_2" path=Prg_XXX.xml

# Tronçon 4 : Expressions
Read file_path=Prg_XXX.xml offset=<ligne_expressions> limit=200
```

### Workflow recommandé

1. **Évaluer la taille** : `dir Prg_XXX.xml` → Si > 100KB, découper
2. **Cartographier** : Grep pour Header/ISN_2 (nombre de sous-tâches)
3. **Analyser par priorité** :
   - D'abord : Structure principale (tronçon 1)
   - Ensuite : CallTask (dépendances)
   - Puis : Sous-tâches clés
4. **Consolider** : Synthèse dans analysis.md

### Exemple réel : Prg_69 (466KB, 12 sous-tâches)

```
Tronçon 1 (lignes 1-150) → Paramètres identifiés (12)
Tronçon 2 (Grep CallTask) → 40 appels externes
Tronçon 3 (Grep ISN_2) → 12 sous-tâches listées
Tronçon 4 (lignes 8590-8900) → Sous-tâche 6 "Choix Edition"
```

### Règles

- **JAMAIS** tenter de lire un fichier > 256KB en une fois
- **TOUJOURS** commencer par cartographier avec Grep
- **PRIORISER** les sections pertinentes au ticket/problème
- **DOCUMENTER** les tronçons analysés dans analysis.md
</chunked_analysis>

<success_criteria>
- Fichiers XML Magic correctement parses sans erreur
- Arborescence des programmes reconstruite fidelement
- Logique metier extraite et documentee
- Dependances entre programmes identifiees
- Code cible genere compilable/executable
- Comportement fonctionnel equivalent preserve
</success_criteria>

<learning_methodology>
**Approche iterative :**
1. Analyser un cas simple (Browse basique)
2. Comparer avec l'ecran de developpement Magic reel
3. Corriger et enrichir les references du skill
4. Monter progressivement en complexite

**Niveaux de progression :**
- Niveau 1 : Programmes Browse simples
- Niveau 2 : Programmes avec CallTask et parametres
- Niveau 3 : Programmes avec expressions IF/CASE complexes
- Niveau 4 : Editions et exports complets
</learning_methodology>

<flow_driven_migration>
## Methodologie Flow-Driven (OBLIGATOIRE)

**Principe fondamental :** Migrer en suivant la cinematique REELLE de l'application, pas les modules arbitraires.

```
Point d'entree (MainProgram="Y") → CallTask → Sous-appels → ... jusqu'aux feuilles
```

### Regles strictes
1. **Ne coder QUE ce qui est appele** depuis le flux principal
2. **Chaque ecran doit etre accessible** depuis la navigation
3. **Pas de code orphelin** (endpoints ou fonctions non utilises)
4. **Tester avec donnees reelles** avant de passer a l'ecran suivant

### Etapes de migration
1. **Identifier le MainProgram** : Chercher `MainProgram="Y"` dans ProgramHeaders.xml
2. **Extraire l'arbre d'appels** : Parser tous les `CallTask` recursivement
3. **Mapper les ISN_2** : Chaque sous-tache (ISN_2) = un ecran ou workflow
4. **Migrer dans l'ordre d'execution** : Task Prefix → Record Main → Task Suffix
5. **Valider chaque branche** : Test fonctionnel avant de passer a la suivante

### Structure d'un orchestrateur Magic (ex: Prg_121)
```
Prg_121 (Orchestrateur)
├── ISN_2=1  : Initialisation (Task Prefix)
├── ISN_2=7  : Pilotage/Menu principal
├── ISN_2=9  : Ouverture Caisse
├── ISN_2=15 : Fermeture Caisse
├── ISN_2=17 : Apport Coffre
├── ISN_2=18 : Apport Produit
├── ISN_2=19 : Remise au Coffre
├── ISN_2=21 : Historique
├── ISN_2=22 : Consultation
├── ISN_2=23 : Reimprimer Tickets
├── ISN_2=24 : Pointage AppRem
├── ISN_2=25 : Sessions Ouvertes
└── ISN_2=27-28 : Calculs Sessions
```

### Anti-patterns a EVITER
- ❌ Creer des endpoints "au cas ou"
- ❌ Coder des ecrans non accessibles depuis le menu
- ❌ Migrer par module sans suivre le flux utilisateur
- ❌ Implementer des fonctions jamais appelees
- ❌ Dupliquer du code pour "completude"

### Validation par phase
Chaque phase doit etre validee AVANT de passer a la suivante :
1. **Build OK** - Compilation sans erreur
2. **Tests OK** - 100% des tests passent
3. **UI accessible** - Ecran reachable depuis navigation
4. **Donnees reelles** - Teste avec base de production
5. **Flux complet** - Workflow de bout en bout fonctionnel

### Commande recommandee
```
/magic-flow <prg_id>   # Extraire l'arbre d'appels d'un programme
```

### Tracage du flux de demarrage (OBLIGATOIRE avant migration UI)

**Etape 1 : Identifier le MainProgram**
```bash
grep -r 'MainProgram="Y"' *.xml
# → Generalement Prg_1.xml
```

**Etape 2 : Extraire les CallTask sequentiels**
```bash
grep -E "CallTask|TaskID" Prg_1.xml | head -50
# → Liste ordonnee des appels
```

**Etape 3 : Mapper les WindowTypes**
Pour chaque programme appele, verifier :
```bash
grep "WindowType" Prg_XXX.xml
# val="2" (SDI) = ecran principal visible
# val="6" (Modal) = popup bloquant
# val="1" (MDI Child) = sous-fenetre
```

**Etape 4 : Construire l'arbre d'appels COMPLET**
```
Main (Prg_1)
  └→ Prg_2 (init silencieux, pas d'UI)
  └→ Prg_165 "Start" (WindowType=1, init visible)
  └→ Prg_328 (verification, pas d'UI)
  └→ Prg_162 "Menu caisse GM" (MENU INTERMEDIAIRE - pas de form SDI visible!)
      └→ Prg_121 "CA0142 - Gestion de la caisse" (WindowType=2, SDI) ← PREMIER ECRAN VISIBLE
```

**ATTENTION : Menu Intermediaire vs Ecran Visible**

Un programme peut etre un "menu intermediaire" qui:
1. N'affiche PAS de form SDI visible
2. Execute immediatement un CallTask vers un autre programme
3. Sert de routeur/dispatcher

**Comment detecter un menu intermediaire:**
```bash
# 1. Verifier si le programme a un form SDI (WindowType=2)
grep "WindowType.*val=\"2\"" Prg_XXX.xml
# Si AUCUN resultat → c'est probablement un menu intermediaire

# 2. Chercher les CallTask immediats
grep -A5 "CallTask" Prg_XXX.xml | head -20
# Si CallTask dans Task Prefix → appel immediat au demarrage
```

**Regle d'or :** Suivre TOUTE la chaine de CallTask jusqu'a trouver le programme
avec un form SDI (WindowType=2) visible - c'est LUI le vrai ecran!

**Etape 5 : Valider visuellement (OBLIGATOIRE)**
- Comparer avec une capture d'ecran de l'application originale
- Le TITRE de l'ecran (ex: "CA0142") doit correspondre au Public Name du programme
- Ne migrer que ce qui est REELLEMENT affiche dans le flux

### Tracage inverse (OBLIGATOIRE avant migration partielle)

**Principe :** Quand on migre un programme SPECIFIQUE, remonter a l'INVERSE jusqu'au Main pour :
1. Connaitre les variables initialisees avant l'appel
2. Comprendre le contexte d'execution
3. Identifier les parametres passes

**Exemple :**
```
Je dois migrer Prg_121 (CA0142 - Gestion de la caisse)
  ↑
Prg_162 l'appelle (Menu caisse GM) → quels parametres sont passes ?
  ↑
Prg_1 l'appelle (Main) → contexte initial complet
```

**Note :** Les 17 parametres de Prg_121 sont initialises par Prg_162 :
- Param 1-6 : Identifiants (societe, utilisateur, terminal)
- Param 7-12 : Etat session (ouvert/ferme, coffre)
- Param 13-17 : Configuration (devise, masques)

**Methode :**
```bash
# Trouver qui appelle mon programme
grep -r "obj=\"162\"" *.xml
# → Trouve Prg_1.xml et d'autres

# Pour chaque appelant, remonter recursivement
grep -r "obj=\"[ID_APPELANT]\"" *.xml
# → Jusqu'a atteindre MainProgram
```

**Variables a tracer :**
- Parametres passes via TSK_PARAMS
- Variables globales (Definition="4")
- Variables de session (utilisateur, terminal, societe)
- Resultats de sous-taches precedentes
</flow_driven_migration>

<analysis_output_format>
## Format de Sortie d'Analyse (OBLIGATOIRE)

Lors d'une analyse de bug ou d'une recommandation de correction, utiliser le format Magic IDE.

### Format Localisation Magic IDE
```
[Position Programme].[Tache].[SousTache].[SousSousTache] Ligne [N]
```

**Structure arborescente :**
- Le premier chiffre = position du programme dans la liste (pas l'ID interne)
- Chaque niveau suivant = position dans l'arborescence des taches
- La ligne = numero de ligne dans le panneau Logic

**Exemple :**
```
22.16.1.1 Ligne 2
   │  │ │ │
   │  │ │ └─ Update FDR Precedent (sous-sous-tache)
   │  │ └─── Reception (sous-tache)
   │  └───── Edition (tache)
   └──────── Print recap sessions (programme position 22)
```

### Format Tableau de Corrections
| Localisation | Ligne | Operation | Actuel | Correct |
|--------------|-------|-----------|--------|---------|
| 22.16.1.1 | 2 | Update | v.FDR = quand | v.FDR = montant |
| 22.16.1 | 45 | Update | Expression 32 | Expression 38 |

### Format Expression
Toujours presenter DEUX versions :
1. **Syntaxe Magic** : `{0,18} <> {0,81}`
2. **Notation Lisible** : `v.total FDR Init <> v.FDR Final veille`

### Tableau de Mapping Variables (si applicable)
| Variable | Description | Source |
|----------|-------------|--------|
| v.total FDR Init | FDR Initial du jour | Calcule dans tache |
| v.FDR Final veille | FDR Final de la veille | Sous-tache Update FDR |

### IMPORTANT
- **NE PAS** utiliser les numeros de ligne XML (17788, 18707...)
- **NE PAS** utiliser les ID internes (Prg_558, ISN_2=56...)
- **TOUJOURS** utiliser la notation arborescente Magic IDE
</analysis_output_format>

<settings_repositories>
## Settings Repositories (Fonts/Colors) - Valide Session 6

Les attributs `Font` et `Color` dans le XML referent les repositories Settings globaux.

### Font Repository

**Fichier source** : `C:\Migration\XPA\Env\PMS\fnt_std_XPA.fre`

**Structure :**
| Onglet | Plage # | Usage |
|--------|---------|-------|
| Application | 1-~23 | Fonts projet personnalisees |
| Internal | 24-~151 | Fonts runtime (dialogs, boutons) |
| Studio | 152+ | Fonts IDE (HTML, headers) |

**Mapping XML → IDE :**
```xml
<Control>
  <Font val="131"/>   <!-- → Settings > Fonts > #131 -->
</Control>
```

**Exemples valides :**
| XML val | Onglet | Name | Font | Style | Size |
|---------|--------|------|------|-------|------|
| 8 | Application | Unused | MS Sans Serif | | 8 |
| 33 | Internal | Fixed Size Font | Arial | | 10 |
| 131 | Internal | User Defined Font | MS Sans Serif | B | 8 |
| 167 | Studio | Small Font | Small Fonts | | 6 |

**Style codes :**
| Style IDE | Signification |
|-----------|---------------|
| (vide) | Regular |
| B | Bold |
| I | Italic |
| BI | Bold Italic |

### Color Repository

**Fichier source** : `C:\Migration\XPA\Env\PMS\clr_std_XPA.fre`

**Mapping XML → IDE :**
```xml
<Control>
  <Color val="1"/>   <!-- → Settings > Colors > #1 -->
</Control>
```

**Couleurs standard :**
| # | Name | Usage |
|---|------|-------|
| 1 | Window's Default | Fond fenetre |
| 2 | Control's Default | Fond controles |
| 3 | Default Free Text | Texte libre |
| 4 | Default Help Window | Aide |
| 5 | Default 3D Effect | Effet 3D |
| 6 | Default Print Form Color | Impression |
| 7 | Default Hyperlink | Liens |

### Regles

1. **Numerotation globale** : Les numeros sont uniques a travers tous les onglets (Application + Internal + Studio)
2. **Pas de gaps** : La numerotation est continue
3. **Reference directe** : `Font val="N"` ou `Color val="N"` → Entree #N dans le repository correspondant
</settings_repositories>
