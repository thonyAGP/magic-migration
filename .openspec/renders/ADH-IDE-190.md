# ADH IDE 190 - Menu solde d'un compte

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_189.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 190 |
| **Fichier XML** | Prg_189.xml |
| **Description** | Menu solde d'un compte |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 21 |
| **Module** | ADH |
| **Dossier IDE** | Solde |

> **Note**: Ce programme est Prg_189.xml. L'ID XML (189) peut differer de la position IDE (190).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-190.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (2 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #40 | `cafil018_dat` | comptable________cte | R | 1x |
| #47 | `cafil025_dat` | compte_gm________cgm | R | 1x |

---

## 3. PARAMETRES D'ENTREE (21)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P. Societe | ALPHA | - |
| P2 | P. Code GM | NUMERIC | - |
| P3 | P. Filiation | NUMERIC | - |
| P4 | P. Masque montant | ALPHA | - |
| P5 | P. Uni/Bilateral | ALPHA | - |
| P6 | P. devise locale | ALPHA | - |
| P7 | P. nb decimale | NUMERIC | - |
| P8 | P. village à CAM ? | ALPHA | - |
| P9 | P. solde compte | NUMERIC | - |
| P10 | P. etat compte | ALPHA | - |
| P11 | P. date du solde | DATE | - |
| P12 | P. garanti O/N | ALPHA | - |
| P13 | P. code retour | ALPHA | - |
| P14 | P. nom village | ALPHA | - |
| P15 | P. village à tel ? | ALPHA | - |
| P16 | P. tel à cam ? | ALPHA | - |
| P17 | P. village à bibop ? | ALPHA | - |
| P18 | P. type triplet | ALPHA | - |
| P19 | P. type interface | ALPHA | - |
| P20 | P. telephone | ALPHA | - |
| P21 | P. fax | ALPHA | - |
| P22 | W0 choix action | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 choix action | ALPHA | - |
| v.titre | ALPHA | - |
| v.libelle solde | ALPHA | - |
| v.fin | LOGICAL | - |
| v.ConfirmationFacture | NUMERIC | - |

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

## 5. EXPRESSIONS (29 total, 24 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Date ()` | `Date ()` |
| 2 | `{32768,2}` | `VG.Retour Chariot` |
| 3 | `Trim ({0,24})` | `Trim (v.libelle solde)` |
| 4 | `37` | `37` |
| 5 | `''` | `''` |
| 6 | `{0,22}='1'` | `N Confirmation annule solde='1'` |
| 7 | `{0,9}<>0` | `P. etat compte<>0` |
| 8 | `{0,26}` | `L Existe Ecriture S` |
| 9 | `'TRUE'LOG` | `'TRUE'LOG` |
| 10 | `{0,22}='2' AND {0,10}='S'` | `N Confirmation annule solde='2' AND P. date du solde='S'` |
| 11 | `NOT ({0,27})` | `NOT (V Date/Heure session)` |
| 12 | `{0,27}` | `V Date/Heure session` |
| 13 | `{0,23}=6` | `v.titre=6` |
| 14 | `{0,10}='S'` | `P. date du solde='S'` |
| 15 | `{0,1}` | `P. Code GM` |
| 16 | `{0,2}` | `P. Filiation` |
| 17 | `{0,31} = 'S' AND {32768,53} AND {0,22}='1'` | `{0,31} = 'S' AND VG.Facture V3.00 AND N Confirmation annu...` |
| 18 | `{0,32} = 1` | `{0,32} = 1` |
| 19 | `IF(Trim({32768,115})<>'','\|','')&'ANNULATION DE SOLDE'` | `IF(Trim(VG.v.Service)<>'','\|','')&'ANNULATION DE SOLDE'` |
| 20 | `{32768,111} AND {32768,112}<>0` | `VG. Interface Galaxy Grèce AND VG.Second Safe Control 1.0...` |
| 21 | `IF(Trim({32768,115})<>'','\|','')&'SOLDE'` | `IF(Trim(VG.v.Service)<>'','\|','')&'SOLDE'` |
| 22 | `IF(Trim({32768,115})<>'','\|','')&'FACTURE'` | `IF(Trim(VG.v.Service)<>'','\|','')&'FACTURE'` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `'S'` | `'S'` |
| 4 | `{0,6}` | `P. nb decimale` |
| 5 | `Counter (0)=1` | `Counter (0)=1` |
| 6 | `'TRUE'LOG` | `'TRUE'LOG` |
| 7 | `{0,7}<>'A' AND IF ({0,8}='O',Trim ({0,9})=Trim ({32768,1}...` | `P. village à CAM ?<>'A' AND IF (P. solde compte='O',Trim ...` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 (0 W / 2 R) |
| Parametres | 21 |
| Variables locales | 29 |
| Expressions | 29 |
| Expressions 100% decodees | 24 (83%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

