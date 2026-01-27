# ADH IDE 151 - Reimpression tickets fermeture

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_151.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 151 |
| **Fichier XML** | Prg_151.xml |
| **Description** | Reimpression tickets fermeture |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 21 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_151.xml. L'ID XML (151) peut differer de la position IDE (151).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-151.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (2 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #246 | `caisse_session` | histo_sessions_caisse | R | 1x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 1x |

---

## 3. PARAMETRES D'ENTREE (21)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 nbre decimales | NUMERIC | - |
| P3 | P0 nom village | ALPHA | - |
| P4 | P0 masque cumul | ALPHA | - |
| P5 | P0 devise locale | ALPHA | - |
| P6 | P0 uni/bi | ALPHA | - |
| P7 | P0 village tai | ALPHA | - |
| P8 | P0 date comptable | DATE | - |
| P9 | P0 session | NUMERIC | - |
| P10 | P1 quand | ALPHA | - |
| P11 | P1 montant appro monnaie | NUMERIC | - |
| P12 | P1 montant appro produit | NUMERIC | - |
| P13 | P1 montant remise monnaie | NUMERIC | - |
| P14 | P1 montant remise cartes | NUMERIC | - |
| P15 | P1 montant remise chèques | NUMERIC | - |
| P16 | P1 montant remise od | NUMERIC | - |
| P17 | P1 remise nbre devises | NUMERIC | - |
| P18 | P1 montant remise produits | NUMERIC | - |
| P19 | P2 montant appro monnaie final | NUMERIC | - |
| P20 | P2 montant remise monnaie final | NUMERIC | - |
| P21 | P2 montant ecart fermeture | NUMERIC | - |
| P22 | erreur | LOGICAL | - |

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

> Total: 166 variables mappees

---

## 5. EXPRESSIONS (38 total, 35 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'F'` | `'F'` |
| 2 | `'FALSE'LOG` | `'FALSE'LOG` |
| 3 | `'TRUE'LOG` | `'TRUE'LOG` |
| 4 | `{0,23}='00/00/0000'DATE` | `date comptable='00/00/0000'DATE` |
| 5 | `{0,24}<>'00/00/0000'DATE` | `{0,24}<>'00/00/0000'DATE` |
| 6 | `NOT ({0,22})` | `NOT (date fin session)` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{0,2}` | `P0 nom village` |
| 3 | `{0,3}` | `P0 masque cumul` |
| 4 | `{0,4}` | `P0 devise locale` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,9}` | `{1,9}` |
| 3 | `'A'` | `'A'` |
| 4 | `'F'` | `'F'` |
| 5 | `'E'` | `'E'` |
| 6 | `'F'` | `'F'` |
| 7 | `'V'` | `'V'` |
| 8 | `'F'` | `'F'` |
| 9 | `'D'` | `'D'` |
| 10 | `'F'` | `'F'` |
| 11 | `{0,6}` | `P0 village tai` |
| 12 | `{0,12}` | `P1 montant remise monnaie` |
| 13 | `{0,18}` | `P2 montant appro monnaie final` |
| 14 | `{0,19}` | `P2 montant remise monnaie final` |
| 15 | `{0,20}` | `P2 montant ecart fermeture` |
| 16 | `{0,21}` | `erreur` |
| 17 | `{0,22}` | `date fin session` |
| 18 | `{0,28}` | `{0,28}` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `Date ()` | `Date ()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 (0 W / 2 R) |
| Parametres | 21 |
| Variables locales | 24 |
| Expressions | 38 |
| Expressions 100% decodees | 35 (92%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

