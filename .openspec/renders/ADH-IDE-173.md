# ADH IDE 173 - Gestion forfait TAI LOCAL

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_172.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 173 |
| **Fichier XML** | Prg_172.xml |
| **Description** | Gestion forfait TAI LOCAL |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 17 |
| **Module** | ADH |
| **Dossier IDE** | Operations GM |

> **Note**: Ce programme est Prg_172.xml. L'ID XML (172) peut differer de la position IDE (173).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-173.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (11 tables - 6 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 8x |
| #40 | `cafil018_dat` | comptable________cte | **W** | 2x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 4x |
| #173 | `cafil181_dat` | intermed_compta__ite | **W** | 2x |
| #463 | `verifpool_dat` | heure_de_passage | **W** | 7x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 4x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 3x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #39 | `cafil017_dat` | depot_garantie___dga | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 2x |
| #77 | `cafil055_dat` | articles_________art | R | 3x |

---

## 3. PARAMETRES D'ENTREE (17)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P.SOCIETE | ALPHA | - |
| P2 | P.DEVISE LOCALE | ALPHA | - |
| P3 | P.MASQUE MONTANT | ALPHA | - |
| P4 | P.SOLDE COMPTE | NUMERIC | - |
| P5 | P.COMPTE | NUMERIC | - |
| P6 | P.FILIATION | NUMERIC | - |
| P7 | P.DATE DEB SEJOUR | DATE | - |
| P8 | P.DATE FIN SEJOUR | DATE | - |
| P9 | P.ETAT COMPTE | ALPHA | - |
| P10 | P.DATE SOLDE | DATE | - |
| P11 | P.GARANTIE O/N | ALPHA | - |
| P12 | P.NOM PRENOM | ALPHA | - |
| P13 | P.AGE | ALPHA | - |
| P14 | P.VILLAGE TAI | ALPHA | - |
| P15 | P.TAI OBLIGATOIRE | ALPHA | - |
| P16 | V date deb 1er | DATE | - |
| P17 | V date fin 1er | DATE | - |
| P18 | V sortie | LOGICAL | - |
| P19 | bouton SORTIE | ALPHA | - |
| P20 | V Titre | ALPHA | - |
| P21 | V Choix | ALPHA | - |
| P22 | V Existe Forfait pour le GM | LOGICAL | - |

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

> Total: 170 variables mappees

---

## 5. EXPRESSIONS (350 total, 183 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,2}` | `VG.Retour Chariot` |
| 2 | `Date ()` | `Date ()` |
| 3 | `{0,23}='A'` | `V Existe Forfait pour le GM='A'` |
| 4 | `InStr ('BC',{0,23})<>0` | `InStr ('BC',V Existe Forfait pour le GM)<>0` |
| 5 | `{0,24}` | `V creation validee` |
| 6 | `{0,23}='B'` | `V Existe Forfait pour le GM='B'` |
| 7 | `{0,23}='C'` | `V Existe Forfait pour le GM='C'` |
| 8 | `NOT ({0,24}) AND NOT ({0,20})` | `NOT (V creation validee) AND NOT (bouton SORTIE)` |
| 9 | `''` | `''` |
| 10 | `136` | `136` |
| 11 | `Trim ({0,22})` | `Trim (V Choix)` |
| 12 | `'AUTO'` | `'AUTO'` |
| 13 | `'MANU'` | `'MANU'` |
| 14 | `{0,25}` | `V suppression validee` |
| 15 | `{0,26}` | `{0,26}` |
| 16 | `{0,8}<Date () AND NOT ({0,20})` | `P.ETAT COMPTE<Date () AND NOT (bouton SORTIE)` |
| 17 | `{0,8}>=Date ()` | `P.ETAT COMPTE>=Date ()` |
| 18 | `'TRUE'LOG` | `'TRUE'LOG` |
| 19 | `{0,15}='1'` | `P.Age num='1'` |
| 20 | `{0,1}` | `P.DEVISE LOCALE` |
| 21 | `{0,5}` | `P.FILIATION` |
| 22 | `{0,6}` | `P.DATE DEB SEJOUR` |
| 23 | `Date ()` | `Date ()` |
| 24 | `'H'` | `'H'` |
| 25 | `ASCIIChr (33)` | `ASCIIChr (33)` |
| 1 | `MlsTrans ('Verifier que l''OD est bien pour')&' '&Trim ({...` | `MlsTrans ('Verifier que l''OD est bien pour')&' '&Trim (P...` |
| 2 | `'C'` | `'C'` |
| 3 | `Trim ({0,53})` | `Trim ({0,53})` |
| 4 | `137` | `137` |
| 5 | `{0,1}` | `P.DEVISE LOCALE` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 11 (6 W / 5 R) |
| Parametres | 17 |
| Variables locales | 26 |
| Expressions | 350 |
| Expressions 100% decodees | 183 (52%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

