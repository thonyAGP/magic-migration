# Analyse PMS-1404

> **Jira** : [PMS-1404](https://clubmed.atlassian.net/browse/PMS-1404)

## Symptome

**POS REPORTS M&E : Ajouter colonne Quantite et verifier filtres**

Dans le menu POS > REPORTS > M&E, deux problemes :
1. **Colonne Quantity manquante** : On ne voit pas combien de produits ont ete pris
2. **Filtres non fonctionnels** : Les filtres "person", "item label" ne fonctionnent pas, l'extraction reste identique

## Contexte

| Element | Valeur |
|---------|--------|
| **Type** | Story (evolution) |
| **Statut** | Recette KO |
| **Priorite** | Moderee |
| **Reporter** | Davide Morandi |
| **Assignee** | Anthony Leberre |
| **Label** | PVE |
| **Cree** | 2025-11-12 |

## Investigation

### Programme principal identifie

| Programme | Nom | Role |
|-----------|-----|------|
| **PVE IDE 88** | Report - Discount & Gratuities | Edition des remises et gratuites (M&E) |
| **PVE IDE 182** | Menu Reports | Menu principal des rapports |
| **PVE IDE 77** | Report - Revenue by products | Edition revenus par produits |

### Recherche d'implementation

#### Commits trouves (par date)

| Date | Commit | Description | Impact |
|------|--------|-------------|--------|
| 03/11/2025 | `71ef841ed` | "Mise a jour des quantites sur l'edition des Revenue par produits" | Modifie Prg_82.xml (D&G) |
| 12/11/2025 | `016de2e7a` | "Afficher le % Loss sur chaque ligne de cumul par type de reduction" | Modifie Prg_82.xml |
| 12/11/2025 | `1a8f40b08` | "Vente avec discount et gift pass detectee en tant que gift pass" | Modifie Prg_82.xml |

#### Colonne Quantity dans le code

La colonne "Quantity" **EXISTE DEJA** dans l'en-tete de l'export (Prg_82.xml ligne 3221) :

```
'Village'&'Date'&'Adh#'&'Quality'&'Surname & First name'&'Loyalty'&'Comment'&'Reason'&'Quantity'&'Product'&'Regular price TTC'...
```

**Question** : La colonne existe dans l'en-tete mais les donnees sont-elles remplies ?

---

## PISTES D'INVESTIGATION

### Piste 1 : Colonne Quantity existe mais vide

**Statut** : A VERIFIER

**Hypothese** : L'en-tete contient "Quantity" mais la valeur n'est peut-etre pas populee dans les lignes de donnees.

**Verification requise** :
1. Rechercher la logique qui ecrit les lignes de donnees dans Prg_82.xml
2. Verifier si le champ quantite est bien ecrit avec les autres colonnes
3. Comparer l'ordre des colonnes header vs data

**Programme a analyser** : PVE IDE 88 - sous-taches d'edition

### Piste 2 : Filtres person/item label non fonctionnels

**Statut** : A INVESTIGUER

**Hypothese A** : Les filtres sont presents dans l'UI mais non connectes a la requete SQL/Range

**Hypothese B** : Les filtres sont appliques mais sur le mauvais champ (mauvais mapping)

**Hypothese C** : Bug dans la logique conditionnelle (expression toujours vraie)

**Verification requise** :
1. Identifier les variables de filtre dans le DataView de PVE IDE 182 ou 88
2. Tracer l'utilisation de ces variables dans les Range/SQL expressions
3. Verifier les conditions d'application des filtres

### Piste 3 : Mauvais programme cible

**Statut** : A CLARIFIER

**Question** : Le ticket parle de "M&E" (Meetings & Events). Est-ce bien le rapport "Discount & Gratuities" ?

**Autres programmes potentiels** :
- Prg_354.xml - "Report - Discount & Gratuities" (autre version ?)
- Prg_383.xml - "Report - Discount & Gratuities" (autre version ?)
- Prg_83.xml - "Report - Discount&Gratuit-719" (ticket 719)

**Verification** : Demander confirmation a Davide sur le chemin exact dans le menu POS.

### Piste 4 : Commit 71ef841ed partiellement correctif

**Statut** : PROBABLE

Le commit du 03/11/2025 mentionne "Mise a jour des quantites". Ce commit :
- Modifie Prg_82.xml (le rapport D&G)
- Modifie Prg_71.xml (Revenue by products)

**Mais** : Le ticket PMS-1404 a ete cree le 12/11/2025, donc APRES ce commit.
→ Soit le commit n'a pas resolu le probleme, soit c'est un autre rapport.

### Piste 5 : Probleme de versioning/deploiement

**Statut** : A VERIFIER

**Hypothese** : Le fix a ete committe mais pas deploye sur le village de test.

**Verification** : Comparer la version deployee avec le commit 71ef841ed.

---

## ANALYSE TECHNIQUE DETAILLEE

### Structure du rapport Discount & Gratuities

| Element | Valeur |
|---------|--------|
| Programme | Prg_82.xml (PVE IDE 88) |
| Table principale | caisse_vente |
| Filtre potentiel "person" | Adherent (code_adherent, nom) |
| Filtre potentiel "item label" | Produit (code_article, libelle) |

### Points de modification potentiels

1. **Ajout/correction population Quantity** :
   - Identifier la sous-tache d'edition des lignes
   - Ajouter un champ Select pour la quantite (probablement depuis caisse_vente.ven_qte)
   - L'ajouter dans la logique d'ecriture du fichier

2. **Correction filtres** :
   - Identifier les variables de saisie filtre
   - Tracer leur utilisation dans les Range expressions
   - Corriger la condition de filtrage

---

## RECOMMANDATIONS

### Actions immediates

1. **Clarifier** avec Davide le chemin exact du rapport M&E
2. **Tester** sur un village si la colonne Quantity contient des donnees
3. **Verifier** si le commit 71ef841ed est deploye

### Investigation approfondie

1. **Dumper le DataView** de PVE IDE 88 pour identifier les variables de filtre
2. **Analyser la logique** d'ecriture des lignes de donnees
3. **Tracer les expressions** utilisees pour les filtres

### Tests de recette

1. **Quantity** : Vendre 3 articles identiques, verifier que "3" apparait dans la colonne
2. **Filtre person** : Filtrer sur un GM specifique, verifier que seules ses lignes apparaissent
3. **Filtre item label** : Filtrer sur un produit, verifier le resultat

---

## Status final

| Element | Valeur |
|---------|--------|
| **Implementation** | PARTIELLE / INCERTAINE |
| **Commit potentiel** | `71ef841ed` (03/11/2025) |
| **Statut Jira** | Recette KO |
| **Pistes actives** | 5 pistes a investiguer |
| **Priorite** | Piste 1 (Quantity vide), Piste 2 (Filtres) |
| **Bloqueur** | Clarification sur le rapport exact |

---

## Questions pour le demandeur

1. Quel est le chemin exact dans le menu pour acceder au rapport M&E ?
2. La colonne Quantity apparait-elle dans l'export mais vide, ou n'apparait-elle pas du tout ?
3. Sur quel village avez-vous teste ?
4. Pouvez-vous fournir un export exemple montrant le probleme ?

---

*Analyse: 2026-01-12*
*Statut: INVESTIGATION EN COURS - 5 pistes actives*
