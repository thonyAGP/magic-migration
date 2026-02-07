# type_prestation

**Nom logique Magic** : `type_prestation`

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tpr_code` | nvarchar | 6 | non |  | 2 |
| 2 | `tpr_libelle` | nvarchar | 50 | non |  | 2 |

## Valeurs distinctes

### `tpr_code` (2 valeurs)

```
BEBE, SKI
```

### `tpr_libelle` (2 valeurs)

```
Forfait non skieur, Lit bÃ©bÃ©
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| type_prestation_IDX_1 | NONCLUSTERED | oui | tpr_code |

