# go_job

**Nom logique Magic** : `go_job`

| Info | Valeur |
|------|--------|
| Lignes | 282 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `goj_job_code` | nvarchar | 10 | non |  | 282 |
| 2 | `goj_job_family` | nvarchar | 100 | non |  | 39 |
| 3 | `goj_job_title` | nvarchar | 100 | non |  | 268 |

## Valeurs distinctes

### `goj_job_family` (39 valeurs)

```
Accueil & Services, Ambiance, Baby / Petit Club, Bar, Chef de Village, Childcare Manager, Cirque Sports, Cuisine, EC Villas & Chalets Manager, Entretien des chambres, Excursion, ExpÃ©rience CroisiÃ¨re, F&B Manager, Finance village, Food and Beverage EC, Gourmet/Beach Lounge, Health, Housekeeping EC, Human Resources, Landsports, Leisure Experience, Meetings & Events Village, Mini / Junior Club, Mountain Sports Sports, Others, Restaurant, Room Division Manager, Sales Manager, Shop, Ski Pro Shop, Spa, Sports Manager, Sports nautiques, Stewarding, Stock & Procurement, Technical Services, Village Training, Welcome and Services, Welcome and Services EC
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| go_job_IDX_1 | NONCLUSTERED | oui | goj_job_code |

