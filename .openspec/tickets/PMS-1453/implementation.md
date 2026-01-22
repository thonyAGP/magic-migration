# PMS-1453 - Implémentation

> **Jira** : [PMS-1453](https://clubmed.atlassian.net/browse/PMS-1453)

## Programme à modifier

| Projet | IDE | Nom | Fichier |
|--------|-----|-----|---------|
| ADH | 244 | Histo ventes payantes | Prg_240.xml |
| ADH | 245 | Histo ventes payantes | Prg_241.xml |

## Modifications requises

### 1. Ajouter validation sur Control Suffix

**Localisation** : Écran de saisie des ventes (formulaire)

**Contrôles** :
- `sod_trf_heure_transfert_aller` (FieldID 54/71)
- `sod_trf_heure_transfert_retour` (FieldID 61/78)

**Handler** : Control Suffix

**Logic à ajouter** :

```
BLOCK (condition: NOT Range(heure, 0, 86399))
   Verify Error MlsTrans('ERR_HEURE_INVALIDE')
   CtrlGoto(control_heure)
END_BLOCK
```

### 2. Ajouter message d'erreur

**Table** : Messages MLS (si utilisé)

| Code | FR | EN |
|------|----|----|
| ERR_HEURE_INVALIDE | L'heure doit être entre 00:00 et 23:59 | Time must be between 00:00 and 23:59 |

### 3. Expression de validation

**Créer expression** :
```
Range({champ_heure}, 0, 86399)
```

## Variables existantes

| Variable | Type | FieldID | Description |
|----------|------|---------|-------------|
| sod_trf_heure_transfert_aller | TIME | 54/71 | Heure transfert aller |
| sod_trf_heure_transfert_retour | TIME | 61/78 | Heure transfert retour |

## Tests de validation

| Scénario | Entrée | Attendu |
|----------|--------|---------|
| Heure valide | 10:30 | Accepté |
| Heure limite min | 00:00 | Accepté |
| Heure limite max | 23:59 | Accepté |
| Heure invalide | 70:00 | Erreur + focus sur champ |
| Heure invalide | 24:00 | Erreur + focus sur champ |
| Heure négative | -01:00 | Erreur + focus sur champ |

## Commits

*Aucun commit pour l'instant*

---

*Dernière mise à jour : 2026-01-22*
