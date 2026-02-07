# regles_securite

**Nom logique Magic** : `regles_securite`

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rgs_code_regle` | nvarchar | 8 | non |  | 9 |
| 2 | `rgs_description` | nvarchar | 200 | non |  | 9 |
| 3 | `rgs_valeur` | int | 10 | non |  | 4 |

## Valeurs distinctes

### `rgs_code_regle` (9 valeurs)

```
ALPHA, DUREE, INTERDIT, LOGIN, MAJ, NBRHISTO, NUMERIC, SPEC, TAILLE
```

### `rgs_description` (9 valeurs)

```
Ce mot de passe a dÃ©jÃ  Ã©tÃ© utilisÃ© rÃ©cemment
This password has already been used recently, La durÃ©e d'utilisation du mot de passe est dÃ©passÃ©e. DurÃ©e maxi : %1 jour
The password has expired. Maximum duration: %1 day, Le mot de passe doit au moins contenir un caractÃ¨re en majuscules
Password must contain at least one uppercase character, Le mot de passe doit avoir une taille d'au moins %1 caractÃ¨res
Password must be at least %1 characters long, Le mot de passe doit contenir au moins un caractÃ¨re alphabÃ©tique
Password must contain at least one alphabetical character, Le mot de passe doit contenir au moins un caractÃ¨re spÃ©cial
Password must contain at least one special character, Le mot de passe doit contenir au moins un chiffre
Password must contain at least one digit, Le mot de passe est identique au login utilisateur
The password is identical to the user login, Le mot de passe fait partie de la liste des mots de passe interdits
The password is on the list of prohibited passwords
```

### `rgs_valeur` (4 valeurs)

```
0, 180, 3, 8
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| regles_securite_IDX_1 | NONCLUSTERED | oui | rgs_code_regle |

