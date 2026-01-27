# Specifications Enrichies V2.1

> Index des specifications programme avec annotations fonctionnelles

---

## Vue d'ensemble

Les specifications V2.1 Enhanced combinent:
- **Partie Technique** (V2.0): Tables, Variables, Expressions decodees
- **Partie Fonctionnelle** (Annotations): Objectif metier, Flux utilisateur, Regles metier
- **Notes Migration**: Complexite, Architecture cible, Dependances

---

## Programmes Documentes

### ECF Partages (ADH.ecf)

| IDE | Nom | Type | Complexite | Spec |
|-----|-----|------|------------|------|
| 27 | Separation compte | Batch | HIGH | [ADH-IDE-27](renders/ADH-IDE-27.md) |
| 28 | Fusion compte | Batch | HIGH | [ADH-IDE-28](renders/ADH-IDE-28.md) |
| 69 | Extrait de compte | Batch | MEDIUM | [ADH-IDE-69](renders/ADH-IDE-69.md) |
| 192 | Calcul si depot existe | Batch | LOW | [ADH-IDE-192](renders/ADH-IDE-192.md) |

### Gestion Caisse

| IDE | Nom | Type | Complexite | Spec |
|-----|-----|------|------------|------|
| 121 | Gestion Caisse (Main) | Online | HIGH | [ADH-IDE-121](renders/ADH-IDE-121.md) |

### Ventes

| IDE | Nom | Type | Complexite | Spec |
|-----|-----|------|------------|------|
| 235 | Print ticket vente LEX | Batch | LOW | [ADH-IDE-235](renders/ADH-IDE-235.md) |
| 238 | Transaction Nouv vente | Online | HIGH | [ADH-IDE-238](renders/ADH-IDE-238.md) |

---

## Structure des Specs V2.1

Chaque spec enrichie contient:

```
PARTIE I: SPECIFICATION FONCTIONNELLE
├── 1.1 Objectif Metier (Qui/Quoi/Pourquoi)
├── 1.2 Flux Utilisateur
├── 1.3 Notes Migration
├── 1.4 Dependances ECF
└── 1.5 Tags

PARTIE II: SPECIFICATION TECHNIQUE
├── 2. Tables (avec Access R/W)
├── 3. Parametres d'entree
├── 4. Variables principales
├── 5. Expressions decodees
└── 6. Statistiques
```

---

## Annotations YAML

Les annotations sont stockees dans `.openspec/annotations/`:

| Fichier | Programme |
|---------|-----------|
| [ADH-IDE-27.yaml](annotations/ADH-IDE-27.yaml) | Separation compte |
| [ADH-IDE-28.yaml](annotations/ADH-IDE-28.yaml) | Fusion compte |
| [ADH-IDE-69.yaml](annotations/ADH-IDE-69.yaml) | Extrait de compte |
| [ADH-IDE-121.yaml](annotations/ADH-IDE-121.yaml) | Gestion Caisse |
| [ADH-IDE-192.yaml](annotations/ADH-IDE-192.yaml) | Calcul depot existe |
| [ADH-IDE-235.yaml](annotations/ADH-IDE-235.yaml) | Print ticket vente |
| [ADH-IDE-238.yaml](annotations/ADH-IDE-238.yaml) | Transaction vente |

---

## Statistiques

| Metrique | Valeur |
|----------|--------|
| Programmes documentes | 7 |
| Annotations YAML | 7 |
| Specs V2.1 rendues | 7 |
| ECF partages | 4 (IDE 27, 28, 69, 192) |

---

## Generation

Les specs V2.1 sont generees par:

```powershell
# Extraire regles metier (cree annotations YAML)
.\tools\spec-generator\Extract-BusinessRules.ps1 -Project ADH -IDE 235

# Fusionner spec V2.0 + annotations -> V2.1 Enhanced
.\tools\spec-generator\Merge-SpecWithAnnotations.ps1 -Project ADH -IDE 235
```

---

*Derniere mise a jour: 2026-01-27*
