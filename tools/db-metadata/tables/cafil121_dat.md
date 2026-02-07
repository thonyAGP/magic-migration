# cafil121_dat

| Info | Valeur |
|------|--------|
| Lignes | 17 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `erl_numero` | int | 10 | non |  | 17 |
| 2 | `erl_type_erreur` | nvarchar | 3 | non |  | 3 |
| 3 | `erl_libelle` | nvarchar | 60 | non |  | 17 |

## Valeurs distinctes

### `erl_numero` (17 valeurs)

```
1, 2, 200, 201, 230, 250, 251, 3, 300, 31, 32, 4, 40, 60, 70, 80, 90
```

### `erl_type_erreur` (3 valeurs)

```
GET, PUT, TRS
```

### `erl_libelle` (17 valeurs)

```
AdhÃ©rent en cours de Mise Ã  Jour, AdhÃ©rent inconnu, Article inconnu, Carte et adhÃ©rent inconnu, Carte inconnue, Carte invalide, DifficultÃ© de rÃ©ception, Digit infÃ©rieur Ã  la borne INFERIEURE., Digit supÃ©rieur Ã  la borne SUPERIEURE., END of TEXT de mauvaise qualitÃ©, Erreur sur le ACK final, Erreur sur XON. Dialogue entamÃ© et plus de rÃ©ponse., Format de fichier incorrect, Pas de rÃ©ponse sur ENQ, Pas de rÃ©ponse sur le code SOH, Pas de rÃ©ponse sur une requÃªte au concentrateur., Refus du code SOH
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil121_dat_IDX_1 | NONCLUSTERED | oui | erl_numero |

