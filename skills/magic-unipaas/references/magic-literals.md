# Magic xpa Literals - Reference Officielle

> Source: `C:\Appwin\Magic\Magicxpa23\SUPPORT\mghelpw.chm` - Expression_Editor/Literals.htm

## Vue d'ensemble

Les literals permettent de référencer dynamiquement des objets Magic. Ils sont automatiquement mis à jour si l'objet change de position.

---

## Liste des Literals

| Literal | Description | Exemple |
|---------|-------------|---------|
| **DATE** | Valeur date | `'01/01/97'DATE` |
| **DSOURCE** | Table dans Data Sources | `'5'DSOURCE` |
| **ERR** | Type d'erreur | `'Deadlock'ERR` |
| **EVENT** | Événement interne | `'Exit'EVENT` |
| **EXP** | Expression (pour ExpCalc) | `'3'EXP` |
| **FORM** | Formulaire | `'2'FORM` |
| **INDEX** | Index dans Index Repository | `'5'INDEX` |
| **KBD** | Touche clavier | `'F2'KBD` |
| **LOG** | Booléen | `'TRUE'LOG`, `'FALSE'LOG` |
| **MENU** | Menu | `'1'MENU` |
| **MODE** | Mode de tâche | `'MC'MODE` |
| **PROG** | Programme | `'5'PROG` |
| **RIGHT** | Droit utilisateur | `'RIGHT#4'RIGHT` |
| **TIME** | Valeur temps | `'14:30:15'TIME` |
| **VAR** | Variable | `'A'VAR` |

---

## Détails par Literal

### DSOURCE - Data Source

Référence une table dans le Data Repository.

```
'5'DSOURCE    → Table #5 dans Data Sources
DbDel('493'DSOURCE, '')    → Supprime tous les enregistrements de la table 493
DbName('38'DSOURCE)        → Retourne le nom physique de la table 38
```

**Auto-update**: Si une nouvelle table est insérée avant, Magic met à jour automatiquement le numéro.

### PROG - Programme

Référence un programme dans le Program Repository.

```
'5'PROG                    → Programme #5
CallProg('229'PROG)        → Appelle dynamiquement le programme 229
ProgIdx('hasRight','TRUE'LOG)  → Retourne l'index d'un programme par son nom public
```

**Auto-update**: Si le programme change de position, Magic met à jour automatiquement.

### EXP - Expression

Référence une expression pour ExpCalc.

```
'3'EXP                     → Expression #3
ExpCalc('13'EXP)           → Évalue l'expression #13 et retourne son résultat
```

### VAR - Variable

Référence une variable pour les fonctions dynamiques.

```
'A'VAR                     → Variable A
'ET'VAR                    → Variable ET
VarSet('P'VAR, X+6)        → Affecte X+6 à la variable P
VarCurr('A'VAR)            → Retourne la valeur courante de A
VarPrev('A'VAR)            → Retourne la valeur précédente de A
```

**Accès tableau**: `VarSet('P'VAR+1, X+6)` → Met à jour la variable Q (suivante après P)

### FORM - Formulaire

Référence un formulaire.

```
'2'FORM                    → Formulaire #2
MainDisplay = '3'FORM      → Affiche dynamiquement le formulaire 3
```

### INDEX - Index

Référence un index.

```
'5'INDEX                   → Index #5 dans Index Repository
```

### LOG - Booléen

```
'TRUE'LOG                  → Valeur booléenne True
'FALSE'LOG                 → Valeur booléenne False
```

### DATE / TIME

```
'01/01/97'DATE             → Date (peut participer à l'arithmétique)
'01/01/97'DATE + 14        → 15/01/97
'14:30:15'TIME             → Temps
'14:30:15'TIME + 5         → +5 secondes
```

### EVENT / KBD

```
'Exit'EVENT                → Événement interne Exit
'F2'KBD                    → Touche F2
```

**Note**: Non disponible pour Rich Client tasks.

### MODE

Modes de tâche valides.

```
'MC'MODE                   → Mode Modify/Create
```

### MENU

```
'1'MENU                    → Premier menu (Default Pulldown)
```

### RIGHT

```
'RIGHT#4'RIGHT             → Droit utilisateur #4
Rights('SUPERVISOR'RIGHT)  → Vérifie si l'utilisateur a ce droit
```

### ERR

```
'Deadlock'ERR              → Erreur Deadlock (pour Automatic Retry)
```

---

## Fonctions associées aux Literals

### Fonctions VAR

| Fonction | Description |
|----------|-------------|
| `VarSet(var, value)` | Affecte une valeur à la variable |
| `VarCurr(var)` | Retourne la valeur courante |
| `VarPrev(var)` | Retourne la valeur précédente |
| `VarMod(var)` | Vérifie si la variable a été modifiée |
| `VarAttr(var)` | Retourne les attributs de la variable |
| `VarName(var)` | Retourne le nom de la variable |

### Fonctions DSOURCE

| Fonction | Description |
|----------|-------------|
| `DbDel(dsource, '')` | Supprime tous les enregistrements |
| `DbName(dsource)` | Retourne le nom physique de la table |
| `DbRecs(dsource, '')` | Retourne le nombre d'enregistrements |
| `DbExist(dsource)` | Vérifie si la table existe |

### Fonctions PROG

| Fonction | Description |
|----------|-------------|
| `CallProg(prog, args...)` | Appelle un programme dynamiquement |
| `ProgIdx(name, bool)` | Retourne l'index d'un programme par nom |

### Fonctions EXP

| Fonction | Description |
|----------|-------------|
| `ExpCalc(exp)` | Évalue une expression et retourne son résultat |

---

## Source Documentation

Chemin complet de l'aide Magic:
```
C:\Appwin\Magic\Magicxpa23\SUPPORT\mghelpw.chm
```

Fichiers HTML extraits:
```
C:\Appwin\Magic\Magicxpa23\SUPPORT\mghelpw_extracted\Expression_Editor\
```

Pages clés:
- `Literals.htm` - Liste complète des literals
- `VarSet.htm`, `VarCurr.htm`, `VarPrev.htm` - Fonctions VAR
- `DbDel.htm`, `DbName.htm`, `DbRecs.htm` - Fonctions DSOURCE
- `CallProg.htm`, `ProgIdx.htm` - Fonctions PROG
- `ExpCalc.htm` - Fonction EXP
