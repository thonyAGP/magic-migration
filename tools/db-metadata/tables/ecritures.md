# ecritures

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `yyyymm` | int | 10 | non |  | 0 |
| 2 | `nombre_lignes_gm` | int | 10 | non |  | 0 |
| 3 | `nombre_lignes_go` | int | 10 | non |  | 0 |
| 4 | `nombre_lignes_autres` | int | 10 | non |  | 0 |
| 5 | `montant_gm` | int | 10 | non |  | 0 |
| 6 | `montant_go` | int | 10 | non |  | 0 |
| 7 | `montant_autres` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ecritures_IDX_1 | NONCLUSTERED | oui | yyyymm |

