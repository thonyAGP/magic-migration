# PMS-1451 - Résolution

> **Jira** : [PMS-1451](https://clubmed.atlassian.net/browse/PMS-1451)

## Diagnostic

Le programme de purge (REF IDE 746) utilise `gmr_fin_sejour` pour déterminer si un GM/GO doit être purgé. Cette date correspond au **premier tronçon de séjour uniquement**.

Pour les GM/GO avec plusieurs tronçons, il faut prendre la date de fin du **dernier tronçon** dans la table `fra_sejour`.

## Solution proposée

### Approche

Modifier le critère de sélection pour :
1. Rechercher la date de fin maximale dans `fra_sejour` pour chaque GM/GO
2. Utiliser cette date comme critère de purge

### Tables concernées

| Table | Champ | Rôle |
|-------|-------|------|
| fra_sejour (321) | date_fin | Date fin de chaque tronçon |
| gm-recherche (cafil008_dat) | gmr_fin_sejour | Date fin 1er tronçon (actuel) |

### Pseudo-code du fix

**Avant** :
```
SI gmr_fin_sejour < Date_Purge ALORS
   Purger le GM/GO
```

**Après** :
```
date_fin_reelle = MAX(fra_sejour.date_fin WHERE societe=S AND compte=C AND filiation=F)
SI date_fin_reelle IS NULL ALORS
   date_fin_reelle = gmr_fin_sejour
SI date_fin_reelle < Date_Purge ALORS
   Purger le GM/GO
```

## Statut

| Étape | Statut | Date |
|-------|--------|------|
| Analyse | Terminée | 2026-01-22 |
| Validation solution | En attente | |
| Implémentation | En attente | |
| Tests | En attente | |
| Déploiement | En attente | |

---

*Dernière mise à jour : 2026-01-22*
