# ADH IDE 235 -  Print ticket vente LEX

> **Version spec** : 2.0
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_231.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 235 |
| **Fichier XML** | Prg_231.xml |
| **Description** |  Print ticket vente LEX |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 29 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_231.xml. L'ID XML (231) peut differer de la position IDE (235).

---

## 2. TABLES (17 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 4x |
| #34 | `cafil012_dat` | hebergement______heb | R | 4x |
| #40 | `cafil018_dat` | comptable________cte | R | 4x |
| #67 | `cafil045_dat` | tables___________tab | R | 3x |
| #69 | `cafil047_dat` | initialisation___ini | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 5x |
| #263 | `caisse_vente` | vente | R | 4x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |
| #417 | `pv_weight` | pv_weight | R | 2x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | R | 14x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #818 | `zcircafil146` | Circuit supprime | R | 3x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | R | 15x |
| #867 | `log_maj_tpe` | log_maj_tpe | R | 5x |
| #878 | `categorie_operation_mw` | categorie_operation_mw | R | 2x |
| #904 | `Boo_AvailibleEmployees` | Boo_AvailibleEmployees | R | 3x |
| #1037 | `Table_1037` | Unknown | R | 2x |

---

## 3. PARAMETRES D'ENTREE (29)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 od annulation | LOGICAL | - |
| P2 | P0 Nom | ALPHA | - |
| P3 | P0 Date | DATE | - |
| P4 | P0 Article libelle 1 | ALPHA | - |
| P5 | P0 Article complementaire | ALPHA | - |
| P6 | P0 Qte *NU* | NUMERIC | - |
| P7 | P0 Prix unitaire | NUMERIC | - |
| P8 | P0 Total | NUMERIC | - |
| P9 | P0 Devise locale | ALPHA | - |
| P10 | P0 Masque | ALPHA | - |
| P11 | P0 Chambre | ALPHA | - |
| P12 | P0 mode de paiement | ALPHA | - |
| P13 | P0 libelle paiement | ALPHA | - |
| P14 | PO is TAI | LOGICAL | - |
| P15 | P0 TAI Cash | ALPHA | - |
| P16 | P0 TAI start date | DATE | - |
| P17 | P0 TAI end date | DATE | - |
| P18 | W0 en-tête ? | ALPHA | - |
| P19 | W0 fin tâche | ALPHA | - |
| P20 | W0 copies | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-78}` | W0 en-tête ? | ALPHA | - |
| `{0,-77}` | W0 fin tâche | ALPHA | - |
| `{0,-76}` | W0 copies | NUMERIC | - |
| `{0,-70}` | v.Itération Compteur ticket | NUMERIC | - |
| `{0,-69}` | v.NumeroTicketsvg | NUMERIC | - |
| `{0,-65}` | v.Date Conso ou date séjour | ALPHA | - |
| `{0,-50}` | v.TPE ICMP | LOGICAL | - |
| `{0,-47}` | v.Service Interne Club Med? | LOGICAL | - |
| `{0,-45}` | v. nb erreur lignes inexistante | NUMERIC | - |
| `{0,-44}` | v.Liste des TVA taux Réduit | UNICODE | - |
| `{0,-42}` | v.Nombre de taux réduit | NUMERIC | - |
| `{0,-41}` | v.N° Taux reduit en cours | NUMERIC | - |
| `{0,-40}` | v.Taux réduit en cours | UNICODE | - |
| `{0,-39}` | v.Text à éditer si pdt tx redu | UNICODE | - |
| `{0,-38}` | v.Libelle TVA | UNICODE | - |
| `{0,-37}` | v.Libelle Montant HT | UNICODE | - |
| `{0,-34}` | v.Montant Service | NUMERIC | - |
| `{0,-35}` | v.Montant Product | NUMERIC | - |
| `{0,-25}` | v.ABS Montant Service | NUMERIC | - |
| `{0,-24}` | v.ABS Montant Prod | NUMERIC | - |

### 4.2 Variables globales (VG)

| Ref | Decode | Role |
|-----|--------|------|
| `{32768,0}` | VG.LOGIN | - |
| `{32768,1}` | VG.USER | - |
| `{32768,2}` | VG.Retour Chariot | - |
| `{32768,3}` | VG.DROIT ACCES IT ? | - |
| `{32768,4}` | VG.DROIT ACCES CAISSE ? | - |
| `{32768,5}` | VG.BRAZIL DATACATCHING? | - |
| `{32768,6}` | VG.USE MDR | - |
| `{32768,7}` | VG.VRL ACTIF ? | - |
| `{32768,8}` | VG.ECI ACTIF ? | - |
| `{32768,9}` | VG.COMPTE CASH ACTIF ? | - |
| `{32768,10}` | VG.IND SEJ PAYE ACTIF ? | - |
| `{32768,11}` | VG.CODE LANGUE USER | - |
| `{32768,12}` | VG.EFFECTIF ACTIF ? | - |
| `{32768,13}` | VG.TAXE SEJOUR ACTIF ? | - |
| `{32768,14}` | VG.N° version | - |

> Total: 224 variables mappees

---

## 5. EXPRESSIONS (844 total, 523 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (2)` | `SetCrsr (2)` |
| 2 | `SetCrsr (1)` | `SetCrsr (1)` |
| 31 | `GetParam ('CURRENTPRINTERNUM')` | `GetParam ('CURRENTPRINTERNUM')` |
| 3 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 4 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 5 | `GetParam ('CURRENTPRINTERNUM')=5` | `GetParam ('CURRENTPRINTERNUM')=5` |
| 6 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 7 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 8 | `'VRL'` | `'VRL'` |
| 9 | `'VSL'` | `'VSL'` |
| 10 | `INIPut('EmbedFonts=N','FALSE'LOG)` | `INIPut('EmbedFonts=N','FALSE'LOG)` |
| 11 | `INIPut('CompressPDF =Y','FALSE'LOG)` | `INIPut('CompressPDF =Y','FALSE'LOG)` |
| 12 | `'TRUE'LOG` | `'TRUE'LOG` |
| 13 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 14 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 15 | `Translate ('%TempDir%')&'ticket_vente_'&
Str({0,15},'8P0...` | `Translate ('%TempDir%')&'ticket_vente_'&
Str(P0 UNI/BI,'...` |
| 16 | `{0,32}` | `v.Itération Compteur ticket` |
| 17 | `ExpCalc('3'EXP) OR ExpCalc('7'EXP)` | `ExpCalc('3'EXP) OR ExpCalc('7'EXP)` |
| 27 | `{0,51}>0` | `v.demande AGEC à effectuée?>0` |
| 19 | `StrTokenCnt({0,52},',')` | `StrTokenCnt(v.Imprimante n°,',')` |
| 20 | `StrToken({0,52},{0,55},',')` | `StrToken(v.Imprimante n°,{0,55},',')` |
| 21 | `Trim('* '&{0,56})&MlsTrans('% reduction rate item')` | `Trim('* '&{0,56})&MlsTrans('% reduction rate item')` |
| 22 | `MlsTrans('TVA')` | `MlsTrans('TVA')` |
| 23 | `MlsTrans('Montant HT')` | `MlsTrans('Montant HT')` |
| 24 | `GetParam ('NUMBERCOPIES')` | `GetParam ('NUMBERCOPIES')` |
| 28 | `{0,25} OR {0,26}` | `p.Re_Print_Annulation OR PI.N° de Ticket si VG TENV10` |
| 26 | `1` | `1` |
| 29 | `ABS({0,62})` | `ABS({0,62})` |
| 30 | `ABS({0,61})` | `ABS({0,61})` |
| 1 | `Counter (0)>={1,44}` | `Counter (0)>={1,44}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 17 (0 W / 17 R) |
| Parametres | 29 |
| Variables locales | 53 |
| Expressions | 844 |
| Expressions 100% decodees | 523 (62%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*
