# Analyse des Mises à Jour des Dates de Location - Projet PVE

**Date**: 2026-01-04
**Projet**: PVE (Point de Vente/POS)
**Objet**: Traçage des points de mise à jour des dates de location ski/matériel

---

## 1. Tables Principales

### Table n°400 - pv_rentals_dat (locations)
| Colonne ID | Nom | Type | Description |
|------------|-----|------|-------------|
| 7 | #_rental_days_requested | Numeric | Nombre de jours de location demandés |
| 8 | date_out | Date | **Date de début de location** |
| 10 | date_in | Date | **Date de fin de location** |

### Table n°401 - pv_rentals_histo_dat (historique)
Structure similaire à pv_rentals_dat, contient l'historique des locations passées.

---

## 2. Programmes avec Accès WRITE à Table n°400

### Vue d'ensemble

| Programme | Nom | Dossier | Dernière Modification | Priorité |
|-----------|-----|---------|----------------------|----------|
| **PVE IDE 196 - Package=> account** | Package=> account | Mobile POS (15) | **26/11/2025** | CRITIQUE |
| **PVE IDE 192 - Select Product** | Select Product | Mobile POS (15) | **14/11/2025** | HAUTE |
| PVE IDE 181 - Saisie Prepaid | Saisie Prepaid | Menu (14) | 04/04/2023 | BASSE |
| PVE IDE 171 - GetNbrProdBookerWithoutBooking | GetNbrProdBookerWithoutBooking | Interface Booker (13) | 15/04/2019 | BASSE |

---

## 3. ANALYSE DÉTAILLÉE - PVE IDE 196 "Package=> account"

**Dossier**: Mobile POS (dossier 15)
**Source**: Programme 190

### Sous-tâches avec modifications récentes

| Tâche | Nom | Dernière Modification |
|-------|-----|----------------------|
| **196.1** | Package=> account | 26/11/2025 12:02:22 |
| **196.13** | package | 26/11/2025 12:02:22 |
| **196.8** | SALE package_Add_Qté | 30/10/2025 11:32:51 |
| 196.7 | SALE package_Creat | 18/11/2024 15:57:47 |

### POINTS CRITIQUES - Opérations UPDATE sur les dates

**Localisation**: Tâche 196.8 "SALE package_Add_Qté" → après création rental

| Ligne IDE | Variable | Colonne | Expression | Description |
|-----------|----------|---------|------------|-------------|
| ligne 7 | H | #_rental_days_requested | Expression 7 | Cumul jours location |
| ligne 8 | I | date_out | Expression 8 | Date de sortie |
| ligne 10 | K | date_in | Expression 9 | Date de retour |
| ligne 11 | L | time_out | Expression 10 | Heure sortie |
| ligne 12 | M | time_in | Expression 11 | Heure retour |

### Expressions de calcul

```
Tâche 196.8 Expression 7 = H + L           → Cumul quantités (H=jours actuels, L=qté parent)
Tâche 196.8 Expression 8 = (IF(N=0,BQ,N)*L)+I  → Calcul prix
Tâche 196.8 Expression 9 = Date()          → DATE DU JOUR ← ATTENTION !
Tâche 196.8 Expression 10 = Time()         → HEURE DU JOUR
```

**Variables:**
- H = rental_days (index 7)
- I = date_out (index 8)
- K = date_in (index 10)
- L = quantité parent (index 11)
- M = time_in (index 12)
- N = prix unitaire parent (index 13)
- BQ = prix défaut parent (index 68)

---

## 4. ANALYSE DÉTAILLÉE - PVE IDE 192 "Select Product"

**Dossier**: Mobile POS (dossier 15)
**Source**: Programme 186

### Sous-tâches avec modifications récentes

| Tâche | Nom | Dernière Modification |
|-------|-----|----------------------|
| **192.1** | Select Product | 14/11/2025 12:17:46 |
| **192.3** | Product | 14/11/2025 12:17:46 |
| **192.2** | Sub Category | 07/11/2025 11:31:34 |
| **192.12** | Mise à jour des produits sémin | 04/11/2025 16:54:02 |

### Accès WRITE à Table n°400

PVE IDE 192 a accès WRITE dans plusieurs sous-tâches mais délègue la création effective à PVE IDE 196 via le flux package.

---

## 5. PVE IDE 195 "Package Rental date" - Calendrier

**Dossier**: Mobile POS (dossier 15)
**Source**: Programme 189
**Dernière modification**: 16/05/2019 ← NON MODIFIÉ RÉCEMMENT

### Sous-tâches

| Tâche | Nom | Dernière Modification |
|-------|-----|----------------------|
| 195.1 | Package Rental date | 16/05/2019 17:18:55 |
| 195.2 | calendar (rental) | 20/07/2017 15:10:57 |

**Rôle**: Interface calendrier pour sélection des dates par l'utilisateur.
**Note**: Ce programme n'a PAS été modifié depuis 2019.

---

## 6. Flux de Création des Locations

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUX CRÉATION LOCATION                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PVE IDE 192 - Select Product                                       │
│      │ (Mobile POS, modifié 14/11/2025)                             │
│      │                                                               │
│      ├──> Tâche 192.3 "Product"                                     │
│      │        (modifié 14/11/2025)                                  │
│      │        → Sélection du produit location                       │
│      │                                                               │
│      └──> PVE IDE 195 - Package Rental date                         │
│               │ (NON modifié - 16/05/2019)                          │
│               │                                                      │
│               └──> Tâche 195.2 "calendar (rental)"                  │
│                        → Interface calendrier dates                 │
│                        → Retourne: p.date start, p.date end        │
│                                                                      │
│  ════════════════════════════════════════════════════════════════   │
│                                                                      │
│  PVE IDE 196 - Package=> account                                    │
│      │ (Mobile POS, modifié 30/10/2025)                             │
│      │                                                               │
│      └──> Tâche 196.8 "SALE package_Add_Qté"                        │
│               UPDATE Table n°400 (pv_rentals_dat)                   │
│               Variable H:  rental_days ← Expression 7 (cumul)       │
│               Variable I:  date_out    ← Expression 8 (calcul)      │
│               Variable K:  date_in     ← Expression 9 = Date() !!!  │
│               Variable L:  time_out    ← Expression 10 = Time()     │
│               Variable M:  time_in     ← Expression 11              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Programmes à IGNORER

### PVE IDE 213 "Vérification Skier Profile" - FAUX POSITIF

**Modifié**: 22/04/2025
**Dossier**: Zoom (dossier 22)
**Source**: Programme 207

**IMPORTANT**: Ce programme NE modifie PAS les dates de location.
- Accède à la table GM profile (n°382), pas à Table n°400
- Valide uniquement le profil skieur (taille, poids, pointure, type ski, etc.)
- Vérifie si le profil est complet avant la location

---

## 8. Points d'Investigation Prioritaires

### À vérifier EN PREMIER:

| Priorité | Programme | Tâche | Quoi regarder |
|----------|-----------|-------|---------------|
| 1 | PVE IDE 196 | **Tâche 196.8** | Update Variable K (date_in) avec Date() |
| 2 | PVE IDE 196 | **Tâche 196.8** | Update Variable I (date_out) |
| 3 | PVE IDE 196 | **Tâche 196.8** | Expression 9 = Date() ← SUSPECT |
| 4 | PVE IDE 196 | **Tâche 196.13** | Sous-tâche "package" (26/11/2025) |
| 5 | PVE IDE 192 | **Tâche 192.12** | "Mise à jour produits sémin" (04/11/2025) |

### Questions à se poser:

1. **L'expression `Date()` dans Expression 9** est-elle le problème?
   - Elle assigne la DATE DU JOUR à date_in au lieu de la date sélectionnée dans le calendrier

2. **Les modifications du 26/11/2025** (Tâches 196.1 et 196.13) ont-elles changé la logique?
   - Comparer avec une version antérieure si disponible

3. **Le flux entre PVE IDE 192 et PVE IDE 196** transmet-il correctement les dates?
   - Vérifier les paramètres passés

---

## 9. Résumé Exécutif

| Point | Détail |
|-------|--------|
| **Point chaud** | Tâche 196.8 Expression 9: `Date()` assignée à variable K (date_in) |
| **Dernière modif critique** | 26/11/2025 sur Tâches 196.1 et 196.13 |
| **Calendrier (PVE IDE 195)** | NON modifié depuis 2019 - probablement pas le problème |
| **Faux positif écarté** | PVE IDE 213 (profil skieur) ne touche pas aux dates |
| **Dossier commun** | Tous les programmes critiques sont dans "Mobile POS" |

---

## Références Magic IDE

### Programmes

| IDE | Projet | Nom Public | Description |
|-----|--------|------------|-------------|
| PVE IDE 196 | PVE | Package=> account | Création package location |
| PVE IDE 192 | PVE | Select Product | Sélection produit |
| PVE IDE 195 | PVE | Package Rental date | Calendrier dates |
| PVE IDE 181 | PVE | Saisie Prepaid | Saisie prépayé |
| PVE IDE 171 | PVE | GetNbrProdBookerWithoutBooking | Interface Booker |
| PVE IDE 213 | PVE | Vérification Skier Profile | Profil skieur |

### Variables Tâche 196.8

| Variable | Index | Description |
|----------|-------|-------------|
| H | 7 | rental_days_requested |
| I | 8 | date_out |
| K | 10 | date_in |
| L | 11 | time_out |
| M | 12 | time_in |
| N | 13 | prix unitaire (parent) |
| BQ | 68 | prix défaut (parent) |

---

*Rapport généré le 2026-01-04 pour analyse ticket support dates de location ski.*
*Mis à jour 2026-01-08 - Format IDE Magic*
