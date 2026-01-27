# ADH IDE 37 - Menu changement compte

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_37.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 37 |
| **Fichier XML** | Prg_37.xml |
| **Description** | Menu changement compte |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 9 |
| **Module** | ADH |
| **Dossier IDE** | Changement Compte |

> **Note**: Ce programme est Prg_37.xml. L'ID XML (37) peut differer de la position IDE (37).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-37.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (0 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|

---

## 3. PARAMETRES D'ENTREE (9)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code GM | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | > masque montant | ALPHA | - |
| P5 | > garantie | ALPHA | - |
| P6 | > solde | NUMERIC | - |
| P7 | > date limite solde | DATE | - |
| P8 | > nom village | ALPHA | - |
| P9 | > Uni/Bilateral | ALPHA | - |
| P10 | W0 choix action | ALPHA | - |
| P11 | PROGRAM | NUMERIC | - |
| P12 | V. titre | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 choix action | ALPHA | - |
| V. titre | ALPHA | - |

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

## 5. EXPRESSIONS (10 total, 9 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Trim ({0,12})` | `Trim ({0,12})` |
| 2 | `26` | `26` |
| 3 | `Date ()` | `Date ()` |
| 4 | `{32768,2}` | `VG.Retour Chariot` |
| 5 | `{0,3}<>0 AND {0,10}='1'` | `> masque montant<>0 AND PROGRAM='1'` |
| 6 | `''` | `''` |
| 9 | `IF(Trim({32768,115})<>'',Trim({32768,115})&'\|','')&IF({0...` | `IF(Trim(VG.v.Service)<>'',Trim(VG.v.Service)&'\|','')&IF(...` |
| 7 | `{0,10}='1'` | `PROGRAM='1'` |
| 8 | `{0,10}='2'` | `PROGRAM='2'` |
| 10 | `{32768,111} AND {32768,112}<>0` | `VG. Interface Galaxy Grèce AND VG.Second Safe Control 1.0...` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 9 |
| Variables locales | 12 |
| Expressions | 10 |
| Expressions 100% decodees | 9 (90%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

