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
- Tronçons de séjour multiples → **Table n°167 - troncon (cafil145_dat)**
- Date fin séjour GM → **Table n°30 - gm-recherche (cafil008_dat)** champ `gmr_fin_sejour`
- Sélection archivage → Programme de sélection à identifier

---

## 2. Localisation Programmes - CORRIGÉE

### Programme de sélection pour archivage (TROUVÉ)

| Projet | IDE | Fichier | Nom | Rôle |
|--------|-----|---------|-----|------|
| **REF** | **749** | Prg_726.xml | **lancement reparation** | Orchestrateur archivage |
| **REF** | **749.1** | Prg_726.xml | **séléction** | **SÉLECTION DES GO À ARCHIVER** |
| **REF** | **749.2** | Prg_726.xml | supress des arrivées avant dim | Nettoyage zselect |

### Programmes de suppression (appelés après sélection)

| Projet | IDE | Fichier | Nom | Table cible |
|--------|-----|---------|-----|-------------|
| REF | 750 | Prg_727.xml | suppress voyages | Table n°39 |
| REF | 751 | Prg_728.xml | suppress gmrecherche | Table n°30 |
| REF | 752 | Prg_729.xml | suppress gmcomplet | Table n°31 |
| REF | 753 | Prg_730.xml | suppress prestation | Table n°36 |
| REF | 754 | Prg_731.xml | suppress hebergement | Table n°34 |
| REF | 755 | Prg_732.xml | suppress personnel | Table n°35 |
| REF | 756 | Prg_733.xml | suppress personnelarrivee | Table n°207 |
| REF | 757 | Prg_734.xml | suppress voyagearrivee | Table n°166 |
| REF | 758 | Prg_735.xml | suppress go | Table n°817 |
| REF | 759 | Prg_736.xml | suppress accompagnant | Table n°200 |
| REF | 760 | Prg_737.xml | suppress troncon | Table n°167 |
| REF | 761 | Prg_738.xml | suppress resa | Table n°165 |

> **Note** : REF IDE 746 "Purge caisse" est un programme DIFFÉRENT qui purge les sessions de caisse (users/sessions), pas les GM/GO.

---

## 3. Analyse du programme de sélection (REF IDE 749.1)

### DataView de la tâche 749.1 "séléction"

| Source | Table | Accès | Rôle |
|--------|-------|-------|------|
| **Main Source** | Table n°31 - gm_complet (cafil011_dat) | READ | Itère sur tous les GM |
| **Link 1** | Table n°34 - hebergement (cafil012_dat) | READ | Joint l'hébergement |
| **Link 2** | Table n°34 - hebergement (cafil012_dat) | READ | Second lien (autre clé) |
| **Link 3** | **Table n°808 - zselect** | **WRITE** | **Écrit la liste des GO à supprimer** |

### Variables du programme principal (REF IDE 749)

| Variable | Nom | Type | Description |
|----------|-----|------|-------------|
| A | V.N°d'import début | Numeric | N° import de départ |
| B | V.compteur | Numeric | Compteur |
| **C** | **date a partir d'ou on suprime** | **Date** | **Date de purge** |
| D | B.lancement | Alpha | Bouton lancement |

### Expressions clés de la tâche 749.1

| N° | Expression | Valeur | Description |
|----|------------|--------|-------------|
| 3 | `{1,3}` | Parent Variable C | Date de purge (depuis formulaire) |
| 6 | `{0,9}` | Field 9 DataView | Une date du GM |

### Range de sélection

```
Main Source : Table n°31 (gm_complet)
Range sur colonne 42 (date) avec :
  - MIN = Expression 3 = {1,3} = Date de purge

→ Sélectionne les GM où la date (colonne 42) < Date purge
```

### ⚠️ CE QUI MANQUE

**La tâche 749.1 NE JOINT PAS la table n°167 (troncon).**

Elle ne vérifie donc pas `MAX(tro_date_depart_vol) WHERE tro_code_a_i_r = 'R'`.

---

## 4. Flux complet d'archivage

```
┌───────────────────────────────────────────────────────────────┐
│  REF IDE 749 - lancement reparation                           │
│  Formulaire "Lancement de la sélection"                       │
│  Variable C = "date a partir d'ou on suprime"                 │
└───────────────────────┬───────────────────────────────────────┘
                        │ Bouton "Lancement"
                        ▼
┌───────────────────────────────────────────────────────────────┐
│  Tâche 749.1 - séléction                                      │
│  ─────────────────────────────────────────────────────────────│
│  Main Source: Table n°31 (gm_complet)                         │
│  Link 1: Table n°34 (hebergement)                             │
│  Link 2: Table n°34 (hebergement)                             │
│  Link 3: Table n°808 (zselect) [WRITE]    ◄── ÉCRIT ICI      │
│  ─────────────────────────────────────────────────────────────│
│  Range: date < Variable C (date purge)                        │
│                                                               │
│  ⚠️ PAS DE LINK vers Table n°167 (troncon)                   │
│  ⚠️ Ne vérifie pas tro_date_depart_vol                       │
└───────────────────────┬───────────────────────────────────────┘
                        │ Remplit zselect
                        ▼
┌───────────────────────────────────────────────────────────────┐
│  Tâche 749.2 - supress des arrivées avant dim                 │
│  Nettoie zselect (supprime selon Range date)                  │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│  CallTask REF IDE 750-761 (suppress *)                        │
│  ─────────────────────────────────────────────────────────────│
│  Chaque programme lit zselect et supprime dans sa table       │
│  cible les enregistrements correspondants.                    │
└───────────────────────────────────────────────────────────────┘
```

---

## 5. Root Cause - CONFIRMÉE

| Élément | Valeur |
|---------|--------|
| **Programme** | **REF IDE 749.1** (Tâche "séléction" dans Prg_726.xml) |
| **Main Source** | Table n°31 - gm_complet (cafil011_dat) |
| **Problème** | La Range utilise une date du GM sans vérifier les tronçons |
| **Table manquante** | Table n°167 - troncon (cafil145_dat) |
| **Champ à vérifier** | `MAX(tro_date_depart_vol) WHERE tro_code_a_i_r = 'R'` |
| **Impact** | GM/GO avec plusieurs tronçons archivés à tort |

### Exemple concret (ticket)

| Tronçon | Date départ | Code A/I/R | Commentaire |
|---------|-------------|------------|-------------|
| 1er | 07/12/2025 | R (Retour) | Vérifié par sélection actuelle |
| 2ème | 15/06/2026 | R (Retour) | **NON VÉRIFIÉ** |

- Date utilisée dans sélection = **07/12/2025** (depuis gm_complet)
- Date purge = 26/12/2025
- Résultat : GM archivé car 07/12 < 26/12
- **Attendu** : Garder car dernier tronçon = 15/06/2026 > 26/12/2025

---

## 6. Tables concernées

### Table n°31 - gm_complet (cafil011_dat)

**Rôle** : Main Source du programme de sélection

| Champ | Type | Description |
|-------|------|-------------|
| code_gm | Numeric | Numéro compte |
| filiation | Numeric | Filiation |
| ... | ... | Autres champs GM |

### Table n°167 - troncon (cafil145_dat)

**Rôle** : À ajouter comme Link pour vérifier la vraie date de fin

| Champ | Type | Description |
|-------|------|-------------|
| tro_societe | Unicode | Code société |
| tro_compte | Numeric | Numéro compte GM |
| tro_filiation | Numeric | Filiation |
| tro_code_a_i_r | Unicode | **A**ller / **I**nterne / **R**etour |
| tro_date_depart_vol | Date | **Date départ du vol** |
| tro_date_arrivee_vol | Date | Date arrivée du vol |

**Index** : cafil145_dat_IDX_1 (societe, compte, filiation, code_a_i_r, date_depart)

### Table n°808 - zselect (Selection des noms a supprimer)

**Rôle** : Table intermédiaire contenant la liste des GM/GO à supprimer

| Champ | Type | Description |
|-------|------|-------------|
| societe | Alpha | Code société |
| compte | Numeric | Numéro compte |
| filiation | Numeric | Filiation |
| nom | Alpha | Nom |
| prenom | Alpha | Prénom |
| ... | ... | Autres champs |

---

## Données requises

- Base de données : Village concerné à la date 03/12/2025 (date purge)
- Table(s) à extraire :
  - `cafil011_dat` (gm_complet des GO archivés)
  - `cafil145_dat` (tronçons de ces GO)
  - `ztrocafil145` (tronçons supprimés lors de la purge)

---

*Analyse : 2026-01-22T19:30*
*Programme identifié : REF IDE 749.1 "séléction"*
