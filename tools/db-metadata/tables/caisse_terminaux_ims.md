# caisse_terminaux_ims

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | int | 10 | non |  | 1 |
| 2 | `libelle` | nvarchar | 64 | non |  | 1 |
| 3 | `numero_du_terminal` | int | 10 | non |  | 1 |
| 4 | `hostname_ims` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `chrono` (1 valeurs)

```
90
```

### `libelle` (1 valeurs)

```
SAFE 2 RECEPTION MGR
```

### `numero_du_terminal` (1 valeurs)

```
90
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_terminaux_ims_IDX_2 | NONCLUSTERED | oui | numero_du_terminal |
| caisse_terminaux_ims_IDX_1 | NONCLUSTERED | oui | chrono |

