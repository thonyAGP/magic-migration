# dispatch_par

| Info | Valeur |
|------|--------|
| Lignes | 157 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `identifiant` | nvarchar | 20 | non |  | 156 |
| 2 | `nom_lieu_sejour` | nvarchar | 50 | non |  | 143 |
| 3 | `chemin_traitement_arrivants` | nvarchar | 80 | non |  | 157 |
| 4 | `code_village_api` | nvarchar | 30 | non |  | 1 |
| 5 | `code_village_api_suffixe` | bit |  | non |  | 1 |
| 6 | `etis_date_dernier_appel` | varchar | 8 | non |  | 1 |
| 7 | `etis_heure_dernier_appel` | varchar | 6 | non |  | 1 |

## Valeurs distinctes

### `code_village_api_suffixe` (1 valeurs)

```
0
```

### `etis_date_dernier_appel` (1 valeurs)

```
00000000
```

### `etis_heure_dernier_appel` (1 valeurs)

```
000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| dispatch_par_IDX_1 | NONCLUSTERED | oui | identifiant, nom_lieu_sejour |

