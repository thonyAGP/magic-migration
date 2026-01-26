# ADH IDE 237 - Transaction Nouv vente avec GP

> **Version spec** : 2.0
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_233.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 237 |
| **Fichier XML** | Prg_233.xml |
| **Description** | Transaction Nouv vente avec GP |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 20 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_233.xml. L'ID XML (233) peut differer de la position IDE (237).

---

## 2. TABLES (30 tables - 9 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #32 | `cafil010_dat` | prestations | **W** | 3x |
| #46 | `cafil024_dat` | mvt_prestation___mpr | **W** | 2x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 1x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 7x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 13x |
| #899 | `Boo_ResultsRechercheHoraire` | Boo_ResultsRechercheHoraire | **W** | 8x |
| #1037 | `Table_1037` | Unknown | **W** | 3x |
| #26 | `cafil004_dat` | comptes_speciaux_spc | R | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 3x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #39 | `cafil017_dat` | depot_garantie___dga | R | 1x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 3x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 4x |
| #79 | `cafil057_dat` | gratuites________gra | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 8x |
| #96 | `cafil074_dat` | table_prestation_pre | R | 1x |
| #103 | `cafil081_dat` | logement_client__loc | R | 1x |
| #109 | `cafil087_dat` | table_utilisateurs | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #140 | `cafil118_dat` | moyen_paiement___mop | R | 1x |
| #197 | `caisse_artstock` | articles_en_stock | R | 1x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |
| #697 | `droits` | droits_applications | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #801 | `moyens_reglement_complem` | moyens_reglement_complem | R | 1x |
| #818 | `zcircafil146` | Circuit supprime | R | 1x |

---

## 3. PARAMETRES D'ENTREE (20)

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
| `{0,133}` | v.SoldeGiftPass | NUMERIC | - |
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
| `{0,158}` | v.Date activité VAE | DATE | - |
| `{0,163}` | v.VAE pendant le séjour ? | LOGICAL | - |
| `{0,160}` | v.Matin/Après midi | UNICODE | - |
| `{0,102}` | W0 Sens du transfert Aller | ALPHA | - |

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

> Total: 339 variables mappees

---

## 5. EXPRESSIONS (849 total, 547 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `DStr({0,7},'DD/MM/YYYY')` | `DStr(W0 Total_Vente,'DD/MM/YYYY')` |
| 2 | `IF(Trim({0,53})='1','ALLER',IF(Trim({0,53})='2','RETOUR',...` | `IF(Trim(W0 Nom de la rue)='1','ALLER',IF(Trim(W0 Nom de l...` |
| 3 | `MlsTrans ('Verifier que la transaction est bien pour')&' ...` | `MlsTrans ('Verifier que la transaction est bien pour')&' ...` |
| 4 | `Date ()` | `Date ()` |
| 5 | `IF({0,183}=0,IF({0,23}='VSL',{0,13},Date()),{0,96})` | `IF({0,183}=0,IF(W0 sous-imput.='VSL',Bouton Ok,Date()),W0...` |
| 6 | `NOT {32768,38}` | `NOT VG.VG GIFT PASS_V2.00` |
| 7 | `{32768,2}` | `VG.Retour Chariot` |
| 8 | `Trim ({0,143})` | `Trim (V.Total carte)` |
| 9 | `154` | `154` |
| 10 | `{0,1}` | `W0 Retour Transmission TPE` |
| 11 | `{0,5}` | `W0 Fin Transaction TPE` |
| 12 | `{0,6}` | `v. titre` |
| 13 | `'F'` | `'F'` |
| 14 | `Date ()` | `Date ()` |
| 15 | `{0,49}*{0,48}` | `W0 Titre*W0 Date du transfert Retour` |
| 16 | `({0,49}*{0,48})-{0,95}` | `(W0 Titre*W0 Date du transfert Retour)-W0 forfait date(O/N)` |
| 17 | `'FALSE'LOG` | `'FALSE'LOG` |
| 18 | `'N'` | `'N'` |
| 19 | `1` | `1` |
| 20 | `'CAISSE'` | `'CAISSE'` |
| 21 | `{0,21}` | `W0 Code reduction` |
| 22 | `{0,49}>0 AND {0,48}=0` | `W0 Titre>0 AND W0 Date du transfert Retour=0` |
| 23 | `{0,117} AND {0,42}='N'` | `Bouton Ok AND W0 Type d'endroit Aller='N'` |
| 24 | `{0,48}>{0,118} AND NOT ({0,149})` | `W0 Date du transfert Retour>W0 Lien Logement Lieu Séjour ...` |
| 25 | `{0,119}=0 AND {0,43}<>'' AND {0,93}<>100 AND {0,23}<>'VRL...` | `V.VADA ?=0 AND W0 Code Gare/Aéroport Aller<>'' AND W0 for...` |
| 26 | `{0,23}='VRL' OR {0,23}='VSL'` | `W0 sous-imput.='VRL' OR W0 sous-imput.='VSL'` |
| 306 | `NOT({0,188})` | `NOT({0,188})` |
| 28 | `{0,49}>0 AND {0,129}='N'` | `W0 Titre>0 AND v.NumeroTicket(VRL/VSL)='N'` |
| 29 | `({0,49}=0) AND (ExpCalc('55'EXP))` | `(W0 Titre=0) AND (ExpCalc('55'EXP))` |
| 30 | `({0,49}=0) AND {0,23}<>'VRL' AND (ExpCalc('55'EXP))` | `(W0 Titre=0) AND W0 sous-imput.<>'VRL' AND (ExpCalc('55'E...` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 30 (9 W / 21 R) |
| Parametres | 20 |
| Variables locales | 171 |
| Expressions | 849 |
| Expressions 100% decodees | 547 (64%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*
