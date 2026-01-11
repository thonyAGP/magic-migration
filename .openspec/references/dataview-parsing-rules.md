# Data View Parsing Rules - Observations Brutes

> Document de référence basé sur les screenshots IDE Magic vs parsing XML.
> Ces règles sont "brutes" et validées visuellement - ne pas modifier sans validation IDE.

## Date: 2026-01-11

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

### Script parse-dataview.ps1 - Offset AUTOMATIQUE (V5)

Depuis la V5, l'offset est **calculé automatiquement** par le script via le chemin d'ancêtres.

```powershell
# L'offset est calculé automatiquement (plus besoin de MainOffset manuel)
./parse-dataview.ps1 -Project ADH -PrgId 159 -TaskIsn 2

# Sortie: Path: Main(143) + Liste des GM(47) = 190
```

**Offsets Main par projet (utilisés comme base):**
| Projet | MainOffset | Dernière variable Main |
|--------|------------|----------------------|
| ADH | 143 | EK (VG.Masque) |
| PBP | (à déterminer) | |
| PVE | (à déterminer) | |

### RÈGLE CALCUL OFFSET SOUS-TÂCHES

#### Règles validées (2026-01-11)

| # | Règle | Description |
|---|-------|-------------|
| 1 | **COUNT des Select** | Compter le NOMBRE de Select, pas le max FieldID (gère les gaps/suppressions) |
| 2 | **Chemin direct** | Compter UNIQUEMENT les ancêtres, PAS les tâches siblings |
| 3 | **Tous LogicUnits** | Inclure Record Main + Handlers (variables cachées) |

#### Formule générale

```
Offset = Main + Σ(Select count de chaque ancêtre dans le chemin)
Variable = Offset + (FieldID - 1)
```

#### Exemple ADH 285.1.2.5 ligne 5

```
Chemin: Main → 285 main → 285.1 → 285.1.2 → 285.1.2.5

Offset = 143 (Main)
       + 64 (Prg 285 main)
       + 0 (285.1)
       + 111 (285.1.2)
       = 318

Ligne 5 = FieldID 4 → index 3 → 318 + 3 = 321 → LJ
```

| Niveau | ISN | Select | Cumul |
|--------|-----|--------|-------|
| Main ADH | - | 143 | 143 |
| Prg 285 main | 1 | 64 | 207 |
| 285.1 | 2 | 0 | 207 |
| 285.1.2 | 5 | 111 | 318 |
| **285.1.2.5** | 10 | 5 | (cible) |

#### Exemple ADH 122.1.1.1 ligne 7

```
Chemin: Main → 122 main → 122.1 → 122.1.1 → 122.1.1.1

Offset = 143 + 57 + 13 + 0 = 213
Ligne 7 = FieldID 5 → index 4 → 213 + 4 = 217 → HJ
```

**Script :** `tools/scripts/calc-nested-offset.ps1`

---

## Règle 1b: Variables dans les Handlers (CACHÉES)

**RÈGLE CRITIQUE** : Les variables déclarées dans les **Handlers** (Logic Unit type "H") comptent aussi dans le total, même si elles ne sont pas visibles dans l'onglet Data View.

### Exemple ADH 122.1

| Source | FieldID | Variable | Visible DV? |
|--------|---------|----------|-------------|
| Record Main | 1-12 | GS-HD | Oui |
| **Handler** | 13 | HE | **Non** |
| **Handler** | 14 | HF | **Non** |

**Total = 14 variables** (pas 12 !)

### Impact sur le calcul d'offset

```
ADH 122.1.1.1 ligne 7:
  Offset = Main (143) + Prg 122 (57) + 122.1 (14) + 122.1.1 (0) = 214
  FieldID 5 → index 4 → global 218 → HK
```

### Comment détecter

Parcourir **TOUS** les LogicUnits de la tâche, pas seulement Record Main :
- Level "R" = Record Main (Data View visible)
- Level "H" = Handler (variables cachées)
- Level "TP/TS" = Task Prefix/Suffix
- Level "RP/RS" = Record Prefix/Suffix

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

**CORRECTION (2026-01-11)**: Les valeurs Init ne sont PAS dans un attribut `<Init>`.
Elles sont stockées comme **Update** dans les LogicUnits Prefix/Suffix:

| LogicUnit | Level | Type | Usage |
|-----------|-------|------|-------|
| Task Prefix | TP | - | Initialisations globales tâche |
| Record Prefix | R | P | Initialisations par enregistrement |
| Record Suffix | R | S | Mises à jour après traitement |
| Task Suffix | TS | - | Finalisations tâche |

**Structure XML**:
```xml
<LogicUnit>
  <Level val="R"/>
  <Type val="S"/>  <!-- S = Suffix -->
  <LogicLines>
    <LogicLine>
      <Update FlowIsn="24">
        <FieldID val="12"/>        <!-- Variable à initialiser -->
        <WithValue val="6"/>       <!-- Expression ID -->
        ...
      </Update>
    </LogicLine>
  </LogicLines>
</LogicUnit>
```

**Script**: `parse-dataview.ps1` V6 résout maintenant les Init avec conditions.

---

## Règle 6: Résolution VG.X → Noms (2026-01-11)

Les références aux variables globales VG ont le format `{32768,X}` où X est l'ID de colonne dans le Main program (Prg_1.xml).

**Exemple**:
- `{32768,1}` → `VG.LOGIN` (colonne id=1 de Prg_1.xml)
- `{32768,5}` → `VG.Societe`

**Résolution automatique dans le script**:
```powershell
# Le script charge les noms VG depuis Prg_1.xml
$vgNames = @{}
[xml]$mainPrgXml = Get-Content "$projectsPath\$Project\Source\Prg_1.xml" -Encoding UTF8
foreach ($col in $mainPrgXml.Application.ProgramsRepository.Programs.Task.Resource.Columns.Column) {
    $vgNames["$($col.id)"] = $col.name
}

# Puis remplace {32768,X} par le nom réel
$simplified = [regex]::Replace($expr, '\{32768,(\d+)\}', {
    param($match)
    $vgId = $match.Groups[1].Value
    if ($vgNames.ContainsKey($vgId)) { return $vgNames[$vgId] }
    return "VG.$vgId"
})
```

**Résultat** :
```
Ligne 19: [GV] Column utilisateur VG.LOGIN
```

---

## Règle 7: Conditions Block IF (2026-01-11)

Les initialisations peuvent être conditionnelles, encadrées par des Block IF/END_BLK dans le Prefix/Suffix.

**Structure XML**:
```xml
<LogicLine><BLOCK EndBlock="26" Type="I"><Condition Exp="9" /></BLOCK></LogicLine>
<LogicLine><Update><FieldID val="11"/><WithValue val="11"/></Update></LogicLine>
<LogicLine><END_BLK /></LogicLine>
```

**Affichage dans le script** (deux formats):

| Format | Exemple |
|--------|---------|
| **Compact** | `'O' [IF Trim(GI)<>'']` |
| **Expanded** | `'O' [IF Trim(P.Card Id)<>'']` |

**Note**: Pour les blocs imbriqués multiples, le script track une pile de conditions, mais cela peut devenir complexe. L'affichage est surtout utile pour les conditions simples.

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

- [x] Compter exactement les variables de la tâche main pour connaître l'offset subtask ✅ `calc-nested-offset.ps1`
- [x] Implémenter résolution ItemIsn → REF table id ✅ `parse-dataview.ps1` (via Comps.xml)
- [x] Parser la colonne Init ✅ `parse-dataview.ps1` V4 (via Update dans Prefix/Suffix)
- [x] Tester sur d'autres programmes ✅ ADH 285.1.2.5, ADH 122.1.1.1 validés
- [x] Calcul automatique offset sous-tâches ✅ `parse-dataview.ps1` V5 (via path traversal)
- [x] Résolution VG.X → noms réels ✅ `parse-dataview.ps1` V5 (via Prg_1.xml)
- [x] Affichage conditions Block IF ✅ `parse-dataview.ps1` V6 (compact + expanded)

---

## Scripts Associés

- `tools/scripts/parse-dataview.ps1` - **Parser Data View V6** (offset auto, Init, VG resolution, conditions)
- `tools/scripts/calc-nested-offset.ps1` - Calcul offset sous-tâches imbriquées (standalone)
- `tools/scripts/debug-param.ps1` - Debug paramètres
- `tools/scripts/debug-cols.ps1` - Debug colonnes
- `tools/scripts/check-prg.ps1` - Vérification header programme

### Usage parse-dataview.ps1 V6

```powershell
# Simple - offset calculé automatiquement
./parse-dataview.ps1 -Project ADH -PrgId 159 -TaskIsn 2

# Sortie:
# === ADH IDE 160 - Update Ezcard ===
# Path: Main(143) + Liste des GM(47) = 190
# VG names loaded: 118 variables
# Init expressions found: 4
#
# Ln#  Var  Type        Details                          Init (Compact)
# 16  [GS] Column      status                           'O' [IF Trim(GI)<>'']
# 17  [GT] Column      date_operation                   Date() [IF Trim(GI)<>'']
# 19  [GV] Column      utilisateur                      VG.LOGIN [IF Trim(GI)<>'']
#
# === EXPANDED VIEW (Init avec noms colonnes) ===
# [GS] 'O' [IF Trim(P.Card Id)<>'']
# [GV] VG.LOGIN [IF Trim(P.Card Id)<>'']
```
