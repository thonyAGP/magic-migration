# ADH IDE 133 - Mise a jour comptage caisse WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_133.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 133 |
| **Fichier XML** | Prg_133.xml |
| **Description** | Mise a jour comptage caisse WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 6 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_133.xml. L'ID XML (133) peut differer de la position IDE (133).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-133.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (6 tables - 3 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #220 | `caisse_compcais_devise_histo` | comptage_caisse_devise_histo | **W** | 2x |
| #222 | `caisse_compcais_histo2` | comptage_caisse_histo | **W** | 2x |
| #223 | `caisse_compcais_montant_histo` | comptage_caisse_montant_histo | **W** | 1x |
| #491 | `%club_user%_caisse_solde_par_mop` | soldes_par_mop | R | 1x |
| #492 | `caisse_tabrecap` | edition_tableau_recap | R | 1x |
| #493 | `%club_user%_caisse_ticket` | edition_ticket | R | 1x |

---

## 3. PARAMETRES D'ENTREE (6)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param Quand | ALPHA | - |
| P2 | Param Chrono histo | NUMERIC | - |
| P3 | Param Date Validation | DATE | - |
| P4 | Param Time Validation | TIME | - |
| P5 | Param chrono session | NUMERIC | - |
| P6 | Param Total caisse | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|

### 4.2 Variables globales (VG)

| Variable | Role |
|----------|------|
| VG.LOGIN | - |
| VG.USER | - |
| VG.Retour Chariot | - |
| VG.DROIT ACCES IT ? | - |
| VG.DROIT ACCES CAISSE ? | - |
| VG.BRAZIL DATACATCHING? | - |
| VG.USE MDR | - |
| VG.VRL ACTIF ? | - |
| VG.ECI ACTIF ? | - |
| VG.COMPTE CASH ACTIF ? | - |
| VG.IND SEJ PAYE ACTIF ? | - |
| VG.CODE LANGUE USER | - |
| VG.EFFECTIF ACTIF ? | - |
| VG.TAXE SEJOUR ACTIF ? | - |
| VG.N° version | - |

> Total: 130 variables mappees

---

## 5. EXPRESSIONS (39 total, 15 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,1}` | `{1,1}` |
| 3 | `{1,2}` | `{1,2}` |
| 4 | `{0,1}` | `Param Chrono histo` |
| 5 | `{0,2}` | `Param Date Validation` |
| 6 | `{0,3}` | `Param Time Validation` |
| 7 | `{0,4}` | `Param chrono session` |
| 8 | `{0,5}` | `Param Total caisse` |
| 9 | `{0,6}` | `{0,6}` |
| 10 | `{1,3}` | `{1,3}` |
| 11 | `{1,4}` | `{1,4}` |
| 12 | `{1,5}` | `{1,5}` |
| 13 | `{0,7}` | `{0,7}` |
| 14 | `{0,8}` | `{0,8}` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{2,1}` | `{2,1}` |
| 3 | `{2,2}` | `{2,2}` |
| 4 | `{0,1}` | `Param Chrono histo` |
| 5 | `{0,2}` | `Param Date Validation` |
| 6 | `{0,3}` | `Param Time Validation` |
| 7 | `{0,4}` | `Param chrono session` |
| 8 | `{2,5}` | `{2,5}` |
| 1 | `{0,4}<>0` | `Param chrono session<>0` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{3,2}` | `{3,2}` |
| 3 | `{1,1}` | `{1,1}` |
| 4 | `{1,2}` | `{1,2}` |
| 5 | `{1,3}` | `{1,3}` |
| 6 | `{3,1}` | `{3,1}` |
| 7 | `{1,4}` | `{1,4}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 6 (3 W / 3 R) |
| Parametres | 6 |
| Variables locales | 6 |
| Expressions | 39 |
| Expressions 100% decodees | 15 (38%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

