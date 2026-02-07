# caisse_compte_charge

| Info | Valeur |
|------|--------|
| Lignes | 835 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cha_service_village` | nvarchar | 4 | non |  | 30 |
| 2 | `cha_imputation` | float | 53 | non |  | 566 |
| 3 | `cha_sous_imputation` | int | 10 | non |  | 1 |
| 4 | `cha_libelle` | nvarchar | 64 | non |  | 50 |

## Valeurs distinctes

### `cha_service_village` (30 valeurs)

```
ANIM, ARZA, BABY, BARD, BOUT, CMAF, COIF, COMM, ECON, EQUI, ESTH, EXCU, FITN, GEST, GOLF, HOTE, INFI, LOCV, MAIN, MAMA, MINI, PARK, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `cha_sous_imputation` (1 valeurs)

```
0
```

### `cha_libelle` (50 valeurs)

```
Achat de carburants stockÃ©, Achat de fuel stockÃ©, Achat de gaz stockÃ©, Achat de matÃ©riels et fournitures stockÃ©s pour l'exploitation, Achats Carburants, Achats de marchandises, Achats de navettes et transfert, Achats de prestations de services, Achats de remontÃ©es mÃ©caniques - redevances, Achats de remontÃ©es mÃ©caniques -forfaits, Achats de transport GO: Avion, train, bateau, Achats denrÃ©es, Achats tabac, Achats timbres, Autres charges externes (hors honoraires), Autres frais de mission, Autres frais de transport: Taxi, bus, pÃ©age, mÃ©tro, indemnitÃ©s k, Autres impÃ´ts locaux, patentes..., Autres taxes, Cadeaux Ã  la clientÃ¨le, Charges diverses de gestion courante, Consommation trafic voix tÃ©lÃ©phonie mobilie, Cotisations et dons, Descentes et remontÃ©es du  personnel, Documentation gÃ©nÃ©rale, Droits d'enregistrements et de timbre, Entretien et rÃ©paration / Biens immobiliers, Entretien et rÃ©paration / Biens mobiliers, Fournitures de bureau non stockÃ©es, Fournitures informatiques non stockÃ©es, Fournitures non stockables ; gaz, Frais d'affranchissement, Frais de rÃ©ception, Frais d'hÃ´tel et d'hÃ©bergement, Location de salles de sÃ©minaires, Location matÃ©riel / Mobilier / Bateaux / Salles, Location vÃ©hicules - contrats de courtes durÃ©es, matÃ©riels et fournitures consommables Maintenance, MÃ©decine du travail pharmacie, PMH - Non stockÃ©, Promotion de la vente - deductible, R. R. R.  obtenues - Achats, Sous traÃ®tance gÃ©nÃ©rale, Taxes diverses, TÃ©lÃ©phone hors Antares, Transfert du personnel : Navettes du personnel de service, Transport et douane -sur autres achats, Transports et autres frais sur achats de marchandises, Transports et autres frais sur achats non stockÃ©s, Uniforme et Habillement du personnel
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_compte_charge_IDX_2 | NONCLUSTERED | non | cha_imputation, cha_sous_imputation |
| caisse_compte_charge_IDX_1 | NONCLUSTERED | oui | cha_service_village, cha_imputation, cha_sous_imputation |

