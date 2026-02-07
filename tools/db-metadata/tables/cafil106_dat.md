# cafil106_dat

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ptr_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ptr_code_langue` | nvarchar | 1 | non |  | 5 |
| 3 | `ptr_libelle_1` | nvarchar | 80 | non |  | 5 |
| 4 | `ptr_libelle_2` | nvarchar | 80 | non |  | 1 |

## Valeurs distinctes

### `ptr_societe` (1 valeurs)

```
C
```

### `ptr_code_langue` (5 valeurs)

```
A, E, F, G, I
```

### `ptr_libelle_1` (5 valeurs)

```
Der Clubchef und sein Team wÃ¼nschen Ihnen eine angenehme Heimreise., El director y su equipo les desean un agradable viaje., Il capo del villaggio e la sua equipe vi augurano un felice viaggio di ritorno., Le chef de Village et son Ã©quipe vous souhaitent un agrÃ©able voyage retour., The chief of the village and his team wish you a great trip back.
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil106_dat_IDX_1 | NONCLUSTERED | oui | ptr_societe, ptr_code_langue |

