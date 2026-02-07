# param_pied_recu

**Nom logique Magic** : `param_pied_recu`

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ppr_type_article` | nvarchar | 3 | non |  | 6 |
| 2 | `ppr_texte_pied_recu` | nvarchar | 350 | oui |  | 5 |
| 3 | `ppr_stype_article` | nvarchar | 3 | non |  | 1 |

## Valeurs distinctes

### `ppr_type_article` (6 valeurs)

```
GL1, GL2, SL1, SL2, VRL, VSL
```

### `ppr_texte_pied_recu` (5 valeurs)

```
By subscribing the present rental of  equipment whose names are written in this document, the customer  accepts and  agrees  to  the general terms and conditions of rental and acknowledge that he revi, I specifically accept that my credit card, whose numbers I have communicated in order to open my account in the resort, can be used to pay for the amount of my expenses that I made in the resort and a, Jâ€™accepte expressÃ©ment que ma carte bancaire, dont jâ€™ai communiquÃ© les coordonnÃ©es pour lâ€™ouverture dâ€™un compte  au resort, puisse Ãªtre dÃ©bitÃ©e du montant des  dÃ©penses facturÃ©es et inscrites sur ce c, La signature de la prÃ©sente note vaut approbation immÃ©diate et sans rÃ©serve des conditions gÃ©nÃ©rales de vente Club MÃ©diterranÃ©e qui y sont jointes

The signature of this document signifies that you , Le client en souscrivant la prÃ©sente location de matÃ©riel dont les noms sont rÃ©fÃ©rencÃ©s dans ce document dÃ©clare accepter sans aucune rÃ©serve les conditions gÃ©nÃ©rales de location dont il certifie avoi
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| param_pied_recu_IDX_1 | NONCLUSTERED | oui | ppr_type_article |

