# web_api_cashup

**Nom logique Magic** : `web_api_cashup`

| Info | Valeur |
|------|--------|
| Lignes | 1047 |
| Colonnes | 14 |
| Clef primaire | RowId |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `RowId` | bigint | 19 | non | PK | 1047 |
| 2 | `CashupId` | nvarchar | 50 | non |  | 900 |
| 3 | `ExtractionDate` | datetime |  | non |  | 937 |
| 4 | `Village` | nvarchar | 3 | non |  | 1 |
| 5 | `Organization` | nvarchar | 500 | oui |  | 2 |
| 6 | `TerminalCode` | nvarchar | 20 | oui |  | 1 |
| 7 | `TerminalName` | nvarchar | 300 | oui |  | 1 |
| 8 | `CashierEmployeeId` | nvarchar | 50 | oui |  | 23 |
| 9 | `CashierEmployeeLastName` | nvarchar | 300 | oui |  | 15 |
| 10 | `CashierEmployeeFirstName` | nvarchar | 300 | oui |  | 15 |
| 11 | `CashupDate` | datetime |  | non |  | 900 |
| 12 | `Application` | nvarchar | 100 | non |  | 1 |
| 13 | `Service` | nvarchar | 4 | non |  | 1 |
| 14 | `DateComptable` | char | 8 | non |  | 778 |

## Valeurs distinctes

### `Organization` (2 valeurs)

```
7DE4A92A710043518AC48601F7EB96AC, Phuket Boutique
```

### `TerminalCode` (1 valeurs)

```
1PHU01
```

### `TerminalName` (1 valeurs)

```
1PHU01
```

### `CashierEmployeeId` (23 valeurs)

```
2DDB1769162D497FA557AFB65D8217FB, 3DF4BD42715940AF9DAAB169E0FF0E13, 40FEFF3A0A5A4B84AF7DE8EA5CA532B8, 42C36D92A26B44FBAF406FABCFA6A442, 4551EC22173545789AD56B22176A8A9A, 627632899C194176BA4E72BCCE9B19CE, 6937DE26DA2D498BBAD6EBD6C8A19088, 69886A4F692646DCA49A3D65E930FC10, 8D53B21F01CE43068AD98655721771F3, 9C060528210E492080BD6A4D425225D0, A753ACCB3FAF4909AA9AACD38A32C695, C0385ECAA0C644E7B99E57A89DF9E0D7, C2F666E9178A4DC78F950895F56CD02D, E05D0EA48406493F88187E611A508CFC, E7472CA3645F486CB5B49D87C8B64DB6, Emilio, JULIA VAN DEN BURG, Jutharat, LUISA, MAO, NANTAPORN, ROBKWAEN, SIMA
```

### `CashierEmployeeLastName` (15 valeurs)

```
, BEANGKRATHOK, CHEN, FUJIKAWA, GREGORIO, KANVIRA, KIM, Kobeh, ROBKWAEN, ROCCHIETTI MARCH, UDOMPAISANSAK, UDORN, VAN DEN BURG, WISETCHART, ZOUHRAOUI
```

### `CashierEmployeeFirstName` (15 valeurs)

```
, Emilio, FOUAD, JESSICA, JULIA, JUNJIRA AOM, KANKA ALEX, LUCA, MAO, NANTAPORN, PHATTARAWAN, Shindanai, SUIN, WANTANEE, WARUNYA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| web_api_cashup_IDX_2 | NONCLUSTERED | oui | DateComptable, RowId |

