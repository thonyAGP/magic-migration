# ADH IDE 208 - Print Reçu code autocom

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_207.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 208 |
| **Fichier XML** | Prg_207.xml |
| **Description** | Print Reçu code autocom |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 9 |
| **Module** | ADH |
| **Dossier IDE** | Telephone |

> **Note**: Ce programme est Prg_207.xml. L'ID XML (207) peut differer de la position IDE (208).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-208.yaml`
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
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 7x |
| #80 | `cafil058_dat` | codes_autocom____aut | R | 7x |

---

## 3. PARAMETRES D'ENTREE (9)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code adherent | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 nom village | ALPHA | - |
| P5 | P0 longueur code | NUMERIC | - |
| P6 | P0 code autocom | NUMERIC | - |
| P7 | P0 n° ligne | NUMERIC | - |
| P8 | P0 salle seminaire | ALPHA | - |
| P9 | P0 telephone direct | ALPHA | - |

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

> Total: 136 variables mappees

---

## 5. EXPRESSIONS (247 total, 157 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 2 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 3 | `GetParam ('CURRENTPRINTERNUM')=6` | `GetParam ('CURRENTPRINTERNUM')=6` |
| 4 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 5 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 6 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `Counter (0)>=GetParam ('NUMBERCOPIES')` | `Counter (0)>=GetParam ('NUMBERCOPIES')` |
| 2 | `SetParam ('CURRENTPAGENUMBER',0)` | `SetParam ('CURRENTPAGENUMBER',0)` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `MlsTrans ('CODE TELEPHONE')` | `MlsTrans ('CODE TELEPHONE')` |
| 3 | `{2,1}` | `{2,1}` |
| 4 | `{2,2}` | `{2,2}` |
| 5 | `{2,3}` | `{2,3}` |
| 6 | `{2,6}` | `{2,6}` |
| 7 | `{0,2}` | `P0 filiation` |
| 8 | `{0,3}` | `P0 nom village` |
| 9 | `IF ({2,5}=4,'####P0',IF ({2,5}=5,'#####P0',IF ({2,5}=6,'#...` | `IF ({2,5}=4,'####P0',IF ({2,5}=5,'#####P0',IF ({2,5}=6,'#...` |
| 10 | `IF ({2,7}<>0,'N° de ligne ','')` | `IF ({2,7}<>0,'N° de ligne ','')` |
| 11 | `IF ({2,7}<>0,{2,7},0)` | `IF ({2,7}<>0,{2,7},0)` |
| 12 | `IF ({2,7}<>0,'6P0','6Z')` | `IF ({2,7}<>0,'6P0','6Z')` |
| 13 | `IF ({2,8}<>'','Salle       :','')` | `IF ({2,8}<>'','Salle       :','')` |
| 14 | `IF ({2,8}<>'',{2,8},'')` | `IF ({2,8}<>'',{2,8},'')` |
| 15 | `IF ({2,9}<>'','Tel. direct :','')` | `IF ({2,9}<>'','Tel. direct :','')` |
| 16 | `IF ({2,9}<>'',{2,9},'')` | `IF ({2,9}<>'',{2,9},'')` |
| 17 | `GetParam ('VI_CLUB')` | `GetParam ('VI_CLUB')` |
| 18 | `GetParam ('VI_NAME')` | `GetParam ('VI_NAME')` |
| 19 | `GetParam ('VI_ADR1')` | `GetParam ('VI_ADR1')` |
| 20 | `GetParam ('VI_ADR2')` | `GetParam ('VI_ADR2')` |
| 21 | `GetParam ('VI_ZIPC')` | `GetParam ('VI_ZIPC')` |
| 22 | `GetParam ('VI_PHON')` | `GetParam ('VI_PHON')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 (0 W / 2 R) |
| Parametres | 9 |
| Variables locales | 9 |
| Expressions | 247 |
| Expressions 100% decodees | 157 (64%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

