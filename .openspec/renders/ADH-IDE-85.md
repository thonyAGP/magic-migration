# ADH IDE 85 -     Determine Age Debut Sejour

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_85.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 85 |
| **Fichier XML** | Prg_85.xml |
| **Description** |     Determine Age Debut Sejour |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | EzCard |

> **Note**: Ce programme est Prg_85.xml. L'ID XML (85) peut differer de la position IDE (85).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-85.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (0 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|

---

## 3. PARAMETRES D'ENTREE (5)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0-Date de Naissance | DATE | - |
| P2 | P0-Date debut Sejour | DATE | - |
| P3 | P0-Age | NUMERIC | - |
| P4 | P0-Age Codifie | ALPHA | - |
| P5 | W0 Date debut sejour | DATE | - |
| P6 | W0 Nb de Mois | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 Date debut sejour | DATE | - |
| W0 Nb de Mois | NUMERIC | - |

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

## 5. EXPRESSIONS (19 total, 15 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `IF ({0,2}='00/00/0000'DATE,Date (),{0,2})` | `IF (P0-Age='00/00/0000'DATE,Date (),P0-Age)` |
| 2 | `{0,1}>0` | `P0-Date debut Sejour>0` |
| 3 | `Year ({0,6})-Year ({0,1})` | `Year (W0 Nb de Mois)-Year (P0-Date debut Sejour)` |
| 4 | `Month ({0,6})<Month ({0,1})` | `Month (W0 Nb de Mois)<Month (P0-Date debut Sejour)` |
| 5 | `{0,3}-1` | `P0-Age Codifie-1` |
| 6 | `Month ({0,6})=Month ({0,1}) AND Day ({0,6})<Day ({0,1})` | `Month (W0 Nb de Mois)=Month (P0-Date debut Sejour) AND Da...` |
| 7 | `{0,3}>0` | `P0-Age Codifie>0` |
| 8 | `IF ({0,3}>100,ASCIIChr (200),ASCIIChr ({0,3}+100))` | `IF (P0-Age Codifie>100,ASCIIChr (200),ASCIIChr (P0-Age Co...` |
| 9 | `{0,3}=0` | `P0-Age Codifie=0` |
| 10 | `IF (Month ({0,6})<=Month ({0,1}),Month ({0,6})+12-Month (...` | `IF (Month (W0 Nb de Mois)<=Month (P0-Date debut Sejour),M...` |
| 11 | `Day ({0,6})<Day ({0,1})` | `Day (W0 Nb de Mois)<Day (P0-Date debut Sejour)` |
| 12 | `{0,7}-1` | `{0,7}-1` |
| 13 | `{0,7}=0 OR {0,7}=12` | `{0,7}=0 OR {0,7}=12` |
| 14 | `1` | `1` |
| 15 | `ASCIIChr (80+{0,7})` | `ASCIIChr (80+{0,7})` |
| 16 | `{0,1}<=0` | `P0-Date debut Sejour<=0` |
| 17 | `0` | `0` |
| 18 | `ASCIIChr (80)` | `ASCIIChr (80)` |
| 19 | `{0,7}` | `{0,7}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 5 |
| Variables locales | 7 |
| Expressions | 19 |
| Expressions 100% decodees | 15 (79%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

