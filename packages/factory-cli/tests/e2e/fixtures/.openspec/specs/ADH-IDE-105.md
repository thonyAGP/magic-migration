# ADH IDE 105 - SMOKE_LEAF_3

## Objectif

Programme utilitaire de validation des saisies utilisateur.
Appele depuis IDE 102 pour controler le montant saisi avant enregistrement.

## Regles metier

- R1: Valider que le montant est positif et non nul
- R2: Verifier la coherence avec le solde disponible

## Variables

| Lettre | Nom | Type | Description |
|--------|-----|------|-------------|
| A | amount | Numeric | Montant saisi par l'utilisateur |

## Flux

1. Reception du montant en parametre
2. Validation format numerique
3. Controle positivite
4. Retour OK/KO au programme appelant
