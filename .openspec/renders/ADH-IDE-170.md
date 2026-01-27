# ADH IDE 170 - Messagerie

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_169.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 170 |
| **Fichier XML** | Prg_169.xml |
| **Description** | Messagerie |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Operations GM |

> **Note**: Ce programme est Prg_169.xml. L'ID XML (169) peut differer de la position IDE (170).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-170.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (8 tables - 5 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 1x |
| #88 | `cafil066_dat` | historik_station | **W** | 3x |
| #123 | `cafil101_dat` | fichier_messagerie | **W** | 7x |
| #131 | `cafil109_dat` | fichier_validation | **W** | 3x |
| #136 | `cafil114_dat` | fichier_echanges | **W** | 4x |
| #63 | `cafil041_dat` | parametres___par | R | 1x |
| #78 | `cafil056_dat` | param__telephone_tel | R | 1x |
| #80 | `cafil058_dat` | codes_autocom____aut | R | 1x |

---

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0-Societe | ALPHA | - |
| P2 | P0-Numero Compte | NUMERIC | - |
| P3 | P0-Filiation Compte | NUMERIC | - |
| P4 | W0-Fin de Tache | ALPHA | - |
| P5 | W0-Accord Suite | ALPHA | - |
| P6 | W0-Nom Personne | ALPHA | - |
| P7 | W0-Prenom Personne | ALPHA | - |
| P8 | W0-Provenance | ALPHA | - |
| P9 | W0-Date | DATE | - |
| P10 | W0-Heure | TIME | - |
| P11 | W0 village TEL | ALPHA | - |
| P12 | W0 interface | ALPHA | - |
| P13 | W0 type triplet | ALPHA | - |
| P14 | W0-n° poste | NUMERIC | - |
| P15 | W0-n° ligne | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0-Fin de Tache | ALPHA | - |
| W0-Accord Suite | ALPHA | - |
| W0-Nom Personne | ALPHA | - |
| W0-Prenom Personne | ALPHA | - |
| W0-Provenance | ALPHA | - |
| W0-Date | DATE | - |
| W0-Heure | TIME | - |
| W0 village TEL | ALPHA | - |
| W0 interface | ALPHA | - |
| W0 type triplet | ALPHA | - |
| W0-n° poste | NUMERIC | - |
| W0-n° ligne | NUMERIC | - |

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

> Total: 148 variables mappees

---

## 5. EXPRESSIONS (160 total, 108 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'F'` | `'F'` |
| 2 | `{0,4}='F'` | `W0-Accord Suite='F'` |
| 3 | `{0,11}='O' AND {0,12}='CLUB' AND {0,13}='1'` | `W0 interface='O' AND W0 type triplet='CLUB' AND W0-n° pos...` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `2` | `2` |
| 3 | `'0'` | `'0'` |
| 4 | `{0,3}` | `W0-Fin de Tache` |
| 5 | `{0,5}` | `W0-Nom Personne` |
| 6 | `{0,6}` | `W0-Prenom Personne` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{0,5}` | `W0-Nom Personne` |
| 5 | `{0,4}` | `W0-Accord Suite` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `'N'` | `'N'` |
| 5 | `IF ({0,1}=0,'L','C')` | `IF (P0-Numero Compte=0,'L','C')` |
| 1 | `'F'` | `'F'` |
| 2 | `{0,1}='F'` | `P0-Numero Compte='F'` |
| 3 | `InStr ('GN',{0,2})>0` | `InStr ('GN',P0-Filiation Compte)>0` |
| 4 | `{0,2}='E'` | `P0-Filiation Compte='E'` |
| 5 | `{0,4}=6` | `W0-Accord Suite=6` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `{2,2}` | `{2,2}` |
| 3 | `{2,3}` | `{2,3}` |
| 4 | `'N'` | `'N'` |
| 5 | `{32768,1}` | `VG.USER` |
| 6 | `'LMES'` | `'LMES'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 8 (5 W / 3 R) |
| Parametres | 3 |
| Variables locales | 15 |
| Expressions | 160 |
| Expressions 100% decodees | 108 (68%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

