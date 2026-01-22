# PMS-1359 - Resolution

> **Jira** : [PMS-1359](https://clubmed.atlassian.net/browse/PMS-1359)

---

## Diagnostic

### Type de ticket

| Critere | Valeur |
|---------|--------|
| **Type** | Story (nouvelle fonctionnalite) |
| **Ce n'est PAS** | Un bug a corriger |
| **Objectif** | Ajouter un indicateur visuel (`**`) sur l'edition de cloture |

### Besoin metier

Les responsables de village veulent etre alertes quand le FDR (Fond De Roulement) d'ouverture du jour est different du FDR de fermeture de la veille.

**Scenario concret** :
1. **J (20/08)** : Le coffre 1 ferme avec FDR = 1000 EUR
2. **J+1 (21/08)** : Le coffre 1 ouvre avec FDR = 900 EUR (quelqu'un a pris 100 EUR)
3. **Attendu** : L'edition de cloture du 21/08 affiche `**` pour alerter

### Cas particulier

- Si la "case est vide" (pas de donnees), afficher quand meme `**` si applicable.

---

## Conclusion

### Statut implementation

| Element | Statut |
|---------|--------|
| **Logique Magic** | IMPLEMENTE |
| **Variables creees** | 6 variables FDR dans Tache 22.16.1 |
| **Lecture J-1** | IMPLEMENTE via Link Table 246/249 |
| **Flags ecart** | IMPLEMENTE (COFFRE2 et RECEPTION) |
| **Commit** | `9422490b5` (01/10/2025) |

### Ce qui a ete implemente

| Fonctionnalite | Variable | Status |
|----------------|----------|--------|
| Stocker FDR fermeture veille | `v.FDR fermeture de la veille` | OK |
| Detecter si session J-1 existe | `v.Session de Fermeture prec exi` | OK |
| Flag ecart COFFRE2 | `v.Ecart F.D.R. COFFRE2` | OK |
| Flag ecart RECEPTION | `v.Ecart F.D.R. RECEPTION ?` | OK |

---

## Tests de recette recommandes

| # | Scenario | Donnees | Resultat attendu |
|---|----------|---------|------------------|
| 1 | FDR identique | J: FDR=1000, J+1: FDR=1000 | Pas de `**` |
| 2 | FDR different | J: FDR=1000, J+1: FDR=900 | `**` affiche |
| 3 | Premiere session | Pas de J-1 | Comportement a definir |
| 4 | COFFRE2 uniquement | Ecart sur COFFRE2 seulement | `**` sur ligne COFFRE2 |
| 5 | RECEPTION uniquement | Ecart sur RECEPTION seulement | `**` sur ligne RECEPTION |
| 6 | Case vide avec ecart | J: FDR=100, J+1: vide | `**` affiche |

---

## Points de vigilance

### A verifier lors de la recette

1. **Affichage du `**`** : Les flags logiques (`v.Ecart F.D.R. COFFRE2`, `v.Ecart F.D.R. RECEPTION ?`) sont-ils bien utilises dans la partie Forms/Output de l'edition ?

2. **Cas "case vide"** : Si `v.Session de Fermeture prec exi` = FALSE, quel comportement ? La spec Jira dit "il faudra donc avoir quand meme les **" mais la condition exacte n'est pas claire.

3. **Multi-coffres** : Le village Tignes a plusieurs coffres. Verifier que chaque coffre est traite independamment.

---

## Decision

**STATUT FINAL** : `IMPLEMENTE - EN ATTENTE RECETTE`

L'implementation cote Magic est terminee. Le ticket peut passer en recette fonctionnelle pour validation par le metier.

---

*Resolution documentee le 2026-01-22*

---

*DerniÃ¨re mise Ã  jour : 2026-01-22T18:55*
