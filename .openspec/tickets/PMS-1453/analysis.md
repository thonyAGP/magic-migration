# PMS-1453 - Vente de transfert > heure erronee

> **Jira** : [PMS-1453](https://clubmed.atlassian.net/browse/PMS-1453)
> **Protocole** : `.claude/protocols/ticket-analysis.md` applique
> **Version** : Template v3.0

---

## 1. Contexte Jira

| Element | Valeur |
|---------|--------|
| **Symptome** | Dans l'ecran de vente de transfert, l'utilisateur peut saisir une heure invalide (ex: 70:00) |
| **Donnees entree** | Saisie de "70:00" dans le champ heure transfert |
| **Attendu** | Le systeme devrait limiter la saisie aux heures valides (00:00 a 23:59) |
| **Obtenu** | Donnees incohérentes stockees dans la table `transfertn` |
| **Reporter** | Utilisateur metier |
| **Date** | 2026-01 |

### Indices extraits du ticket
- Programme mentionne : `Saisie vente transfert` -> verifie ETAPE 2
- Table mentionnee : `transfertn` -> verifie ETAPE 2
- Champ concerne : `trf_heure` (heure transfert)

---

## 2. Localisation Programmes

### MCP Evidence

> **OBLIGATOIRE** : Documenter chaque appel MCP effectue

| Outil | Parametres | Resultat |
|-------|------------|----------|
| `magic_find_program` | "transfert", "ADH" | 4 resultats (IDE 174, 175, 307, 313) |
| `magic_get_position` | "ADH", 307 | **ADH IDE 307 - Saisie transaction Nouv vente** |
| `magic_get_position` | "ADH", 313 | **ADH IDE 313 - Saisie transaction Nouv vente** (variante) |
| `magic_get_tree` | "ADH", 307 | 42 taches, tache principale 307.37 pour saisie heure |

### Programmes identifies

| Fichier XML | IDE Verifie | Nom | Role dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_307.xml | **ADH IDE 307** | Saisie transaction Nouv vente | Ecran principal de saisie |
| Prg_313.xml | **ADH IDE 313** | Saisie transaction Nouv vente | Variante de saisie |
| Prg_174.xml | **ADH IDE 174** | Transferts | Liste des transferts |
| Prg_175.xml | **ADH IDE 175** | Print transferts | Impression |

---

## 3. Tracage Flux

### Arborescence Taches

> **OBLIGATOIRE** : Chemin hierarchique depuis la racine

```
ADH IDE 307 - Saisie transaction Nouv vente
├── Tache 307.1 - Main
│   └── CallTask vers 307.36
├── Tache 307.36 - Type Transfert (selection type)
│   └── Subform vers 307.37
├── Tache 307.37 - Affiche details transfert ← SAISIE HEURE
│   └── Columns W1 Heure transfert Aller/Retour
└── Tache 307.39 - Creation Transfertn → Ecriture table
```

### Resolution des CallTask/CallProgram

| Ligne | Source | TargetPrg | MCP Verifie | Destination |
|-------|--------|-----------|-------------|-------------|
| - | Tache 307.1 | 307.36 | `magic_get_tree` | Tache 307.36 - Type Transfert |
| - | Tache 307.36 | 307.37 | `magic_get_tree` | Tache 307.37 - Affiche details |
| - | Tache 307.37 | 307.39 | `magic_get_tree` | Tache 307.39 - Creation |

### Diagramme du flux

```
┌─────────────────────┐
│ ADH IDE 307         │ Saisie transaction Nouv vente
│ Tache 307.1         │ Main
└─────────┬───────────┘
          │ CallTask
          ▼
┌─────────────────────┐
│ ADH IDE 307         │
│ Tache 307.36        │ Type Transfert
└─────────┬───────────┘
          │ Subform
          ▼
┌─────────────────────┐
│ ADH IDE 307         │
│ Tache 307.37        │ Affiche details transfert ← SAISIE HEURE
└─────────┬───────────┘
          │ CallTask
          ▼
┌─────────────────────┐
│ ADH IDE 307         │
│ Tache 307.39        │ Creation Transfertn → Ecriture table
└─────────────────────┘
```

---

## 4. Analyse Expressions

### MCP Evidence

| Outil | Parametres | Resultat |
|-------|------------|----------|
| `magic_get_line` | "ADH", "307.37", colonnes | Colonnes id=5 et id=13 sans Picture |
| - | - | FIELD_TIME sans validation de format |

### Analyse des colonnes

Dans la **Tache 307.37** "Affiche details transfert", les colonnes de saisie d'heure sont definies **SANS Picture de validation** :

**Colonne id=5 "W1 Heure transfert Aller"** (ligne ~31823):
- Model: FIELD_TIME
- Picture: ABSENT ← PROBLEME

**Colonne id=13 "W1 Heure transfert Retour"** (ligne ~31880):
- Model: FIELD_TIME
- Picture: ABSENT ← PROBLEME

### Comparaison avec table REF (correctement definie)

La table `transfertn` dans DataSources.xml definit le champ avec Picture:
```xml
<Column id="5" name="trf_heure">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <Picture id="157" valUnicode="HH:MM:SS"/>  <!-- Validation presente -->
  </PropertyList>
</Column>
```

---

## 5. Root Cause

| Element | Valeur |
|---------|--------|
| **Programme** | ADH IDE 307 - Saisie transaction Nouv vente, Tache 307.37 |
| **Sous-tache** | Tache 307.37 - Affiche details transfert |
| **Ligne Logic** | Colonnes id=5 et id=13 |
| **Expression** | PropertyList des colonnes FIELD_TIME |
| **Erreur** | Picture de validation HH:MM absente |
| **Impact** | Saisie de valeurs invalides (ex: 70:00) acceptee |

### Localisation dans l'arborescence

```
ADH IDE 307
└── Tache 307.37
    ├── Column id=5 "W1 Heure transfert Aller" ← MANQUE Picture
    └── Column id=13 "W1 Heure transfert Retour" ← MANQUE Picture
```

### Cause technique

Le type `FIELD_TIME` definit le format de stockage mais **le Picture definit la validation de saisie**.
Sans Picture, Magic accepte n'importe quelle valeur numerique.

---

## 6. Solution

### Avant (bug)

```xml
<Column id="5" name="W1 Heure transfert Aller">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <_FieldStyle id="276" val="1"/>
    <!-- MISSING: Picture -->
  </PropertyList>
</Column>
```

### Apres (fix)

```xml
<Column id="5" name="W1 Heure transfert Aller">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <Picture id="157" valUnicode="HH:MM"/>
    <_FieldStyle id="276" val="1"/>
  </PropertyList>
</Column>
```

### Actions requises

| Fichier | Ligne | Action |
|---------|-------|--------|
| `Prg_307.xml` | ~31823 | Ajouter `<Picture id="157" valUnicode="HH:MM"/>` a Column id="5" |
| `Prg_307.xml` | ~31880 | Ajouter `<Picture id="157" valUnicode="HH:MM"/>` a Column id="13" |
| `Prg_313.xml` | a verifier | Meme correction sur variante si applicable |

---

## Donnees requises

- Base de donnees : N/A (modification code source uniquement)
- Fichier(s) : `Prg_307.xml`, `Prg_313.xml`
- Table(s) a extraire : N/A

---

*Analyse : 2026-01-26T15:00*
*Pattern KB : missing-picture-validation (nouveau)*
