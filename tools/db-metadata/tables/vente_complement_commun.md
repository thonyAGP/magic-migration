# vente_complement_commun

**Nom logique Magic** : `vente_complement_commun`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |
| Clef primaire | vcc_type_od_vente, vcc_rowId_40_ou_263 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vcc_type_od_vente` | char | 1 | non | PK | 0 |
| 2 | `vcc_rowId_40_ou_263` | int | 10 | non | PK | 0 |
| 3 | `vcc_date_application_location` | datetime |  | oui |  | 0 |
| 4 | `vcc_application_matin_apresmidi` | char | 2 | oui |  | 0 |
