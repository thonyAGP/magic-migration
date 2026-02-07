# Systeme d'Offset des Variables Magic

> Documentation du calcul des lettres globales des variables dans Magic IDE

## Probleme

Dans Magic IDE, les variables sont identifiees par des lettres (A, B, C... Z, BA, BB...).

**Chaque programme n'a PAS ses propres lettres A, B, C.** Les lettres sont **globales** et dependent de :
1. Le nombre de variables dans le Main (Prg_1) du projet
2. Le nombre de variables dans chaque ancetre dans la chaine d'appel

## Convention des Lettres Magic

```
Index 0-25   : A-Z   (26 lettres simples)
Index 26-51  : BA-BZ (apres Z vient BA, pas AA!)
Index 52-77  : CA-CZ
Index 78-103 : DA-DZ
...
```

**ATTENTION** : Contrairement a Excel (AA apres Z), Magic utilise BA apres Z.

## Formule de Calcul

```
Offset_Global = Main_Offset + Σ(Selects des ancetres)

Lettre_Variable = IndexToVariable(Offset_Global + Index_Local)
```

Ou :
- `Main_Offset` = nombre de variables (Selects) dans Prg_1.xml du projet
- `Selects des ancetres` = variables dans chaque tache parente jusqu'a la cible
- `Index_Local` = position de la variable dans la tache (0-based)

## Calcul Dynamique de l'Offset

L'offset est calcule dynamiquement en comptant les colonnes du Main task (ISN_2=1)
du premier programme (Prg_1.xml) de chaque projet.

**Source des projets** : `D:\Data\Migration\XPA\PMS\{PROJECT}\Source\`

**Algorithme** :
1. Lire `Progs.xml` pour obtenir l'ID du premier programme
2. Ouvrir `Prg_{ID}.xml`
3. Trouver le task avec `ISN_2="1"` (Main task)
4. Compter les elements `<Column>` dans `Resource/Columns`

**Exemples de valeurs calculees** (a titre indicatif) :

| Projet | Main_Offset | Premiere Lettre |
|--------|-------------|-----------------|
| ADH | 117 | EN |
| VIL | 52 | CA |
| PVE | 143 | FN |

> **Note** : Ces valeurs sont calculees dynamiquement, pas hardcodees.
> Il y a 38+ projets sous PMS, pas seulement ces exemples.

## Exemple Concret : ADH IDE 70

IDE 70 est appele depuis IDE 69. Pour calculer les lettres globales :

```
Main_Offset (ADH) = 117
1ere variable IDE 70 = IndexToVariable(117) = EN
```

Verification avec Magic IDE :
- Index 117 = EN (117 / 26 = 4 = E, 117 % 26 = 13 = N)
- Index 118 = EO (P0 code adherent)
- Index 119 = EP (P0 filiation)
- Index 120 = EQ (P0 masque montant)
- etc.

**Note**: L'offset 117 correspond aux variables VG (EA-EK) plus le header du programme.

## Composants Implementes

### 1. MagicColumn.IndexToVariable() (C#)
**Fichier** : `MagicMcp/Models/MagicColumn.cs`

Convertit un index 0-based en lettre Magic.

```csharp
public static string IndexToVariable(int index)
{
    if (index < 26)
        return ((char)('A' + index)).ToString();
    else if (index < 702)
    {
        int first = index / 26;    // 1=B, 2=C, 3=D...
        int second = index % 26;   // 0=A, 1=B, 2=C...
        return $"{(char)('A' + first)}{(char)('A' + second)}";
    }
    // ... cas 3 lettres
}
```

### 2. OffsetCalculator (C#)
**Fichier** : `MagicMcp/Services/OffsetCalculator.cs`

Calcule l'offset global pour une tache en parcourant la chaine d'ancetres.

```csharp
public OffsetResult CalculateOffset(string project, int programId, int taskIsn2)
{
    result.Offset = GetMainOffset(project);  // Calcule dynamiquement

    foreach (var ancestor in ancestorChain)
    {
        if (ancestor.Contributes)
            result.Offset += ancestor.SelectCount;
    }
    return result;
}
```

### 3. IndexCache.CalculateMainOffsetForProject() (C#)
**Fichier** : `MagicMcp/Services/IndexCache.cs`

Calcule le main_offset dynamiquement en comptant les colonnes du Main task.

```csharp
private int CalculateMainOffsetForProject(string projectName)
{
    // 1. Lire Progs.xml pour trouver le premier programme
    // 2. Ouvrir Prg_{id}.xml
    // 3. Trouver Header[@ISN_2='1'] (Main task)
    // 4. Compter les Column dans Resource/Columns
    return columns?.Elements("Column").Count() ?? 0;
}
```

### 4. Convert-FieldToLetter (PowerShell)
**Fichier** : `spec-pipeline-v72/Phase3-Decode.ps1`

Version PowerShell de la conversion index -> lettre.

```powershell
function Convert-FieldToLetter {
    param([int]$FieldId)
    $index = $FieldId - 1  # Convert to 0-based

    if ($index -lt 26) {
        return [string][char](65 + $index)
    }
    elseif ($index -lt 702) {
        $first = [int][math]::Floor($index / 26)
        $second = $index % 26
        return [string][char](65 + $first) + [string][char](65 + $second)
    }
}
```

## Integration Pipeline V7.2

### Phase 1 : Discovery
Calcule le `main_offset` dynamiquement via `Get-MainOffset` (PowerShell).

```powershell
# Phase1-Discovery.ps1
$mainOffset = Get-MainOffset -ProjectName $Project
# Compte les colonnes du Main task dans Prg_1.xml
```

### Phase 2 : Mapping
Applique l'offset aux lettres des variables :

```powershell
# Phase2-Mapping.ps1
$mainOffset = $discovery.metadata.main_offset
$globalIndex = $mainOffset + ($localFieldId - 1)
$globalLetter = Convert-IndexToLetter -Index $globalIndex
```

## Scripts de Debug

| Script | Description |
|--------|-------------|
| `scripts/count-main-offset.ps1` | Compte les variables du Main |
| `scripts/calc-nested-offset.ps1` | Calcule l'offset d'une tache imbriquee |
| `scripts/calc-offsets.ps1` | Calcule les offsets des sous-taches |
| `debug-offset.ps1` | Diagnostic complet de l'offset |

## Tests

**Fichier** : `MagicMcp.Tests/VariableNamingTests.cs`

```csharp
[InlineData(0, "A")]
[InlineData(25, "Z")]
[InlineData(26, "BA")]   // Apres Z vient BA, pas AA!
[InlineData(52, "CA")]
[InlineData(117, "EN")]  // ADH main_offset - premiere variable locale
[InlineData(143, "FN")]  // PVE main_offset
```

## Historique

| Date | Changement |
|------|------------|
| 2026-02-07 | Correction convention Magic (BA apres Z, pas AA) |
| 2026-02-07 | Documentation systeme d'offset |
| 2026-02-07 | Integration offset dans pipeline V7.2 |

---
*Derniere mise a jour : 2026-02-07*
