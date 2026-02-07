# type_questionnaire

**Nom logique Magic** : `type_questionnaire`

| Info | Valeur |
|------|--------|
| Lignes | 22 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tqu_numero_questionnaire` | int | 10 | non |  | 5 |
| 2 | `tqu_code` | nvarchar | 4 | non |  | 22 |
| 3 | `tqu_libelle` | nvarchar | 50 | non |  | 21 |

## Valeurs distinctes

### `tqu_numero_questionnaire` (5 valeurs)

```
104, 60, 61, 62, 63
```

### `tqu_code` (22 valeurs)

```
ALRG, BABY, CRBO, CRLS, CRSA, CRSE, CRST, FYAR, JU11, JU14, LBSN, LCAA, LCMO, LCRA, LCSK, LSKA, LSKE, LSNA, LSNE, MIN8, MINI, STAG
```

### `tqu_libelle` (21 valeurs)

```
Adult allergens, Baby/Petit Club, Cours ski/snow Adultes, Cours ski/snow enfants, Facilitate Your Arrival, Junior 11 - 13 ans, Junior 14-17 ans, LeÃ§ons particuliÃ¨res de ski/snowboard, Location Boots Snow, Location casque Adulte, Location Chaussure Montagne, Location chaussures ski, Location raquette, Location Ski Adultes, Location Ski Enfants, Location Snowboard Adultes, Location Snowboard Enfants, Mini 4-7 ans, Mini 8-10 ans, Pack Booster ski/snowboard, Stage d'apprentissage de la glisse
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| type_questionnaire_IDX_1 | NONCLUSTERED | oui | tqu_numero_questionnaire, tqu_code |

