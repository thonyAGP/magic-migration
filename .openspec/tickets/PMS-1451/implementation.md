# PMS-1451 - Implémentation

> **Jira** : [PMS-1451](https://clubmed.atlassian.net/browse/PMS-1451)

## Programme à modifier

| Projet | IDE | Nom | Fichier |
|--------|-----|-----|---------|
| REF | 746 | Purge caisse | Prg_723.xml |

## Modifications requises

### 1. Créer une nouvelle sous-tâche

**Nom** : `Recherche date fin max tronçon`

**DataView** :
- Main Source : Table n°321 (fra_sejour)
- Locate : societe, compte, filiation
- Range : Max sur date_fin

**Logic** :
- Record Suffix : Récupérer MAX(date_fin) dans variable

### 2. Modifier le critère de purge

**Localisation** : Tâche 746.3 (user)

**Avant** :
```
Condition purge = gmr_fin_sejour < Date_Purge
```

**Après** :
```
1. CallTask vers "Recherche date fin max tronçon"
2. SI date_fin_max trouvée ALORS
     Condition purge = date_fin_max < Date_Purge
   SINON
     Condition purge = gmr_fin_sejour < Date_Purge
```

## Variables à ajouter

| Variable | Type | Description |
|----------|------|-------------|
| v.DateFinMaxTroncon | DATE | Date fin du dernier tronçon |
| v.TronconTrouve | LOGICAL | Indique si un tronçon existe |

## Tests de validation

| Scénario | Attendu |
|----------|---------|
| GM avec 1 tronçon (fin < purge) | Purgé |
| GM avec 1 tronçon (fin > purge) | Conservé |
| GM avec 2 tronçons (T1 < purge, T2 > purge) | Conservé |
| GM avec 2 tronçons (T1 < purge, T2 < purge) | Purgé |
| GO sans tronçon dans fra_sejour | Utilise gmr_fin_sejour |

## Commits

*Aucun commit pour l'instant*

---

*Dernière mise à jour : 2026-01-22*
