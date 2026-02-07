# log_vod

**Nom logique Magic** : `log_vod`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vod_datedebut` | char | 8 | non |  | 0 |
| 2 | `vod_heuredebut` | char | 6 | non |  | 0 |
| 3 | `vod_chambre` | nvarchar | 6 | non |  | 0 |
| 4 | `vod_compte1` | int | 10 | non |  | 0 |
| 5 | `vod_nom1` | nvarchar | 80 | non |  | 0 |
| 6 | `vod_compte2` | int | 10 | non |  | 0 |
| 7 | `vod_co_emis` | bit |  | non |  | 0 |
| 8 | `vod_ack_co` | bit |  | non |  | 0 |
| 9 | `vod_ver_co` | bit |  | non |  | 0 |
| 10 | `vod_ci_emis` | bit |  | non |  | 0 |
| 11 | `vod_ack_ci` | bit |  | non |  | 0 |
| 12 | `vod_ver_ci` | bit |  | non |  | 0 |
| 13 | `vod_stat_recu` | bit |  | non |  | 0 |
| 14 | `vod_ack_stat` | bit |  | non |  | 0 |
| 15 | `vod_info1_emis` | bit |  | non |  | 0 |
| 16 | `vod_ack_info1` | bit |  | non |  | 0 |
| 17 | `vod_info2_emis` | bit |  | non |  | 0 |
| 18 | `vod_ack_info2` | bit |  | non |  | 0 |
| 19 | `vod_datefin` | char | 8 | non |  | 0 |
| 20 | `vod_heurefin` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_vod_IDX_1 | NONCLUSTERED | oui | vod_datedebut, vod_heuredebut, vod_chambre |

