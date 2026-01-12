# Analyse PMS-1359

> **Jira** : [PMS-1359](https://clubmed.atlassian.net/browse/PMS-1359)

## Symptome

**Edition Cloture : Indiquer ecart FDR entre fermeture veille et ouverture jour**

Lorsque le FDR initial du jour est different du FDR final de la veille, afficher un indicateur (**) sur le document de cloture pour alerter l'operateur.

### Exemple cite (Tignes)

| Jour | Operation | Coffre 1 | Observation |
|------|-----------|----------|-------------|
| 20/08 | Fermeture | X EUR | Montant final |
| 21/08 | Ouverture | Y EUR | Y != X → afficher ** |

**Cas particulier** : Si la case est vide (pas de session precedente), afficher quand meme les ** si applicable.

## Contexte

| Element | Valeur |
|---------|--------|
| **Village/Site** | Tignes (exemple) |
| **Type** | Story (evolution) |
| **Statut** | En cours |
| **Priorite** | Basse |
| **Reporter** | Jessica Palermo |
| **Assignee** | Anthony Leberre |
| **Label** | VIL |

## Investigation

### Programme principal identifie

| Programme | Nom | Role |
|-----------|-----|------|
| **VIL IDE 558** | Print recap sessions | Edition recapitulatif sessions caisse |

### Implementation trouvee

**Commit** : `9422490b5a19534966d8f8ee0d9c8973ad938c77`
**Date** : 01/10/2025
**Message** : "Ajout d'un indicateur permettant lors de l'edition de cloture de la session, un indicateur permettant de savoir si le solde FDR initial est different de celui de la derniere fermeture."

### Modifications apportees

#### Nouvelles variables ajoutees (VIL IDE 558)

| Variable | Type | Role |
|----------|------|------|
| `v.FDR fermeture de la veille` | Numeric 11.3 | Stocke le FDR final de la derniere fermeture |
| `v.Session de Fermeture prec exi` | Logical | TRUE si une session de fermeture precedente existe |
| `v.Ecart F.D.R. COFFRE2` | Logical | TRUE si ecart detecte sur COFFRE2 |
| `v.Ecart F.D.R. RECEPTION ?` | Logical | TRUE si ecart detecte sur RECEPTION |

#### Logique implementee

1. **Recherche session precedente** via CallTask vers sous-tache 56
2. **Lecture table** `caisse_session` (obj=249) pour recuperer le FDR final de la derniere fermeture
3. **Comparaison** avec le FDR initial du jour
4. **Affichage indicateur** (**) si difference detectee

### Fichiers modifies

| Fichier | Modifications |
|---------|---------------|
| `VIL/Source/Prg_558.xml` | +1456 lignes - Variables, logique, affichage |
| `VIL/Source/Prg_482.xml` | +4 lignes - Ajustements mineurs |
| `VIL/Source/ProgramHeaders.xml` | +3477 lignes - Headers mis a jour |
| `VIL/Source/Comps.xml` | -3 lignes - Nettoyage |

---

## PISTES D'INVESTIGATION

### Piste 1 : Implementation existante ✅ VALIDEE

**Statut** : IMPLEMENTEE (commit 9422490b5)

L'implementation semble complete et correspond a la demande :
- Variables pour stocker le FDR de la veille
- Logique de comparaison
- Indicateurs par type de caisse (COFFRE2, RECEPTION)

### Piste 2 : Cas du receptionniste (captures 3 et 4)

**A verifier** : Le cas mentionne dans le ticket concerne aussi les receptionnistes. L'implementation couvre-t-elle ce cas ?

**Variable concernee** : `v.Ecart F.D.R. RECEPTION ?`

**Verification** : La variable existe, donc le cas devrait etre couvert.

### Piste 3 : Affichage des ** sur l'edition

**A verifier** : L'indicateur (**) est-il bien affiche sur le document PDF/imprime ?

**Point d'attention** : Le commit ajoute les variables et la logique, mais l'affichage sur le formulaire d'edition doit etre verifie.

### Piste 4 : Cas "case vide"

Le ticket mentionne : "Il se peut que la case soit vide, il faudra donc avoir quand meme les **"

**A verifier** : Si pas de session precedente (`v.Session de Fermeture prec exi` = FALSE), l'indicateur est-il quand meme affiche ?

---

## RECOMMANDATIONS

### Tests de recette

1. **Scenario 1** : Fermer session jour J avec FDR=1000, ouvrir jour J+1 avec FDR=1000 → Pas de **
2. **Scenario 2** : Fermer session jour J avec FDR=1000, ouvrir jour J+1 avec FDR=900 → ** affiche
3. **Scenario 3** : Premiere session (pas de precedent) avec FDR != 0 → ** affiche ?
4. **Scenario 4** : Test sur COFFRE2 et RECEPTION separement

### Points de vigilance

1. La variable `v.Session de Fermeture prec exi` doit etre correctement initialisee
2. La recherche de la derniere session doit utiliser la bonne cle (date, operateur, type caisse)
3. L'affichage ** doit etre visible sur TOUS les formats d'edition (ecran, PDF, imprimante)

---

## Status final

| Element | Valeur |
|---------|--------|
| **Implementation** | COMPLETE ✅ |
| **Commit** | `9422490b5` (01/10/2025) |
| **Recette** | A VALIDER |
| **Pistes eliminees** | Aucune - toutes valides |
| **Pistes a verifier** | Piste 3 (affichage **), Piste 4 (case vide) |

---

*Analyse: 2026-01-12*
*Statut: IMPLEMENTE - EN ATTENTE RECETTE*
