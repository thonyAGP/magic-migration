# paramgen_mail

**Nom logique Magic** : `paramgen_mail`

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pgm_utilisateur` | nvarchar | 20 | non |  | 1 |
| 2 | `pgm_password` | nvarchar | 20 | non |  | 1 |
| 3 | `pgm_timeout_connexion` | smallint | 5 | non |  | 1 |
| 4 | `pgm_serveur_mail_test` | nvarchar | 15 | non |  | 1 |
| 5 | `pgm_user_mail_test` | nvarchar | 30 | non |  | 1 |
| 6 | `pgm_user_mail_password` | nvarchar | 30 | non |  | 1 |
| 7 | `pgm_serveur_mail_prod` | nvarchar | 15 | non |  | 1 |
| 8 | `pgm_user_mail_prod` | nvarchar | 30 | non |  | 1 |
| 9 | `pgm_user_mail_password_prod` | nvarchar | 30 | non |  | 1 |
| 10 | `pgm_serveur_mail` | nvarchar | 1 | non |  | 1 |
| 11 | `pgm_seuil_taille_fic_sauvegarde` | smallint | 5 | non |  | 1 |

## Valeurs distinctes

### `pgm_utilisateur` (1 valeurs)

```
admin
```

### `pgm_timeout_connexion` (1 valeurs)

```
60
```

### `pgm_serveur_mail_test` (1 valeurs)

```
MAILLVIS
```

### `pgm_serveur_mail_prod` (1 valeurs)

```
MAILLVIS
```

### `pgm_user_mail_prod` (1 valeurs)

```
syspms@clubmed.com
```

### `pgm_serveur_mail` (1 valeurs)

```
P
```

### `pgm_seuil_taille_fic_sauvegarde` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| paramgen_IDX_1 | NONCLUSTERED | oui | pgm_utilisateur |

