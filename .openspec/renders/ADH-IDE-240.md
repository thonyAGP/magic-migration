# ADH IDE 240 - Transaction Nouv vente PMS-710

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_236.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 240 |
| **Fichier XML** | Prg_236.xml |
| **Description** | Transaction Nouv vente PMS-710 |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 24 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_236.xml. L'ID XML (236) peut differer de la position IDE (240).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-240.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (32 tables - 10 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #32 | `cafil010_dat` | prestations | **W** | 5x |
| #46 | `cafil024_dat` | mvt_prestation___mpr | **W** | 3x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 1x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 10x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 16x |
| #899 | `Boo_ResultsRechercheHoraire` | Boo_ResultsRechercheHoraire | **W** | 9x |
| #1037 | `Table_1037` | Unknown | **W** | 4x |
| #1047 | `Table_1047` | Unknown | **W** | 2x |
| #26 | `cafil004_dat` | comptes_speciaux_spc | R | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 3x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #39 | `cafil017_dat` | depot_garantie___dga | R | 1x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 3x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 5x |
| #79 | `cafil057_dat` | gratuites________gra | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 9x |
| #96 | `cafil074_dat` | table_prestation_pre | R | 2x |
| #103 | `cafil081_dat` | logement_client__loc | R | 1x |
| #108 | `cafil086_dat` | code_logement____clo | R | 1x |
| #109 | `cafil087_dat` | table_utilisateurs | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #140 | `cafil118_dat` | moyen_paiement___mop | R | 1x |
| #197 | `caisse_artstock` | articles_en_stock | R | 2x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |
| #697 | `droits` | droits_applications | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #801 | `moyens_reglement_complem` | moyens_reglement_complem | R | 1x |
| #818 | `zcircafil146` | Circuit supprime | R | 1x |

---

## 3. PARAMETRES D'ENTREE (24)

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

| Nom | Type | Role |
|-----|------|------|
| W0 FIN SAISIE OD | LOGICAL | - |
| W0 Cloture en cours | LOGICAL | - |
| W0 code article | NUMERIC | - |
| v.SoldeGiftPass | NUMERIC | - |
| W0 imputation | NUMERIC | - |
| W0 sous-imput. | NUMERIC | - |
| W0 date d'achat | DATE | - |
| W0 annulation | ALPHA | - |
| W0 service village | ALPHA | - |
| W0 libelle article | ALPHA | - |
| W0 article dernière minute | LOGICAL | - |
| W0 nbre articles | NUMERIC | - |
| W0 prix unitaire | NUMERIC | - |
| W0 Categorie de chambre | ALPHA | - |
| W0 Lieu sejour | ALPHA | - |
| W0 Code reduction | ALPHA | - |
| v.Date activité VAE | DATE | - |
| v.VAE pendant le séjour ? | LOGICAL | - |
| v.Matin/Après midi | UNICODE | - |
| W0 Sens du transfert Aller | ALPHA | - |

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

> Total: 388 variables mappees

---

## 5. EXPRESSIONS (1063 total, 709 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `DStr({0,7},'DD/MM/YYYY')` | `DStr(W0 Total_Vente,'DD/MM/YYYY')` |
| 2 | `IF(Trim({0,54})='1','ALLER',IF(Trim({0,54})='2','RETOUR',...` | `IF(Trim(W0 Commune)='1','ALLER',IF(Trim(W0 Commune)='2','...` |
| 3 | `MlsTrans ('Verifier que la transaction est bien pour')&' ...` | `MlsTrans ('Verifier que la transaction est bien pour')&' ...` |
| 4 | `Date ()` | `Date ()` |
| 5 | `IF({0,184}=0,IF({0,23}='VSL',{0,13},Date()),{0,97})` | `IF(v.email=0,IF(W0 imputation='VSL',Bouton Ok,Date()),W0 ...` |
| 6 | `NOT {32768,38}` | `NOT VG.VG GIFT PASS_V2.00` |
| 7 | `{32768,2}` | `VG.Retour Chariot` |
| 8 | `Trim ({0,144})` | `Trim (V.Num Auto)` |
| 9 | `154` | `154` |
| 10 | `{0,1}` | `W0 Retour Transmission TPE` |
| 11 | `{0,5}` | `W0 Fin Transaction TPE` |
| 12 | `{0,6}` | `v. titre` |
| 13 | `'F'` | `'F'` |
| 14 | `Date ()` | `Date ()` |
| 15 | `{0,50}*{0,49}` | `W0 Nom*W0 Titre` |
| 16 | `({0,50}*{0,49})-{0,96}` | `(W0 Nom*W0 Titre)-W0 forfait date(O/N)` |
| 17 | `'FALSE'LOG` | `'FALSE'LOG` |
| 18 | `'N'` | `'N'` |
| 19 | `1` | `1` |
| 20 | `'CAISSE'` | `'CAISSE'` |
| 21 | `{0,21}` | `W0 Code reduction` |
| 22 | `{0,50}>0 AND {0,49}=0` | `W0 Nom>0 AND W0 Titre=0` |
| 23 | `{0,118} AND {0,43}='N'` | `Bouton Ok AND W0 Type d'endroit Aller='N'` |
| 24 | `{0,49}>{0,119} AND NOT ({0,150})` | `W0 Titre>W0 Lien Logement Lieu Séjour AND NOT (V.SoldeRes...` |
| 25 | `{0,120}=0 AND {0,44}<>'' AND {0,94}<>100 AND {0,23}<>'VRL...` | `V.VADA ?=0 AND W0 Code Gare/Aéroport Aller<>'' AND W0 for...` |
| 26 | `{0,23}='VRL' OR {0,23}='VSL'` | `W0 imputation='VRL' OR W0 imputation='VSL'` |
| 353 | `NOT({0,189})` | `NOT(v. pied stype existe?)` |
| 28 | `{0,50}>0 AND {0,130}='N'` | `W0 Nom>0 AND v.NumeroTicket(VRL/VSL)='N'` |
| 29 | `({0,50}=0) AND (ExpCalc('55'EXP))` | `(W0 Nom=0) AND (ExpCalc('55'EXP))` |
| 30 | `({0,50}=0) AND {0,23}<>'VRL' AND (ExpCalc('55'EXP))` | `(W0 Nom=0) AND W0 imputation<>'VRL' AND (ExpCalc('55'EXP))` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 32 (10 W / 22 R) |
| Parametres | 24 |
| Variables locales | 202 |
| Expressions | 1063 |
| Expressions 100% decodees | 709 (67%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

