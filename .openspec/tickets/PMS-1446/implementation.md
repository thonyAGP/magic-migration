# PMS-1446 - Spécification d'implémentation

> **Jira** : [PMS-1446](https://clubmed.atlassian.net/browse/PMS-1446)

## Solution retenue : Option 2 + 3

Calcul automatique de MODEDAYINC basé sur la durée du séjour, avec seuil configurable.

---

## 1. Table de configuration (Option 3)

### Nouvelle table ou ajout à table existante REF

| Champ | Type | Valeur défaut | Description |
|-------|------|---------------|-------------|
| SEUIL_COURT_SEJOUR | Numeric | 7 | Nb nuits seuil (< = court séjour) |
| MODEDAYINC_COURT | Numeric | 0 | Incrément courts séjours (jour même) |
| MODEDAYINC_LONG | Numeric | 1 | Incrément longs séjours (lendemain) |

### Emplacement suggéré

Option A : Table `pos_parametres` existante (si existe)
Option B : Nouvelle table `pos_rental_config`

---

## 2. Modifications PVE IDE 139 (Initialization)

### Localisation
- **Programme** : PVE IDE 139 - Initialization
- **Fichier source** : `Prg_139.xml`
- **Sous-tâche** : Tâche 139.2 (Task Suffix)

### Modification Expression 4

**Actuel (ligne 665)** :
```magic
SetParam('MODEDAYINC', {0,2})
-- Prend la valeur de la table modes AM/PM directement
```

**Nouveau** :
```magic
SetParam('MODEDAYINC',
    IF(DureeSejour < GetParam('SEUIL_COURT_SEJOUR'),
       GetParam('MODEDAYINC_COURT'),
       GetParam('MODEDAYINC_LONG')
    )
)
```

### Nouvelles variables requises

| Variable | Source | Description |
|----------|--------|-------------|
| DureeSejour | Calculée | P.Fin sejour - P.date debut sejour |

### Nouvelles expressions à ajouter

```magic
-- Expression N : Charger paramètres depuis table config
SetParam('SEUIL_COURT_SEJOUR', {table_config, champ_seuil})
SetParam('MODEDAYINC_COURT', {table_config, champ_inc_court})
SetParam('MODEDAYINC_LONG', {table_config, champ_inc_long})

-- Expression N+1 : Calcul durée séjour
DureeSejour = P.Fin_sejour - P.date_debut_sejour
```

---

## 3. Modifications PVE IDE 186 (Select Product)

### Localisation
- **Programme** : PVE IDE 186 - Select Product
- **Fichier source** : `Prg_186.xml`

### Variables existantes à utiliser

| Variable | Colonne | Nom | Usage |
|----------|---------|-----|-------|
| E | 30 | P.date debut sejour | Date arrivée |
| F | 41 | P.Fin sejour | Date départ |

### Nouvelle logique dans Record Main

Avant l'appel à `GetParam('MODEDAYINC')`, calculer :

```magic
-- Pseudo-code logique
v.DureeSejour = F - E                    -- P.Fin sejour - P.date debut sejour
v.EstCourtSejour = (v.DureeSejour < 7)   -- Comparaison avec seuil

-- Puis dans Expression 15 (calcul date début location)
IF v.EstCourtSejour THEN
    DateDebutLocation = Date()           -- Jour même
ELSE
    DateDebutLocation = Date() + 1       -- Lendemain (comportement actuel)
END IF
```

### Expression 15 actuelle (ligne 6627)
```magic
Date() - GetParam('MODEDAYINC') + {0,10}
```

### Expression 15 modifiée
```magic
Date() - IF(({0,F} - {0,E}) < GetParam('SEUIL_COURT_SEJOUR'),
            GetParam('MODEDAYINC_COURT'),
            GetParam('MODEDAYINC_LONG')
         ) + {0,10}
```

**Où** :
- `{0,F}` = Variable F (P.Fin sejour) - à remplacer par index réel
- `{0,E}` = Variable E (P.date debut sejour) - à remplacer par index réel

---

## 4. Règles AM/PM (inchangées)

Les règles AM/PM existantes restent identiques :

| Heure | Condition | Comportement |
|-------|-----------|--------------|
| < 12:00 | Matin | Selon mode AM |
| 12:00 - 15:00 | Mi-journée | Demi-journée |
| > 15:00 | Après-midi | Selon mode PM |

Ces règles s'appliquent **après** le calcul du MODEDAYINC.

---

## 5. Matrice de test

### Cas de test requis

| # | Durée séjour | Mode | Heure vente | Date début attendue |
|---|--------------|------|-------------|---------------------|
| 1 | 7 nuits | AM | 10:00 | Lendemain arrivée |
| 2 | 7 nuits | PM | 14:00 | Lendemain arrivée |
| 3 | 6 nuits | AM | 10:00 | Jour arrivée |
| 4 | 6 nuits | PM | 14:00 | Jour arrivée |
| 5 | 4 nuits | AM | 10:00 | Jour arrivée |
| 6 | 3 nuits | PM | 16:00 | Jour arrivée |
| 7 | 8 nuits | AM | 09:00 | Lendemain arrivée |
| 8 | 14 nuits | PM | 13:00 | Lendemain arrivée |

### Cas limites

| # | Cas | Durée | Attendu |
|---|-----|-------|---------|
| 9 | Seuil exact | 7 nuits | Lendemain (>= seuil) |
| 10 | Seuil -1 | 6 nuits | Jour même (< seuil) |
| 11 | 1 nuit | 1 nuit | Jour même |
| 12 | Dates libres 5 nuits | 5 nuits | Jour même |

---

## 6. Configuration annuelle

### Procédure de modification du seuil

1. Ouvrir la table de configuration POS
2. Modifier la valeur `SEUIL_COURT_SEJOUR`
3. Sauvegarder
4. Redémarrer les sessions POS

**Aucun développement requis pour changer le seuil.**

### Exemple de changement

Si Club Med décide que le seuil passe à 5 nuits :

| Paramètre | Ancienne valeur | Nouvelle valeur |
|-----------|-----------------|-----------------|
| SEUIL_COURT_SEJOUR | 7 | 5 |

Résultat :
- Séjours < 5 nuits → Matériel jour arrivée
- Séjours >= 5 nuits → Matériel lendemain

---

## 7. Impact et dépendances

### Programmes impactés

| Programme | Type modification |
|-----------|-------------------|
| PVE IDE 139 | Ajout lecture config + calcul |
| PVE IDE 186 | Modification Expression 15 |
| PVE IDE 349 | Idem (variante V4) |
| PVE IDE 353 | Idem (variante V4) |
| PVE IDE 397 | Idem (variante V4) |
| PVE IDE 405 | Idem (Best Of) |

### Tables impactées

| Table | Modification |
|-------|--------------|
| Nouvelle table config | Création |
| pos_parametres (si utilisée) | Ajout champs |

### Composants non impactés

- PVE IDE 189 (Package Rental date) - reste désactivé
- PVE IDE 256 (Choix AM/PM) - inchangé
- Logique AM/PM - inchangée
- Calcul prix - inchangé

---

## 8. Estimation effort

| Tâche | Effort |
|-------|--------|
| Création/modification table config | 0.5j |
| Modification PVE IDE 139 | 0.5j |
| Modification PVE IDE 186 + variantes | 1j |
| Tests unitaires | 1j |
| Tests intégration | 0.5j |
| Documentation | 0.5j |
| **Total** | **4 jours** |

---

## 9. Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Régression calcul dates | Moyenne | Élevé | Tests exhaustifs |
| Performance (calcul supplémentaire) | Faible | Faible | Calcul simple |
| Erreur seuil config | Faible | Moyen | Validation valeur > 0 |

---

## Validation

- [ ] Validation métier de la solution
- [ ] Validation technique Magic
- [ ] Identification table configuration exacte
- [ ] Planification développement
- [ ] Environnement de test disponible
