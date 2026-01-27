# ADH IDE 75 - Creation Pied Facture

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_75.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 75 |
| **Fichier XML** | Prg_75.xml |
| **Description** | Creation Pied Facture |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | Extrait de Compte |

> **Note**: Ce programme est Prg_75.xml. L'ID XML (75) peut differer de la position IDE (75).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-75.yaml`
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

## 3. PARAMETRES D'ENTREE (5)

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

> Total: 128 variables mappees

---

## 5. EXPRESSIONS (12 total, 6 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Val(Fill('9',10),'10')` | `Val(Fill('9',10),'10')` |
| 2 | `{0,4}` | `P.Montant Ttc` |
| 3 | `999` | `999` |
| 4 | `{0,12}+({0,5}/(1+{0,4}/100))` | `{0,12}+({0,5}/(1+P.Montant Ttc/100))` |
| 5 | `{0,21}+({0,5}/(1+{0,4}/100))` | `{0,21}+({0,5}/(1+P.Montant Ttc/100))` |
| 6 | `{0,13}+Round(({0,5}/(1+{0,4}/100)*{0,4}/100),12,2)` | `{0,13}+Round(({0,5}/(1+P.Montant Ttc/100)*P.Montant Ttc/1...` |
| 7 | `{0,22}+Round(({0,5}/(1+{0,4}/100)*{0,4}/100),12,2)` | `{0,22}+Round(({0,5}/(1+P.Montant Ttc/100)*P.Montant Ttc/1...` |
| 8 | `{0,14}+{0,5}` | `{0,14}+{0,5}` |
| 9 | `{0,23}+{0,5}` | `{0,23}+{0,5}` |
| 10 | `{0,1}` | `P.Compte Gm` |
| 11 | `{0,2}` | `P.Filiation` |
| 12 | `{0,3}` | `P.Taux Tva` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 ( W / 0 R) |
| Parametres | 5 |
| Variables locales | 5 |
| Expressions | 12 |
| Expressions 100% decodees | 6 (50%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

