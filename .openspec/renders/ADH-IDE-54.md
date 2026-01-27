# ADH IDE 54 - Factures_Check_Out

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_54.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 54 |
| **Fichier XML** | Prg_54.xml |
| **Description** | Factures_Check_Out |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 8 |
| **Module** | ADH |
| **Dossier IDE** | Easy Check Out |

> **Note**: Ce programme est Prg_54.xml. L'ID XML (54) peut differer de la position IDE (54).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-54.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (8 tables - 3 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #866 | `maj_appli_tpe` | maj_appli_tpe | **W** | 8x |
| #870 | `rayons_boutique` | Rayons_Boutique | **W** | 5x |
| #932 | `taxe_add_param` | taxe_add_param | **W** | 2x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |
| #867 | `log_maj_tpe` | log_maj_tpe | R | 1x |
| #868 | `affectation_gift_pass` | Affectation_Gift_Pass | R | 1x |

---

## 3. PARAMETRES D'ENTREE (8)

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
| V.No Facture | NUMERIC | - |
| V.Nom Fichier PDF | ALPHA | - |
| V.Pos , | NUMERIC | - |
| V.Service | ALPHA | - |
| V.Fact déjà editée | LOGICAL | - |
| V.Date Début Hebergement | DATE | - |
| V.Date Fin Hebergement | DATE | - |
| V.Existe non facturee ? | LOGICAL | - |
| V.Existe flaguee ? | LOGICAL | - |

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

> Total: 174 variables mappees

---

## 5. EXPRESSIONS (146 total, 77 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `P.i.Code_Gm` |
| 2 | `{0,2}` | `P.i.Filiation` |
| 3 | `{0,3}` | `P.i.Application` |
| 4 | `{0,10}` | `V.Existe facture ?` |
| 5 | `{0,11}` | `V.Nom` |
| 6 | `IF({0,42},Trim({0,45}),Trim({0,23})&' '&Trim({0,24}))` | `IF({0,42},Trim({0,45}),Trim(V.Fact déjà editée)&' '&Trim(...` |
| 7 | `IF({0,42},Trim({0,44}),Trim({0,19})&' '&Trim({0,21})&' '&...` | `IF({0,42},Trim({0,44}),Trim(V.No Facture)&' '&Trim(V.Pos ...` |
| 8 | `IF({0,42},Trim({0,46}),Trim({0,25}))` | `IF({0,42},Trim({0,46}),Trim(V.Date Fin Hebergement))` |
| 9 | `IF({0,42},Trim({0,47}),Trim({0,27}))` | `IF({0,42},Trim({0,47}),Trim(V.Existe flaguee ?))` |
| 10 | `IF({0,42},Trim({0,49}),Trim({0,29}))` | `IF({0,42},Trim({0,49}),Trim({0,29}))` |
| 11 | `'Numéro d''adhérent'&' '&Trim(Str({0,22},'10Z'))` | `'Numéro d''adhérent'&' '&Trim(Str(V.Service,'10Z'))` |
| 12 | `Trim({0,31})&Trim(Str(Year(Date()),'4'))&Trim(Str(Month(D...` | `Trim({0,31})&Trim(Str(Year(Date()),'4'))&Trim(Str(Month(D...` |
| 13 | `Trim({0,31})&Trim(Str(Year(Date()),'4'))&Trim(Str(Month(D...` | `Trim({0,31})&Trim(Str(Year(Date()),'4'))&Trim(Str(Month(D...` |
| 14 | `NOT({0,62})` | `NOT({0,62})` |
| 15 | `{0,62}` | `{0,62}` |
| 16 | `MID(GetParam('SERVICE'),4,{0,60}-4)` | `MID(GetParam('SERVICE'),4,{0,60}-4)` |
| 17 | `InStr(GetParam('SERVICE'),',')` | `InStr(GetParam('SERVICE'),',')` |
| 18 | `{32768,2}` | `VG.Retour Chariot` |
| 19 | `Date()` | `Date()` |
| 20 | `{0,58}` | `{0,58}` |
| 21 | `'TRUE'LOG` | `'TRUE'LOG` |
| 22 | `'FALSE'LOG` | `'FALSE'LOG` |
| 23 | `IF(Trim({0,6}) <> '',Trim({0,6}) & Trim({0,59}), Translat...` | `IF(Trim(P.i.TypeReglement) <> '',Trim(P.i.TypeReglement) ...` |
| 24 | `'FALSE'LOG` | `'FALSE'LOG` |
| 25 | `{0,65}` | `{0,65}` |
| 26 | `{0,66}` | `{0,66}` |
| 27 | `Trim({0,50})<>''` | `Trim({0,50})<>''` |
| 28 | `{0,40}` | `{0,40}` |
| 29 | `{0,48}` | `{0,48}` |
| 30 | `NOT {0,42}` | `NOT {0,42}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 8 (3 W / 5 R) |
| Parametres | 8 |
| Variables locales | 28 |
| Expressions | 146 |
| Expressions 100% decodees | 77 (53%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

