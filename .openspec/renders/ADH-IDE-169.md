# ADH IDE 169 - Messages

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_168.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 169 |
| **Fichier XML** | Prg_168.xml |
| **Description** | Messages |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 6 |
| **Module** | ADH |
| **Dossier IDE** | Operations GM |

> **Note**: Ce programme est Prg_168.xml. L'ID XML (168) peut differer de la position IDE (169).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-169.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (7 tables - 5 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #88 | `cafil066_dat` | historik_station | **W** | 2x |
| #123 | `cafil101_dat` | fichier_messagerie | **W** | 4x |
| #131 | `cafil109_dat` | fichier_validation | **W** | 1x |
| #136 | `cafil114_dat` | fichier_echanges | **W** | 2x |
| #36 | `cafil014_dat` | client_gm | R | 1x |
| #80 | `cafil058_dat` | codes_autocom____aut | R | 1x |

---

## 3. PARAMETRES D'ENTREE (6)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > compte | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | > village tel | ALPHA | - |
| P5 | > type triplet | ALPHA | - |
| P6 | > Interface | ALPHA | - |
| P7 | W0 reseau | ALPHA | - |
| P8 | W0 message ? | ALPHA | - |
| P9 | W0 n° poste | NUMERIC | - |
| P10 | W0 n° ligne | NUMERIC | - |
| P11 | W0 fin tache | ALPHA | - |
| P12 | v. titre | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 reseau | ALPHA | - |
| W0 message ? | ALPHA | - |
| W0 n° poste | NUMERIC | - |
| W0 n° ligne | NUMERIC | - |
| W0 fin tache | ALPHA | - |
| v. titre | ALPHA | - |

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

## 5. EXPRESSIONS (84 total, 54 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Trim ({0,12})` | `Trim ({0,12})` |
| 2 | `124` | `124` |
| 3 | `{0,7}<>'R'` | `W0 message ?<>'R'` |
| 4 | `{0,11}='F'` | `v. titre='F'` |
| 5 | `'F'` | `'F'` |
| 6 | `{0,4}='O' AND {0,6}='CLUB' AND {0,5}='1'` | `> type triplet='O' AND W0 reseau='CLUB' AND > Interface='1'` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{0,4}` | `> type triplet` |
| 5 | `{0,5}` | `> Interface` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{0,3}` | `> village tel` |
| 4 | `{1,7}='R'` | `{1,7}='R'` |
| 5 | `{1,7}<>'R'` | `{1,7}<>'R'` |
| 6 | `'R'` | `'R'` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `'N'` | `'N'` |
| 4 | `'F'` | `'F'` |
| 5 | `{0,6}='F'` | `W0 reseau='F'` |
| 6 | `IF ({0,5}=0,'O','N')` | `IF (> Interface=0,'O','N')` |
| 1 | `'O'` | `'O'` |
| 2 | `Date ()` | `Date ()` |
| 3 | `{32768,2}` | `VG.Retour Chariot` |
| 4 | `Trim ({1,12})` | `Trim ({1,12})` |
| 5 | `{1,1}` | `{1,1}` |
| 6 | `{0,1}` | `> compte` |
| 7 | `{1,2}` | `{1,2}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 7 (5 W / 2 R) |
| Parametres | 6 |
| Variables locales | 12 |
| Expressions | 84 |
| Expressions 100% decodees | 54 (64%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

