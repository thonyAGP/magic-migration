# kid_club_languages

| Info | Valeur |
|------|--------|
| Lignes | 17 |
| Colonnes | 5 |
| Clef primaire | kcl_id |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `kcl_id` | bigint | 19 | non | PK | 17 |
| 2 | `kcl_code` | char | 2 | non |  | 17 |
| 3 | `kcl_label_fr` | nvarchar | 50 | non |  | 17 |
| 4 | `kcl_label_en` | nvarchar | 50 | non |  | 17 |
| 5 | `kcl_symbol` | nvarchar | 5 | oui |  | 2 |

## Valeurs distinctes

### `kcl_id` (17 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `kcl_code` (17 valeurs)

```
AL, CH, CS, EN, ES, FR, ID, IS, IT, JP, MY, NL, PT, RU, SC, TH, TR
```

### `kcl_label_fr` (17 valeurs)

```
Allemand, Anglais, Chinois SimplifiÃ©, Chinois Traditionnel, CorÃ©en, Espagnol, FranÃ§ais, HÃ©breu, IndonÃ©sien, Italien, Japonais, Malais, NÃ©erlandais, Portugais, Russe, ThaÃ¯, Turc
```

### `kcl_label_en` (17 valeurs)

```
Dutch, English, French, German, Hebrew, Indonesian, Italian, Japanese, Korean, Malay, Portuguese, Russian, Simplify Chinese, Spanish, Thai, Traditional Chinese, Turkish
```

### `kcl_symbol` (2 valeurs)

```
ç®€, ç¹
```

