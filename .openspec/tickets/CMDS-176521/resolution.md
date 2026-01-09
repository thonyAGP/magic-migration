# Resolution CMDS-176521

> **Jira** : <a href="https://clubmed.atlassian.net/browse/CMDS-176521" target="_blank">CMDS-176521</a>

## Statut: RÉSOLU ✅

---

## Symptôme

**Bug d'affichage du prix remisé dans le POS (module PVE)**

- Prix attendu avec -10% : **5,400 JPY**
- Prix affiché : **41,857** (valeur incorrecte)
- Prix facturé à la validation : **CORRECT**

---

## Fix appliqué

### Commit `64688798c` - 23/12/2025

**Auteur** : Alan (alan.lecorre.ext@clubmed.com)

**Message** : "Modification POS du bouton DISCOUNT qui renvoyait une erreur SQL après avoir cliquer sur le bouton payment all filiations"

### Programmes modifiés

| Programme | Modification |
|-----------|--------------|
| PVE IDE 180 | Suppression SQL_WHERE_U |
| **PVE IDE 181** | Suppression SQL_WHERE_U (Task 33) |
| PVE IDE 284 | Suppression SQL_WHERE_U |

### Modification technique

**Suppression de la condition SQL dans la Task 33** :

```xml
<!-- AVANT (bug) -->
<SQL_WHERE_U>
  <TOKEN>
    <CODE val="1"/>
    <SqlWhereFlags val="1"/>
    <Parent val="3"/>
    <VAR_ISN val="30"/>
  </TOKEN>
</SQL_WHERE_U>

<!-- APRÈS (fix) -->
<!-- Section supprimée -->
```

**Changement associé** : `<SqlWhereExist val="Y"/>` → `<SqlWhereExist val="N"/>`

---

## Analyse initiale (référence)

Mon analyse avait identifié un problème potentiel différent :

### Expression 33 - Référence variable suspecte

```magic
Round({1,13}*(1-ExpCalc('15'EXP)/100),10,{32768,43})
```

- `{1,13}` référence index 13 dans Task 19
- Task 19 n'a pas de variable à l'index 13 (commence à 16)
- Pourrait causer des valeurs aléatoires

**Note** : Cette analyse reste valide pour investigation future si le bug réapparaît.

---

## Programmes concernés

| Programme | Description | Fix appliqué |
|-----------|-------------|--------------|
| PVE IDE 180 | Main Sale | ✅ Oui |
| **PVE IDE 181** | Main Sale-664 | ✅ Oui |
| PVE IDE 284 | Main Sale Sale Bar Code | ✅ Oui |

---

## Références Magic IDE

### Programme principal

| IDE | Projet | Nom Public | Fichier |
|-----|--------|------------|---------|
| **PVE IDE 181** | PVE | Main Sale-664 | Prg_181.xml |

### Historique Git

```
64688798c Modification POS du bouton DISCOUNT (erreur SQL)
61a174f6b Modification POS PAYMENT ALL FILIATIONS (commentaire)
c7e0b112a Modification POS payment all filiations (locations)
```

---

## Validation

- [x] Fix déployé (commit 64688798c)
- [x] 3 programmes corrigés (180, 181, 284)
- [ ] Validation fonctionnelle à confirmer

---

*Dernière mise à jour: 2026-01-09*
*Fix appliqué: suppression SQL_WHERE_U dans Task 33*
