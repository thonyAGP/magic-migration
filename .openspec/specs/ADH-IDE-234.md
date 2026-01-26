# ADH IDE 234 -  Print ticket vente

> **Version spec** : 2.0
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_230.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 234 |
| **Fichier XML** | Prg_230.xml |
| **Description** |  Print ticket vente |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 27 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_230.xml. L'ID XML (230) peut differer de la position IDE (234).

---

## 2. TABLES (8 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #67 | `cafil045_dat` | tables___________tab | R | 2x |
| #69 | `cafil047_dat` | initialisation___ini | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 5x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | R | 12x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #818 | `zcircafil146` | Circuit supprime | R | 1x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | R | 15x |
| #867 | `log_maj_tpe` | log_maj_tpe | R | 5x |

---

## 3. PARAMETRES D'ENTREE (27)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 od annulation | LOGICAL | - |
| P2 | P0 Nom | ALPHA | - |
| P3 | P0 Date | DATE | - |
| P4 | P0 Article libelle 1 | ALPHA | - |
| P5 | P0 Article complementaire | ALPHA | - |
| P6 | P0 Qte | NUMERIC | - |
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

> Total: 184 variables mappees

---

## 5. EXPRESSIONS (552 total, 364 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (2)` | `SetCrsr (2)` |
| 2 | `SetCrsr (1)` | `SetCrsr (1)` |
| 3 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 4 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 5 | `GetParam ('CURRENTPRINTERNUM')=5` | `GetParam ('CURRENTPRINTERNUM')=5` |
| 6 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 7 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 8 | `'VRL'` | `'VRL'` |
| 9 | `'VSL'` | `'VSL'` |
| 10 | `{0,22}` | `P.Document ticket` |
| 11 | `INIPut('EmbedFonts=N','FALSE'LOG)` | `INIPut('EmbedFonts=N','FALSE'LOG)` |
| 12 | `INIPut('CompressPDF =Y','FALSE'LOG)` | `INIPut('CompressPDF =Y','FALSE'LOG)` |
| 13 | `'TRUE'LOG` | `'TRUE'LOG` |
| 14 | `GetParam ('NUMBERCOPIES')` | `GetParam ('NUMBERCOPIES')` |
| 15 | `1` | `1` |
| 16 | `{0,25}` | `p.Re_Print_Annulation` |
| 1 | `Counter (0)>={1,40}` | `Counter (0)>={1,40}` |
| 2 | `SetParam ('CURRENTPAGENUMBER',0)` | `SetParam ('CURRENTPAGENUMBER',0)` |
| 3 | `DbDel('{867,4}'DSOURCE,'')` | `DbDel('{867,4}'DSOURCE,'')` |
| 4 | `NOT {1,22}` | `NOT {1,22}` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `{2,10}` | `{2,10}` |
| 3 | `{2,9}` | `{2,9}` |
| 4 | `IF ({2,1} OR {2,26},MlsTrans ('ANNULATION')&' ','')&IF ({...` | `IF ({2,1} OR {2,26},MlsTrans ('ANNULATION')&' ','')&IF ({...` |
| 5 | `{32768,2}` | `VG.Retour Chariot` |
| 6 | `{0,10}+{0,5}` | `P0 Chambre+P0 Qte` |
| 7 | `IF (NOT ({2,17}),{0,1},{0,1}&IF (Right ({0,1},4)='Nigh',I...` | `IF (NOT ({2,17}),P0 Nom,P0 Nom&IF (Right (P0 Nom,4)='Nigh...` |
| 8 | `IF ({2,17},IF ({2,18}='O','CASH','ACCOUNT '&IF ({0,5}<0,'...` | `IF ({2,17},IF ({2,18}='O','CASH','ACCOUNT '&IF (P0 Qte<0,...` |
| 9 | `Trim (Str ({2,20}-{2,19},'3'))&' Night'&IF (MID ({0,1},7,...` | `Trim (Str ({2,20}-{2,19},'3'))&' Night'&IF (MID (P0 Nom,7...` |
| 10 | `{2,17}` | `{2,17}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 8 (0 W / 8 R) |
| Parametres | 27 |
| Variables locales | 33 |
| Expressions | 552 |
| Expressions 100% decodees | 364 (66%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*
