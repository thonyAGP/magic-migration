# log_affec_auto_entete

**Nom logique Magic** : `log_affec_auto_entete`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lae_date_traitement` | char | 8 | non |  | 0 |
| 2 | `lae_nb_rejet_hors_scope` | int | 10 | non |  | 0 |
| 3 | `lae_nb_rejet_millesia` | int | 10 | non |  | 0 |
| 4 | `lae_nb_rejet_note` | int | 10 | non |  | 0 |
| 5 | `lae_nb_rejet_comm_na` | int | 10 | non |  | 0 |
| 6 | `lae_nb_rejet_ch_affectee` | int | 10 | non |  | 0 |
| 7 | `lae_nb_rejet_code_logement` | int | 10 | non |  | 0 |
| 8 | `lae_nb_rejet_en_scope` | int | 10 | non |  | 0 |
| 9 | `lae_nb_affectes` | int | 10 | non |  | 0 |
| 10 | `lae_user` | char | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_affec_auto_entete_IDX_1 | NONCLUSTERED | oui | lae_date_traitement |

