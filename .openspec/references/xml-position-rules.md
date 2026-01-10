# Règles de Position XML → IDE

> Règles brutes pour convertir les références XML en positions IDE.
> Basées sur analyse du 2026-01-10.

---

## 1. Résolution des Tables (REF Component)

### Principe clé
**obj dans XML = ItemIsn dans Comps.xml**, pas l'id direct.

### Chaîne de résolution

```
XML: <DataObject comp="4" obj="693"/>
         ↓
Comps.xml (comp=4 = REF):
    Trouver entrée où ItemIsn="693"
    → id="673", PublicName="caisse_eledetail01"
         ↓
REF/DataSources.xml:
    Trouver table où Public="caisse_eledetail01"
    → id="673", name="table_element_detail_session"
         ↓
IDE affiche: Table 673 - table_element_detail_session
```

### Structure Comps.xml

```xml
<Object>
  <id val="673"/>           <!-- IDE table number -->
  <ItemIsn val="693"/>      <!-- Clé de lookup (= obj dans XML) -->
  <PublicName val="caisse_eledetail01"/>  <!-- Nom pour résolution REF -->
</Object>
```

### Algorithme

```
function ResolveTableForIDE(comp, obj):
    1. Trouver Component id={comp} dans Comps.xml
    2. Dans ComponentDataObjects, trouver Object où ItemIsn={obj}
    3. Retourner:
       - IDE Position = Object.id
       - Table Name = Object.PublicName → REF DataSources.Public → name
```

### Tables sans PublicName (offset)

12 tables dans REF n'ont pas d'attribut Public:
- ids: 741, 750, 751, 912, 919, 920, 931, 949, 950, 953, 954, 955

Ces tables ne sont pas exposées dans Comps.xml et ne créent pas d'offset
car le système utilise ItemIsn comme lookup, pas des positions séquentielles.

---

## 2. Résolution des Programmes

### Principe clé
**IDE Position = position dans la liste ProgramsRepositoryOutLine (1-indexed)**

Le XML id n'est qu'un pointeur interne, PAS la position IDE.

### Structure Progs.xml

```xml
<ProgramsRepositoryOutLine>
  <Programs>
    <Program id="1"/>    <!-- Position IDE 1 -->
    <Program id="2"/>    <!-- Position IDE 2 -->
    ...
    <Program id="155"/>  <!-- Position IDE 155 -->
    <Program id="329"/>  <!-- Position IDE 156 (INSÉRÉ!) -->
    <Program id="156"/>  <!-- Position IDE 157 -->
    ...
    <Program id="323"/>  <!-- Position IDE 230 (INSÉRÉ!) -->
    <Program id="286"/>  <!-- Position IDE 231 (INSÉRÉ!) -->
    <Program id="328"/>  <!-- Position IDE 232 (INSÉRÉ!) -->
    ...
    <Program id="294"/>  <!-- Position IDE 297 -->
  </Programs>
</ProgramsRepositoryOutLine>
```

### Insertions ADH détectées

| IDE Position | Program ID | Note |
|--------------|------------|------|
| 156 | 329 | Hors séquence |
| 230 | 323 | Hors séquence |
| 231 | 286 | Hors séquence |
| 232 | 328 | Hors séquence |
| 278 | 285 | Hors séquence |

### Algorithme

```
function GetIDEPosition(xmlId):
    programs = Progs.xml/ProgramsRepositoryOutLine/Programs/Program
    for i, prg in enumerate(programs):
        if prg.id == xmlId:
            return i + 1  # 1-indexed
    return null

function GetXMLId(idePosition):
    programs = Progs.xml/ProgramsRepositoryOutLine/Programs/Program
    return programs[idePosition - 1].id
```

### Vérification

| IDE Position | XML id | Calcul |
|--------------|--------|--------|
| 155 | 155 | Séquentiel |
| 156 | 329 | Inséré |
| 157 | 156 | 157 - 1 = 156 |
| 297 | 294 | 297 - 3 = 294 |

---

## 3. Résolution des Colonnes Data View

### Principe clé
**IDE Line Number = position dans LogicLines (1-indexed)**

### Structure LogicLines

```xml
<LogicLines>
  <LogicLine>  <!-- IDE Line 1 -->
    <DATAVIEW_SRC .../>
  </LogicLine>
  <LogicLine>  <!-- IDE Line 2 -->
    <Select FieldID="1" id="1">
      <Column val="1"/>
      <Type val="V"/>
      <IsParameter val="Y"/>
    </Select>
  </LogicLine>
  <LogicLine>  <!-- IDE Line 3 -->
    <Remark .../>  <!-- Ligne vide -->
  </LogicLine>
  <LogicLine>  <!-- IDE Line 4 -->
    <LNK ...>
      <DB comp="4" obj="30"/>
    </LNK>
  </LogicLine>
  <LogicLine>  <!-- IDE Line 5 -->
    <Select FieldID="25" id="25">
      <Column val="1"/>  <!-- Vrai ID colonne dans la table liée -->
      <Type val="R"/>
    </Select>
  </LogicLine>
</LogicLines>
```

### Attributs Select

| Attribut | Signification |
|----------|---------------|
| FieldID | Index variable (A=1, B=2, ..., Z=26, AA=27...) |
| Column.val | ID colonne (séquentiel pour Main Source, réel pour Link) |
| Type | V=Virtual, R=Real (table column) |
| IsParameter | Y=Paramètre, N=Normal |

### Colonnes Main Source vs Link

| Contexte | Column.val | Exemple |
|----------|-----------|---------|
| Main Source | Séquentiel | 1, 2, 3, 4, ..., 24 |
| Link Query | Vrais IDs table | 1, 5, 6, 8, 2, 3 (non-séquentiel!) |

### Vérification ADH IDE 160 (Prg_159)

Link Query vers table 30 (gm-recherche):

| IDE Line | Select FieldID | Column.val | Nom colonne |
|----------|---------------|------------|-------------|
| 28 | 25 | 1 | gmr_societe |
| 29 | 26 | 5 | gmr_type_de_client |
| 30 | 27 | 6 | gmr_num__club |
| 31 | 28 | 8 | gmr_filiation_club |
| 32 | 29 | 2 | gmr_code_gm |
| 33 | 30 | 3 | gmr_filiation_villag |

**Note:** Column.val peut sauter des valeurs (1→5→6→8) et revenir en arrière (8→2→3)!

---

## 4. Numérotation des Variables

### Globale sur tout le programme
Les variables sont numérotées globalement:
- Paramètres du programme principal (A, B, C...)
- Colonnes Main Source (continue après paramètres)
- Colonnes Links (continue)
- Variables Virtuelles (continue)
- Sous-tâches continuent après parent

### Formule
```
Variable Index 0 → A
Variable Index 25 → Z
Variable Index 26 → AA
Variable Index 27 → AB
...
Formule:
  if index < 26: chr(65 + index)
  else: chr(65 + index/26 - 1) + chr(65 + index%26)
```

---

## Exemples Vérifiés

### ADH IDE 294 Task 7 (Detail devises)
| Source | Valeur | Explication |
|--------|--------|-------------|
| XML obj | 693 | Référence brute dans Prg_294.xml |
| Comps ItemIsn | 693 | Clé de lookup |
| Comps id | 673 | **IDE table number** |
| Comps PublicName | caisse_eledetail01 | Nom pour résolution |
| REF id | 673 | Table résolue |
| REF name | table_element_detail_session | Nom affiché |
| **IDE affiche** | **673 - table_element_detai** | ✓ Correspond au screenshot |

---

*Document généré le 2026-01-10*
