# ADH IDE 242 - Menu Choix Saisie/Annul vente

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_238.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 242 |
| **Fichier XML** | Prg_238.xml |
| **Description** | Menu Choix Saisie/Annul vente |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 16 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_238.xml. L'ID XML (238) peut differer de la position IDE (242).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-242.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (4 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #38 | `cafil016_dat` | comptable_gratuite | **W** | 2x |
| #264 | `caisse_vente_gratuite` | vente_gratuite | R | 1x |
| #400 | `pv_rentals_dat` | pv_cust_rentals | R | 1x |
| #804 | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | R | 1x |

---

## 3. PARAMETRES D'ENTREE (16)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P.Societe | ALPHA | - |
| P2 | P.Devise locale | ALPHA | - |
| P3 | P.Code GM | NUMERIC | - |
| P4 | P.Filiation | NUMERIC | - |
| P5 | P.Etat compte | ALPHA | - |
| P6 | W0 choix action | ALPHA | - |
| P7 | v.fin | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 choix action | ALPHA | - |
| v.fin | LOGICAL | - |
| V.Existe IGR ? | LOGICAL | - |
| V.Existe Gratuité ? | LOGICAL | - |
| V.Session ouverte ? | LOGICAL | - |

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

> Total: 160 variables mappees

---

## 5. EXPRESSIONS (40 total, 33 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Date ()` | `Date ()` |
| 2 | `{32768,2}` | `VG.Retour Chariot` |
| 3 | `''` | `''` |
| 4 | `{0,17}='1'` | `v.fin='1'` |
| 5 | `{0,18}` | `V.Existe IGR ?` |
| 6 | `'TRUE'LOG` | `'TRUE'LOG` |
| 7 | `{0,17}='2'` | `v.fin='2'` |
| 8 | `DbDel('{933,4}'DSOURCE,'')` | `DbDel('{933,4}'DSOURCE,'')` |
| 9 | `{0,17}='3'` | `v.fin='3'` |
| 10 | `{0,17}='4'` | `v.fin='4'` |
| 11 | `{32768,3} OR {32768,47}` | `VG.DROIT ACCES IT ? OR VG.USER RFI / RESPONSABLE RECEP` |
| 12 | `{0,17}='3' OR {0,17}='4'` | `v.fin='3' OR v.fin='4'` |
| 13 | `({32768,3} OR {32768,47}) AND {0,19}` | `(VG.DROIT ACCES IT ? OR VG.USER RFI / RESPONSABLE RECEP) ...` |
| 14 | `({32768,3} OR {32768,47}) AND {0,20}` | `(VG.DROIT ACCES IT ? OR VG.USER RFI / RESPONSABLE RECEP) ...` |
| 15 | `NOT {0,16}` | `NOT W0 choix action` |
| 16 | `NOT {32768,81}` | `NOT VG.VG Email des reçus de vente V1` |
| 17 | `NOT({32768,83}) AND NOT({32768,85})` | `NOT(VG.VG Envoi Mail paiement VAD) AND NOT(VG.VG Fusion L...` |
| 18 | `{32768,83} AND NOT {32768,85}` | `VG.VG Envoi Mail paiement VAD AND NOT VG.VG Fusion Liste ...` |
| 19 | `NOT {32768,85} OR {32768,3}` | `NOT VG.VG Fusion Liste Operations OR VG.DROIT ACCES IT ?` |
| 20 | `NOT {32768,89}` | `NOT VG.Modif ligne de vente actif ?` |
| 21 | `{32768,89} AND NOT {32768,93}` | `VG.Modif ligne de vente actif ? AND NOT VG.Mail Vente Ass...` |
| 22 | `{32768,89} AND {32768,93}` | `VG.Modif ligne de vente actif ? AND VG.Mail Vente Ass. 0 ...` |
| 23 | `CallProg('{323,-1}'PROG)` | `CallProg('{323,-1}'PROG)` |
| 24 | `NOT({0,21}) AND NOT({32768,3})` | `NOT({0,21}) AND NOT(VG.DROIT ACCES IT ?)` |
| 25 | `IF(Trim({32768,115})<>'',Trim({32768,115})&'\|','')&'VENTE'` | `IF(Trim(VG.v.Service)<>'',Trim(VG.v.Service)&'\|','')&'VE...` |
| 26 | `{32768,111} AND {32768,112}<>0` | `VG. Interface Galaxy Grèce AND VG.Second Safe Control 1.0...` |
| 27 | `IF(Trim({32768,115})<>'',Trim({32768,115})&'\|','')&'HIST...` | `IF(Trim(VG.v.Service)<>'',Trim(VG.v.Service)&'\|','')&'HI...` |
| 28 | `IF(Trim({32768,115})<>'',Trim({32768,115})&'\|','')&'HIST...` | `IF(Trim(VG.v.Service)<>'',Trim(VG.v.Service)&'\|','')&'HI...` |
| 29 | `IF(Trim({32768,115})<>'',Trim({32768,115})&'\|','')&'HIST...` | `IF(Trim(VG.v.Service)<>'',Trim(VG.v.Service)&'\|','')&'HI...` |
| 1 | `{1,1}` | `{1,1}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 ( W / 3 R) |
| Parametres | 16 |
| Variables locales | 21 |
| Expressions | 40 |
| Expressions 100% decodees | 33 (82%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

