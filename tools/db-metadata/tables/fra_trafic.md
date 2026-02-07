# fra_trafic

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 19 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ressource` | nvarchar | 4 | non |  | 0 |
| 2 | `type_ressource` | nvarchar | 1 | non |  | 0 |
| 3 | `type_produit` | nvarchar | 1 | non |  | 0 |
| 4 | `code_produit` | nvarchar | 6 | non |  | 0 |
| 5 | `sous_type_produit` | nvarchar | 2 | non |  | 0 |
| 6 | `sens` | nvarchar | 1 | non |  | 0 |
| 7 | `numero_vol` | nvarchar | 10 | non |  | 0 |
| 8 | `date_depart` | nvarchar | 8 | non |  | 0 |
| 9 | `heure_depart` | nvarchar | 4 | non |  | 0 |
| 10 | `code_iata_aeroport_depart` | nvarchar | 6 | non |  | 0 |
| 11 | `date_arrivee` | nvarchar | 8 | non |  | 0 |
| 12 | `heure_arrivee` | nvarchar | 4 | non |  | 0 |
| 13 | `code_iata_arrivee` | nvarchar | 6 | non |  | 0 |
| 14 | `categorie` | nvarchar | 6 | non |  | 0 |
| 15 | `classe` | nvarchar | 3 | non |  | 0 |
| 16 | `numero_pnr` | nvarchar | 12 | non |  | 0 |
| 17 | `compagnie` | nvarchar | 9 | non |  | 0 |
| 18 | `affreteur` | nvarchar | 6 | non |  | 0 |
| 19 | `RowId_322` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fra_trafic_IDX_1 | NONCLUSTERED | oui | RowId_322 |

