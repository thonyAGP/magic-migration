# ADH IDE 196 - Choix Articles Gift Pass

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_195.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 196 |
| **Fichier XML** | Prg_195.xml |
| **Description** | Choix Articles Gift Pass |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 2 |
| **Module** | ADH |
| **Dossier IDE** | Solde |

> **Note**: Ce programme est Prg_195.xml. L'ID XML (195) peut differer de la position IDE (196).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-196.yaml`
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
| #979 | `Table_979` | Unknown | **W** | 2x |

---

## 3. PARAMETRES D'ENTREE (2)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.GiftPassTotal | NUMERIC | - |
| v.Solde Gift Pass | NUMERIC | - |

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

## 5. EXPRESSIONS (10 total, 2 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `P.Valider` |
| 2 | `{0,6}` | `{0,6}` |
| 3 | `{0,7} > {0,8}` | `{0,7} > {0,8}` |
| 4 | `'TRUE'LOG` | `'TRUE'LOG` |
| 5 | `{0,6}>{0,5}` | `{0,6}>Btn.Cancel` |
| 6 | `'Montant : ' & Str({0,5},'12.3') & ' Gift Pass : ' & Str(...` | `'Montant : ' & Str(Btn.Cancel,'12.3') & ' Gift Pass : ' &...` |
| 7 | `{0,6} > {0,8}` | `{0,6} > {0,8}` |
| 8 | `{0,7}>{0,1}` | `{0,7}>P.Valider` |
| 1 | `{0,6}+{0,5}` | `{0,6}+Btn.Cancel` |
| 2 | `{0,6}` | `{0,6}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 ( W / 0 R) |
| Parametres | 2 |
| Variables locales | 6 |
| Expressions | 10 |
| Expressions 100% decodees | 2 (20%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

