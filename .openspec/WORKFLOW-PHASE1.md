# Phase 1: Foundation Hybride - Workflow

> Documentation du workflow spec V2.0 + annotations YAML

## Vue d'ensemble

La Phase 1 met en place un systeme hybride permettant de combiner :
- **Specs techniques V2.0** : Generees automatiquement depuis les XML Magic
- **Annotations YAML** : Informations fonctionnelles maintenues manuellement

## Infrastructure

### Fichiers de configuration

| Fichier | Role |
|---------|------|
| `.openspec/specs/*.md` | Specs V2.0 generees (322 programmes ADH) |
| `.openspec/annotations/*.yaml` | Annotations fonctionnelles |
| `.openspec/renders/*.md` | Specs V2.1 Enhanced (merged output) |
| `.openspec/templates/SPEC-V3-TEMPLATE.md` | Template Handlebars pour V3 (KB-based) |
| `.openspec/cross-project-callers.json` | Registry des programmes ECF partages |

### Scripts disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| `Generate-ProgramSpecV2.ps1` | Genere spec V2.0 depuis XML | `.\Generate-ProgramSpecV2.ps1 -Project ADH -IDE 121` |
| `Merge-SpecWithAnnotations.ps1` | Merge V2 + annotations | `.\Merge-SpecWithAnnotations.ps1 -Project ADH -IDE 121` |
| `Extract-BusinessRules.ps1` | Extrait regles metier | `.\Extract-BusinessRules.ps1 -Project ADH -IDE 238 -OutputYaml` |
| `Render-Spec.ps1` | Rendu V3.0 complet (requiert KB) | `.\Render-Spec.ps1 -Project ADH -IDE 238` |
| `Sync-SpecsToKb.ps1` | Indexe specs dans KB | `.\Sync-SpecsToKb.ps1 -Force` |

## Workflow quotidien

### 1. Generer une spec V2.0

```powershell
cd D:\Projects\ClubMed\LecteurMagic\tools\spec-generator
.\Generate-ProgramSpecV2.ps1 -Project ADH -IDE 121
```

**Output**: `.openspec/specs/ADH-IDE-121.md`

### 2. Creer des annotations

Copier le template et editer :

```powershell
Copy-Item ".openspec\annotations\TEMPLATE.yaml" ".openspec\annotations\ADH-IDE-121.yaml"
```

Editer le fichier YAML avec :
- **functional.objective** : Qui/Quoi/Pourquoi
- **functional.user_flow** : Etapes utilisateur
- **business_rules** : Regles metier identifiees
- **migration.notes** : Notes pour la migration
- **dependencies.ecf_notes** : Dependances ECF

### 3. Generer une spec enhanced (V2.1)

```powershell
.\Merge-SpecWithAnnotations.ps1 -Project ADH -IDE 121
```

**Output**: `.openspec/renders/ADH-IDE-121.md`

### 4. Extraction automatique de regles

```powershell
.\Extract-BusinessRules.ps1 -Project ADH -IDE 238 -OutputYaml
```

**Output**: Fichier YAML pre-rempli avec regles extraites des expressions

## Structure des annotations YAML

```yaml
program:
  project: "ADH"
  ide: 121

functional:
  objective:
    who: "Operateur caisse"
    what: "Gerer les sessions de caisse"
    why: "Point d'entree principal pour operations caisse"

  user_flow:
    - Selection depuis menu principal
    - Verification session existante
    - Affichage tableau de bord
    - Acces aux sous-menus

business_rules:
  - code: RM-001
    description: Une seule session active par terminal
    expression_id: null
    validated: false

migration:
  complexity_override: CRITICAL
  target_architecture: CQRS
  notes:
    - "17 parametres d'entree"
    - "Gere concurrence sessions"

dependencies:
  ecf_notes: "PARTAGE via ADH.ecf - Appele depuis PBP et PVE"

metadata:
  tags:
    - caisse
    - ecf-shared
    - critical
```

## Programmes ECF prioritaires

Ces programmes sont partages via ADH.ecf et necessitent des annotations completes :

| IDE | PublicName | Description | Annotations |
|-----|------------|-------------|-------------|
| 121 | Gestion_Caisse_142 | Gestion caisse | FAIT |
| 69 | EXTRAIT_COMPTE | Extrait de compte | FAIT |
| 192 | SOLDE_COMPTE | Calcul solde | FAIT |
| 238 | - | Vente Gift Pass | FAIT |
| 27 | Separation | Separation compte | FAIT |
| 28 | Fusion | Fusion compte | FAIT |

## Limitations actuelles

### SQLite CLI non disponible

Le rendu V3.0 complet via `Render-Spec.ps1` necessite sqlite3 CLI pour acceder a la Knowledge Base.

**Solution de contournement** : Utiliser `Merge-SpecWithAnnotations.ps1` qui produit un rendu V2.1 Enhanced.

### Indexation KB

La synchronisation des specs vers la KB (`Sync-SpecsToKb.ps1`) necessite les DLLs SQLite compilees.

**Workaround** : Les specs V2.0 sont deja generees et utilisables. L'indexation KB sera automatisee dans une phase ulterieure.

## Prochaines etapes (Phase 2)

1. Installer sqlite3 CLI ou creer un indexeur .NET
2. Automatiser la synchronisation KB via CI/CD
3. Implementer la detection de drift
4. Ajouter la generation de call graph Mermaid

## Commandes utiles

```powershell
# Lister les annotations existantes
Get-ChildItem ".openspec\annotations\*.yaml" | Select-Object Name

# Verifier programmes ECF
Get-Content ".openspec\cross-project-callers.json" | ConvertFrom-Json

# Generer toutes les specs ADH (batch)
.\Generate-AllAdhSpecs.ps1
```

---

*Workflow Phase 1 - Derniere mise a jour: 2026-01-27*
