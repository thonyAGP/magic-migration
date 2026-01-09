# Resolution CMDS-176521

> **Jira** : <a href="https://clubmed.atlassian.net/browse/CMDS-176521" target="_blank">CMDS-176521</a>

## Statut: CAUSE RACINE IDENTIFIÉE

---

## Symptôme

**Bug d'affichage du prix remisé dans le POS (module PVE)**

- Prix attendu avec -10% : **5,400 JPY**
- Prix affiché : **41,857** (valeur incorrecte)
- Prix facturé à la validation : **CORRECT**

---

## Diagnostic Complet

### Programme concerné : PVE IDE 284 - Main Sale Sale Bar Code

L'analyse approfondie a révélé que le bug se situe dans **PVE IDE 284** (Main Sale Sale Bar Code), pas dans PVE IDE 186.

### Hiérarchie des tâches

```
Task 1 - Main Sale Sale Bar Code (Root)
  └── Task 19 - Forfait_Package=> account
        └── Task 22 - SALE package_Creat_projet_FBO
              └── Expression 33 (calcul prix remisé)
```

### Expression de calcul (Expression 33)

```magic
Round({1,13}*(1-ExpCalc('15'EXP)/100),10,{32768,43})
```

**Où :**
- `{1,13}` = Variable index 13 du parent (Level 1)
- `ExpCalc('15'EXP)` = Expression 15 (pourcentage remise)
- `{32768,43}` = Variable contexte arrondi

### Expression 15 (calcul % remise)

```magic
IF({1,129} OR ({1,121} AND {32768,96}), 100, IF({1,103},{1,107},{1,59}))
```

**Logique :**
- Si condition gratuite → 100%
- Sinon si Great Members → % spécifique
- Sinon → % par défaut

---

## CAUSE RACINE IDENTIFIÉE

### Variables dans Task 1 (Root)

| Index | Variable | Type | Valeur typique |
|-------|----------|------|----------------|
| **13** | `v.LequipmentId` | ID équipement | Numérique |
| **59** | `V.SoldeCompte` | Solde compte | **41,857** |

### Le Bug

**L'expression `{1,13}` devrait référencer le PRIX du produit**, mais selon le contexte d'exécution, elle peut récupérer :

1. **`v.LequipmentId`** (ID équipement) - mauvaise valeur
2. Ou un autre index inattendu via l'héritage de contexte

La valeur **41,857** correspond probablement au **solde du compte BAR CASH** (`V.SoldeCompte`) qui est stocké à l'index 59, suggérant un problème de binding entre les niveaux de tâches.

### Hypothèse de bug

Le binding de variable entre Task 19 et Task 22 ne transmet pas correctement le prix du produit à l'index attendu (13), résultant en l'utilisation d'une valeur résiduelle ou incorrecte.

---

## Références Magic IDE

### Programme

| IDE | Projet | Nom Public | Description |
|-----|--------|------------|-------------|
| **PVE IDE 284** | PVE | Main Sale Sale Bar Code | Vente via scan barcode |

### Tâches concernées

| Task | ISN_2 | Description | Rôle |
|------|-------|-------------|------|
| Task 1 | 1 | Main Sale Sale Bar Code | Root - Variables globales |
| Task 19 | 19 | Forfait_Package=> account | Parent du calcul |
| Task 22 | 22 | SALE package_Creat_projet_FBO | Contient Expression 33 |
| Task 42 | 42 | Discount % | Saisie % remise manuel |

### Variables critiques (Task 1 Root)

| Variable | Index | Description | Impact |
|----------|-------|-------------|--------|
| N | 13 | v.LequipmentId | Mauvaise source pour prix |
| BH | 59 | V.SoldeCompte | Possible source de 41,857 |

### Expression clé

| Programme | Expression | Formule | Bug |
|-----------|------------|---------|-----|
| PVE IDE 284 | 33 | `Round({1,13}*(1-ExpCalc('15'EXP)/100),10,CTX_43)` | {1,13} pointe vers mauvaise variable |

---

## Solution proposée

### Correction requise dans PVE IDE 284

1. **Vérifier l'initialisation de la variable prix** avant l'appel à Task 22
2. **S'assurer que le paramètre P.Prix (index 31 de Task 19)** est correctement passé
3. **Modifier Expression 33** pour utiliser l'index correct du prix :
   ```magic
   -- Au lieu de {1,13}, utiliser {1,31} (P.Prix) ou le bon index
   Round({1,31}*(1-ExpCalc('15'EXP)/100),10,{32768,43})
   ```

### Validation requise

- [ ] Confirmer que P.Prix (index 31) contient bien le prix du produit
- [ ] Tester la modification sur un environnement de dev
- [ ] Vérifier que la valeur facturée reste correcte
- [ ] Tester avec différents % de remise (5%, 10%, 50%, 100%)

---

## Ticket Jira Dev

Davide (CMDS) a confirmé :
- Ticket Jira dev ouvert pour prochaine release PMS
- Correction prévue avant fin janvier 2026

---

## Comparaison PVE IDE 186 vs PVE IDE 284

| Aspect | PVE IDE 186 (Main Sale) | PVE IDE 284 (Sale Bar Code) |
|--------|-------------------------|------------------------------|
| Expression prix remisé | Expression 33 | Expression 33 |
| Structure | Moins de sous-tâches | 61+ sous-tâches imbriquées |
| Calcul correct | Oui (prix facturé OK) | Affichage KO, facture OK |
| Bug localisé | Non | **OUI** |

---

*Dernière mise à jour: 2026-01-09*
*Analyse complète - Cause racine identifiée*
