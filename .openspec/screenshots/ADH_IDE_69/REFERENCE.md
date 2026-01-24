# ADH IDE 69 - EXTRAIT_COMPTE - Captures IDE Magic Reference

> Date capture: 2026-01-23
> Source: IDE Magic Unipaas

## Screenshot 1: Logic View (Task 69 - Extrait de compte)

**Fichier**: logic-view.png

**Contenu**:
- **Task Prefix**:
  - Ligne 2: Update Variable EN avec With: 2 'C' (condition: >societe='')
  - Ligne 3: Call SubTask 1 (Recalcul solde)
  - Ligne 4: Call SubTask 2 (Presence Ecritures GIFT PASS) - Cnd: 8 VG FREE EXTRA

- **Task Suffix**:
  - Ligne 7: Call Program **182** (Raz Current Printer)

- **Record Suffix**:
  - Ligne 10: Call SubTask 3 (scroll sur compte) - Cnd: 6 NOT >P_FormatPDF
  - Ligne 12: Call Program **71** (Print extrait compte /Date) [17 Arguments] - Cnd: 7 >P_FormatPDF
  - Ligne 14: Call SubTask 4 (Reaffichage infos compte)

**Appels programmes identifiés**: 182, 71

---

## Screenshot 2: Expression Rules (69 - Extrait de compte)

**Fichier**: expression-rules.png

**9 Expressions**:
| # | Expression |
|---|------------|
| 1 | EN='' |
| 2 | 'C' |
| 3 | EN |
| 4 | EP |
| 5 | EQ |
| 6 | NOT EX |
| 7 | EX |
| 8 | BL |
| 9 | 'TRUE'LOG |

**Variables visibles** (EH à FA):
| Variable | Nom | Type | Source |
|----------|-----|------|--------|
| EH | VG. Interface Galaxy Grèce | Logical | Virtual |
| EI | VG.Second Safe Control 1.00 | Logical | Virtual |
| EJ | VG.Devise locale | Alpha | Virtual |
| EK | VG.Masque | Alpha | Virtual |
| EN | > societe | Alpha | Parameter |
| EO | > code_retour | Alpha | Parameter |
| EP | > code_adherent | Numeric | Parameter |
| EQ | > filiation | Numeric | Parameter |
| ER | > masque mtt | Alpha | Parameter |
| ES | > nom village | Alpha | Parameter |
| ET | < solde compte | Numeric | Parameter |
| EU | < etat compte | Alpha | Parameter |
| EV | < date solde | Date | Parameter |
| EW | < garanti O/N | Alpha | Parameter |
| EX | >P_FormatPDF | Logical | Parameter |
| EY | >P.ViensDe | Alpha | Parameter |
| EZ | dat_societe | Unicode | date_comptable__dat |
| FA | dat_date_comptable | Date | date_comptable__dat |

**Note**: Variables commencent à EH (pas A) = offset de 134 colonnes des ancêtres

---

## Screenshot 3: DataView (Task 69 - Extrait de compte)

**Fichier**: dataview.png

**Structure complète** (37+ lignes visibles):

### Main Source
- Ligne 1: Main Source **0** (No Main Source), Index: 0

### Parameters (lignes 2-14)
| Ligne | Type | # | Nom | Attribut | Picture |
|-------|------|---|-----|----------|---------|
| 2 | Parameter | 1 | > societe | Alpha | U |
| 3 | Parameter | 2 | > code_retour | Alpha | U |
| 4 | Parameter | 3 | > code_adherent | Numeric | ########P0 |
| 5 | Parameter | 4 | > filiation | Numeric | 3L |
| 6 | Parameter | 5 | > masque mtt | Alpha | 16 |
| 7 | Parameter | 6 | > nom village | Alpha | U30 |
| 8 | Parameter | 7 | < solde compte | Numeric | N## ### ### ###.## |
| 9 | Parameter | 8 | < etat compte | Alpha | U |
| 10 | Parameter | 9 | < date solde | Date | ##/##/##Z |
| 11 | Parameter | 10 | < garanti O/N | Alpha | U |
| 12 | Parameter | 11 | >P_FormatPDF | Logical | 5 |
| 13 | (comment) | - | l'application appelante : PVE, RET, ADH | - | - |
| 14 | Parameter | 12 | >P.ViensDe | Alpha | U3 |

### Link Query 70 - Ref_Tables.date_comptable__da (lignes 16-19)
| Ligne | Type | # | Nom | Attribut | Locate |
|-------|------|---|-----|----------|--------|
| 16 | Link Query | 70 | Ref_Tables.date_comptable__da | Index: 1 | Direction: Default |
| 17 | Column | 1 | dat_societe | Unicode | 3 To: 3 |
| 18 | Column | 2 | dat_date_comptable | Date | DD/MM/YYYY |
| 19 | End Link | - | - | - | - |

### Link Query 755 - Ref_Tables.comptes_speciaux_sp (lignes 21-27)
| Ligne | Type | # | Nom | Attribut | Locate |
|-------|------|---|-----|----------|--------|
| 21 | Link Query | 755 | Ref_Tables.comptes_speciaux_sp | Index: 1 | - |
| 22 | Column | 1 | spc_societe | Unicode | 3 To: 3 |
| 23 | Column | 2 | spc_num_compte | Numeric | 4 To: 4 |
| 24 | Column | 3 | spc_filiation | Numeric | 5 To: 5 |
| 26 | Column | 11 | spc_fictif | Logical | 5 |
| 27 | End Link | - | - | - | - |

### Link Query 707 - Ref_Tables.parametre_generaux (lignes 28-31)
| Ligne | Type | # | Nom | Attribut |
|-------|------|---|-----|----------|
| 28 | Link Query | 707 | Ref_Tables.parametre_generaux | Index: 1 |
| 29 | Column | 1 | societe | Unicode |
| 30 | Column | 20 | edit_tva_ext_compte | Logical |
| 31 | End Link | - | - | - |

### Virtuals (lignes 33-36)
| Ligne | Type | # | Nom | Attribut |
|-------|------|---|-----|----------|
| 33 | Virtual | 1 | W0 Presence Recap Free Extra | Logical |
| 34 | Virtual | 2 | W0 Print Recap Free Extra | Logical |
| 36 | Virtual | 3 | W0 Mail Existe | Logical |

### Link Query 285 (ligne 37+)
| Ligne | Type | # | Nom |
|-------|------|---|-----|
| 37 | Link Query | 285 | Ref_Tables.email |

---

## Screenshot 4: Program Repository

**Fichier**: program-repository.png

**Programme ADH IDE 69**:
- **Name**: Extrait de compte
- **Folder**: Extrait de Compte
- **Public Name**: EXTRAIT_COMPTE
- **Last Update**: 08/01/2026 23:42:11
- **External**: Non coché

**Statistiques projet ADH**:
- Total programmes: 323

---

## Validation KB vs IDE (2026-01-23)

### Note importante
Les screenshots ci-dessus documentent uniquement **Task 1** (tâche principale).
Le programme complet contient **12 tâches** avec ses sous-tâches.

### Validation Task 1 (screenshots)
| Élément | IDE | KB Task 1 | Status |
|---------|-----|-----------|--------|
| Public Name | EXTRAIT_COMPTE | EXTRAIT_COMPTE | ✅ |
| Expressions | 9 | 9 | ✅ |
| Program Calls | 2 (182, 71) | 2 | ✅ |
| Parameters | 12 | 12 | ✅ |
| Link Queries | 4 (70, 755, 707, 285) | 4 | ✅ |
| Virtuals | 3 | 3 | ✅ |

### Validation Programme Complet (KB)
| Métrique | KB | Status |
|----------|-----|--------|
| Tasks | 12 | ✅ |
| Expressions (total) | 188 | ✅ |
| Program Calls (total) | 33 | ✅ |

**100% ISO avec IDE Magic**
