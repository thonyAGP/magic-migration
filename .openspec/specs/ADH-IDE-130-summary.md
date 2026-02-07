# ADH IDE 130 - Ecart fermeture caisse

> **Analyse**: 2026-02-07 03:50
> **Pipeline**: V7.2 Enrichi

## RESUME EXECUTIF

- **Fonction**: Controleur de caisse - Compare montants comptes vs calcules, detecte et documente les ecarts
- **Formule cle**: `Ecart = Compte - Calcule` (T=F-M pour total, U=G-N pour monnaie, etc.)
- **Tables modifiees**: 0
- **Complexite**: **BASSE** (12/100)
- **Statut**: NON_ORPHELIN
- **Raison**: Appele par 2 programme(s): Fermeture caisse (IDE 131), Fermeture caisse 144 (IDE 299)

## PROGRAMMES LIES

| Direction | Programmes |
|-----------|------------|
| **Appele par** | [Fermeture caisse (IDE 131)](ADH-IDE-131.md), [Fermeture caisse 144 (IDE 299)](ADH-IDE-299.md) |
| **Appelle** | [Devise update session WS (IDE 142)](ADH-IDE-142.md), [Recuperation du titre (IDE 43)](ADH-IDE-43.md) |

## STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Taches | 10 |
| Lignes Logic | 260 |
| Expressions | 2 |
| Tables | 7 |

---
*Spec SUMMARY generee par Pipeline V7.2*
