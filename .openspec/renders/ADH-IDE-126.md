# ADH IDE 126 - Calcul solde initial WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_126.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 126 |
| **Fichier XML** | Prg_126.xml |
| **Description** | Calcul solde initial WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 12 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_126.xml. L'ID XML (126) peut differer de la position IDE (126).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-126.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (7 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 2x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #222 | `caisse_compcais_histo2` | comptage_caisse_histo | R | 1x |
| #247 | `caisse_session_article` | histo_sessions_caisse_article | R | 1x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 2x |
| #250 | `caisse_session_devise` | histo_sessions_caisse_devise | R | 2x |

---

## 3. PARAMETRES D'ENTREE (12)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P.i. societe | ALPHA | - |
| P2 | P.i. devise locale | ALPHA | - |
| P3 | P.i. session | NUMERIC | - |
| P4 | P.o. solde initial | NUMERIC | - |
| P5 | P.o. solde initial monnaie | NUMERIC | - |
| P6 | P.o. solde initial produits | NUMERIC | - |
| P7 | P.o. solde initial cartes | NUMERIC | - |
| P8 | P.o. solde initial cheques | NUMERIC | - |
| P9 | P.o. solde initial od | NUMERIC | - |
| P10 | P.o. nbre devise initial | NUMERIC | - |
| P11 | P.i. UNI/BI | ALPHA | - |

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

> Total: 142 variables mappees

---

## 5. EXPRESSIONS (58 total, 35 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'F'` | `'F'` |
| 3 | `'F'` | `'F'` |
| 4 | `{0,18}` | `{0,18}` |
| 5 | `{0,19}` | `{0,19}` |
| 6 | `NOT({0,12})` | `NOT({0,12})` |
| 7 | `{0,20}` | `{0,20}` |
| 8 | `{0,12}` | `{0,12}` |
| 9 | `{0,21}` | `{0,21}` |
| 10 | `{0,22}` | `{0,22}` |
| 11 | `{0,23}` | `{0,23}` |
| 12 | `{0,24}` | `{0,24}` |
| 1 | `{1,11}<>'B'` | `{1,11}<>'B'` |
| 2 | `{1,11}='B'` | `{1,11}='B'` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `{2,3}-1` | `{2,3}-1` |
| 4 | `'F'` | `'F'` |
| 5 | `'F'` | `'F'` |
| 6 | `{0,2}` | `P.i. session` |
| 7 | `{0,4}` | `P.o. solde initial monnaie` |
| 8 | `'O'` | `'O'` |
| 9 | `'I'` | `'I'` |
| 10 | `'K'` | `'K'` |
| 11 | `{0,13}<>0 AND {0,5}` | `{0,13}<>0 AND P.o. solde initial produits` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `'O'` | `'O'` |
| 3 | `0` | `0` |
| 4 | `{32768,1}` | `VG.USER` |
| 5 | `{2,3}-1` | `{2,3}-1` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 7 (0 W / 7 R) |
| Parametres | 12 |
| Variables locales | 12 |
| Expressions | 58 |
| Expressions 100% decodees | 35 (60%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

