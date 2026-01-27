# ADH IDE 136 - Generation ticket WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_136.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 136 |
| **Fichier XML** | Prg_136.xml |
| **Description** | Generation ticket WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 12 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_136.xml. L'ID XML (136) peut differer de la position IDE (136).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-136.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (3 tables - 2 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #511 | `%club_user%_pv_display` | pv_invoicedisplaytmp | **W** | 1x |
| #512 | `%club_user%_pv_eqhist_dat` | pv_equip_histo | **W** | 1x |
| #196 | `caisse_article` | gestion_article_session | R | 1x |

---

## 3. PARAMETRES D'ENTREE (12)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param chrono session | NUMERIC | - |
| P2 | Param Quand | ALPHA | - |
| P3 | Param Type | ALPHA | - |
| P4 | Param montant | NUMERIC | - |
| P5 | Param montant monnaie | NUMERIC | - |
| P6 | Param montant produits | NUMERIC | - |
| P7 | Param montant cartes | NUMERIC | - |
| P8 | Param montant cheques | NUMERIC | - |
| P9 | Param montant od | NUMERIC | - |
| P10 | Param nbre devise | NUMERIC | - |
| P11 | Param commentaire ecart | ALPHA | - |
| P12 | Param commentaire ecart devise | ALPHA | - |

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

> Total: 142 variables mappees

---

## 5. EXPRESSIONS (32 total, 17 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{0,1}` | `Param Quand` |
| 3 | `{0,15}+1` | `{0,15}+1` |
| 4 | `{0,3}` | `Param montant` |
| 5 | `{0,2}` | `Param Type` |
| 6 | `Date ()` | `Date ()` |
| 7 | `Time ()` | `Time ()` |
| 8 | `{0,4}` | `Param montant monnaie` |
| 9 | `{0,5}` | `Param montant produits` |
| 10 | `{0,6}` | `Param montant cartes` |
| 11 | `{0,7}` | `Param montant cheques` |
| 12 | `{0,8}` | `Param montant od` |
| 13 | `{0,9}` | `Param nbre devise` |
| 14 | `{0,11}` | `Param commentaire ecart devise` |
| 15 | `{0,10}` | `Param commentaire ecart` |
| 16 | `{0,12}` | `{0,12}` |
| 17 | `{0,6}<>0` | `Param montant cartes<>0` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{0,9}<>0` | `Param nbre devise<>0` |
| 3 | `{1,2}` | `{1,2}` |
| 4 | `IF ({1,3}='E','A','D')` | `IF ({1,3}='E','A','D')` |
| 1 | `{2,16}` | `{2,16}` |
| 2 | `{2,17}` | `{2,17}` |
| 3 | `{2,18}` | `{2,18}` |
| 4 | `{1,3}` | `{1,3}` |
| 5 | `{1,10}` | `{1,10}` |
| 6 | `{1,6}` | `{1,6}` |
| 7 | `{1,7}` | `{1,7}` |
| 8 | `{1,8}` | `{1,8}` |
| 9 | `{1,9}` | `{1,9}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (2 W /  R) |
| Parametres | 12 |
| Variables locales | 12 |
| Expressions | 32 |
| Expressions 100% decodees | 17 (53%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

