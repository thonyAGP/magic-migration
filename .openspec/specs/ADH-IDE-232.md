# ADH IDE 232 - Verif session caisse ouverte

> **Version spec** : 2.0
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

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-117}` | v. Message session ouvertes | UNICODE | - |
| `{0,-116}` | v. Liste session ouvertes | UNICODE | - |

### 4.2 Variables globales (VG)

| Ref | Decode | Role |
|-----|--------|------|
| `{32768,0}` | VG.LOGIN | - |
| `{32768,1}` | VG.USER | - |
| `{32768,2}` | VG.Retour Chariot | - |
| `{32768,3}` | VG.DROIT ACCES IT ? | - |
| `{32768,4}` | VG.DROIT ACCES CAISSE ? | - |
| `{32768,5}` | VG.BRAZIL DATACATCHING? | - |
| `{32768,6}` | VG.USE MDR | - |
| `{32768,7}` | VG.VRL ACTIF ? | - |
| `{32768,8}` | VG.ECI ACTIF ? | - |
| `{32768,9}` | VG.COMPTE CASH ACTIF ? | - |
| `{32768,10}` | VG.IND SEJ PAYE ACTIF ? | - |
| `{32768,11}` | VG.CODE LANGUE USER | - |
| `{32768,12}` | VG.EFFECTIF ACTIF ? | - |
| `{32768,13}` | VG.TAXE SEJOUR ACTIF ? | - |
| `{32768,14}` | VG.N° version | - |

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
