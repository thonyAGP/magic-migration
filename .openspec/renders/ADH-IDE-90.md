# ADH IDE 90 - Edition Facture Tva(Compta&Ve)

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_90.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 90 |
| **Fichier XML** | Prg_90.xml |
| **Description** | Edition Facture Tva(Compta&Ve) |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 12 |
| **Module** | ADH |
| **Dossier IDE** | Factures |

> **Note**: Ce programme est Prg_90.xml. L'ID XML (90) peut differer de la position IDE (90).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-90.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (8 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #27 | `cafil005_dat` | donnees_village__dvi | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |
| #744 | `pv_lieux_vente` | pv_lieux_vente | R | 1x |
| #866 | `maj_appli_tpe` | maj_appli_tpe | R | 1x |
| #867 | `log_maj_tpe` | log_maj_tpe | R | 2x |
| #869 | `detail_import_boutique` | Detail_Import_Boutique | R | 1x |
| #932 | `taxe_add_param` | taxe_add_param | R | 1x |

---

## 3. PARAMETRES D'ENTREE (12)

| # | Nom | Type | Description |
|---|-----|------|-------------|

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

> Total: 142 variables mappees

---

## 5. EXPRESSIONS (39 total, 11 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,5}` | `P.Service` |
| 2 | `IF(Trim({32768,22})='','N12.2Z',{32768,22})` | `IF(Trim(VG.MASQUE MONTANT)='','N12.2Z',VG.MASQUE MONTANT)` |
| 3 | `INIPut('EmbedFonts=N','FALSE'LOG)` | `INIPut('EmbedFonts=N','FALSE'LOG)` |
| 4 | `INIPut('CompressPDF =Y','FALSE'LOG)` | `INIPut('CompressPDF =Y','FALSE'LOG)` |
| 1 | `Trim({1,4})` | `Trim({1,4})` |
| 2 | `Trim({1,15})` | `Trim({1,15})` |
| 3 | `Trim({1,23})` | `Trim({1,23})` |
| 4 | `IF({1,10},Trim(Str({0,44},'10P0Z')),GetParam('GM_ADHN'))` | `IF({1,10},Trim(Str({0,44},'10P0Z')),GetParam('GM_ADHN'))` |
| 5 | `IF({1,10},Trim(Str({0,39},'8P0')),GetParam('GM_ACCN'))` | `IF({1,10},Trim(Str({0,39},'8P0')),GetParam('GM_ACCN'))` |
| 6 | `Trim({1,16})` | `Trim({1,16})` |
| 7 | `Trim({1,14})` | `Trim({1,14})` |
| 8 | `Trim({1,17})` | `Trim({1,17})` |
| 9 | `Trim({1,19})` | `Trim({1,19})` |
| 10 | `'Facture N° '&Trim({1,40})&Trim(Str({1,5},'8P0'))&' du '&...` | `'Facture N° '&Trim({1,40})&Trim(Str({1,5},'8P0'))&' du '&...` |
| 11 | `{1,1}` | `{1,1}` |
| 12 | `{1,2}` | `{1,2}` |
| 13 | `{1,3}` | `{1,3}` |
| 14 | `CndRange(NOT({1,12}),Date())` | `CndRange(NOT({1,12}),Date())` |
| 15 | `IF({1,10},Trim({0,45})&' '&Trim({0,46}),Trim({0,33})&' '&...` | `IF({1,10},Trim({0,45})&' '&Trim({0,46}),Trim({0,33})&' '&...` |
| 16 | `{0,16}<>0` | `{0,16}<>0` |
| 17 | `'Téléphone :'&Trim({1,27})&' - ''Fax :'&Trim({1,28})&' - ...` | `'Téléphone :'&Trim({1,27})&' - ''Fax :'&Trim({1,28})&' - ...` |
| 18 | `NOT({1,7})` | `NOT({1,7})` |
| 19 | `NOT({1,8})` | `NOT({1,8})` |
| 20 | `{0,15}` | `{0,15}` |
| 21 | `Counter(0)=1` | `Counter(0)=1` |
| 22 | `CndRange(NOT({1,12}),IF({1,9},'TRUE'LOG,'FALSE'LOG))` | `CndRange(NOT({1,12}),IF({1,9},'TRUE'LOG,'FALSE'LOG))` |
| 23 | `{0,25}<>'R'` | `{0,25}<>'R'` |
| 24 | `{1,10}` | `{1,10}` |
| 25 | `IF({1,10},{0,49},{0,37})` | `IF({1,10},{0,49},{0,37})` |
| 26 | `{32768,22}` | `VG.MASQUE MONTANT` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 8 (0 W / 8 R) |
| Parametres | 12 |
| Variables locales | 12 |
| Expressions | 39 |
| Expressions 100% decodees | 11 (28%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

