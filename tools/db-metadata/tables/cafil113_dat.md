# cafil113_dat

| Info | Valeur |
|------|--------|
| Lignes | 74 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code_circuit` | nvarchar | 6 | non |  | 74 |
| 3 | `libelle` | nvarchar | 20 | non |  | 45 |
| 4 | `forfait_non_skieur` | bit |  | non |  | 1 |
| 5 | `type_prestation` | nvarchar | 6 | oui |  | 1 |
| 6 | `stype_tm` | nvarchar | 2 | non |  | 1 |
| 7 | `code_service` | nvarchar | 4 | non |  | 1 |
| 8 | `code_categorie_prestation` | nvarchar | 3 | non |  | 15 |

## Valeurs distinctes

### `code_societe` (1 valeurs)

```
C
```

### `libelle` (45 valeurs)

```
AFTER SUN REJUVENATI, BABY BED, BABY CLUB 4-23 MONTH, BACK TO THE NATURE, BIJDRAGE SGR, BSI VACANCES GO BRAS, CANCELLATION FOR ANY, CHRONO SMOOTH LIFTIN, CM BABY WELCOME, CORAL AND MAITON, DON FONDATION CLUB M, DONATION FRIENDS OF, DOUBLE DELIGHT (FOR, ELEPHANT CARE ADVENT, FACIAL TREATMENT - 5, FACIAL TREATMENT 50, FORFAIRT SAI NA, GUARANTEE FUNDS, INTRODUCTION OF BUDD, KHOR BARAI ANDAMAN, KING SIZE BED, MASSAGE 50 M  AFTER, MASSAGE 50 M  BEFORE, MASSAGE 50 MINUTES I, MEDICAL INSURANCE, OFFRE HONEY MOON PRE, PETIT CLUB 2-3 YEARS, PETIT CLUB MED 2 ANS, PETIT CLUB MED 3 ANS, PHI PHI ISLAND BY SP, PHUKET MIX TOUR, PL.CONF.ACCOMP(4PL), PL.DEBUTANT.5PL, Prestation Inconnue, REFRESH AND REJOICE, SERENITY PROTECTION, TAILORED TREATMENTS, TRANSFERT, TRAVEL INSURANCE, TRAVEL INSURANCE AMS, TRAVEL INSURANCE RUS, TRAVEL INSURANCE SUI, TRAVEL INSURANCE SUN, TRIBE, TSF PHUKET APT
```

### `forfait_non_skieur` (1 valeurs)

```
0
```

### `code_categorie_prestation` (15 valeurs)

```
, CB1, DON, EN2, ENF, EXN, FON, HM4, PB6, SA4, SA8, TSF, TVV, VI9, VSS
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil113_dat_IDX_1 | NONCLUSTERED | oui | code_societe, code_circuit |

