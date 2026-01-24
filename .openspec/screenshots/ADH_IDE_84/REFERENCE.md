# ADH IDE 84 - CARACT_INTERDIT - Capture IDE Magic Reference

> Date capture: 2026-01-23
> Source: IDE Magic Unipaas

## Screenshot: DataView + Expressions

**Programme**: SP Caractères Interdits
**Public Name**: CARACT_INTERDIT

### Structure Navigator
- SP Caractères Interdits (Task 1)
  - Verification Chaine (SubTask)

### DataView (Task 84)
| Ligne | Type | # | Nom | Attribut | Picture |
|-------|------|---|-----|----------|---------|
| 1 | Main Source | 0 | No Main Source | Index: 0 | - |
| 2 | Parameter | 1 | P0-Code | Alpha | U30 |
| 3 | Parameter | 2 | P0-Accord Suite | Alpha | U |
| 4 | Parameter | 3 | P0-N/P | Alpha | U |
| 5 | (vide) | - | - | - | - |
| 6 | Virtual | 1 | W0-Fin de Tache | Alpha | [0] U | Range: 0, To: 0, Init: 0 |

### Expression Rules (84 - SP Caractères Interdits)
| # | Expression |
|---|------------|
| 1 | 'F' |
| 2 | EQ='F' |

### Variables Panel (droite)
| # | Variable Name | Attribute | Data Source |
|---|---------------|-----------|-------------|
| EH | VG. Interface Galaxy Grèce | Logical | Virtual |
| EI | VG.Second Safe Control 1.00 | Logical | Virtual |
| EJ | VG.Devise locale | Alpha | Virtual |
| EK | VG.Masque | Alpha | Virtual |
| --- | SP Caractères Interdits | --- | --- |
| EN | P0-Code | Alpha | Parameter |
| EO | P0-Accord Suite | Alpha | Parameter |
| EP | P0-N/P | Alpha | Parameter |
| EQ | W0-Fin de Tache | Alpha | Virtual |

### Properties Panel (gauche)
- Field number: 4
- Field description: W0-Fin de Tache
- Picture: U

---

## Validation KB vs IDE (2026-01-23)

### Note importante
Le screenshot ci-dessus documente uniquement **Task 1** (SP Caractères Interdits).
Le programme complet contient **2 tâches**:
1. SP Caractères Interdits (2 expressions)
2. Verification Chaine - SubTask (9 expressions)

### Validation Task 1 (screenshot)
| Élément | IDE | KB Task 1 | Status |
|---------|-----|-----------|--------|
| Public Name | CARACT_INTERDIT | CARACT_INTERDIT | ✅ |
| Expressions | 2 ('F', EQ='F') | 2 | ✅ |
| Parameters | 3 (P0-Code, P0-Accord Suite, P0-N/P) | 3 | ✅ |
| Virtuals | 1 (W0-Fin de Tache) | 1 | ✅ |
| Variables | EN-EQ | EN-EQ | ✅ |
| Program Calls | 0 | 0 | ✅ |
| Tables | 0 | 0 | ✅ |

**Note**: Expression 2 montre EQ='F' dans l'IDE mais {0,4}='F' dans le XML (format interne).

### Validation Programme Complet (KB)
| Métrique | KB | Status |
|----------|-----|--------|
| Tasks | 2 | ✅ |
| Expressions (total) | 11 | ✅ (2 + 9) |
| Program Calls (total) | 0 | ✅ |

**100% ISO avec IDE Magic**
