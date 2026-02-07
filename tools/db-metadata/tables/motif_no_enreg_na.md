# motif_no_enreg_na

**Nom logique Magic** : `motif_no_enreg_na`

| Info | Valeur |
|------|--------|
| Lignes | 14 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mnn_ordre` | int | 10 | non |  | 7 |
| 2 | `mnn_langue` | nvarchar | 3 | non |  | 2 |
| 3 | `mnn_libelle` | nvarchar | 50 | non |  | 13 |

## Valeurs distinctes

### `mnn_ordre` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 7
```

### `mnn_langue` (2 valeurs)

```
ANG, FRA
```

### `mnn_libelle` (13 valeurs)

```
Additional GM in occupied room, Chambre dÃ©commercialisÃ©e, Chambre GM No Show ou Early Departure, GM Additionnel dans chambre occupÃ©e, GM No Show or Early Departure, Late Check out, Logement chambre GO, Not-offered for sale room, Prestataire extÃ©rieur, Service Provider / Supplier, Staff Room, Upgrade impossible on the arrival day, Upgrade jour d'arrivÃ©e impossible
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| motif_no_enreg_na_IDX_1 | NONCLUSTERED | oui | mnn_langue, mnn_ordre |

