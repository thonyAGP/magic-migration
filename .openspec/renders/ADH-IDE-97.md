# ADH IDE 97 - Factures (Tble Compta&Vent) V3

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_97.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 97 |
| **Fichier XML** | Prg_97.xml |
| **Description** | Factures (Tble Compta&Vent) V3 |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 6 |
| **Module** | ADH |
| **Dossier IDE** | Factures V3 |

> **Note**: Ce programme est Prg_97.xml. L'ID XML (97) peut differer de la position IDE (97).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-97.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (16 tables - 7 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #40 | `cafil018_dat` | comptable________cte | **W** | 1x |
| #263 | `caisse_vente` | vente | **W** | 1x |
| #746 | `version` | projet | **W** | 1x |
| #866 | `maj_appli_tpe` | maj_appli_tpe | **W** | 12x |
| #868 | `affectation_gift_pass` | Affectation_Gift_Pass | **W** | 2x |
| #870 | `rayons_boutique` | Rayons_Boutique | **W** | 7x |
| #911 | `log_booker` | log_booker | **W** | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #121 | `cafil099_dat` | tables_pays_ventes | R | 1x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |
| #744 | `pv_lieux_vente` | pv_lieux_vente | R | 1x |
| #786 | `qualite_avant_reprise` | qualite_avant_reprise | R | 1x |
| #867 | `log_maj_tpe` | log_maj_tpe | R | 2x |
| #871 | `activite` | Activite | R | 1x |
| #932 | `taxe_add_param` | taxe_add_param | R | 1x |

---

## 3. PARAMETRES D'ENTREE (6)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V.Lien Gm_Complet | LOGICAL | - |
| V.Lien Pied de facture | LOGICAL | - |
| V.Existe facture ? | LOGICAL | - |
| V.Nom | ALPHA | - |
| V.Adresse | ALPHA | - |
| V.CP | ALPHA | - |
| V.Ville | ALPHA | - |
| V.Pays | UNICODE | - |
| V.Telephone | ALPHA | - |
| V.Facture Sans Nom | LOGICAL | - |
| V.Facture Sans Adresse | LOGICAL | - |
| V.Reponse Imprimer | NUMERIC | - |
| V.No Facture | NUMERIC | - |
| V.Nom Fichier PDF | ALPHA | - |
| V.Pos , | NUMERIC | - |
| V.Service | ALPHA | - |
| V.Fact déjà editée | LOGICAL | - |
| V.Date Début Hebergement | DATE | - |
| V.Date Fin Hebergement | DATE | - |
| v.MessageValidationIdentite | UNICODE | - |

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

> Total: 194 variables mappees

---

## 5. EXPRESSIONS (318 total, 185 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'Hébergement'` | `'Hébergement'` |
| 2 | `{0,1}` | `P.i.Code_Gm` |
| 3 | `{0,2}` | `P.i.Filiation` |
| 4 | `{0,3}` | `P.i.Application` |
| 5 | `{0,6}` | `V.Lien Gm_Complet` |
| 6 | `{0,8}` | `V.Existe facture ?` |
| 7 | `{0,2}` | `P.i.Filiation` |
| 8 | `{0,9}` | `V.Nom` |
| 9 | `StrBuild(MlsTrans('Numéro d''adhérent @1@'),IF({0,5},Str(...` | `StrBuild(MlsTrans('Numéro d''adhérent @1@'),IF(P.i.Date P...` |
| 10 | `'Quitter'` | `'Quitter'` |
| 11 | `'Imprimer'` | `'Imprimer'` |
| 12 | `'R.à.z'` | `'R.à.z'` |
| 13 | `MlsTrans('Confirmez vous l''édition de cette facture ?')` | `MlsTrans('Confirmez vous l''édition de cette facture ?')` |
| 14 | `Trim({0,45}) &Trim(Str(Year(Date()),'4'))&Trim(Str(Month(...` | `Trim({0,45}) &Trim(Str(Year(Date()),'4'))&Trim(Str(Month(...` |
| 15 | `Trim({0,45}) &Trim(Str(Year(Date()),'4'))&Trim(Str(Month(...` | `Trim({0,45}) &Trim(Str(Year(Date()),'4'))&Trim(Str(Month(...` |
| 16 | `NOT({0,79}) OR {0,94}` | `NOT({0,79}) OR {0,94}` |
| 17 | `{0,79} AND NOT({0,94}) AND {0,99} > 2` | `{0,79} AND NOT({0,94}) AND {0,99} > 2` |
| 18 | `MID(GetParam('SERVICE'),4,{0,77}-4)` | `MID(GetParam('SERVICE'),4,{0,77}-4)` |
| 19 | `{0,70}` | `{0,70}` |
| 20 | `InStr(GetParam('SERVICE'),',')` | `InStr(GetParam('SERVICE'),',')` |
| 21 | `{32768,2}` | `VG.Retour Chariot` |
| 22 | `Date()` | `Date()` |
| 23 | `{0,75}` | `{0,75}` |
| 24 | `'TRUE'LOG` | `'TRUE'LOG` |
| 25 | `'FALSE'LOG` | `'FALSE'LOG` |
| 26 | `'FALSE'LOG` | `'FALSE'LOG` |
| 27 | `{0,94}` | `{0,94}` |
| 28 | `NOT {0,95}` | `NOT {0,95}` |
| 29 | `{0,99} > 2` | `{0,99} > 2` |
| 30 | `{0,95}` | `{0,95}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 16 (7 W / 9 R) |
| Parametres | 6 |
| Variables locales | 38 |
| Expressions | 318 |
| Expressions 100% decodees | 185 (58%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

