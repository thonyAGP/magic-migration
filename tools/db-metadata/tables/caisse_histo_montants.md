# caisse_histo_montants

| Info | Valeur |
|------|--------|
| Lignes | 1564 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `date_comptable` | char | 8 | non |  | 1564 |
| 3 | `nouveau_solde_pms` | float | 53 | non |  | 1421 |
| 4 | `montant_total_compte` | float | 53 | non |  | 526 |
| 5 | `montant_monnaie_compte` | float | 53 | non |  | 526 |
| 6 | `nouveau_solde_pms_compte` | float | 53 | non |  | 537 |
| 7 | `mt5_total_tpe` | float | 53 | non |  | 1379 |
| 8 | `mt6_total_card_caisse_pms` | float | 53 | non |  | 1379 |
| 9 | `mt7_total_card_sans_session` | float | 53 | non |  | 1 |
| 10 | `mt8_total_tpe_anterieur_a_dc` | float | 53 | non |  | 78 |
| 11 | `mt9_total_ventes_card_a_dc` | float | 53 | non |  | 1288 |
| 12 | `montant_prod_apres_comptage` | float | 53 | non |  | 1 |
| 13 | `montant_prod_compte` | float | 53 | non |  | 1 |
| 14 | `libre` | nvarchar | 160 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `mt7_total_card_sans_session` (1 valeurs)

```
0
```

### `montant_prod_apres_comptage` (1 valeurs)

```
0
```

### `montant_prod_compte` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_histo_montants_IDX_1 | NONCLUSTERED | oui | societe, date_comptable |

