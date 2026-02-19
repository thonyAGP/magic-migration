# Batch B1 - Ouverture Session (PILOTE)

## Status: CONTRACTED

## Programme racine : ADH IDE 122 - Ouverture caisse

## Programmes (18) - Coverage reelle

| IDE | Nom Programme | Niveau | Complexite | Coverage | PARTIAL | MISSING | Status |
|-----|---------------|:------:|-----------|:--------:|:-------:|:-------:|--------|
| 128 | Controle ouverture caisse WS | 0 | BASSE | 100% | 0 | 0 | N/A backend |
| 133 | MAJ comptage caisse WS | 0 | BASSE | 100% | 0 | 0 | N/A backend |
| 134 | MAJ detail session WS | 0 | MOYENNE | 100% | 0 | 0 | N/A backend |
| 136 | Generation ticket WS | 0 | BASSE | 100% | 0 | 0 | N/A backend |
| 142 | Devise update session WS | 0 | BASSE | 100% | 0 | 0 | N/A backend |
| 143 | Devises calcul ecart WS | 0 | BASSE | 100% | 0 | 0 | N/A backend |
| 147 | Devises des tickets WS | 0 | BASSE | 100% | 0 | 0 | N/A backend |
| 148 | Devises RAZ WS | 0 | BASSE | 100% | 0 | 0 | N/A backend |
| 126 | Calcul solde initial WS | 1 | BASSE | **33%** | 4 | 8 | a enrichir |
| 43 | Recuperation du titre | 3 | BASSE | 0% | 0 | 0 | N/A backend |
| 120 | Saisie contenu caisse | 4 | HAUTE | **62%** | 14 | 9 | a enrichir |
| 123 | Apport coffre | 4 | MOYENNE | **55%** | 2 | 6 | a enrichir |
| 124 | Apport articles | 4 | BASSE | **60%** | 2 | 5 | a enrichir |
| 129 | Ecart ouverture caisse | 4 | MOYENNE | **37%** | 7 | 15 | a enrichir |
| 137 | Ticket ouverture session | 4 | BASSE | **52%** | 2 | 10 | a enrichir |
| 139 | Ticket appro remise | 4 | HAUTE | **38%** | 6 | 21 | a enrichir |
| 156 | Verif session caisse ouverte | 6 | BASSE | 100% | 0 | 0 | IMPL |
| 122 | Ouverture caisse | 6 | HAUTE | **55%** | 9 | 27 | a enrichir |

## Statistiques

| Metrique | Valeur |
|----------|--------|
| Programmes total | 18 |
| Backend-only (N/A) | 9 |
| Frontend (a enrichir) | 8 |
| Fully IMPL | 1 (IDE 156) |
| Coverage moyenne frontend | **49%** |
| Elements PARTIAL | 46 |
| Elements MISSING | 101 |
| Total gaps a combler | **147** |

## Gap transversal : Breakdown MOP

Le concept **MOP** (Modes de Paiement) est le gap #1 cross-cutting :
- **Monnaie** (especes/pieces)
- **Produits** (produits vendus)
- **Cartes** (CB, AMEX)
- **Cheques**
- **OD** (Ordre Depense / divers)

Ce breakdown MOP est utilise par : IDE 120, 122, 126, 129, 137, 139 (6/8 programmes frontend).

## Plan d'enrichissement (5 vagues)

### Wave E1 - Types (pre-requis)

Enrichir les types TypeScript pour supporter le modele MOP :
- `src/types/session.ts` : Ajouter `SoldeParMOP` (monnaie/produits/cartes/cheques/od)
- Variables MISSING dans SessionDetail : solde initial, caisse comptee, caisse calculee, ecart par MOP

### Wave E2 - Logic/Stores (IDE 126, 129)

| IDE | Fonction | Cible |
|-----|----------|-------|
| 126 | `calculateSoldeInitial()` | `sessionStore.ts` |
| 129 | `calculateEcartOuverture()` | `sessionStore.ts` |

### Wave E3 - UI/Pages (IDE 120, 123, 124)

| IDE | Composant | Enrichissement |
|-----|-----------|---------------|
| 120 | `DenominationGrid` / `SessionOuverturePage` | Comptage par MOP, validation |
| 123 | `ApproCoffreForm` | Connexion a l'ouverture, devises |
| 124 | `ApproProduitsForm` | Meme enrichissement que 123 |

### Wave E4 - Print (IDE 137, 139)

| IDE | Print | Enrichissement |
|-----|-------|---------------|
| 137 | Ticket ouverture session | Breakdown MOP, devises |
| 139 | Ticket appro remise | Detail complet appro/remise |

### Wave E5 - Orchestrateur (IDE 122)

Wiring final : IDE 122 orchestre les 17 callees en sequence.
Enrichir `SessionOuverturePage` pour le flux complet ouverture.

## Ordre de priorite enrichissement

1. **IDE 126** (33%) - Logique calcul solde initial → pre-requis pour tout
2. **IDE 129** (37%) - Logique ecart ouverture → validation finale
3. **IDE 139** (38%) - Ticket appro remise → 27 gaps, le plus volumineux
4. **IDE 137** (52%) - Ticket ouverture → depends de 129
5. **IDE 120** (62%) - Saisie contenu caisse → UI principale, 23 gaps
6. **IDE 123** (55%) - Apport coffre → formulaire
7. **IDE 124** (60%) - Apport articles → formulaire
8. **IDE 122** (55%) - Orchestrateur → en dernier, wiring global

## Notes

- Le pilote B1 valide la methodologie SPECMAP end-to-end
- IDE 122 est l'orchestrateur : il appelle les 17 autres en sequence
- IDE 120 (Saisie contenu caisse) est le plus complexe (HAUTE, ecran principal)
- 9 programmes sont purement backend WS ou utilitaire → contrats simples (tout N/A)
- Gap transversal MOP impacte 6/8 programmes frontend → enrichir les types en premier
