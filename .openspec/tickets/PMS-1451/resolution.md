# PMS-1451 - Résolution

> **Jira** : [PMS-1451](https://clubmed.atlassian.net/browse/PMS-1451)

## Diagnostic

Le champ `gmr_fin_sejour` de la table **n°30 - gm-recherche (cafil008_dat)** contient la date de fin du **premier tronçon de séjour** uniquement.

Pour les GM/GO avec plusieurs tronçons (ex: prolongation de séjour), la purge utilise cette date incorrecte et archive des personnes dont le séjour réel n'est pas terminé.

## Solution proposée

### Approche 1 : Modifier le critère de purge (RECOMMANDÉE)

Remplacer l'utilisation de `gmr_fin_sejour` par une sous-requête sur la table troncon :

```sql
-- Critère actuel (BUG)
WHERE gmr_fin_sejour < @Date_Purge

-- Critère corrigé
WHERE (
    SELECT MAX(tro_date_depart_vol)
    FROM cafil145_dat
    WHERE tro_societe = gmr_societe
      AND tro_compte = gmr_code_gm
      AND tro_filiation = gmr_filiation_villag
      AND tro_code_a_i_r = 'R'  -- Retour uniquement
) < @Date_Purge
```

**Avantages** :
- Ne modifie pas la structure existante
- Calcul dynamique basé sur les vraies données

**Inconvénients** :
- Performance (sous-requête pour chaque GM)

### Approche 2 : Mettre à jour gmr_fin_sejour lors de l'import

Modifier **PBG IDE 225 - Traitement des Adherents** pour que `gmr_fin_sejour` contienne la date du **dernier** tronçon et non du premier.

**Avantages** :
- Pas de modification de la purge
- Performance optimale

**Inconvénients** :
- Impact potentiel sur d'autres fonctionnalités utilisant `gmr_fin_sejour`
- Nécessite de retraiter les données existantes

### Tables concernées

| Table | Champ | Rôle |
|-------|-------|------|
| n°30 - gm-recherche (cafil008_dat) | gmr_fin_sejour | Date fin actuelle (1er tronçon) |
| n°167 - troncon (cafil145_dat) | tro_date_depart_vol | Date départ de chaque tronçon |
| n°167 - troncon (cafil145_dat) | tro_code_a_i_r | A=Aller, I=Interne, R=Retour |

### Pseudo-code du fix (Approche 1)

**Avant** :
```
SI gmr_fin_sejour < Date_Purge ALORS
   Purger le GM/GO
```

**Après** :
```
date_fin_reelle = MAX(tro_date_depart_vol)
                  FROM cafil145_dat
                  WHERE compte = gmr_code_gm
                    AND tro_code_a_i_r = 'R'

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

*Dernière mise à jour : 2026-01-22T18:49*
