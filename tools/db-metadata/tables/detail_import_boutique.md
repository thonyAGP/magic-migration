# detail_import_boutique

**Nom logique Magic** : `detail_import_boutique`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dib_date_import` | char | 8 | non |  | 0 |
| 2 | `dib_heure_import` | char | 6 | non |  | 0 |
| 3 | `dib_nom` | nvarchar | 14 | non |  | 0 |
| 4 | `dib_prenom` | nvarchar | 9 | non |  | 0 |
| 5 | `dib_montant` | nvarchar | 12 | non |  | 0 |
| 6 | `dib_date_vente` | char | 8 | non |  | 0 |
| 7 | `dib_heure_vente` | char | 6 | non |  | 0 |
| 8 | `dib_num_club` | float | 53 | non |  | 0 |
| 9 | `dib_filiation` | int | 10 | non |  | 0 |
| 10 | `dib_annulation` | nvarchar | 2 | non |  | 0 |
| 11 | `dib_libelle_article` | nvarchar | 20 | non |  | 0 |
| 12 | `dib_rayon` | nvarchar | 9 | non |  | 0 |
| 13 | `dib_quantite` | nvarchar | 5 | non |  | 0 |
| 14 | `dib_remise` | nvarchar | 10 | non |  | 0 |
| 15 | `dib_taux_tva` | nvarchar | 8 | non |  | 0 |
| 16 | `dib_montant_ligne` | nvarchar | 10 | non |  | 0 |
| 17 | `dib_reglement` | nvarchar | 3 | non |  | 0 |
| 18 | `dib_id_ticket` | nvarchar | 25 | non |  | 0 |
| 19 | `dib_ticket_num_ligne` | nvarchar | 3 | non |  | 0 |
| 20 | `dib_rowid` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| detail_import_boutique_IDX_2 | NONCLUSTERED | oui | dib_num_club, dib_filiation, dib_rowid |
| detail_import_boutique_IDX_1 | NONCLUSTERED | oui | dib_date_import, dib_heure_import, dib_rowid |

