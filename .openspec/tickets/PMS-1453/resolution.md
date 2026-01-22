# PMS-1453 - Résolution

> **Jira** : [PMS-1453](https://clubmed.atlassian.net/browse/PMS-1453)

## Diagnostic

Les champs de saisie d'heure de transfert dans le formulaire de vente (ADH IDE 244/245) n'ont pas de validation de plage. L'utilisateur peut saisir des heures comme "70:00" qui sont acceptées et stockées.

## Solution proposée

### Approche 1 : Validation Control Verify (recommandée)

Ajouter un handler Control Verify sur les champs heure :

```
IF heure > 86399 OR heure < 0 THEN
   Verify Error "L'heure doit être entre 00:00 et 23:59"
   Annuler
END IF
```

### Approche 2 : Expression Range

Utiliser la fonction `Range()` de Magic :

```
Range(heure, 0, 86399)
```

Retourne TRUE si la valeur est dans la plage, FALSE sinon.

### Champs à modifier

| Champ | FieldID | Table |
|-------|---------|-------|
| sod_trf_heure_transfert_aller | 54, 71 | saisie_od_par_service |
| sod_trf_heure_transfert_retour | 61, 78 | saisie_od_par_service |

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
