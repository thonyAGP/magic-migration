# import_go_erreur_affection

**Nom logique Magic** : `import_go_erreur_affection`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `imgoe_sequence` | int | 10 | non |  | 0 |
| 2 | `imgoe_ligne` | int | 10 | non |  | 0 |
| 3 | `imgoe_date` | char | 8 | non |  | 0 |
| 4 | `imgoe_heure` | char | 6 | non |  | 0 |
| 5 | `imgoe_chambre` | nvarchar | 10 | non |  | 0 |
| 6 | `imgoe_message` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| imgoe_IDX_1 | NONCLUSTERED | oui | imgoe_sequence, imgoe_ligne, imgoe_date, imgoe_heure, imgoe_chambre |

