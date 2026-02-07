# reterr_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `numero_adherent` | float | 53 | non |  | 0 |
| 2 | `lettre_controle` | nvarchar | 1 | non |  | 0 |
| 3 | `filiation_club` | int | 10 | non |  | 0 |
| 4 | `nom` | nvarchar | 30 | non |  | 0 |
| 5 | `prenom` | nvarchar | 8 | non |  | 0 |
| 6 | `date_achat` | char | 8 | non |  | 0 |
| 7 | `heure_achat` | char | 6 | non |  | 0 |
| 8 | `date_post` | char | 8 | non |  | 0 |
| 9 | `heure_post` | char | 6 | non |  | 0 |
| 10 | `montant` | float | 53 | non |  | 0 |
| 11 | `annulation` | nvarchar | 1 | non |  | 0 |
| 12 | `type_erreur` | nvarchar | 30 | non |  | 0 |
| 13 | `date_comptable` | char | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| reterr_dat_IDX_1 | NONCLUSTERED | oui | numero_adherent, filiation_club, date_achat, heure_achat |
| reterr_dat_IDX_2 | NONCLUSTERED | oui | date_comptable, numero_adherent, filiation_club, date_achat, heure_achat |

