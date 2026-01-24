# PVE IDE 403 - Menu Main (TPE) - Captures IDE Magic Reference

> Date capture: 2026-01-23
> Source: IDE Magic Unipaas

---

## Screenshot 1: Logic View - Task 403.1.4.5 "Generate Preview OD"

### Task Prefix
| Ligne | Opération | Type | Cible | Description | Arguments/With |
|-------|-----------|------|-------|-------------|----------------|
| 2 | Call | Program | 297 | Get Bank accounting date | [2 Arguments] |
| 3 | Update | Variable | OM | V ski accounting date | With: 6 (V bank accounting date) |
| 4 | Call | Program | 126 | Verif cloture | [2 Arguments] |
| 5 | (comment) | - | - | Par securite | - |
| 6 | Evaluate | Expression | 2 | DbDel('9'DSOURCE,'') | - |

### Task Suffix
| Ligne | Opération | Type | Cible | Description | With | Condition |
|-------|-----------|------|-------|-------------|------|-----------|
| 8 | Update | Variable | LT | validated__ | With: 3 'TRUE'LOG | Cnd: 1 (L confirmation ?=6) |
| 9 | Evaluate | Expression | 2 | DbDel('9'DSOURCE,'') | - | - |

### Record Prefix
| Ligne | Opération | Type | Cible | Description | With | Condition |
|-------|-----------|------|-------|-------------|------|-----------|
| 11 | (comment) | - | - | First passage | - | - |
| 12 | Call | SubTask | 2 | Batch global | - | - |
| 13 | Update | Variable | OY | V.ITERATION | With: 7 (1) | - |
| 14 | (comment) | - | - | Pas d'erreur equipment = Preview transactions | - | - |
| 15 | Call | SubTask | 1 | Preview Payments | - | Cnd: 4 NOT(L error equipment) |
| 16 | (comment) | - | - | Erreur equipment = Message | - | - |
| 17 | Verify | Warning | 0 | All the equipments must be assigned... | Display in Box | Cnd: 5 L error equipment? |
| 18 | (comment) | - | - | Confirmation = Payment et Edition | - | - |
| 19 | Block | If | 10 | {V Cancel pour pour Gift Pass | - | - |
| 20 | Update | Variable | OF | v Annule Payment | With: 11 'TRUE'LOG | - |
| 21 | Evaluate | Expression | 2 | DbDel('9'DSOURCE,'') | - | - |
| 22 | Block | End | - | } | - | - |
| 23 | Block | If | 1 | {L confirmation ?=6 | - | - |
| 24 | Evaluate | Expression | 2 | DbDel('9'DSOURCE,'') | - | - |
| 25 | Call | SubTask | 2 | Batch global | - | - |
| 26 | Raise Event | - | - | Annulation Garantie | Wait: Yes | Cnd: 8 v Annulation Vente Ga |
| 27 | Call | SubTask | 4 | Maj Garantie | - | Cnd: 9 VG PME (Porte Monnaie) |
| 28 | Block | End | - | } | - | - |
| 29 | (comment) | - | - | Suppression des lignes Gift Pass non validées | - | - |
| 30 | Call | SubTask | 5 | Suppression Gift Pass | - | - |

**Program Calls dans cette tâche:** 297, 126 (2 appels)

---

## Screenshot 2: DataView - Task 403.1.4.5 "Generate Preview OD"

**Main Source**: 0 (No Main Source), Index: 0

### Parameters & Virtuals
| Ligne | Type | # | Nom | Attribut | Picture |
|-------|------|---|-----|----------|---------|
| 1 | Main Source | 0 | No Main Source | Index: 0 | - |
| 2 | Parameter | 1 | P select all ? | Logical | 5 |
| 3 | Virtual | 2 | V bank accounting date | Date | ##/##/#### |
| 4 | Virtual | 3 | V ski accounting date | Date | ##/##/#### |
| 5 | Virtual | 4 | L cloture in progress ? | Logical | 5 |
| 6 | Virtual | 5 | L confirmation ? | Numeric | 1 |
| 7 | Virtual | 6 | L error equipment ? | Logical | 5 |
| 8 | (comment) | - | Ajout du 22/01/2013 | - | - |
| 9 | Virtual | 7 | L error payeur ? | Logical | 5 |
| 10 | (comment) | - | Ajout du 28/07/2013 pour Crédit conso | - | - |
| 11 | Virtual | 8 | V Total Ticket | Numeric | N10.3 |
| 12 | Virtual | 9 | V Total CréditConso | Numeric | N10.3 |
| 13 | Virtual | 10 | V EZcard | Alpha | 10 |
| 14 | (comment) | - | Pour TPE | - | - |
| 15 | Virtual | 11 | V.Id transaction PMS | Alpha | 32 |
| 16 | Virtual | 12 | V.Id transaction AXIS | Alpha | 32 |
| 17 | Virtual | 13 | V.MOP TPE | Alpha | 4 |
| 18 | Virtual | 14 | V.MOP PMS | Alpha | 5 |
| 19 | Virtual | 15 | V.ITERATION | Numeric | 1 |
| 20 | Virtual | 16 | V Cancel pour pour Gift Pass | Logical | 5 |
| 21 | Virtual | 17 | v Annulation Vente Garantie | Logical | 5 |
| 22 | Virtual | 18 | v ReCredit Garantie | Logical | 5 |
| 23 | Virtual | 19 | v Total Vente | Numeric | N12.3 |

---

## Screenshot 3: Expression Rules - Task 403.1.4.5 "Generate Preview OD"

**11 Expressions:**
| # | Expression |
|---|------------|
| 1 | OO=6 |
| 2 | DbDel ('9'DSOURCE,'') |
| 3 | 'TRUE'LOG |
| 4 | NOT (OP) |
| 5 | OP |
| 6 | OL |
| 7 | 1 |
| 8 | PA AND BE AND LA<>'CANCEL' |
| 9 | BE AND LA='CANCEL' |
| 10 | OZ |
| 11 | 'TRUE'LOG |

### Variables Panel (OH à OZ)
| Var | Nom | Attribut | Data Source |
|-----|-----|----------|-------------|
| OH | v.Adresse Mail | Alpha | Virtual |
| OI | v.Langue | Alpha | Virtual |
| OJ | v.Envoi Email | Logical | Virtual |
| OK | P select all ? | Logical | Parameter |
| OL | V bank accounting date | Date | Virtual |
| OM | V ski accounting date | Date | Virtual |
| ON | L cloture in progress ? | Logical | Virtual |
| OO | L confirmation ? | Numeric | Virtual |
| OP | L error equipment ? | Logical | Virtual |
| OQ | L error payeur ? | Logical | Virtual |
| OR | V Total Ticket | Numeric | Virtual |
| OS | V Total CréditConso | Numeric | Virtual |
| OT | V EZcard | Alpha | Virtual |
| OU | V.Id transaction PMS | Alpha | Virtual |
| OV | V.Id transaction AXIS | Alpha | Virtual |
| OW | V.MOP TPE | Alpha | Virtual |
| OX | V.MOP PMS | Alpha | Virtual |
| OY | V.ITERATION | Numeric | Virtual |
| OZ | V Cancel pour pour Gift Pass | Logical | Virtual |

**Expanded View:** L confirmation ?=6

---

## Screenshot 4: Logic View - Task 403 "Menu Main (TPE)" (tâche racine)

### Task Prefix
| Ligne | Opération | Type | Cible | Description | With | Condition |
|-------|-----------|------|-------|-------------|------|-----------|
| 2 | Update | Variable | FP | V Update tab filiation | With: 2 'TRUE'LOG | Cnd: 6 VG.CUST ID<>0 |
| 3 | Update | Variable | FQ | V Decimal | With: 3 GetParam('DECIMALNUMBER') | - |
| 4 | Update | Variable | FR | V Masque | With: 4 GetParam('AMOUNTFORMAT') | - |
| 5 | Update | Variable | FS | V Masque sans Z | With: 5 Left(Trim(V Masque),Len(Trim(V... | - |

### Record Prefix
| Ligne | Opération | Type | Cible | Description | With |
|-------|-----------|------|-------|-------------|------|
| 7 | Call | SubTask | 1 | browse | - |
| 8 | Update | Variable | FN | V no exit | With: 2 'TRUE'LOG |

---

## Screenshot 5: DataView + Expression Rules - Task 403 "Menu Main (TPE)"

### DataView
| Ligne | Type | # | Nom | Attribut | Picture |
|-------|------|---|-----|----------|---------|
| 1 | Main Source | 0 | No Main Source | Index: 0 | - |
| 2 | Virtual | 1 | V no exit | Logical | 5 |
| 3 | Virtual | 2 | L.equipment id | Alpha | 5 |
| 4 | Virtual | 3 | V Update tab filiation | Logical | 5 |
| 5 | Virtual | 4 | V Decimal | Numeric | 1 |
| 6 | Virtual | 5 | V Masque | Alpha | 20 |
| 7 | Virtual | 6 | V Masque sans Z | Alpha | 20 |
| 8 | Virtual | 7 | V.recherche clubmed pass | Alpha | 10 |
| 9 | Virtual | 8 | V.Num Compte sauvegarde | Numeric | #########P0 | Range: 0, To: 0, Init: 0 |

### Expression Rules - Task 403 (7 expressions)
| # | Expression |
|---|------------|
| 1 | NOT (FN) |
| 2 | 'TRUE'LOG |
| 3 | GetParam('DECIMALNUMBER') |
| 4 | GetParam('AMOUNTFORMAT') |
| 5 | Left(Trim(FR),Len(Trim(FR))-1) |
| 6 | Q<>0 |
| 7 | IF(BI<>1,'3'FORM,'2'FORM) |

### Variables Panel (FH à FU)
| Var | Nom | Attribut | Data Source |
|-----|-----|----------|-------------|
| FH | VG. Japan China DIN | Logical | Virtual |
| FI | VG. Manual Prepaid Comment | Logical | Virtual |
| FJ | VG.Great Member Revamped | Logical | Virtual |
| FK | VG.ECI En cours de séjour | Logical | Virtual |
| FL | VG. Serv Voir téléphone | Logical | Virtual |
| FM | VG.texte pour ligne total M&E | Unicode | Virtual |
| FN | V no exit | Logical | Virtual |
| FO | L.equipment id | Alpha | Virtual |
| FP | V Update tab filiation | Logical | Virtual |
| FQ | V Decimal | Numeric | Virtual |
| FR | V Masque | Alpha | Virtual |
| FS | V Masque sans Z | Alpha | Virtual |
| FT | V.recherche clubmed pass | Alpha | Virtual |
| FU | V.Num Compte sauvegarde | Numeric | Virtual |

---

## Structure Navigator (partiel visible)

```
Menu Main (TPE)
├── browse
│   ├── Scan
│   ├── equipments
│   │   ├── check out
│   │   │   └── clear
│   │   ├── serial check out
│   │   │   └── scan equipment
│   │   └── serial check in
│   │       └── scan equipment
│   ├── Payments
│   │   └── SQL Total payement
│   └── Package
│       ├── Renvoi Mail
│       ├── actions
│       │   └── Saisie comment annulation
│       ├── Payment
│       │   ├── init payer
│       │   └── create cardType
│       ├── Discount %
│       │   └── Saisie comment annulation
│       ├── Generate Preview OD
│       │   ├── Preview Payments
│       │   │   └── calcul total
│       │   └── Batch global
│       │       ├── batch comptable
│       │       │   ├── OD debit 18
│       │       │   ├── OD credit 18
│       │       │   ├── OD debit 181
│       │       │   ├── OD credit 181
│       │       │   ├── OD debit PoS
│       │       │   ├── OD credit PoS
│       │       │   ├── OD cancel PoS
│       │       │   │   └── OD cancel PoS
│       │       │   ├── OD cancel 18
│       │       │   │   ├── OD cancel 18
│       │       │   │   └── cancel vente
│       │       │   └── OD cancel 181
│       │       │       └── OD cancel 181
│       │       ├── update cust rentals
│       │       │   └── Calcul days
│       │       │       └── Lect PoS Compta
│       │       └── Lecture IN PO
│       │           ├── OD credit PoS pack
│       │           └── OD credit 18
│       ...
```

---

## VALIDATION KB vs IDE

### ✅ ÉCART 1: Nom du Programme - CORRIGÉ (2026-01-23)
| Source | Valeur |
|--------|--------|
| **IDE** | Menu Main (TPE) |
| **KB** | Menu Main (TPE) ✅ |

**FIX**: Bug corrigé - lecture du nom depuis `Task/Header/@Description` dans Prg_*.xml quand absent de ProgramHeaders.xml.

### Vérification des expressions
| Tâche | Expressions IDE | Status |
|-------|-----------------|--------|
| Task 403 (main) | 7 | ✅ |
| Task 403.1.4.5 (Generate Preview OD) | 11 | ✅ |
| **TOTAL Programme** | **1684** | ✅ (KB=1684) |

### Vérification des Program Calls
| Tâche | Appels visibles | Programmes appelés |
|-------|-----------------|-------------------|
| Task 403.1.4.5 | 2 | 297 (Get Bank accounting date), 126 (Verif cloture) |
| **TOTAL Programme** | **69** | ✅ (KB=69) |

---

## VALIDATION FINALE KB (2026-01-23)

| Métrique | IDE | KB | Status |
|----------|-----|-----|--------|
| Nom | Menu Main (TPE) | Menu Main (TPE) | ✅ |
| Tasks | 85 | 85 | ✅ |
| Expressions | 1684 | 1684 | ✅ |
| Program Calls | 69 | 69 | ✅ |

**100% ISO avec IDE Magic**
