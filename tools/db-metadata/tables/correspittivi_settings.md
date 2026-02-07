# correspittivi_settings

**Nom logique Magic** : `correspittivi_settings`

| Info | Valeur |
|------|--------|
| Lignes | 34 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cos_compte_analytique` | int | 10 | non |  | 31 |
| 2 | `cos_service` | nvarchar | 4 | non |  | 16 |
| 3 | `cos_libelle1` | nvarchar | 80 | non |  | 31 |
| 4 | `cos_libelle2` | nvarchar | 80 | non |  | 31 |
| 5 | `cos_tva` | float | 53 | non |  | 4 |
| 6 | `cos_type_fiscale` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `cos_compte_analytique` (31 valeurs)

```
706250110, 706410115, 706410205, 706410215, 706410230, 706410231, 706410232, 706410234, 706410255, 706410256, 706410272, 706410274, 706410277, 706410278, 706410325, 706415274, 706420384, 707610218, 707610219, 707610274, 707610325, 707610340, 707620230, 707620340, 707630340, 708310272, 708310274, 708310278, 708310385, 708310395, 708870385
```

### `cos_service` (16 valeurs)

```
BABY, BARD, BOUT, CMAF, ESTH, EXCU, GEST, PARK, PLAN, PRES, RECE, REST, SKIN, SPTE, STAN, TRAF
```

### `cos_libelle1` (31 valeurs)

```
AFFITTO SALE & MATERIALE, INCASSI, INCASSI BABY/PETIT CLUB, INCASSI BAR HORS BSI, INCASSI BAR LOCALE, INCASSI BAR LOCALE VINI, INCASSI CARTE  INTERNET/TELEFONO/FAX, INCASSI CORSO TENNIS, INCASSI ENTRATA PISCINA PISCINA (CERVINIA), INCASSI FINE DINING, INCASSI FORFAITS SCI (SKI PASS), INCASSI GOLF, INCASSI LAVANDERIA GO/GM, INCASSI MINICLUB- PYJAMA CLUB, INCASSI RISTORANTE SPECIALITA, INCASSI SERVIZI COMUNI, INCASSI SIGARI, INCASSI SPA / PARRUCCHIERE, INCASSI TRANSFERT, INCASSI VENDITA PRODOTTI ALIMENTARI, INCASSI VENDITA PRODOTTI SKI SERVICE, INCASSI VENDITA PRODOTTI SPA, NOLEGGIO MATERIALE GOLF, NOLEGGIO MATERIALE SPORT, NOLEGGIO SCI & SCARPONI, PARCHEGGIO, VENDITA FRANCOBOLLI, VENDITA PRODOTTI BOUTIQUE, VENDITA SIGARETTE, VRL - VENDITA PASTI LOCALI, VSL - VENDITA SOGGIORNI LOCALI
```

### `cos_libelle2` (31 valeurs)

```
autre, cigare, cigarette, Forfait de ski/ ventes encaissÃ¨ Ã  la reception, Lingerie go (jetons)/GM, location chaussure montagnes etc, location sac golf, parking, Produits Spa, Recette Bar, Recette Vin, recettes baby/petit club, recettes HBSI, recettes pyjama  club, Recettes restaurant de specialitÃ©, recettes stage golf/green fees, REPAS FINE DINING, salle en cas de Cmb ou group, SKI & chaussures de location, Spa/Salon de coiffure, timbres, Transfert, Vente de repas local, Vente de SÃ©jour Local, Vente entrÃ© piscine hors gm pour villages Cervinia, Vente produit ski service, Vente Produits Boutique, ventes cours tennis, ventes produits alimentares boutiques eataly ou trattoria (dep restaurant), Ventes ski service, Wifi/TÃ©lÃ©phone/Fax
```

### `cos_tva` (4 valeurs)

```
0, 10, 22, 4
```

### `cos_type_fiscale` (2 valeurs)

```
N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| correspittivi_settings_IDX_1 | NONCLUSTERED | oui | cos_compte_analytique, cos_tva |

