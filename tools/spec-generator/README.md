# Spec Generator - APEX 4-Phase Workflow

> Pipeline de generation et maintenance des specifications V4.0 ADH

## Vue d'ensemble du Workflow

```
================================================================================
                    WORKFLOW SPECIFICATION PROGRAMME MAGIC
              Pipeline 4 phases - Approx. 15-30 secondes par programme
================================================================================

  INPUT                                                                   OUTPUT
    |                                                                       |
    |   +==============+   +==============+   +==============+   +=================+
    |   |   PHASE 1    |   |   PHASE 2    |   |   PHASE 3    |   |    PHASE 4      |
    v   |  DISCOVERY   |==>|   MAPPING    |==>|   DECODE     |==>|   SYNTHESIS     |
        |              |   |              |   |              |   |                 |
 ADH    | Position IDE |   | Tables R/W/L |   | Expressions  |   | Spec finale     |
 IDE    | Call Graph   |   | Parametres   |   | Regles metier|   | 3 onglets       |
 XXX    | Orphan check |   | Variables    |   | Algorigramme |   | Mermaid         |
        |              |   |              |   |              |   |                 |
        +==============+   +==============+   +==============+   +=================+
```

## Scripts Disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| **`Generate-SpecV40.ps1`** | **Orchestrateur principal 4 phases** | Generation spec complete |
| `Batch-GenerateAdhV40.ps1` | Generation batch tous les ADH | Regeneration massive |
| `Generate-CallGraph.ps1` | Diagramme Mermaid callers/callees | Analyse dependances |
| `Populate-SpecData.ps1` | Peuple specs avec donnees MCP | Enrichissement |
| `Generate-MigrationBlueprint.ps1` | Genere squelette C# depuis spec | Migration code |
| `Generate-TestsFromSpec.ps1` | Genere tests xUnit/Vitest | Tests auto |

## Usage Principal

### Generer une spec V4.0

```powershell
# Generation standard
.\Generate-SpecV40.ps1 -Project ADH -IdePosition 237

# Avec sortie verbose
.\Generate-SpecV40.ps1 -Project ADH -IdePosition 237 -VerboseOutput

# Forcer regeneration
.\Generate-SpecV40.ps1 -Project ADH -IdePosition 237 -Force

# Sans phase decode (plus rapide)
.\Generate-SpecV40.ps1 -Project ADH -IdePosition 237 -SkipDecode
```

### Generer en batch

```powershell
# Tous les programmes ADH
.\Batch-GenerateAdhV40.ps1

# Range specifique
.\Batch-GenerateAdhV40.ps1 -StartIDE 1 -EndIDE 50
```

## Phases du Workflow

### PHASE 1: DISCOVERY (Cartographier le terrain)

| Etape | Action | Outil |
|-------|--------|-------|
| 1.1 | Identification programme | KbIndexRunner spec-data |
| 1.2 | Localisation XML | Recherche fichier source |
| 1.3 | Verification ECF | Liste ADH.ecf |
| 1.4 | Verification orphelin | 4 criteres |

**Criteres orphelin:**
1. Callers actifs > 0 → NON ORPHELIN
2. PublicName defini → NON ORPHELIN
3. Composant ECF → NON ORPHELIN
4. Main program (IDE 1) → NON ORPHELIN

### PHASE 2: MAPPING (Documenter les donnees)

| Etape | Action | Donnees extraites |
|-------|--------|-------------------|
| 2.1 | Tables | ID, Nom physique/logique, Access (R/W/L), Count |
| 2.2 | Parametres | Variable, Nom, Type, Direction (IN/OUT) |
| 2.3 | Variables | Locales (lettres), Globales (VG*) |

### PHASE 3: DECODE (Comprendre la logique)

| Etape | Action | Resultat |
|-------|--------|----------|
| 3.1 | Expressions | Liste des 10 premieres |
| 3.2 | Regles metier | Codes RM-001, RM-002... |

### PHASE 4: SYNTHESIS (Produire la spec)

| Etape | Action | Section spec |
|-------|--------|--------------|
| 4.1 | Tables section | TAB:Technique 2.2 |
| 4.2 | Parametres section | TAB:Technique 2.3 |
| 4.3 | Diagrammes Mermaid | Call chain + Callees |
| 4.4 | Assemblage final | Fichier .md 3 onglets |

## Structure Spec V4.0

```
<!-- TAB:Fonctionnel -->
## SPECIFICATION FONCTIONNELLE
- 1.1 Objectif metier
- 1.2 Regles metier
- 1.3 Flux utilisateur
- 1.4 Cas d'erreur
- 1.5 Dependances ECF

<!-- TAB:Technique -->
## SPECIFICATION TECHNIQUE
- 2.1 Identification
- 2.2 Tables
- 2.3 Parametres
- 2.4 Algorigramme
- 2.5 Expressions cles
- 2.6 Statistiques

<!-- TAB:Cartographie -->
## CARTOGRAPHIE APPLICATIVE
- 3.1 Chaine d'appels depuis Main
- 3.2 Callers directs
- 3.3 Callees (3 niveaux)
- 3.4 Composants ECF utilises
- 3.5 Verification orphelin
```

## Score de Complexite

| Score | Niveau | Interpretation |
|-------|--------|----------------|
| < 300 | FAIBLE | Programme simple, migration directe |
| 300-1000 | MOYENNE | Programme standard, attention aux dependances |
| > 1000 | HAUTE | Programme complexe, planification detaillee requise |

**Formule:** `Score = (Tasks * 10) + LogicLines + (Tables * 5) + Expressions`

## Prerequis

- .NET 8 SDK installe
- Knowledge Base indexee (`~/.magic-kb/knowledge.db`)
- Sources Magic disponibles (`D:\Data\Migration\XPA\PMS\`)

### Verifier la KB

```powershell
dotnet run --project tools/KbIndexRunner -- validate
```

### Re-indexer si necessaire

```powershell
dotnet run --project tools/KbIndexRunner -- "D:\Data\Migration\XPA\PMS"
```

## Troubleshooting

### KB non initialisee

```
ERROR: Knowledge Base not initialized
```

**Solution:** Executer l'indexation
```powershell
dotnet run --project tools/KbIndexRunner
```

### Programme non trouve

```
{"error": "Program ADH IDE 999 not found"}
```

**Solution:** Verifier que le programme existe dans la KB
```powershell
dotnet run --project tools/KbIndexRunner -- query "ADH 999"
```

### Spec deja existante

```
SKIP - V4.0 spec already exists. Use -Force to regenerate.
```

**Solution:** Utiliser le flag `-Force`
```powershell
.\Generate-SpecV40.ps1 -Project ADH -IdePosition 237 -Force
```

## Composants ECF ADH.ecf

Les programmes suivants sont partages via ADH.ecf et ne sont jamais orphelins:

| IDE | Public Name | Description |
|-----|-------------|-------------|
| 27 | Separation | Separation compte |
| 28 | Fusion | Fusion compte |
| 53 | EXTRAIT_EASY_CHECKOUT | Easy checkout extrait |
| 54 | FACTURES_CHECK_OUT | Factures checkout |
| 64 | SOLDE_EASY_CHECK_OUT | Solde easy checkout |
| 65 | EDITION_EASY_CHECK_OUT | Edition easy checkout |
| 69 | EXTRAIT_COMPTE | Extrait compte |
| 70-76 | EXTRAIT_* | Extraits divers |
| 84 | CARACT_INTERDIT | Caracteres interdits |
| 97 | Saisie_facture_tva | Facture TVA |
| 111 | GARANTIE | Garantie |
| 121 | Gestion_Caisse_142 | Gestion caisse |
| 149 | CALC_STOCK_PRODUIT | Stock produit |
| 178-181 | GET_PRINTER / SET_LIST / RAZ | Impression |
| 192 | SOLDE_COMPTE | Solde compte |
| 208-210 | OPEN/CLOSE_PHONE_LINE | Telephone |
| 229 | PRINT_TICKET | Impression ticket |
| 243 | DEVERSEMENT | Deversement |

## Historique des versions

| Version | Date | Changements |
|---------|------|-------------|
| 4.0 | 2026-01-28 | Workflow APEX 4 phases, 3 onglets |
| 3.5 | 2026-01-27 | TAB markers + Mermaid |
| 3.0 | 2026-01-26 | Callees 3 niveaux |
| 2.0 | 2026-01-25 | Structure initiale |

---

*Derniere mise a jour: 2026-01-28 - Workflow APEX 4-Phase*
