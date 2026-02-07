# caisse_solde_compte_adherent

| Info | Valeur |
|------|--------|
| Lignes | 1564 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `date_comptable` | char | 8 | non |  | 1564 |
| 3 | `solde` | float | 53 | non |  | 1380 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_solde_compte_adherent_IDX_1 | NONCLUSTERED | oui | societe, date_comptable |

