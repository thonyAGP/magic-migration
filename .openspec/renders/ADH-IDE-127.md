# ADH IDE 127 - Calcul solde ouverture WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_127.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 127 |
| **Fichier XML** | Prg_127.xml |
| **Description** | Calcul solde ouverture WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 10 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_127.xml. L'ID XML (127) peut differer de la position IDE (127).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-127.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (4 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #232 | `caisse_devise` | gestion_devise_session | R | 2x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 1x |

---

## 3. PARAMETRES D'ENTREE (10)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param solde ouverture | NUMERIC | - |
| P4 | Param solde ouverture monnaie | NUMERIC | - |
| P5 | Param solde ouverture produits | NUMERIC | - |
| P6 | Param solde ouverture cartes | NUMERIC | - |
| P7 | Param solde ouverture cheques | NUMERIC | - |
| P8 | Param solde ouverture od | NUMERIC | - |
| P9 | Param nbre devise | NUMERIC | - |
| P10 | Param UNI/BI | ALPHA | - |

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

> Total: 138 variables mappees

---

## 5. EXPRESSIONS (36 total, 21 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'L'` | `'L'` |
| 3 | `{0,15}` | `{0,15}` |
| 4 | `{0,16}` | `{0,16}` |
| 5 | `{0,17}` | `{0,17}` |
| 6 | `{0,18}` | `{0,18}` |
| 7 | `{0,19}` | `{0,19}` |
| 8 | `{0,20}` | `{0,20}` |
| 9 | `{0,21}` | `{0,21}` |
| 1 | `{1,10}<>'B'` | `{1,10}<>'B'` |
| 2 | `{1,10}='B'` | `{1,10}='B'` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `{0,2}` | `Param solde ouverture` |
| 4 | `{0,4}` | `Param solde ouverture produits` |
| 5 | `'O'` | `'O'` |
| 6 | `'I'` | `'I'` |
| 7 | `'L'` | `'L'` |
| 8 | `'A'` | `'A'` |
| 9 | `{0,2}<>{2,2}` | `Param solde ouverture<>{2,2}` |
| 10 | `'O'` | `'O'` |
| 11 | `{0,10}+{0,16}` | `{0,10}+{0,16}` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `'O'` | `'O'` |
| 3 | `0` | `0` |
| 4 | `{32768,1}` | `VG.USER` |
| 5 | `{0,2}` | `Param solde ouverture` |
| 6 | `{0,4}` | `Param solde ouverture produits` |
| 7 | `'O'` | `'O'` |
| 8 | `'I'` | `'I'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (0 W / 4 R) |
| Parametres | 10 |
| Variables locales | 10 |
| Expressions | 36 |
| Expressions 100% decodees | 21 (58%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

