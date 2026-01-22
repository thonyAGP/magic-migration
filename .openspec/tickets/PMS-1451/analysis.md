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
- Tronçons de séjour multiples → **Table n°167 - troncon__________tro (cafil145_dat)**
- Date fin séjour GM → **Table n°30 - gm-recherche_____gmr (cafil008_dat)** champ `gmr_fin_sejour`
- Purge → Programme de purge à identifier

---

## 2. Localisation Programmes

### magic_find_program("purge")

| Project | IDE | ID | Name | Public |
|---------|-----|----|------|--------|
| REF | 746 | 723 | Purge caisse | PURGE |
| REF | 747 | 724 | Purge caisse PMS-690 | |
| REF | 748 | 725 | Lancement Purge | |
| PBG | 274 | 784 | Affichage Log Purge Unit | |

### magic_find_program("troncon")

| Project | IDE | ID | Name | Public |
|---------|-----|----|------|--------|
| PBG | 35 | 427 | Browse - IMPORT Troncon IMT | |
| PBG | 46 | 415 | Browse - TRONCON TRO | |
| REF | 159 | 159 | Browse - troncon__________tro | cafil145_dat |
| REF | 760 | 737 | suppress troncon | |
| PBG | 212 | 234 | Traitement des Troncons | |

### magic_get_tree("REF", 737) - suppress troncon

| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| 760 | 1 | suppress troncon | 0 |
| 760.1 | 2 | troncon | 1 |
| 760.1.1 | 3 | ajout dans trace | 2 |

### Programmes identifiés

| Fichier XML | IDE Vérifié | Nom | Rôle dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_723.xml | **REF IDE 746** | Purge caisse | Purge des sessions caisse |
| Prg_737.xml | **REF IDE 760** | suppress troncon | Suppression tronçons lors purge |
| Prg_234.xml | **PBG IDE 212** | Traitement des Troncons | Création des tronçons |
| Prg_214.xml | **PBG IDE 225** | Traitement des Adherents | Import GM avec dates tronçon |

---

## 3. Tables concernées

### Table n°167 - troncon__________tro (cafil145_dat)

**Champs clés** :

| Champ | Type | Description |
|-------|------|-------------|
| tro_societe | Unicode | Code société |
| tro_compte | Numeric | Numéro compte GM |
| tro_filiation | Numeric | Filiation |
| tro_code_a_i_r | Unicode | **A**ller / **I**nterne / **R**etour |
| tro_date_depart_vol | Date | Date départ du vol |
| tro_date_arrivee_vol | Date | Date arrivée du vol |

**Index** : cafil145_dat_IDX_1 (societe, compte, filiation, code_a_i_r, date_depart, heure_depart)

### Table n°30 - gm-recherche_____gmr (cafil008_dat)

**Champs clés** :

| Champ | Type | Description |
|-------|------|-------------|
| gmr_code_gm | Numeric | Numéro compte |
| gmr_filiation_villag | Numeric | Filiation |
| gmr_debut_sejour | Date | Date début séjour (1er tronçon) |
| gmr_fin_sejour | Date | **Date fin séjour (1er tronçon seulement!)** |

### Autres tables liées

| N° | Nom | Physique | Rôle |
|----|-----|----------|------|
| 321 | fra_sejour | fra_sejour | Séjours avec dates |
| 71 | derniere_purge___pur | cafil049_dat | Historique purges |
| 82 | param_purge______ppu | cafil060_dat | Paramètres purge |
| 819 | Troncon supprime | ztrocafil145 | Archive tronçons |

---

## 4. Traçage Flux

### Flux d'import des adhérents

```
┌─────────────────────────────────────────┐
│ PBG IDE 225 - Traitement des Adherents  │
│ Variables: U (v.date deb dern troncon)  │
│            V (v.date fin dern troncon)  │
└────────────────────┬────────────────────┘
                     │ Écrit dans
                     ▼
┌─────────────────────────────────────────┐
│ Table n°30 - gm-recherche (cafil008)    │
│ gmr_fin_sejour = date fin 1er tronçon   │  ← BUG ICI
└─────────────────────────────────────────┘
```

### Flux de purge

```
┌─────────────────────────────────────────┐
│ REF IDE 748 - Lancement Purge           │
└────────────────────┬────────────────────┘
                     │ Appelle
                     ▼
┌─────────────────────────────────────────┐
│ REF IDE 746 - Purge caisse              │
│ Critère: gmr_fin_sejour < Date_Purge    │  ← Utilise mauvaise date
└────────────────────┬────────────────────┘
                     │ Appelle
                     ▼
┌─────────────────────────────────────────┐
│ REF IDE 760 - suppress troncon          │
│ Table: n°167 (cafil145_dat)             │
└─────────────────────────────────────────┘
```

---

## 5. Root Cause

| Élément | Valeur |
|---------|--------|
| **Table source** | Table n°30 - gm-recherche (cafil008_dat) |
| **Champ fautif** | `gmr_fin_sejour` |
| **Problème** | Contient la date du **1er tronçon** au lieu du **dernier** |
| **Table correcte** | Table n°167 - troncon (cafil145_dat) |
| **Champ correct** | `MAX(tro_date_depart_vol) WHERE tro_code_a_i_r = 'R'` |
| **Impact** | GM/GO avec plusieurs tronçons purgés à tort |

### Exemple concret (ticket)

| Tronçon | Date départ | Code A/I/R |
|---------|-------------|------------|
| 1er | 07/12/2025 | R (Retour) |
| 2ème | 15/06/2026 | R (Retour) |

- `gmr_fin_sejour` = **07/12/2025** (1er tronçon)
- Date purge = 26/12/2025
- Résultat : GM purgé car 07/12 < 26/12
- **Attendu** : Garder car dernier tronçon = 15/06/2026 > 26/12/2025

---

## Données requises

- Base de données : Village concerné à la date 03/12/2025 (date purge)
- Table(s) à extraire :
  - `cafil008_dat` (gmr_fin_sejour des GO archivés)
  - `cafil145_dat` (tronçons de ces GO)
  - `ztrocafil145` (tronçons supprimés lors de la purge)

---

*Analyse : 2026-01-22T18:42*
