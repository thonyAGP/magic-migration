# caisse_ref_compte_produit

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cre_service_village` | nvarchar | 4 | non |  | 0 |
| 2 | `cre_imputation` | float | 53 | non |  | 0 |
| 3 | `cre_sous_imputation` | int | 10 | non |  | 0 |
| 4 | `cre_libelle` | nvarchar | 64 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_compte_produit_IDX_1 | NONCLUSTERED | oui | cre_service_village, cre_imputation, cre_sous_imputation |
| caisse_ref_compte_produit_IDX_2 | NONCLUSTERED | non | cre_imputation, cre_sous_imputation |

