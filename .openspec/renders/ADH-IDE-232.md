# ADH IDE 232 - Verif session caisse ouverte

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_328.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 232 |
| **Fichier XML** | Prg_328.xml |
| **Description** | Verif session caisse ouverte |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_328.xml. L'ID XML (328) peut differer de la position IDE (232).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-232.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (1 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #246 | `caisse_session` | histo_sessions_caisse | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v. Message session ouvertes | UNICODE | - |
| v. Liste session ouvertes | UNICODE | - |

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

> Total: 122 variables mappees

---

## 5. EXPRESSIONS (7 total, 3 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `MlsTrans('Vous avez encore @1@ sessions de caisse ouverte...` | `MlsTrans('Vous avez encore @1@ sessions de caisse ouverte...` |
| 2 | `Trim({0,2})<>''` | `Trim({0,2})<>''` |
| 3 | `StrBuild(Trim({0,1}),Str(StrTokenCnt({0,2},'-')-1,'3'))&{...` | `StrBuild(Trim(v. Liste session ouvertes),Str(StrTokenCnt(...` |
| 1 | `'00/00/0000'DATE` | `'00/00/0000'DATE` |
| 2 | `RTrim({1,2})&ASCIIChr(10)&' - '&Trim({0,2})` | `RTrim({1,2})&ASCIIChr(10)&' - '&Trim({0,2})` |
| 3 | `Trim({1,2})=''` | `Trim({1,2})=''` |
| 4 | `ASCIIChr(10)&MlsTrans('Les utilisateurs concernés sont :')` | `ASCIIChr(10)&MlsTrans('Les utilisateurs concernés sont :')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 (0 W /  R) |
| Parametres | 0 |
| Variables locales | 2 |
| Expressions | 7 |
| Expressions 100% decodees | 3 (43%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

