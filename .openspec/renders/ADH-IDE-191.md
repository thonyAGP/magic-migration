# ADH IDE 191 - Annulation solde

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_190.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 191 |
| **Fichier XML** | Prg_190.xml |
| **Description** | Annulation solde |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 11 |
| **Module** | ADH |
| **Dossier IDE** | Solde |

> **Note**: Ce programme est Prg_190.xml. L'ID XML (190) peut differer de la position IDE (191).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-191.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (15 tables - 10 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #40 | `cafil018_dat` | comptable________cte | **W** | 4x |
| #44 | `cafil022_dat` | change___________chg | **W** | 3x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 4x |
| #268 | `ccpartyp` | cc_total_par_type | **W** | 2x |
| #271 | `cctotal` | cc_total | **W** | 2x |
| #272 | `cctypdet` | cc_type_detail | **W** | 2x |
| #517 | `%club_user%_pv_palmtmp_dat` | pv_palmtemp | **W** | 4x |
| #582 | `%club_user%tempocomptagen_dat` | tempo_comptage_nation | **W** | 4x |
| #945 | `Table_945` | Unknown | **W** | 4x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 5x |
| #140 | `cafil118_dat` | moyen_paiement___mop | R | 2x |

---

## 3. PARAMETRES D'ENTREE (11)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P. Societe | ALPHA | - |
| P2 | P. Code GM | NUMERIC | - |
| P3 | P. Masque montant | ALPHA | - |
| P4 | P. Filiation | NUMERIC | - |
| P5 | P. Code devise | ALPHA | - |
| P6 | P. Masque montant | ALPHA | - |
| P7 | P. Nom village | ALPHA | - |
| P8 | P. Telephone | ALPHA | - |
| P9 | P. Fax | ALPHA | - |
| P10 | P. Uni/Bilateral | ALPHA | - |
| P11 | P. Date/Heure session | NUMERIC | - |
| P12 | L Annulation | LOGICAL | - |
| P13 | L Abandon | LOGICAL | - |
| P14 | V Date solde | DATE | - |
| P15 | V Heure 1er solde (edition) | TIME | - |
| P16 | V Heure solde | TIME | - |
| P17 | V Solde compte | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V.N°Ticket (SOLDE) | NUMERIC | - |
| V.N°Ticket (CHANGE) | NUMERIC | - |
| v.Montant Carte | NUMERIC | - |
| v.Nb Cartes | NUMERIC | - |
| v.MOP | UNICODE | - |
| v.Num Dossier PMS | ALPHA | - |
| v.Num Dossier AXIS | ALPHA | - |
| v.Num Autorisation | ALPHA | - |
| v.Message Erreur | ALPHA | - |
| v.Transaction Validee | LOGICAL | - |
| v.Token Id | UNICODE | - |
| v.Transaction Id | UNICODE | - |

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

> Total: 176 variables mappees

---

## 5. EXPRESSIONS (277 total, 154 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `P. Code GM` |
| 2 | `{0,2}` | `P. Masque montant` |
| 3 | `{0,4}` | `P. Code devise` |
| 4 | `Date ()` | `Date ()` |
| 5 | `Time ()` | `Time ()` |
| 6 | `DbDel ('{517,4}'DSOURCE,'')` | `DbDel ('{517,4}'DSOURCE,'')` |
| 7 | `{0,19}` | `v.Montant Carte` |
| 8 | `{32768,23} AND {32768,24} AND {0,27}<>0 AND {0,28}>1` | `VG.PROJ.INTERF.TPE ACTIF AND VG.TPE INTERFACE SUR TERMINA...` |
| 9 | `'TRUE'LOG` | `'TRUE'LOG` |
| 10 | `{32768,23} AND {32768,24} AND {0,27}<>0 AND {0,28}=1` | `VG.PROJ.INTERF.TPE ACTIF AND VG.TPE INTERFACE SUR TERMINA...` |
| 11 | `MlsTrans('Erreur transaction TPE : ')&Trim({0,33})` | `MlsTrans('Erreur transaction TPE : ')&Trim({0,33})` |
| 12 | `NOT({0,34})` | `NOT({0,34})` |
| 13 | `NOT ({0,20})` | `NOT (v.Nb Cartes)` |
| 14 | `41` | `41` |
| 15 | `'FIN'` | `'FIN'` |
| 16 | `'O'` | `'O'` |
| 17 | `IF ({0,10}='U','N','O')` | `IF (P. Date/Heure session='U','N','O')` |
| 18 | `DbDel ('{582,4}'DSOURCE,'')` | `DbDel ('{582,4}'DSOURCE,'')` |
| 19 | `NOT({32768,51})` | `NOT(VG.Tickets bilingues TIK V1.00)` |
| 20 | `{32768,51}` | `VG.Tickets bilingues TIK V1.00` |
| 21 | `{32768,52}` | `VG.Numero Ticket V1.00` |
| 22 | `ABS({0,27})` | `ABS(v.Token Id)` |
| 23 | `IF({0,27}<0,'D','C')` | `IF(v.Token Id<0,'D','C')` |
| 24 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 25 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `164` | `164` |
| 2 | `Trim ({0,1})` | `Trim (P. Code GM)` |
| 3 | `Date ()` | `Date ()` |
| 4 | `{32768,2}` | `VG.Retour Chariot` |
| 5 | `{1,1}` | `{1,1}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 15 (10 W / 5 R) |
| Parametres | 11 |
| Variables locales | 29 |
| Expressions | 277 |
| Expressions 100% decodees | 154 (56%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

