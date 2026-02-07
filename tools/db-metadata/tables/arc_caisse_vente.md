# arc_caisse_vente

**Nom logique Magic** : `arc_caisse_vente`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 43 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `arc_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `arc_compte_gm` | int | 10 | non |  | 0 |
| 3 | `arc_filiation` | smallint | 5 | non |  | 0 |
| 4 | `arc_imputation` | float | 53 | non |  | 0 |
| 5 | `arc_sous_imputation` | smallint | 5 | non |  | 0 |
| 6 | `arc_libelle` | nvarchar | 15 | non |  | 0 |
| 7 | `arc_libelle_supplem_` | nvarchar | 15 | non |  | 0 |
| 8 | `arc_credit_debit` | nvarchar | 1 | non |  | 0 |
| 9 | `arc_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 10 | `arc_code_type` | nvarchar | 1 | non |  | 0 |
| 11 | `arc_numero_chrono` | int | 10 | non |  | 0 |
| 12 | `arc_avec_change` | nvarchar | 1 | non |  | 0 |
| 13 | `arc_mode_de_paiement` | nvarchar | 4 | non |  | 0 |
| 14 | `arc_montant` | float | 53 | non |  | 0 |
| 15 | `arc_date_comptable` | char | 8 | non |  | 0 |
| 16 | `arc_date_d_operation` | char | 8 | non |  | 0 |
| 17 | `arc_heure_operation` | char | 6 | non |  | 0 |
| 18 | `arc_nbre_d_articles` | smallint | 5 | non |  | 0 |
| 19 | `arc_flag_application` | nvarchar | 1 | non |  | 0 |
| 20 | `arc_type_transaction` | nvarchar | 1 | non |  | 0 |
| 21 | `arc_operateur` | nvarchar | 8 | non |  | 0 |
| 22 | `arc_RowId_263` | int | 10 | non |  | 0 |
| 23 | `arc_ref_article` | float | 53 | non |  | 0 |
| 24 | `arc_taux_tva` | float | 53 | non |  | 0 |
| 25 | `arc_no_facture` | float | 53 | non |  | 0 |
| 26 | `arc_service` | nvarchar | 4 | non |  | 0 |
| 27 | `arc_montant_remise` | float | 53 | non |  | 0 |
| 28 | `arc_date_purge` | char | 8 | non |  | 0 |
| 29 | `arc_id_transaction` | nvarchar | 32 | oui |  | 0 |
| 30 | `arc_id_acceptation` | nvarchar | 32 | oui |  | 0 |
| 31 | `arc_free_extra` | bit |  | non |  | 0 |
| 32 | `arc_montant_total_pour_free_ext` | float | 53 | non |  | 0 |
| 33 | `arc_montant_free_extra` | float | 53 | non |  | 0 |
| 34 | `arc_num_terminal_vente` | int | 10 | non |  | 0 |
| 35 | `arc_ven_activite_comptable` | int | 10 | non |  | 0 |
| 36 | `arc_ven_id_ligne_annulation` | int | 10 | non |  | 0 |
| 37 | `arc_ven_row_id_origine` | int | 10 | non |  | 0 |
| 38 | `arc_num_cheque` | nvarchar | 30 | non |  | 0 |
| 39 | `arc_type_art` | nvarchar | 6 | non |  | 0 |
| 40 | `arc_stype_art` | nvarchar | 6 | non |  | 0 |
| 41 | `arc_login_vendeur` | nvarchar | 8 | non |  | 0 |
| 42 | `arc_matricule` | nvarchar | 30 | non |  | 0 |
| 43 | `arc_commentaire_annulation` | nvarchar | 100 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| arc_caisse_vente_IDX_4 | NONCLUSTERED | non | arc_societe, arc_date_comptable, arc_code_type |
| arc_caisse_vente_IDX_2 | NONCLUSTERED | non | arc_societe, arc_compte_gm, arc_filiation, arc_date_d_operation, arc_heure_operation |
| arc_caisse_vente_IDX_5 | NONCLUSTERED | non | arc_societe, arc_date_comptable, arc_operateur, arc_code_type |
| arc_caisse_vente_IDX_3 | NONCLUSTERED | non | arc_societe, arc_compte_gm, arc_code_type, arc_date_d_operation, arc_heure_operation |
| arc_caisse_vente_IDX_6 | NONCLUSTERED | oui | arc_RowId_263 |
| arc_caisse_vente_IDX_1 | NONCLUSTERED | non | arc_societe, arc_compte_gm, arc_date_d_operation, arc_heure_operation |

