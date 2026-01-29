# ADH IDE 121 - Gestion caisse

> **Analyse**: 2026-01-29 11:34
> **Pipeline**: V6.0 Deep Analysis

## RESUME EXECUTIF

- **Fonction**: Gestion caisse
- **Tables modifiees**: 4
- **Complexite**: **MOYENNE** (48/100)
- **Statut**: NON_ORPHELIN
- **Raison**: Appele par 2 programme(s): IDE 163, IDE 281

## MOTS-CLES RECHERCHE

Gestion, caisse

## CE PROGRAMME EST CONCERNE SI...

- Bug sur les tables: concurrence_sessions, saisie_approvisionnement, histo_sessions_caisse, sessions_coffre2
- Probleme dans le flux depuis: Menu caisse GM - scroll (IDE 163), Fermeture Sessions (IDE 281)
- Erreur dans les appels vers: Calcul concurrence sessions (IDE 116), Mise à jour detail session WS (IDE 134), Ticket appro remise (IDE 139), Contrôles - Integrite dates (IDE 48), Ouverture caisse (IDE 122)

## PROGRAMMES LIES

| Direction | Programmes |
|-----------|------------|
| **Appele par** | Menu caisse GM - scroll (IDE 163), Fermeture Sessions (IDE 281) |
| **Appelle** | Calcul concurrence sessions (IDE 116), Mise à jour detail session WS (IDE 134), Ticket appro remise (IDE 139), Contrôles - Integrite dates (IDE 48), Ouverture caisse (IDE 122), Fermeture caisse (IDE 131), Controle fermeture caisse WS (IDE 155), Recuperation du titre (IDE 43), Affichage sessions (IDE 119), Apport coffre (IDE 123) |

## STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Taches | 32 |
| Lignes Logic | 678 |
| Expressions | 7 |
| Tables | 12 |

---
*Spec SUMMARY generee par Pipeline V6.0*
