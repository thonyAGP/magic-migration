# ADH IDE 77 - Club Med Pass menu

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_77.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 77 |
| **Fichier XML** | Prg_77.xml |
| **Description** | Club Med Pass menu |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 21 |
| **Module** | ADH |
| **Dossier IDE** | EzCard |

> **Note**: Ce programme est Prg_77.xml. L'ID XML (77) peut differer de la position IDE (77).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-77.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (10 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #312 | `ezcard` | ez_card | **W** | 4x |
| #14 | `bartransacdet` | transac_detail_bar | R | 1x |
| #15 | `bartransacent` | transac_entete_bar | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 2x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #47 | `cafil025_dat` | compte_gm________cgm | R | 1x |
| #131 | `cafil109_dat` | fichier_validation | R | 1x |
| #470 | `%club_user%_caisse_coffre_compcais` | comptage_coffre | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #786 | `qualite_avant_reprise` | qualite_avant_reprise | R | 1x |

---

## 3. PARAMETRES D'ENTREE (21)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | V.Choix action | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V.TAI Obligatoire | ALPHA | - |
| V.Nom complet | ALPHA | - |
| V.Prenom complet | ALPHA | - |
| v.Club Med Pass ID | ALPHA | - |
| V.ID Club Med Pass scannee | ALPHA | - |
| V.Status card | ALPHA | - |
| V.Other card valid | LOGICAL | - |
| V.Date de naissance | DATE | - |
| v.delete confirmation | NUMERIC | - |
| v.ez detail empty | LOGICAL | - |
| v.ok to create | LOGICAL | - |
| V.Action | ALPHA | - |
| V.Choix action | ALPHA | - |
| V.Age mineur | NUMERIC | - |
| v.Activation Bar Limit | ALPHA | - |
| v.Age Bar Limit | NUMERIC | - |
| v.ActionPActive | LOGICAL | - |
| V.Compte scanne | NUMERIC | - |
| V.Compte special | LOGICAL | - |

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

> Total: 198 variables mappees

---

## 5. EXPRESSIONS (109 total, 75 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `''` | `''` |
| 2 | `{0,26}>'' AND {0,39}<>{0,2}` | `V.Status card>'' AND V.Compte special<>P.Filiation` |
| 3 | `IF (GetParam ('CODELANGUE')='FRA','Cette carte n''apparti...` | `IF (GetParam ('CODELANGUE')='FRA','Cette carte n''apparti...` |
| 4 | `Date ()` | `Date ()` |
| 5 | `{32768,2}` | `VG.Retour Chariot` |
| 6 | `{0,27}='V'` | `V.Other card valid='V'` |
| 7 | `{0,27}='O' AND NOT ({0,28}) AND {0,42}='O' AND {0,44}<={0...` | `V.Other card valid='O' AND NOT (V.Date de naissance) AND ...` |
| 8 | `IF ({0,36}='O',IF ({0,37}=0,'Bar Limit Activated for All'...` | `IF (v.Age Bar Limit='O',IF (v.ActionPActive=0,'Bar Limit ...` |
| 9 | `IF ({0,36}='O',IF ({0,37}=0,'TRUE'LOG,IF ({0,29}=0,'FALSE...` | `IF (v.Age Bar Limit='O',IF (v.ActionPActive=0,'TRUE'LOG,I...` |
| 10 | `{0,1}` | `P.Code 8 chiffres` |
| 11 | `{0,2}` | `P.Filiation` |
| 12 | `{0,3}` | `P.Masque montant` |
| 13 | `'EZGUA'` | `'EZGUA'` |
| 14 | `'H'` | `'H'` |
| 15 | `{0,33}='A'` | `V.Choix action='A'` |
| 16 | `IF (GetParam ('CODELANGUE')='FRA','Ce compte n''est pas g...` | `IF (GetParam ('CODELANGUE')='FRA','Ce compte n''est pas g...` |
| 17 | `{0,42}<>'O' AND {0,51}='Oui' AND IF ({0,52},{0,52},{0,48}...` | `{0,42}<>'O' AND {0,51}='Oui' AND IF ({0,52},{0,52},{0,48}...` |
| 18 | `{0,42}='O' OR {0,51}='Non' OR {0,48}='N' OR {32768,74}` | `{0,42}='O' OR {0,51}='Non' OR {0,48}='N' OR VG.Identifica...` |
| 19 | `{0,32}` | `V.Action` |
| 20 | `{0,25}>'' AND {0,32}` | `V.ID Club Med Pass scannee>'' AND V.Action` |
| 21 | `{0,33}='C' OR {0,33}='D'` | `V.Choix action='C' OR V.Choix action='D'` |
| 22 | `IF (GetParam ('CODELANGUE')='FRA',IF ({0,33}='C','Voulez ...` | `IF (GetParam ('CODELANGUE')='FRA',IF (V.Choix action='C',...` |
| 23 | `{0,30}=6` | `v.ez detail empty=6` |
| 24 | `{0,33}='E' OR {0,33}='B'` | `V.Choix action='E' OR V.Choix action='B'` |
| 25 | `IF (GetParam ('CODELANGUE')='FRA','Il n''y a pas de trans...` | `IF (GetParam ('CODELANGUE')='FRA','Il n''y a pas de trans...` |
| 26 | `{0,31}` | `v.ok to create` |
| 27 | `{0,33}='Z'` | `V.Choix action='Z'` |
| 28 | `{0,33}='F'` | `V.Choix action='F'` |
| 29 | `{0,33}='P'` | `V.Choix action='P'` |
| 30 | `{0,38}` | `V.Compte scanne` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 10 ( W / 9 R) |
| Parametres | 21 |
| Variables locales | 40 |
| Expressions | 109 |
| Expressions 100% decodees | 75 (69%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

