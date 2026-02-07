# droits

| Info | Valeur |
|------|--------|
| Lignes | 19 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `droit` | nvarchar | 10 | non |  | 19 |
| 2 | `description` | nvarchar | 30 | non |  | 19 |

## Valeurs distinctes

### `droit` (19 valeurs)

```
CAISSEADH, CAISSECAB, CAISSEFS, CAISSEGADH, CAISSEGST, CAISSEMT, CAISSEPRG, CAISSEVIL, EXCURADM, EXCURMAN, EXCURMNT, PLANNINGB, PLANNINGP, PLANNINGS, PVENTE, REQUEST, RETAILB, SIGNATURGO, TRAFFIC
```

### `description` (19 valeurs)

```
Caisse AdhÃ©rent, Caisse Cabine TÃ©lÃ©phone, Caisse Fin de Saison, Caisse Gestion, Caisse Maintenance, Caisse Purge, Caisse Village, Excursion Back Office, Excursion Front Office, Excursion Maintenance, Interface Boutique Retail, Planning Back Office, Planning Print, Planning Setup, Point de Vente, Request, Signature GO Kid's Club, Trafic, Visualisation Avant Purge
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| droits_IDX_1 | NONCLUSTERED | oui | droit |

