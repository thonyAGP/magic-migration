# Formule de Calcul d'Offset des Variables Magic

> Documentation deterministe pour le calcul des lettres de variables dans Magic Unipaas

## Formule Validee (2026-01-24)

```
Offset = Main_VG + Σ(Selects des ancetres, SAUF ceux avec Access=W)
```

### Composants

| Composant | Description |
|-----------|-------------|
| Main_VG | Variables globales du programme principal (Prg_1.xml) |
| Selects | Operations Select dans TaskLogic de chaque tache |
| Access | Mode d'acces MainSource: R (Read) ou W (Write) |

### Regles de Contribution

| Configuration | Contribution |
|---------------|--------------|
| Pas de MainSource | Compte tous les Selects |
| MainSource avec Access=R | Compte tous les Selects |
| MainSource avec Access=W | **SKIP (0 contribution)** |

## Exemple : VIL IDE 90 Tache BI (ISN_2=32)

Hierarchie validee par screenshots IDE :

| Tache | Selects | MainSource | Access | Contribution |
|-------|---------|------------|--------|--------------|
| ISN_2=1 | 36 | Non | - | +36 |
| ISN_2=15 | 31 | comp=2 | **R** | +31 |
| ISN_2=21 | 5 | comp=2 | **R** | +5 |
| ISN_2=22 | 4 | comp=2 | **R** | +4 |
| ISN_2=24 | 7 | comp=2 | **W** | **+0 (SKIP)** |
| ISN_2=30 | 0 | comp=2 | **W** | **+0 (SKIP)** |

**Calcul : 52 + 36 + 31 + 5 + 4 + 0 + 0 = 128** ✓

La variable FC a l'index 132 (offset 128 + position locale 5 - 1 = 132)

## Conversion Index → Lettre

| Plage Index | Pattern | Exemples |
|-------------|---------|----------|
| 0-25 | A-Z | A=0, Z=25 |
| 26-51 | BA-BZ | BA=26, BZ=51 |
| 52-77 | CA-CZ | CA=52 |
| 78-103 | DA-DZ | - |
| 104-129 | EA-EZ | EP=119, EU=124 |
| 130-155 | FA-FZ | FC=132 |

**IMPORTANT**: Apres Z (25) vient **BA** (26), PAS AA !

### Formule (index >= 26)

```
first = index / 26      // Division entiere
second = index % 26     // Modulo
letter = chr(65 + first) + chr(65 + second)
```

**Exemples valides :**
- Index 119 → first=4 (E), second=15 (P) → **EP**
- Index 124 → first=4 (E), second=20 (U) → **EU**
- Index 132 → first=5 (F), second=2 (C) → **FC**

## Comptage des Colonnes de Table

Les colonnes des tables proviennent de :
1. `<DB><DataObject comp="X" obj="Y" />` - Main Source
2. `<Links><Link><DB><DataObject comp="X" obj="Y" />` - Tables liees

Pour trouver le nombre de colonnes :
1. Dans Comps.xml, trouver ComponentDataObjects/Object[id=Y] → ItemIsn
2. Dans REF/DataSources.xml, trouver DataObject[@id=ItemIsn]
3. Compter ./Columns/Column

## Structure XML

```xml
<Task>
  <Header ISN_2="24" Description="Saisie"/>
  <Resource>
    <DB>
      <DataObject comp="2" obj="490"/>  <!-- comp=2 = MainSource -->
      <Access val="W"/>                  <!-- W = Write (SKIP), R = Read (COUNT) -->
    </DB>
    <Columns>
      <Column id="4" name="V titre">     <!-- Variables locales -->
      ...
    </Columns>
  </Resource>
  <TaskLogic>
    <LogicUnit>
      <LogicLines>
        <LogicLine>
          <Select/>  <!-- Compter ces elements -->
        </LogicLine>
      </LogicLines>
    </LogicUnit>
  </TaskLogic>
</Task>
```

### Elements cles

| Element | Chemin XPath | Signification |
|---------|--------------|---------------|
| MainSource | Resource/DB/DataObject[@comp="2"] | Presence = a une table principale |
| Access Mode | Resource/DB/Access/@val | "R"=Read, "W"=Write |
| Selects | TaskLogic/LogicUnit/LogicLines/LogicLine/Select | Operations a compter |

## Implementation C#

```csharp
bool ShouldContributeToOffset(XElement task)
{
    var db = task.Element("Resource")?.Element("DB");
    var comp = db?.Element("DataObject")?.Attribute("comp")?.Value;
    var access = db?.Element("Access")?.Attribute("val")?.Value;

    // Skip if MainSource (comp=2) with Write access
    return !(comp == "2" && access == "W");
}

int CountSelects(XElement task)
{
    return task.Element("TaskLogic")?
        .Elements("LogicUnit")
        .SelectMany(lu => lu.Element("LogicLines")?.Elements("LogicLine") ?? [])
        .Count(ll => ll.Element("Select") != null) ?? 0;
}
```

## Tests de Controle

Voir `MagicMcp.Tests/VilOffsetControlTests.cs` :

| Test | Attendu | Resultat |
|------|---------|----------|
| Task 90.4.4 (ISN_2=21) offset | 119 | ✓ |
| Task 90.4.4.1 (ISN_2=22) offset | 124 | ✓ |
| Task BI (ISN_2=32) offset | 128 | ✓ |
| FC a position 5 = index 132 | FC | ✓ |
| Access=W non contributif | 0 | ✓ |
| Access=R contributif | Selects | ✓ |

## Expressions

Les expressions utilisent `ExpSyntax/@val` pour la formule.

Les references `{niveau,colId}` signifient :
- niveau 0 = tache courante
- niveau 1 = parent direct
- niveau 2 = grand-parent
- etc.

---

*Cree le 2026-01-22 - Prg_558 initial*
*Mis a jour le 2026-01-24 - Formule validee avec VIL IDE 90 (Access=W exclusion)*
