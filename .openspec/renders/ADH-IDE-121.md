# ADH IDE 121 - Gestion caisse

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_121.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 121 |
| **Fichier XML** | Prg_121.xml |
| **Description** | Gestion caisse |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 17 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_121.xml. L'ID XML (121) peut differer de la position IDE (121).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
- **Qui**: Operateur caisse
- **Quoi**: Gerer les sessions et operations de caisse
- **Pourquoi**: Point d'entree principal pour toutes les operations de caisse du village
### 1.2 Flux Utilisateur
1. Selection depuis menu principal caisse (ADH IDE 1)
2. Verification session existante ou ouverture nouvelle session
3. Affichage tableau de bord caisse avec soldes
4. Acces aux sous-menus (ventes, change, depot, etc.)
5. Gestion des coupures et devises
6. Fermeture session avec validation ecarts

### 1.3 Notes Migration
- Programme central - point d'entree caisse
- 17 parametres d'entree a mapper
- 12 tables dont 5 en ecriture
- Gere concurrence sessions (table caisse_concurrences)
- Interface avec coffre (caisse_session_coffre2)
- Integration Galaxy Grece via VG.Interface Galaxy

### 1.4 Dependances ECF

PARTAGE via ADH.ecf (Sessions_Reprises) - Appele depuis PBP et PVE

### 1.5 Tags
`caisse``, ``ecf-shared``, ``cross-project``, ``critical``, ``session-management`

---

## 2. TABLES (12 tables - 5 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #227 | `caisse_concurrences` | concurrence_sessions | **W** | 1x |
| #244 | `caisse_saisie_appro_dev` | saisie_approvisionnement | **W** | 2x |
| #246 | `caisse_session` | histo_sessions_caisse | **W** | 6x |
| #248 | `caisse_session_coffre2` | sessions_coffre2 | **W** | 3x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | **W** | 4x |
| #23 | `cafil001_dat` | reseau_cloture___rec | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #197 | `caisse_artstock` | articles_en_stock | R | 1x |
| #198 | `caisse_banknote` | coupures_monnaie_locale | R | 1x |
| #232 | `caisse_devise` | gestion_devise_session | R | 1x |
| #697 | `droits` | droits_applications | R | 2x |
| #740 | `pv_stockmvt_dat` | pv_stock_movements | R | 2x |

---

## 3. PARAMETRES D'ENTREE (17)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param Libelle caisse | ALPHA | - |
| P2 | Param Etat caisse | ALPHA | - |
| P3 | Param societe | ALPHA | - |
| P4 | Param devise locale | ALPHA | - |
| P5 | Param nbre decimale | NUMERIC | - |
| P6 | Param masque montant | ALPHA | - |
| P7 | Param code village | ALPHA | - |
| P8 | Param nom village | ALPHA | - |
| P9 | Param masque cumul | ALPHA | - |
| P10 | Param Uni/Bi | ALPHA | - |
| P11 | Param Village TAI | ALPHA | - |
| P12 | Param Mode consultation | LOGICAL | - |
| P13 | p.i.Terminal coffre2 | NUMERIC | - |
| P14 | Param VIL open sessions | ALPHA | - |
| P15 | Param FROM_IMS | ALPHA | - |
| P16 | V Date comptable | DATE | - |
| P17 | V session active | LOGICAL | - |
| P18 | V User ouverture | ALPHA | - |
| P19 | V Date ouverture | DATE | - |
| P20 | V Time ouverture | TIME | - |
| P21 | V Date Fin session | DATE | - |
| P22 | V Last Chrono | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-57}` | v.fin | LOGICAL | - |

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

> Total: 180 variables mappees

---

## 5. EXPRESSIONS (235 total, 184 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,14}='O'` | `Param FROM_IMS='O'` |
| 2 | `'FALSE'LOG` | `'FALSE'LOG` |
| 3 | `'D'` | `'D'` |
| 4 | `{0,31}` | `{0,31}` |
| 5 | `'TRUE'LOG` | `'TRUE'LOG` |
| 6 | `NOT({0,31})` | `NOT({0,31})` |
| 7 | `{32768,111}` | `VG. Interface Galaxy Grèce` |
| 1 | `'CAISSE'` | `'CAISSE'` |
| 2 | `SetParam ('MOPCMP',{0,2})` | `SetParam ('MOPCMP',Param societe)` |
| 3 | `SetParam ('CLACMP',{0,3})` | `SetParam ('CLACMP',Param devise locale)` |
| 1 | `{0,5}` | `Param masque montant` |
| 2 | `{0,4}` | `Param nbre decimale` |
| 3 | `'F'` | `'F'` |
| 4 | `'F'` | `'F'` |
| 5 | `MlsTrans ('Le coffre 2 est déjà ouvert par')&' '&{0,5}` | `MlsTrans ('Le coffre 2 est déjà ouvert par')&' '&Param ma...` |
| 13 | `NOT ({0,6}) AND {0,1}` | `NOT (Param code village) AND Param Etat caisse` |
| 11 | `{1,17} AND {32768,1}<>{0,5}` | `{1,17} AND VG.USER<>Param masque montant` |
| 12 | `NOT {1,17} AND {32768,1}={0,5}` | `NOT {1,17} AND VG.USER=Param masque montant` |
| 8 | `NOT ({0,6})` | `NOT (Param code village)` |
| 9 | `'FALSE'LOG` | `'FALSE'LOG` |
| 10 | `NOT ({0,1})` | `NOT (Param Etat caisse)` |
| 1 | `'CAISSE'` | `'CAISSE'` |
| 2 | `{0,2}` | `Param societe` |
| 3 | `{0,3}` | `Param devise locale` |
| 4 | `{0,4}` | `Param nbre decimale` |
| 5 | `{0,5}` | `Param masque montant` |
| 1 | `{1,3}` | `{1,3}` |
| 2 | `{0,2}` | `Param societe` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{0,1} AND {0,6}='00/00/0000'DATE` | `Param Etat caisse AND Param code village='00/00/0000'DATE` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 12 (5 W / 7 R) |
| Parametres | 17 |
| Variables locales | 31 |
| Expressions | 235 |
| Expressions 100% decodees | 184 (78%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

