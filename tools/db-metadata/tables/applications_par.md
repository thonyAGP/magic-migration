# applications_par

| Info | Valeur |
|------|--------|
| Lignes | 18 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_application` | nvarchar | 6 | non |  | 18 |
| 2 | `nom_application` | nvarchar | 20 | non |  | 18 |

## Valeurs distinctes

### `code_application` (18 valeurs)

```
CA, CB, CG, CL, CM, CP, CV, EXADM, EXMAN, EXMNT, OD, PB, PP, PS, PT, RQ, RT, XT
```

### `nom_application` (18 valeurs)

```
Caisse AdhÃ©rent, Caisse Gestion, Caisse Maintenance, Caisse Purge, Caisse Village, Excursion BackOffice, Excursion Front, Excursion Maint., Gestion Cabine, Login, OD Light, Planning Back Office, Planning Print, Planning Setup, Request, Retail, Trafic, Xtrack
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| applications_par_IDX_1 | NONCLUSTERED | oui | code_application |

