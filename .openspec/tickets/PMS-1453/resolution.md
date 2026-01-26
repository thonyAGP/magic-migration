# PMS-1453 - Résolution

> **Jira** : [PMS-1453](https://clubmed.atlassian.net/browse/PMS-1453)
> **Pattern KB** : `missing-time-validation`

## Diagnostic

Les champs de saisie d'heure de transfert dans **ADH IDE 307** (Tache 307.37) n'ont pas de Picture de validation. L'utilisateur peut saisir des heures invalides comme "70:00" qui sont acceptées et stockées dans la table `transfertn`.

**Cause racine** : Les colonnes FIELD_TIME sans Picture acceptent n'importe quelle valeur numerique.

## Solution recommandée : Ajouter Picture HH:MM

### Modification XML (Prg_304.xml)

**Colonne id=5** "W1 Heure transfert Aller" (ligne ~31823) :
```xml
<Picture id="157" valUnicode="HH:MM"/>
```

**Colonne id=13** "W1 Heure transfert Retour" (ligne ~31880) :
```xml
<Picture id="157" valUnicode="HH:MM"/>
```

### Programmes à modifier

| Programme | Fichier | Tache | Colonnes |
|-----------|---------|-------|----------|
| ADH IDE 307 | Prg_304.xml | 307.37 | id=5, id=13 |
| ADH IDE 313 | Prg_313.xml | A verifier | Meme structure |

## Alternative : Validation Control Verify

Si modification Picture impossible, ajouter handler Control Verify :

```
IF heure > 86399 OR heure < 0 THEN
   Verify Error "L'heure doit être entre 00:00 et 23:59"
   Annuler
END IF
```

## Statut

| Étape | Statut | Date |
|-------|--------|------|
| Analyse | Terminée | 2026-01-22T18:55 |
| Pattern KB créé | Terminé | 2026-01-26 |
| Validation solution | En attente | |
| Implémentation | En attente | |
| Tests | En attente | |
| Déploiement | En attente | |

## Tests de validation

- [ ] Saisie 00:00 → Acceptée
- [ ] Saisie 12:30 → Acceptée
- [ ] Saisie 23:59 → Acceptée
- [ ] Saisie 24:00 → Rejetée
- [ ] Saisie 70:00 → Rejetée

---

*Dernière mise à jour : 2026-01-26*
