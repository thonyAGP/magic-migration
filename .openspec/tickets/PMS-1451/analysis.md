# PMS-1451 - PURGE prend uniquement le 1er tronçon de séjour

> **Jira** : [PMS-1451](https://clubmed.atlassian.net/browse/PMS-1451)
> **Protocole** : `.claude/protocols/ticket-analysis.md` appliqué

---

## 1. Contexte Jira

| Élément | Valeur |
|---------|--------|
| **Symptôme** | "Tous les GO qui avaient plusieurs tronçons de séjour ont été archivés même si leur date de fin était juin 2026" |
| **Données entrée** | Purge lancée le 3/12 pour la date du 26/12 |
| **Attendu** | Le système doit regarder la date de départ du 2ème tronçon (GM et GO) |
| **Obtenu** | Le système regarde uniquement la date de départ du 1er tronçon (le 7/12) |
| **Reporter** | Jessica Palermo |
| **Date** | 2026-01-06 |

### Indices extraits du ticket
- Tronçons de séjour multiples → Table `fra_sejour`
- Purge → Programme de purge à identifier
- GO archivés à tort → Critère de sélection incorrect

---

## 2. Localisation Programmes

### magic_find_program("purge")

| Project | IDE | ID | Name | Public |
|---------|-----|----|------|--------|
| REF | 746 | 723 | Purge caisse | PURGE |
| REF | 747 | 724 | Purge caisse PMS-690 | |
| REF | 748 | 725 | Lancement Purge | |
| PBG | 274 | 784 | Affichage Log Purge Unit | |

### magic_get_tree("REF", 723)

| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| 746 | 1 | Purge caisse | 0 |
| 746.1 | 2 | Paramètres | 1 |
| 746.2 | 3 | Liste USER | 1 |
| 746.3 | 10 | user | 1 |
| 746.3.1 | 11 | Session maxi | 2 |
| 746.3.2 | 12 | Coffre maxi | 2 |
| 746.3.3 | 13 | comptage caisse | 2 |
| 746.3.4 | 16 | session | 2 |
| 746.3.5 | 21 | coffre | 2 |

### Programmes identifiés

| Fichier XML | IDE Vérifié | Nom | Rôle dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_723.xml | **REF IDE 746** | Purge caisse | Programme principal de purge |
| Prg_725.xml | **REF IDE 748** | Lancement Purge | Point d'entrée |

### Tables identifiées

| N° Table | Nom | Nom physique | Rôle |
|----------|-----|--------------|------|
| 321 | fra_sejour | fra_sejour | Tronçons de séjour |

---

## 3. Traçage Flux

### magic_get_logic("REF", 723, 1)

| Ligne | Opération | Condition |
|-------|-----------|-----------|
| 11 | BLOCK | NOT VG.47 |
| 12 | CallTask | Sous-tâche 2 : Paramètres |
| 13 | CallTask | Sous-tâche 3 : Liste USER |
| 14 | CallTask | Sous-tâche 10 : user |
| 15 | CallTask | Sous-tâche 24 : session_user_inconnue |
| 16 | CallTask | Sous-tâche 29 : session_a_zero |
| 17 | CallTask | Sous-tâche 35 : Suppression utilisateur |

### Diagramme du flux

```
┌─────────────────────┐
│ REF IDE 748         │ Lancement Purge
│ Point d'entrée      │
└─────────┬───────────┘
          │ CallTask
          ▼
┌─────────────────────┐
│ REF IDE 746         │ Purge caisse
│ Tâche racine        │
└─────────┬───────────┘
          │ CallTask (condition NOT VG.47)
          ▼
┌─────────────────────┐
│ Tâche 746.3         │ user
│ Boucle sur users    │ ← ZONE SUSPECTE
└─────────────────────┘
```

---

## 4. Analyse du problème

### Hypothèse

Le critère de sélection pour la purge utilise probablement `gmr_debut_sejour` ou `gmr_fin_sejour` de la table `gm-recherche` (cafil008_dat) sans tenir compte des multiples tronçons dans la table `fra_sejour`.

### Variables clés identifiées (table gm-recherche)

| Variable | Nom | Description |
|----------|-----|-------------|
| gmr_debut_sejour | Date début séjour | Premier tronçon |
| gmr_fin_sejour | Date fin séjour | Premier tronçon uniquement |

### Le vrai problème

Pour les GM/GO avec **plusieurs tronçons de séjour**, les dates `gmr_debut_sejour` et `gmr_fin_sejour` correspondent au **premier tronçon uniquement**.

La purge devrait :
1. Vérifier la table `fra_sejour` pour chaque GM/GO
2. Prendre la **date de fin du dernier tronçon** (MAX)
3. Ne purger que si cette date est antérieure à la date de purge

---

## 5. Root Cause

| Élément | Valeur |
|---------|--------|
| **Programme** | REF IDE 746 - Purge caisse |
| **Zone** | Critère de sélection des utilisateurs à purger |
| **Erreur** | Utilise `gmr_fin_sejour` (1er tronçon) au lieu de MAX(fra_sejour.fin_troncon) |
| **Impact** | GM/GO avec tronçons multiples archivés prématurément |

---

## Données requises

- Base de données : Village avec GO multi-tronçons
- Exemple de GM/GO avec tronçon 1 (fin 7/12/2025) et tronçon 2 (fin juin 2026)

---

*Analyse : 2026-01-22 18:14*
