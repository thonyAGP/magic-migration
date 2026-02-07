# quadriga_chambre

**Nom logique Magic** : `quadriga_chambre`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `quc_num_chambre` | nvarchar | 6 | non |  | 0 |
| 2 | `quc_num_compte` | int | 10 | non |  | 0 |
| 3 | `quc_filiation` | smallint | 5 | non |  | 0 |
| 4 | `quc_date_demande` | char | 8 | non |  | 0 |
| 5 | `quc_heure_demande` | char | 6 | non |  | 0 |
| 6 | `quc_code_demande` | nvarchar | 1 | non |  | 0 |
| 7 | `quc_reponse_traitement` | nvarchar | 2 | non |  | 0 |
| 8 | `quc_date_traitement` | char | 8 | non |  | 0 |
| 9 | `quc_heure_traitement` | char | 6 | non |  | 0 |
| 10 | `quc_ancienne_chambre` | nvarchar | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| quadriga_chambre_IDX_1 | NONCLUSTERED | oui | quc_num_chambre, quc_num_compte, quc_filiation, quc_date_demande, quc_heure_demande |

