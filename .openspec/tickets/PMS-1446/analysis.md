# PMS-1446 - Location matériel ski courts séjours

> **Jira** : [PMS-1446](https://clubmed.atlassian.net/browse/PMS-1446)

## Informations Jira

| Champ | Valeur |
|-------|--------|
| **Ticket** | PMS-1446 |
| **Titre** | [POS] location matériel de ski court séjour / séjours dates libres |
| **Statut** | En cours |
| **Priorité** | Haute |
| **Reporter** | Jessica Palermo |
| **Assignee** | Anthony Leberre |
| **Créé** | 2025-12-31 |

## Demande

### Règle actuelle (séjour 7 jours = semaine Club Med)
- Matériel de ski donné le **lendemain** du jour d'arrivée
- Forfait ski valide du lendemain au départ

### Règle demandée (courts séjours < 7 jours)
- Matériel de ski donné le **jour d'arrivée**
- Alignement avec la règle du forfait ski (si droit de skier dès l'arrivée → matériel dès l'arrivée)
- Garder les règles AM/PM (demi-journées)

### Contrainte additionnelle
> "Ces règles risquent de changer chaque année, il faudrait trouver un système pour l'adapter rapidement sans devoir attendre un développement"

## Analyse Technique

### Programmes concernés

| Programme | Nom | Rôle | Statut |
|-----------|-----|------|--------|
| **PVE IDE 186** | Select Product | Programme principal vente/location | Principal |
| **PVE IDE 189** | Package Rental date | Calendrier sélection dates | DÉSACTIVÉ |
| **PVE IDE 139** | Initialization | Initialisation paramètres POS | SetParam |
| **PVE IDE 256** | Choix - Select AM/PM | Sélection mode AM/PM | Config |

### Paramètre clé : MODEDAYINC

```
SetParam('MODEDAYINC', {0,2})  -- Variable C = incrément jours
SetParam('MODEDAY', {0,1})     -- Variable B = mode (AM/PM)
```

Le paramètre **MODEDAYINC** contrôle le décalage en jours :
- `0` = Matériel donné le **jour même**
- `1` = Matériel donné le **lendemain**

### Expressions de calcul des dates (PVE IDE 186)

```magic
-- Expression 15 : Calcul date début
Date() - GetParam('MODEDAYINC') + {0,10}

-- Expression 33 : Date + 1 jour
Date() + 1

-- Expressions 28, 34, 35, 36, 37 : Logique AM/PM
Date() > {2,4} AND Time() >= '12:00:00'TIME AND Time() <= '15:00:00'TIME
```

### Tables concernées

| Table | Objet | Contenu |
|-------|-------|---------|
| DataObject 384 | Modes AM/PM | Configuration modes avec incrément |
| DataObject 379 | Produits | Catalogue produits location |
| DataObject 385 | Calendrier | Calendrier packages |

### Variables importantes (PVE IDE 186)

| Variable | Nom | Type | Rôle |
|----------|-----|------|------|
| E (col 30) | P.date debut sejour | Date | Date arrivée GM |
| F (col 41) | P.Fin sejour | Date | Date départ GM |
| K (col 10) | ? | Numeric | Nombre jours location |

## Solution proposée

### Option 1 : Modification table Modes (RECOMMANDÉE)

**Principe** : Ajouter un nouveau mode dans la table DataObject 384 pour les courts séjours.

| Mode | Description | MODEDAYINC |
|------|-------------|------------|
| AM | Matin standard | 1 |
| PM | Après-midi standard | 1 |
| AM-CS | Matin court séjour | 0 |
| PM-CS | Après-midi court séjour | 0 |

**Avantages** :
- Configuration via table, pas de code
- Changement rapide chaque année
- Compatible avec demande utilisateur

**Inconvénients** :
- Nécessite que l'opérateur choisisse le bon mode
- Risque d'erreur humaine

### Option 2 : Calcul automatique basé sur durée séjour

**Principe** : Modifier la logique pour détecter automatiquement si séjour < 7 jours.

```magic
-- Pseudo-code nouvelle logique
DureeSejour = P.Fin sejour - P.date debut sejour
IF DureeSejour < 7 THEN
    MODEDAYINC = 0  -- Court séjour : matériel jour arrivée
ELSE
    MODEDAYINC = 1  -- Semaine : matériel lendemain
END IF
```

**Points de modification** :
1. **PVE IDE 139** (Initialization) : Ajouter calcul durée séjour
2. **PVE IDE 186** (Select Product) : Utiliser la nouvelle logique
3. **Expression 15** : Adapter le calcul

**Avantages** :
- Automatique, pas d'erreur opérateur
- S'adapte au séjour du GM

**Inconvénients** :
- Modification code Magic
- Nécessite test approfondi

### Option 3 : Paramètre configurable externe

**Principe** : Créer un fichier de configuration ou table de paramètres.

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| SEUIL_COURT_SEJOUR | 7 | Nombre de nuits seuil |
| MODEDAYINC_COURT | 0 | Incrément courts séjours |
| MODEDAYINC_LONG | 1 | Incrément longs séjours |

**Avantages** :
- Très flexible
- Modifiable sans recompilation
- Répond à la demande de changement annuel facile

## Recommandation

**Option 2 + Option 3** combinées :

1. Implémenter le calcul automatique basé sur la durée du séjour
2. Rendre le seuil configurable (7 jours par défaut)
3. Stocker les paramètres dans une table REF accessible

Cela permet :
- Fonctionnement automatique sans intervention opérateur
- Adaptation facile chaque année via modification de table
- Pas besoin de développement pour ajuster le seuil

## Questions en suspens

1. Le seuil de 7 jours est-il fixe ou peut-il varier selon le village ?
2. Les règles AM/PM restent-elles identiques pour tous les types de séjour ?
3. Y a-t-il des exceptions (types de produits spécifiques) ?

## Prochaines étapes

1. [ ] Valider l'approche avec le métier
2. [ ] Identifier la table de configuration à utiliser
3. [ ] Spécifier les modifications exactes dans PVE IDE 186
4. [ ] Créer les tests de validation
5. [ ] Planifier le déploiement

## Références

- Image attachée : Règles Club Med Alpes Hiver (Semaine/Courts séjours/Dates libres)
- Fichier : `image-20251231-160101.png`

---

## Verification MCP (2026-01-12)

### PVE IDE 186 (Main Sale) confirmé

**27 paramètres** dont les clés pour le calcul :

| Param | Nom | Type | Role |
|-------|-----|------|------|
| 42 | v.Deb_Sejour | Date | Date début séjour GM ✅ |
| 43 | v.Fin_sejour | Date | Date fin séjour GM ✅ |

### Calcul durée séjour disponible

Les variables `v.Deb_Sejour` et `v.Fin_sejour` sont déjà passées en paramètres.
Le calcul `DureeSejour = v.Fin_sejour - v.Deb_Sejour` est donc faisable.

### Status

| Element | Valeur |
|---------|--------|
| **Analyse** | CONFIRMÉE par MCP ✅ |
| **Variables disponibles** | v.Deb_Sejour, v.Fin_sejour |
| **Solution** | Option 2+3 (calcul auto + seuil configurable) |
| **Prochaine étape** | Valider avec le métier |

---

*Analyse: 2026-01-09*
*Verification MCP: 2026-01-12*
*Statut: SPEC COMPLETE - En attente validation métier*
