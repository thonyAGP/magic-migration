# ADH IDE 251 - Creation pied Ticket

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_247.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 251 |
| **Fichier XML** | Prg_247.xml |
| **Description** | Creation pied Ticket |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 7 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_247.xml. L'ID XML (247) peut differer de la position IDE (251).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-251.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (1 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #867 | `log_maj_tpe` | log_maj_tpe | **W** | 1x |

---

## 3. PARAMETRES D'ENTREE (7)

| # | Nom | Type | Description |
|---|-----|------|-------------|

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

> Total: 132 variables mappees

---

## 5. EXPRESSIONS (13 total, 7 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Val(Fill ('9',10),'10')` | `Val(Fill ('9',10),'10')` |
| 2 | `{0,4}` | `P.Montant Ht` |
| 3 | `{0,14}+{0,5}` | `{0,14}+P.Montant Tva` |
| 4 | `{0,15}+{0,6}` | `{0,15}+P.Montant Ttc` |
| 5 | `{0,16}+{0,7}` | `{0,16}+{0,7}` |
| 6 | `999` | `999` |
| 7 | `{0,23}+{0,5}` | `{0,23}+P.Montant Tva` |
| 8 | `{0,24}+{0,6}` | `{0,24}+P.Montant Ttc` |
| 9 | `{0,25}+{0,7}` | `{0,25}+{0,7}` |
| 10 | `'C'` | `'C'` |
| 11 | `'TICK'` | `'TICK'` |
| 12 | `{0,2}` | `P.filiation` |
| 13 | `0` | `0` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 ( W / 0 R) |
| Parametres | 7 |
| Variables locales | 7 |
| Expressions | 13 |
| Expressions 100% decodees | 7 (54%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

