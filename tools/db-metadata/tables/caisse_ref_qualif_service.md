# caisse_ref_qualif_service

| Info | Valeur |
|------|--------|
| Lignes | 40 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `service` | nvarchar | 4 | non |  | 40 |
| 2 | `libelle` | nvarchar | 20 | non |  | 40 |
| 3 | `compte_de_charge_notused` | bit |  | non |  | 2 |
| 4 | `compte_bilan` | bit |  | non |  | 2 |

## Valeurs distinctes

### `service` (40 valeurs)

```
ANIM, ARZA, AUT1, AUT2, AUT3, BABY, BARD, BOUT, CAIS, CASI, CMAF, COCL, COIF, COMM, ECON, EQUI, ESTH, EXCU, FITN, FORM, GEST, GOLF, GPER, HOTE, INFI, LOCV, MAIN, MAMA, MINI, PARK, PHOT, PLAF, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `libelle` (40 valeurs)

```
Animation, Arts appliquÃ©s, Autres deux, Autres trois, Autres un, Baby club, Bar, Boutique, Caisse, Casino, Club med affaires, Coiffure, Commerces extÃ©rieurs, Country club, Economat, Equitation, EsthÃ©tique, Excursion, Fitness, Formation, Gestion, Gestion du personnel, Golf, Hotesse, Infirmerie, Location voiture, Maintenance, Maitresse maison, Mini club, Parking, Photo, Plafond bar, Planning, Pressing, Restaurant, Ski, Sports nautiques, Sports terrestres, Standard, Trafic
```

### `compte_de_charge_notused` (2 valeurs)

```
0, 1
```

### `compte_bilan` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_qualif_service_IDX_1 | NONCLUSTERED | oui | service |

