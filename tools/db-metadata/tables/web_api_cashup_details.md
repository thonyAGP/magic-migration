# web_api_cashup_details

**Nom logique Magic** : `web_api_cashup_details`

| Info | Valeur |
|------|--------|
| Lignes | 8218 |
| Colonnes | 14 |
| Clef primaire | CashupId, CashupDetailId |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `CashupDetailId` | int | 10 | non | PK | 8 |
| 2 | `CashupId` | bigint | 19 | non | PK | 1049 |
| 3 | `WpPaymentTypeId` | nvarchar | 300 | non |  | 16 |
| 4 | `WpPaymentMethodeCode` | nvarchar | 300 | non |  | 14 |
| 5 | `WpPaymentMethodeLabel` | nvarchar | 500 | non |  | 11 |
| 6 | `TotalSales` | float | 53 | non |  | 2179 |
| 7 | `TotalReturns` | float | 53 | non |  | 208 |
| 8 | `TotalDrops` | float | 53 | non |  | 189 |
| 9 | `TotalDeposits` | float | 53 | non |  | 2000 |
| 10 | `TheoricalAmount` | float | 53 | non |  | 1999 |
| 11 | `TotalCounted` | float | 53 | non |  | 2177 |
| 12 | `AmountToKeep` | float | 53 | non |  | 1 |
| 13 | `DifferenceRealToTheorical` | float | 53 | non |  | 1 |
| 14 | `Currency` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `CashupDetailId` (8 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8
```

### `WpPaymentTypeId` (16 valeurs)

```
1A065D37C8A145099532F4F5302C74FE, 3C635CBAF6C248E4BBA8522E02F43661, 53D18CEFBA6046F58F7F9D76DB1EA116, 64E5EA4301354EE8AAD0892894CFB3A0, 9A724F1972AE43A4B096BDA184120FAE, Alipay, American Express, BAF70DC024BC4B93ADE8BD1BEB9CE5B4, Bank Card, CLUB MED PASS, D8A1AF730B6A4A5887E44E4AE9E29912, F76128ED165B4DEBA1AC6F7FF1E6C4F3, Gift Pass, Manual AMEX, Manual Bank Card, WECHAT
```

### `WpPaymentMethodeCode` (14 valeurs)

```
ALI, Alipay, American Express, AMI, Bank Card, CBI, CLUB MED PASS, Gift Pass, GP, Manual AMEX, Manual Bank Card, OD, WEC, WECHAT
```

### `WpPaymentMethodeLabel` (11 valeurs)

```
Alipay, American Express, Bank Card, CLUB MED PASS, CLUBMED PASS, Gift pass, Gift Pass, Manual AMEX, Manual Bank Card, Manual BankCard, WECHAT
```

### `AmountToKeep` (1 valeurs)

```
0
```

### `DifferenceRealToTheorical` (1 valeurs)

```
0
```

### `Currency` (1 valeurs)

```
THB
```

