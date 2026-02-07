# caisse_compte_bilan

| Info | Valeur |
|------|--------|
| Lignes | 56 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `bil_imputation` | float | 53 | non |  | 56 |
| 2 | `bil_sous_imputation` | int | 10 | non |  | 1 |
| 3 | `bil_libelle` | nvarchar | 64 | non |  | 48 |

## Valeurs distinctes

### `bil_sous_imputation` (1 valeurs)

```
0
```

### `bil_libelle` (48 valeurs)

```
Banque villages , comptes en devise locale, Banque villages, comptes en devise locale, Banques villages, comptes en autres devises, Caisse village en devise locale, Cartes bancaires Ã  encaisser amex, Cartes bancaires Ã  encaisser autres, Cartes bancaires Ã  encaisser visas, Change, ChÃ¨ques Ã  encaisser, Clients individuels  Ã©critures manuelles, Compte d'attente - Ecritures de rÃ¨glement en provenance d'AP, CrÃ©diteurs divers 1, CrÃ©diteurs divers 10, CrÃ©diteurs divers 2, CrÃ©diteurs divers 3, CrÃ©diteurs divers 4, CrÃ©diteurs divers 5, CrÃ©diteurs divers 6, CrÃ©diteurs divers 7, CrÃ©diteurs divers 8, CrÃ©diteurs divers 9, DÃ©biteurs divers 1, DÃ©biteurs divers 10, DÃ©biteurs divers 2, DÃ©biteurs divers 22, DÃ©biteurs divers 23, DÃ©biteurs divers 3, DÃ©biteurs divers 4, DÃ©biteurs divers 5, DÃ©biteurs divers 6, DÃ©biteurs divers 7, DÃ©biteurs divers 8, DÃ©biteurs divers 9, Fonds de roulement autres, Fonds de roulement rÃ©ceptionnistes, Liaison entre villages rattachÃ©s Ã  1 mÃªme siÃ¨ge, Liaison villages - remontÃ©es siÃ¨ge local, Personnel avances et acomptes GO GE paye locale, Personnel avances et acomptes GO PS paye siÃ¨ge / villages, Personnel rÃ©munÃ©rations dues, Personnel rÃ©munÃ©rations dues autres, Personnel, avances sur frais, TVA Ã  dÃ©caisser, Tva collectÃ©e ; tva sur les dÃ©bits; taux 1, Tva collectÃ©e ; tva sur les dÃ©bits; taux 2, TVA dÃ©ductible sur autre biens et services ; tva sur les dÃ©bits;, TVA dÃ©ductible sur autre biens et services, tva sur les dÃ©bits,, Virements internes
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_compte_bilan_IDX_1 | NONCLUSTERED | oui | bil_imputation, bil_sous_imputation |

