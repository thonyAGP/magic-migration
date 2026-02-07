# checkout_log

**Nom logique Magic** : `checkout_log`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `CGM_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `CGM_Code_adherent` | int | 10 | non |  | 0 |
| 3 | `CGM_qualite` | nvarchar | 2 | non |  | 0 |
| 4 | `CGM_nom_prenom` | nvarchar | 24 | non |  | 0 |
| 5 | `CGM_Etat` | nvarchar | 1 | non |  | 0 |
| 6 | `CGM_Garanti` | nvarchar | 1 | non |  | 0 |
| 7 | `CGM_Solde_du_compte` | float | 53 | non |  | 0 |
| 8 | `CGM_Plafond_depense` | float | 53 | non |  | 0 |
| 9 | `CGM_Date_limit_solde` | char | 8 | non |  | 0 |
| 10 | `CGM_Date_compt_sold` | char | 8 | non |  | 0 |
| 11 | `CGM_Date_lastoperat` | char | 8 | non |  | 0 |
| 12 | `CGM_Heure_lastoperat` | char | 6 | non |  | 0 |
| 13 | `CGM_Operateur` | nvarchar | 8 | non |  | 0 |
| 14 | `CGM_flag` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| checkout_log_IDX_3 | NONCLUSTERED | non | CGM_societe, CGM_nom_prenom |
| checkout_log_IDX_1 | NONCLUSTERED | oui | CGM_societe, CGM_Code_adherent |
| checkout_log_IDX_5 | NONCLUSTERED | non | CGM_societe, CGM_Date_limit_solde |
| checkout_log_IDX_4 | NONCLUSTERED | non | CGM_societe, CGM_qualite, CGM_nom_prenom |
| checkout_log_IDX_2 | NONCLUSTERED | non | CGM_societe, CGM_Etat |

