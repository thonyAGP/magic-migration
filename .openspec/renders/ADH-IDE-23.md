# ADH IDE 23 - Print reçu change achat

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_23.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 23 |
| **Fichier XML** | Prg_23.xml |
| **Description** | Print reçu change achat |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 14 |
| **Module** | ADH |
| **Dossier IDE** | Change |

> **Note**: Ce programme est Prg_23.xml. L'ID XML (23) peut differer de la position IDE (23).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-23.yaml`
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
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 7x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #44 | `cafil022_dat` | change___________chg | R | 8x |
| #122 | `cafil100_dat` | unilateral_bilateral | R | 1x |
| #324 | `fraissurchange_dat` | frais_change___fchg | R | 1x |
| #368 | `pmsvillage` | pms_village | R | 1x |
| #474 | `%club_user%_caisse_compcais_devise` | comptage_caisse_devise | R | 7x |

---

## 3. PARAMETRES D'ENTREE (14)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 n° adherent | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 date | DATE | - |
| P5 | P0 heure | TIME | - |
| P6 | P0 devise locale | ALPHA | - |
| P7 | P0 nb decimale | NUMERIC | - |
| P8 | P0 masque montant | ALPHA | - |
| P9 | P0 nom village | ALPHA | - |
| P10 | P0 telephone | ALPHA | - |
| P11 | P0 fax | ALPHA | - |
| P12 | W0 en-tête ? | ALPHA | - |
| P13 | W0 fin tâche | ALPHA | - |
| P14 | W0 existe ligne à editer | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 en-tête ? | ALPHA | - |
| W0 fin tâche | ALPHA | - |
| W0 existe ligne à editer | LOGICAL | - |
| v. Operation (Libelle) | ALPHA | - |
| v. Mode paiement (Libelle) | ALPHA | - |
| v. Taux (Libelle) | ALPHA | - |
| v. Montant Devise Local Libelle | ALPHA | - |
| v. Frais de change (Libelle) | ALPHA | - |
| v.Soit (Libelle) | ALPHA | - |
| v. Achat de devise (Libelle) | ALPHA | - |
| v.Message (Libelle) | ALPHA | - |
| v. Paiement (Libelle) | ALPHA | - |
| v. Devise (Libelle) | ALPHA | - |
| v.Montant Product | NUMERIC | - |
| v.Nombre de copies | NUMERIC | - |
| V.Libellé ligne transaction | UNICODE | - |
| V.Libellé ligne acceptation | UNICODE | - |
| V.Edition ligne détail carte? | LOGICAL | - |

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

> Total: 182 variables mappees

---

## 5. EXPRESSIONS (335 total, 219 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (2)` | `SetCrsr (2)` |
| 2 | `SetCrsr (1)` | `SetCrsr (1)` |
| 3 | `{0,1}` | `P0 n° adherent` |
| 4 | `{0,2}` | `P0 filiation` |
| 5 | `{0,4}` | `P0 heure` |
| 6 | `{0,5}` | `P0 devise locale` |
| 7 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 8 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 9 | `GetParam ('CURRENTPRINTERNUM')=5` | `GetParam ('CURRENTPRINTERNUM')=5` |
| 10 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 11 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 12 | `{0,15}` | `W0 fin tâche` |
| 13 | `{0,3}` | `P0 date` |
| 14 | `'A'` | `'A'` |
| 15 | `'Z'` | `'Z'` |
| 16 | `IF ({0,38}='010','Opération N°','Transaction N°')` | `IF ({0,38}='010','Opération N°','Transaction N°')` |
| 17 | `IF ({0,38}='010','Mode de paiement','Payment method')` | `IF ({0,38}='010','Mode de paiement','Payment method')` |
| 18 | `IF ({0,38}='010','Taux','Rate')` | `IF ({0,38}='010','Taux','Rate')` |
| 19 | `IF ({0,38}='010','Montant devise locale','Amount local cu...` | `IF ({0,38}='010','Montant devise locale','Amount local cu...` |
| 20 | `IF ({0,38}='010','Frais de change','Change fees')` | `IF ({0,38}='010','Frais de change','Change fees')` |
| 21 | `IF ({0,38}='010','Soit','Equal')` | `IF ({0,38}='010','Soit','Equal')` |
| 22 | `IF ({0,38}='010','ACHAT DE DEVISES','CURRENCY PURCHASE')` | `IF ({0,38}='010','ACHAT DE DEVISES','CURRENCY PURCHASE')` |
| 23 | `IF ({0,38}='010','Merci de votre visite','Thank you for y...` | `IF ({0,38}='010','Merci de votre visite','Thank you for y...` |
| 24 | `IF ({0,38}='010','Paiement','Payment')` | `IF ({0,38}='010','Paiement','Payment')` |
| 25 | `IF ({0,38}='010','Devise','Currency')` | `IF ({0,38}='010','Devise','Currency')` |
| 26 | `'TRUE'LOG` | `'TRUE'LOG` |
| 27 | `GetParam ('NUMBERCOPIES')` | `GetParam ('NUMBERCOPIES')` |
| 28 | `Trim({0,52})<>'' AND {32768,106}` | `Trim({0,52})<>'' AND VG.Id Log Utilisation ADH` |
| 29 | `'File Number : '&Trim({0,52})` | `'File Number : '&Trim({0,52})` |
| 30 | `'Autorisation Number : '&Trim({0,53})` | `'Autorisation Number : '&Trim({0,53})` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 8 (0 W / 8 R) |
| Parametres | 14 |
| Variables locales | 32 |
| Expressions | 335 |
| Expressions 100% decodees | 219 (65%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

