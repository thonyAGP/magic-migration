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

## Main Offsets par Projet

| Projet | Main_Offset | Source |
|--------|-------------|--------|
| ADH | 143 | Calcule depuis Prg_1.xml |
| VIL | 131 | Calcule depuis Prg_1.xml |
| PVE | 174 | Calcule depuis Prg_1.xml |
| REF | 107 | Calcule depuis Prg_1.xml |

## Exemple Concret : ADH IDE 70

IDE 70 est appele depuis IDE 69. Pour calculer les lettres globales :

```
Main_Offset (ADH) = 143
+ Variables IDE 69 = X (a calculer)
= Offset pour IDE 70

1ere variable IDE 70 = IndexToVariable(Offset)
```

Si Offset = 143, alors :
- Index 143 = FN (143 / 26 = 5 = F, 143 % 26 = 13 = N)
- Index 144 = FO
- Index 145 = FP
- etc.

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
    result.Offset = GetMainOffset(project);  // Ex: 143 pour ADH

    foreach (var ancestor in ancestorChain)
    {
        if (ancestor.Contributes)
            result.Offset += ancestor.SelectCount;
    }
    return result;
}
```

### 3. IndexCache.GetMainOffset() (C#)
**Fichier** : `MagicMcp/Services/IndexCache.cs`

Recupere le main_offset d'un projet (calcule ou hardcode).

```csharp
private static readonly Dictionary<string, int> HardcodedOffsets = new()
{
    ["ADH"] = 143,
    ["VIL"] = 131,
    ["PVE"] = 174,
    ["REF"] = 107
};
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
Recuperer le `main_offset` du projet via KbIndexRunner CLI.

### Phase 5 : Synthesis
Appliquer l'offset aux lettres des variables :

```powershell
$mainOffset = $discovery.main_offset  # Ex: 143
foreach ($var in $variables) {
    $globalIndex = $mainOffset + $var.LocalIndex
    $var.Letter = Convert-IndexToLetter $globalIndex
}
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
[InlineData(143, "FN")]  // ADH main_offset
```

## Historique

| Date | Changement |
|------|------------|
| 2026-02-07 | Correction convention Magic (BA apres Z, pas AA) |
| 2026-02-07 | Documentation systeme d'offset |
| 2026-02-07 | Integration offset dans pipeline V7.2 |

---
*Derniere mise a jour : 2026-02-07*
