# ADH IDE 125 - Remise en caisse

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_125.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 125 |
| **Fichier XML** | Prg_125.xml |
| **Description** | Remise en caisse |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 21 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_125.xml. L'ID XML (125) peut differer de la position IDE (125).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-125.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (9 tables - 5 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #196 | `caisse_article` | gestion_article_session | **W** | 2x |
| #232 | `caisse_devise` | gestion_devise_session | **W** | 7x |
| #244 | `caisse_saisie_appro_dev` | saisie_approvisionnement | **W** | 4x |
| #501 | `%club_user%_email_reprise` | email_reprise | **W** | 1x |
| #505 | `%club_user%_pv_cafil18_dat` | pv_comptable | **W** | 9x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 2x |
| #140 | `cafil118_dat` | moyen_paiement___mop | R | 2x |

---

## 3. PARAMETRES D'ENTREE (21)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param masque montant | ALPHA | - |
| P4 | Param quand | ALPHA | - |
| P5 | Param Montant compte | NUMERIC | - |
| P6 | Param Montant compte monnaie | NUMERIC | - |
| P7 | Param Montant compte produits | NUMERIC | - |
| P8 | Param Montant compte cartes | NUMERIC | - |
| P9 | Param Montant compte cheques | NUMERIC | - |
| P10 | Param Montant compte od | NUMERIC | - |
| P11 | Param Nbre devise comptees | NUMERIC | - |
| P12 | Param Montant versement | NUMERIC | - |
| P13 | Param Mt versement monnaie | NUMERIC | - |
| P14 | Param Mt versement produits | NUMERIC | - |
| P15 | Param Mt versement cartes | NUMERIC | - |
| P16 | Param Mt versement cheque | NUMERIC | - |
| P17 | Param Mt versement od | NUMERIC | - |
| P18 | Param Mt versement Nb devises | NUMERIC | - |
| P19 | Param UNI/BI | ALPHA | - |
| P20 | Param coffre 2 est ouvert | LOGICAL | - |
| P21 | Fin | LOGICAL | - |

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

> Total: 162 variables mappees

---

## 5. EXPRESSIONS (211 total, 122 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,22}` | `{0,22}` |
| 2 | `{0,4}<>'P'` | `Param Montant compte<>'P'` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,4}` | `{1,4}` |
| 3 | `0` | `0` |
| 4 | `{0,5}='V'` | `Param Montant compte monnaie='V'` |
| 5 | `0` | `0` |
| 1 | `{32768,1}` | `VG.USER` |
| 1 | `{1,19}<>'B'` | `{1,19}<>'B'` |
| 2 | `{1,19}='B'` | `{1,19}='B'` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `{0,3}` | `Param quand` |
| 4 | `{0,2}` | `Param masque montant` |
| 5 | `{0,4}` | `Param Montant compte` |
| 6 | `'Saisie'` | `'Saisie'` |
| 7 | `{0,9}` | `Param Montant compte od` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `{0,3}` | `Param quand` |
| 4 | `{0,2}` | `Param masque montant` |
| 5 | `{0,4}` | `Param Montant compte` |
| 6 | `'Saisie'` | `'Saisie'` |
| 7 | `{0,9}` | `Param Montant compte od` |
| 1 | `{1,2}` | `{1,2}` |
| 2 | `147` | `147` |
| 3 | `Trim ({0,8})` | `Trim (Param Montant compte cheques)` |
| 4 | `{32768,1}` | `VG.USER` |
| 5 | `Date ()` | `Date ()` |
| 6 | `MID (Trim ({1,3}),2,15)` | `MID (Trim ({1,3}),2,15)` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 9 (5 W / 4 R) |
| Parametres | 21 |
| Variables locales | 22 |
| Expressions | 211 |
| Expressions 100% decodees | 122 (58%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

