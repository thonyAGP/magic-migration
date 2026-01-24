# PMS-1457 - Caution forfait ski automatique St Moritz

## Contexte Jira

| Element | Valeur |
|---------|--------|
| **Symptome** | Caution forfait ski 25 CHF doit etre creee automatiquement a la cloture nuit |
| **Village** | St Moritz (SMO) |
| **Service** | Forfait ski |
| **Montant** | 25 CHF |

## Programmes mentionnes

- REF IDE 621 - Cloture nuit
- Programme batch nuit

## Tables concernees

- depot_garantie
- cafil069_dat (types garantie)
- operations_dat

## Comportement attendu

A la cloture nuit (batch), le systeme doit:
1. Detecter les GM avec forfait ski actif
2. Creer automatiquement une caution de 25 CHF
3. Enregistrer dans depot_garantie

## Mots-cles

- caution
- forfait ski
- cloture nuit
- batch
- automatique
- St Moritz
- 25 CHF
- depot garantie
