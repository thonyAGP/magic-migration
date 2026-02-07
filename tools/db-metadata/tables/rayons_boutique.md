# rayons_boutique

**Nom logique Magic** : `rayons_boutique`

| Info | Valeur |
|------|--------|
| Lignes | 46 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_rayon` | nvarchar | 9 | non |  | 46 |
| 2 | `libelle_rayon` | nvarchar | 33 | non |  | 46 |
| 3 | `imputation` | int | 10 | non |  | 5 |
| 4 | `code_service` | nvarchar | 4 | non |  | 1 |
| 5 | `sous_imputation` | int | 10 | non |  | 1 |
| 6 | `eligible_gp` | bit |  | non |  | 2 |

## Valeurs distinctes

### `code_rayon` (46 valeurs)

```
, 11, 12, 13, 14, 1M, 2M, 30, 31, 32, 33, 34, 35, 36, 37, 38, 3M, 40, 41, 42, 4M, 51, 52, 53, 54, 55, 56, 61, 62, 63, 64, 65, 66, 67, 68, 69, 6A, 6B, 6C, 71, 72, 73, 74, 79, 81, 82
```

### `libelle_rayon` (46 valeurs)

```
Appareils, Art de la table, Bagagerie, Bijoux Fantaisie, Boutique, Cartes Postales, Cartes TÃ©lÃ©phones, Confection, DÃ©coration, Drap de plage, Droguerie, Emballage, Enveloppes, Epicerie, Femme, Fille, Fondation, Gadget, GarÃ§on, Golf, Homme, Jeux, Laverie, Lessive, Linge de Toilette, Liquide, Livre, Maison, Meuble, Musique/VidÃ©o, Nautique, Papeterie, ParÃ©o, PrÃ©sentoir, Presse, Puericulture, SalÃ©, Senteur, Ski, Soins corporels, Sports, SucrÃ©, Tabac, Timbre, Transport, Vue
```

### `imputation` (5 valeurs)

```
467620000, 707610340, 707620340, 707630340, 708890340
```

### `code_service` (1 valeurs)

```
BOUT
```

### `sous_imputation` (1 valeurs)

```
0
```

### `eligible_gp` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| rayons_boutique_IDX_1 | NONCLUSTERED | oui | code_service, code_rayon |

