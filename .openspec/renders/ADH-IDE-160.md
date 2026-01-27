# ADH IDE 160 - Liste des GM

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_159.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 160 |
| **Fichier XML** | Prg_159.xml |
| **Description** | Liste des GM |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 2 |
| **Module** | ADH |
| **Dossier IDE** | Identification |

> **Note**: Ce programme est Prg_159.xml. L'ID XML (159) peut differer de la position IDE (160).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-160.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (5 tables - 2 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #312 | `ezcard` | ez_card | **W** | 2x |
| #612 | `%club_user%tmp_prex_dat` | tempo_present_excel | **W** | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #47 | `cafil025_dat` | compte_gm________cgm | R | 1x |
| #844 | `%club_user%_stat_vendeur` | stat_vendeur | R | 1x |

---

## 3. PARAMETRES D'ENTREE (2)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.num cmp | UNICODE | - |
| v.retour carte deja attribuee | LOGICAL | - |
| v.variable change en cours | LOGICAL | - |
| v.last good row | NUMERIC | - |

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

## 5. EXPRESSIONS (37 total, 12 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,9}<>'---' AND Trim({0,6})<>''` | `{0,9}<>'---' AND Trim(retour confirmation)<>''` |
| 2 | `{0,9}='---' OR Trim({0,6})=''` | `{0,9}='---' OR Trim(retour confirmation)=''` |
| 3 | `{0,1}` | `v.retour carte deja attribuee` |
| 4 | `Val(MID({0,8},3,10),'10')` | `Val(MID({0,8},3,10),'10')` |
| 5 | `Val(Left({0,8},2),'2')` | `Val(Left({0,8},2),'2')` |
| 6 | `{0,29}` | `{0,29}` |
| 7 | `CallProg('{160,-1}'PROG,{0,25},{0,29},{0,30})` | `CallProg('{160,-1}'PROG,{0,25},{0,29},{0,30})` |
| 8 | `{0,34}` | `{0,34}` |
| 9 | `{0,33}='O'` | `{0,33}='O'` |
| 10 | `Trim({0,34})<>''` | `Trim({0,34})<>''` |
| 11 | `{0,35} AND ({0,37}*1000+{0,38}<>{0,29}*1000+{0,30} OR {0,...` | `{0,35} AND ({0,37}*1000+{0,38}<>{0,29}*1000+{0,30} OR {0,...` |
| 12 | `{0,46}` | `{0,46}` |
| 13 | `Trim({0,46})<>'' AND Trim({0,46})<>Trim({0,34})` | `Trim({0,46})<>'' AND Trim({0,46})<>Trim({0,34})` |
| 14 | `1` | `1` |
| 15 | `Trim({0,46})='' AND Trim({0,34})<>''` | `Trim({0,46})='' AND Trim({0,34})<>''` |
| 16 | `{0,47}=1` | `{0,47}=1` |
| 17 | `{0,47}<>1` | `{0,47}<>1` |
| 18 | `{32768,11}` | `VG.CODE LANGUE USER` |
| 19 | `{0,21}` | `{0,21}` |
| 20 | `Str({0,47},'#')` | `Str({0,47},'#')` |
| 21 | `'TRUE'LOG` | `'TRUE'LOG` |
| 22 | `'FALSE'LOG` | `'FALSE'LOG` |
| 23 | `NOT({0,43})` | `NOT({0,43})` |
| 24 | `IF(Trim({0,46})<>'' AND Trim({0,46})<>Trim({0,34}) AND {0...` | `IF(Trim({0,46})<>'' AND Trim({0,46})<>Trim({0,34}) AND {0...` |
| 25 | `CtrlGoto('card_code',IF(CurRow(0)>{0,44},CurRow(0)+1,CurR...` | `CtrlGoto('card_code',IF(CurRow(0)>{0,44},CurRow(0)+1,CurR...` |
| 26 | `CurRow(0)` | `CurRow(0)` |
| 1 | `{1,25}` | `{1,25}` |
| 2 | `{1,29}` | `{1,29}` |
| 3 | `{1,30}` | `{1,30}` |
| 4 | `{1,34}` | `{1,34}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 5 (2 W / 3 R) |
| Parametres | 2 |
| Variables locales | 7 |
| Expressions | 37 |
| Expressions 100% decodees | 12 (32%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

