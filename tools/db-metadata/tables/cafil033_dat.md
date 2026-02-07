# cafil033_dat

| Info | Valeur |
|------|--------|
| Lignes | 1565 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sks_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `sks_date_comptable` | char | 8 | non |  | 1565 |
| 3 | `sks_cumul_pces_caiss` | float | 53 | non |  | 1420 |
| 4 | `sks_cumul_versmnt` | float | 53 | non |  | 1380 |
| 5 | `sks_cumul_retraits` | float | 53 | non |  | 747 |
| 6 | `sks_solde_caisse` | float | 53 | non |  | 1423 |
| 7 | `sks_resultat_compta` | float | 53 | non |  | 1380 |
| 8 | `sks_cumul_res_saison` | float | 53 | non |  | 1380 |

## Valeurs distinctes

### `sks_societe` (1 valeurs)

```
C
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil033_dat_IDX_1 | NONCLUSTERED | oui | sks_societe, sks_date_comptable |

