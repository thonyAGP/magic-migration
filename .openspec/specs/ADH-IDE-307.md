# ADH IDE 307 - Saisie transaction 154  N.U

> **Version spec** : 2.0
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_304.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 307 |
| **Fichier XML** | Prg_304.xml |
| **Description** | Saisie transaction 154  N.U |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 18 |
| **Module** | ADH |
| **Dossier IDE** | Suppr |

> **Note**: Ce programme est Prg_304.xml. L'ID XML (304) peut differer de la position IDE (307).

---

## 2. TABLES (26 tables - 7 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 3x |
| #32 | `cafil010_dat` | prestations | **W** | 3x |
| #46 | `cafil024_dat` | mvt_prestation___mpr | **W** | 2x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 1x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 8x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 12x |
| #26 | `cafil004_dat` | comptes_speciaux_spc | R | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 2x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #39 | `cafil017_dat` | depot_garantie___dga | R | 1x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 3x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 5x |
| #79 | `cafil057_dat` | gratuites________gra | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 9x |
| #96 | `cafil074_dat` | table_prestation_pre | R | 1x |
| #109 | `cafil087_dat` | table_utilisateurs | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #140 | `cafil118_dat` | moyen_paiement___mop | R | 1x |
| #197 | `caisse_artstock` | articles_en_stock | R | 1x |
| #697 | `droits` | droits_applications | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #737 | `pv_packdetail_dat` | pv_package_detail | R | 1x |
| #801 | `moyens_reglement_complem` | moyens_reglement_complem | R | 1x |

---

## 3. PARAMETRES D'ENTREE (18)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 devise locale | ALPHA | - |
| P3 | P0 masque montant | ALPHA | - |
| P4 | P0 solde compte | NUMERIC | - |
| P5 | P0 code GM | NUMERIC | - |
| P6 | P0 filiation | NUMERIC | - |
| P7 | P0 date fin sejour | DATE | - |
| P8 | P0 etat compte | ALPHA | - |
| P9 | P0 date solde | DATE | - |
| P10 | P0 garanti O/N | ALPHA | - |
| P11 | P0 Nom & prenom | ALPHA | - |
| P12 | P0 UNI/BI | ALPHA | - |
| P13 | Bouton IDENTITE | ALPHA | - |
| P14 | Bouton ABANDON | ALPHA | - |
| P15 | W0 FIN SAISIE OD | LOGICAL | - |
| P16 | Bouton FIN SAISIE OD | ALPHA | - |
| P17 | W0 Cloture en cours | LOGICAL | - |
| P18 | W0 code article | NUMERIC | - |
| P19 | W0 imputation | NUMERIC | - |
| P20 | W0 sous-imput. | NUMERIC | - |
| P21 | W0 date d'achat | DATE | - |
| P22 | W0 annulation | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-37}` | W0 FIN SAISIE OD | LOGICAL | - |
| `{0,-35}` | W0 Cloture en cours | LOGICAL | - |
| `{0,-34}` | W0 code article | NUMERIC | - |
| `{0,-33}` | W0 imputation | NUMERIC | - |
| `{0,-32}` | W0 sous-imput. | NUMERIC | - |
| `{0,-31}` | W0 date d'achat | DATE | - |
| `{0,-30}` | W0 annulation | ALPHA | - |
| `{0,-29}` | W0 service village | ALPHA | - |
| `{0,-28}` | W0 libelle article | ALPHA | - |
| `{0,-27}` | W0 article dernière minute | LOGICAL | - |
| `{0,-22}` | W0 nbre articles | NUMERIC | - |
| `{0,-25}` | W0 prix unitaire | NUMERIC | - |
| `{0,31}` | W0 Categorie de chambre | ALPHA | - |
| `{0,61}` | W0 Lieu sejour | ALPHA | - |
| `{0,21}` | W0 Code reduction | ALPHA | - |
| `{0,28}` | W0 montant avant reduction | NUMERIC | - |
| `{0,22}` | W0 Pourcentage reduction | NUMERIC | - |
| `{0,33}` | W0 Montant reduction | NUMERIC | - |
| `{0,19}` | W0.Date consommation | DATE | - |
| `{0,29}` | W0.Date fin sejour | DATE | - |

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

> Total: 277 variables mappees

---

## 5. EXPRESSIONS (558 total, 371 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `MlsTrans ('Verifier que la transaction est bien pour')&' ...` | `MlsTrans ('Verifier que la transaction est bien pour')&' ...` |
| 2 | `Date ()` | `Date ()` |
| 3 | `IF({0,120}=0,IF({0,23}='VSL',{0,13},Date()),{0,56})` | `IF({0,120}=0,IF(W0 date d'achat='VSL',Bouton Ok,Date()),W...` |
| 4 | `{32768,2}` | `VG.Retour Chariot` |
| 5 | `Trim ({0,99})` | `Trim (P.Toute ligne)` |
| 6 | `154` | `154` |
| 7 | `{0,1}` | `W0 Retour Transmission TPE` |
| 8 | `{0,5}` | `W0 Fin Transaction TPE` |
| 9 | `{0,6}` | `v. titre` |
| 10 | `'F'` | `'F'` |
| 11 | `Date ()` | `Date ()` |
| 12 | `{0,45}*{0,44}` | `W0 Nom de la rue*W0 Num rue` |
| 13 | `({0,45}*{0,44})-{0,55}` | `(W0 Nom de la rue*W0 Num rue)-W0 Libelle MOP` |
| 14 | `'FALSE'LOG` | `'FALSE'LOG` |
| 15 | `'N'` | `'N'` |
| 16 | `1` | `1` |
| 17 | `'CAISSE'` | `'CAISSE'` |
| 18 | `{0,21}` | `W0 Code reduction` |
| 19 | `{0,45}>0 AND {0,44}=0` | `W0 Nom de la rue>0 AND W0 Num rue=0` |
| 20 | `{0,72} AND {0,38}='N'` | `V.MOP TPE AND W0 Motif de non enreg NA='N'` |
| 21 | `{0,44}>{0,73} AND NOT ({0,104})` | `W0 Num rue>V.Id transaction PMS AND NOT (V.Total carte)` |
| 22 | `{0,74}=0 AND {0,39}<>'' AND {0,54}<>100 AND {0,23}<>'VRL'...` | `V.Id transaction AXIS=0 AND V.Type premier article<>'' AN...` |
| 23 | `{0,23}='VRL' OR {0,23}='VSL'` | `W0 date d'achat='VRL' OR W0 date d'achat='VSL'` |
| 24 | `({0,23}='VRL' OR {0,23}='VSL' ) AND NOT({0,124})` | `(W0 date d'achat='VRL' OR W0 date d'achat='VSL' ) AND NOT...` |
| 25 | `{0,45}>0 AND {0,84}='N'` | `W0 Nom de la rue>0 AND V.Transaction ok='N'` |
| 26 | `({0,45}=0) AND (ExpCalc('54'EXP))` | `(W0 Nom de la rue=0) AND (ExpCalc('54'EXP))` |
| 27 | `({0,45}=0) AND {0,23}<>'VRL' AND (ExpCalc('54'EXP))` | `(W0 Nom de la rue=0) AND W0 date d'achat<>'VRL' AND (ExpC...` |
| 28 | `{0,21}>0 AND {0,82}<>'R'` | `W0 Code reduction>0 AND W0 Abandon<>'R'` |
| 29 | `{0,7}=0 OR {0,7}<Date ()` | `W0 Total=0 OR W0 Total<Date ()` |
| 30 | `NOT ({0,7}=0 OR {0,7}<Date ())` | `NOT (W0 Total=0 OR W0 Total<Date ())` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 26 (7 W / 19 R) |
| Parametres | 18 |
| Variables locales | 110 |
| Expressions | 558 |
| Expressions 100% decodees | 371 (66%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*
