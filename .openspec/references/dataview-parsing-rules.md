# Data View Parsing Rules - Observations Brutes

> Document de référence basé sur les screenshots IDE Magic vs parsing XML.
> Ces règles sont "brutes" et validées visuellement - ne pas modifier sans validation IDE.

## Date: 2026-01-10

---

## Source 2: ADH IDE 160 "Liste des GM" (Task Principal)

### Structure Data View Complète

| Ligne | Type | Table IDE | Table Nom | Col ID | Col Nom | Index |
|-------|------|-----------|-----------|--------|---------|-------|
| 1 | Main Source | 594 | tempo_ecran_mecano | - | - | 1 |
| 2-25 | Column | 594 | tempo_ecran_mecano | 1-24 | eme_* | - |
| 26 | (vide) | - | - | - | - | - |
| 27 | Link Query | 30 | gm-recherche_____gm | - | - | 3 |
| 28 | Column | 30 | gm-recherche | 1 | gmr_societe | - |
| 29 | Column | 30 | gm-recherche | 5 | gmr_type_de_client | - |
| 30 | Column | 30 | gm-recherche | 6 | gmr_num__club | - |
| 31 | Column | 30 | gm-recherche | 8 | gmr_filiation_club | - |
| 32 | Column | 30 | gm-recherche | 2 | gmr_code_gm | - |
| 33 | Column | 30 | gm-recherche | 3 | gmr_filiation_villag | - |
| 34 | End Link | - | - | - | - | - |
| 35 | (vide) | - | - | - | - | - |
| 36 | Link Query | 47 | compte_gm_________cg | - | - | 1 |
| 37 | Column | 47 | compte_gm | 1 | cgm_societe | - |
| 38 | Column | 47 | compte_gm | 2 | cgm_code_adherent | - |
| 39 | Column | 47 | compte_gm | 6 | cgm_garanti | - |
| 40 | End Link | - | - | - | - | - |
| 41 | (vide) | - | - | - | - | - |
| 42 | Virtual | - | - | 1 | v.num cmp | - |

### Variables Expression Rules

| Variable | Nom Colonne | Type | Data Source |
|----------|-------------|------|-------------|
| DY-EK | VG.* | Logical/etc | Virtual (globals) |
| EN | eme_societe | Alpha | tempo_ecran_mecano |
| EO | eme_user | Alpha | tempo_ecran_mecano |
| EP | eme_sequence | Numeric | tempo_ecran_mecano |
| EQ | eme_code_vente | Alpha | tempo_ecran_mecano |
| ... | ... | ... | ... |
| FK | eme_age_num | Numeric | tempo_ecran_mecano |

**Première variable du Main Source = EN** (index ~117)

---

## Source 1: ADH IDE 160.1 "Update Ezcard" (Subtask)

---

## Règle 1: Numérotation Variables GLOBALE

Les variables sont numérotées **globalement** sur tout le programme, pas par tâche.

| Tâche | Variables | Plage |
|-------|-----------|-------|
| Main (160) | A à GE | 1-187 environ |
| Subtask 160.1 | GI à GV | Continue après main |

**Implication**: Pour parser une sous-tâche, il faut connaître le nombre de variables de la tâche parente.

### RÈGLE CRITIQUE : Variables Main TOUJOURS incluses

Quand un programme est appelé, les **variables du Main sont TOUJOURS lues en premier**.
Il n'existe PAS de "contexte local" - le contexte local n'existe QUE pour le Main lui-même.

**Exemple ADH IDE 320 (Deversement Transaction SAV) :**

| Source | Variables | Plage |
|--------|-----------|-------|
| **Main (VG.*)** | DX à EK | Variables virtuelles globales |
| --- Séparateur --- | | |
| ADH 320 Parameters | EN à EY | p.Gratuite, p.Annulation... |
| ADH 320 Columns | EZ à ... | sod_societe, sod_compte... |

**Calcul correct pour ADH 320 ligne 36 :**
- Ligne 36 = sod_pourcentage_reduction
- Variable = **FS** (pas AF!)
- Car offset Main (EK) + offset Parameters (EN-EY) + colonnes

**Mapping colonnes Main Source ADH 320 :**
| Ligne | Variable | Colonne |
|-------|----------|---------|
| 17 | EZ | sod_societe |
| 18 | FA | sod_compte |
| 19 | FB | sod_filiation |
| ... | ... | ... |
| 36 | **FS** | sod_pourcentage_reduction |

---

## Règle 2: Column IDs - DISTINCTION Main Source vs Link

### Main Source: IDs SÉQUENTIELS
Les colonnes du Main Source sont numérotées **séquentiellement** (1, 2, 3, ..., 24).
C'est l'ordre de sélection, pas les IDs réels de la table.

### Link Query: IDs RÉELS de la table
Les colonnes des Links utilisent les **vrais IDs de colonnes** de la table.
Exemple: 1, 5, 6, 8, 2, 3 (non séquentiel, avec "trous").

### Exemples validés (ADH IDE 160)

**Main Source (tempo_ecran_mecano):**
```
Ligne 2:  Col 1  = eme_societe
Ligne 3:  Col 2  = eme_user
Ligne 4:  Col 3  = eme_sequence
...
Ligne 25: Col 24 = eme_age_num
```

**Link Query (gm-recherche):**
```
Ligne 28: Col 1 = gmr_societe
Ligne 29: Col 5 = gmr_type_de_client  ← saute 2,3,4
Ligne 30: Col 6 = gmr_num__club
Ligne 31: Col 8 = gmr_filiation_club  ← saute 7
Ligne 32: Col 2 = gmr_code_gm         ← revient en arrière!
Ligne 33: Col 3 = gmr_filiation_villag
```

---

## Règle 2b: Column IDs dans Subtasks

Exemple observé dans screenshot Task 160.1:
```
ID Column | Var | Type    | Init
---------|-----|---------|-----
1        | GI  | Alpha   | gmr_societe
2        | GJ  | Numeric |
3        | GK  | Numeric |
4        | GL  | Alpha   |
5        | GM  | Alpha   |
8        | GN  | Date    | Date()
9        | GO  | Time    | Time()
10       | GP  | Alpha   | VG.LOGIN
```

Note: IDs 6 et 7 absents - ce sont les vrais IDs de colonnes de la table, pas un compteur.

---

## Règle 3: Mapping Composants (ItemIsn)

Quand un programme ADH référence `obj=1047`, c'est un **ItemIsn** de composant.

**Flux de résolution:**
1. ADH/Comps.xml: `<ItemIsn val="1047"/>` → `<id val="934"/>` + `<PublicName val="selection_enregistrement_div"/>`
2. REF/DataSources.xml: `id="934"` → Table "selection enregistrement diver" (Memory)

**TODO**: Implémenter ce mapping dans le script de parsing.

---

## Règle 4: Table code_fidelisation

Dans le screenshot Expression Rules de ADH 160:
- Variables GA, GB, GC → Table `code_fidelisation` (obj=800?)
- Cette table est dans la **tâche principale**, pas dans la subtask 160.1

Le parsing XML de la subtask 160.1 montrait `stat_vendeur` (obj=844) car c'est la table de **cette** sous-tâche.

**Conclusion**: Chaque tâche a sa propre Data View, mais les variables sont globales.

---

## Règle 5: Colonne Init

La colonne Init contient des expressions d'initialisation:
- `gmr_societe` → Variable globale
- `Date()` → Fonction date courante
- `Time()` → Fonction heure courante
- `VG.LOGIN` → Variable globale LOGIN

Ces valeurs sont dans l'attribut `<Init>` du XML.

---

## Screenshots de Référence

### Screenshot 1: Task 160.1 Data View
- Montre la structure exacte avec IDs colonnes non-séquentiels
- Variables GI à GP visibles
- Colonne Init avec expressions

### Screenshot 2: Expression Rules (Programme complet)
- Liste TOUTES les variables du programme (main + subtasks)
- Mapping complet Variable → Type → Table → Colonne
- Variables GA, GB, GC → code_fidelisation dans main task

---

## À Valider

- [ ] Compter exactement les variables de la tâche main pour connaître l'offset subtask
- [ ] Implémenter résolution ItemIsn → REF table id
- [ ] Parser la colonne Init
- [ ] Tester sur d'autres programmes pour valider les règles

---

## Scripts Associés

- `tools/scripts/parse-dataview.ps1` - Parser actuel (à améliorer)
- `tools/scripts/debug-param.ps1` - Debug paramètres
- `tools/scripts/debug-cols.ps1` - Debug colonnes
- `tools/scripts/check-prg.ps1` - Vérification header programme
