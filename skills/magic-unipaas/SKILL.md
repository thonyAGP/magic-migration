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
</key_concepts>

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
</flow_driven_migration>
