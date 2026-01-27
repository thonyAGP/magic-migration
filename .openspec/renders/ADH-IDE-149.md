# ADH IDE 149 - Calcul stock produit WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_149.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 149 |
| **Fichier XML** | Prg_149.xml |
| **Description** | Calcul stock produit WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_149.xml. L'ID XML (149) peut differer de la position IDE (149).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-149.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (6 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #40 | `cafil018_dat` | comptable________cte | R | 1x |
| #222 | `caisse_compcais_histo2` | comptage_caisse_histo | R | 1x |
| #246 | `caisse_session` | histo_sessions_caisse | R | 1x |
| #247 | `caisse_session_article` | histo_sessions_caisse_article | R | 1x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 1x |
| #263 | `caisse_vente` | vente | R | 1x |

---

## 3. PARAMETRES D'ENTREE (4)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param date comptable | DATE | - |
| P3 | Param Numero article | NUMERIC | - |
| P4 | Param stock article | NUMERIC | - |
| P5 | Session | NUMERIC | - |
| P6 | Date debut session | DATE | - |
| P7 | Heure debut session | TIME | - |

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

> Total: 132 variables mappees

---

## 5. EXPRESSIONS (44 total, 18 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `0` | `0` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{0,2}` | `Param Numero article` |
| 3 | `{0,3}` | `Param stock article` |
| 4 | `{0,4}` | `Session` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'ART'` | `'ART'` |
| 3 | `{1,5}` | `{1,5}` |
| 4 | `{1,3}` | `{1,3}` |
| 5 | `{0,2}` | `Param Numero article` |
| 6 | `{0,7}=0` | `{0,7}=0` |
| 7 | `{0,2}<{0,7}` | `Param Numero article<{0,7}` |
| 8 | `{1,4}+{0,4}` | `{1,4}+Session` |
| 9 | `{0,2}={0,7}` | `Param Numero article={0,7}` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,5}` | `{1,5}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{1,4}+{0,5}` | `{1,4}+Date debut session` |
| 5 | `{1,4}-{0,5}` | `{1,4}-Date debut session` |
| 6 | `{0,3}` | `Param stock article` |
| 7 | `{0,10}='E' AND {0,11}='P'` | `{0,10}='E' AND {0,11}='P'` |
| 8 | `{0,10}='V' AND {0,11}='P'` | `{0,10}='V' AND {0,11}='P'` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `'O'` | `'O'` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{1,2}` | `{1,2}` |
| 5 | `{1,6}` | `{1,6}` |
| 6 | `{32768,1}` | `VG.USER` |
| 7 | `{0,6}*1000000+{0,7}>={1,6}*1000000+{1,7}` | `Heure debut session*1000000+{0,7}>={1,6}*1000000+{1,7}` |
| 8 | `{1,4}-{0,8}` | `{1,4}-{0,8}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 6 (0 W / 6 R) |
| Parametres | 4 |
| Variables locales | 7 |
| Expressions | 44 |
| Expressions 100% decodees | 18 (41%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

