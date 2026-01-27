# ADH IDE 209 - Affectation code autocom

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_208.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 209 |
| **Fichier XML** | Prg_208.xml |
| **Description** | Affectation code autocom |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 12 |
| **Module** | ADH |
| **Dossier IDE** | Telephone |

> **Note**: Ce programme est Prg_208.xml. L'ID XML (208) peut differer de la position IDE (209).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-209.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (21 tables - 13 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #34 | `cafil012_dat` | hebergement______heb | **W** | 6x |
| #52 | `cafil030_dat` | serie_ligne______slg | **W** | 2x |
| #53 | `cafil031_dat` | ligne_telephone__lgn | **W** | 4x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 4x |
| #72 | `cafil050_dat` | generation_code_gen | **W** | 1x |
| #73 | `cafil051_dat` | serie_telephone__stl | **W** | 2x |
| #75 | `cafil053_dat` | commande_autocom_cot | **W** | 4x |
| #80 | `cafil058_dat` | codes_autocom____aut | **W** | 5x |
| #86 | `cafil064_dat` | serie_sda________ssd | **W** | 2x |
| #87 | `cafil065_dat` | sda_telephone____sda | **W** | 4x |
| #88 | `cafil066_dat` | historik_station | **W** | 1x |
| #136 | `cafil114_dat` | fichier_echanges | **W** | 8x |
| #151 | `cafil129_dat` | nb_code__poste | **W** | 7x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 4x |
| #104 | `cafil082_dat` | fichier_menage | R | 1x |
| #130 | `cafil108_dat` | fichier_langue | R | 1x |
| #131 | `cafil109_dat` | fichier_validation | R | 1x |
| #152 | `cafil130_dat` | parametres_pour_pabx | R | 2x |
| #169 | `cafil147_dat` | salle_seminaire__sse | R | 2x |
| #188 | `cafil216_dat` | correspondance_sda | R | 1x |
| #786 | `qualite_avant_reprise` | qualite_avant_reprise | R | 1x |

---

## 3. PARAMETRES D'ENTREE (12)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code GM | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 nom village | ALPHA | - |
| P5 | P0 nb code accepte | NUMERIC | - |
| P6 | P0 type triplet | ALPHA | - |
| P7 | P0 longueur code | NUMERIC | - |
| P8 | P0 Max Ligne/poste | NUMERIC | - |
| P9 | P0 Interface | ALPHA | - |
| P10 | P0 S.D.A | ALPHA | - |
| P11 | P0 account CIA Pack? | LOGICAL | - |
| P12 | P0 GPIN limit | NUMERIC | - |
| P13 | W0 code autocom | NUMERIC | - |
| P14 | W0 triplet | ALPHA | - |
| P15 | W0 n° ligne | NUMERIC | - |
| P16 | W0 n° poste | NUMERIC | - |
| P17 | W0 ligne directe | ALPHA | - |
| P18 | W0 compte special ? | ALPHA | - |
| P19 | W0 salle seminaire | ALPHA | - |
| P20 | W0 telephone direct | ALPHA | - |
| P21 | W0 fin tâche | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 code autocom | NUMERIC | - |
| W0 triplet | ALPHA | - |
| W0 n° ligne | NUMERIC | - |
| W0 n° poste | NUMERIC | - |
| W0 ligne directe | ALPHA | - |
| W0 compte special ? | ALPHA | - |
| W0 salle seminaire | ALPHA | - |
| W0 telephone direct | ALPHA | - |
| W0 fin tâche | ALPHA | - |

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

> Total: 160 variables mappees

---

## 5. EXPRESSIONS (429 total, 306 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `({0,6}='3' OR {0,6}='1') AND {0,18}<>'O'` | `(P0 longueur code='3' OR P0 longueur code='1') AND W0 sal...` |
| 2 | `({0,6}='3' OR {0,6}='1') AND {0,18}='O'` | `(P0 longueur code='3' OR P0 longueur code='1') AND W0 sal...` |
| 3 | `'F'` | `'F'` |
| 4 | `{0,21}='F'` | `{0,21}='F'` |
| 5 | `{0,21}<>'F'` | `{0,21}<>'F'` |
| 6 | `{0,10}='O' AND ({0,6}='1' OR {0,6}='2')` | `P0 account CIA Pack?='O' AND (P0 longueur code='1' OR P0 ...` |
| 7 | `{0,17}<>'O' AND ({0,6}='1' OR {0,6}='2')` | `W0 compte special ?<>'O' AND (P0 longueur code='1' OR P0 ...` |
| 8 | `GetParam ('CURRENTPRINTERNUM')<>0` | `GetParam ('CURRENTPRINTERNUM')<>0` |
| 9 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `'F'` | `'F'` |
| 2 | `''` | `''` |
| 3 | `'CTEL'` | `'CTEL'` |
| 4 | `{0,3}+1` | `P0 nom village+1` |
| 5 | `{0,3}<={1,5}-1` | `P0 nom village<={1,5}-1` |
| 6 | `{1,21}=''` | `{1,21}=''` |
| 7 | `{1,21}='F'` | `{1,21}='F'` |
| 8 | `{1,21}='F' AND ({1,6}='1' OR {1,6}='3')` | `{1,21}='F' AND ({1,6}='1' OR {1,6}='3')` |
| 1 | `{2,16}` | `{2,16}` |
| 2 | `{0,2}-1` | `P0 filiation-1` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `'P'` | `'P'` |
| 5 | `{0,5}=0` | `P0 type triplet=0` |
| 6 | `'F'` | `'F'` |
| 7 | `{0,6}='F'` | `P0 longueur code='F'` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `''` | `''` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 21 (13 W / 8 R) |
| Parametres | 12 |
| Variables locales | 21 |
| Expressions | 429 |
| Expressions 100% decodees | 306 (71%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

