# ADH IDE 121 - Gestion_Caisse_142 - Captures IDE Magic Reference

> Date capture: 2026-01-23
> Source: IDE Magic Unipaas

---

## Screenshot 1: Program Repository

**Programme ADH IDE 121**:
- Name: Gestion caisse
- Folder: Gestion Caisse
- Public Name: Gestion_Caisse_142
- Last Update: 27/11/2025 21:35:11

---

## Screenshot 2: DataView Task 121 - Gestion caisse

**Main Source**: 0 (No Main Source), Index: 0

### Parameters (17 total)
| Ligne | Type | # | Nom | Attribut | Picture |
|-------|------|---|-----|----------|---------|
| 2 | Parameter | 1 | Param Libelle caisse | Alpha | 32 |
| 3 | Parameter | 2 | Param Etat caisse | Alpha | U |
| 4 | (vide) | - | - | - | - |
| 5 | Parameter | 3 | Param societe | Alpha | U |
| 6 | Parameter | 4 | Param devise locale | Alpha | U3 |
| 7 | Parameter | 5 | Param nbre decimale | Numeric | 1 |
| 8 | Parameter | 6 | Param masque montant | Alpha | 16 |
| 9 | Parameter | 7 | Param code village | Alpha | 3 |
| 10 | Parameter | 8 | Param nom village | Alpha | U30 |
| 11 | Parameter | 9 | Param masque cumul | Alpha | 18 |
| 12 | Parameter | 10 | Param Uni/Bi | Alpha | U |
| 13 | Parameter | 11 | Param Village TAI | Alpha | U |
| 14 | Parameter | 12 | Param Mode consultation | Logical | 5 |
| 15 | Parameter | 13 | p.i.Terminal coffre2 | Numeric | 3 |
| 16 | Parameter | 14 | Param VIL open sessions | Alpha | U |
| 17 | Parameter | 15 | Param FROM_IMS | Alpha | U |
| 18 | Parameter | 16 | p.i.Hostl coffre2 | Unicode | 50 |
| 19 | Parameter | 17 | i.Host courant coffre 2 ? | Logical | 5 |

### Virtuals (11+ visibles)
| Ligne | Type | # | Nom | Attribut | Picture |
|-------|------|---|-----|----------|---------|
| 21 | Virtual | 1 | V Date comptable | Date | ##/##/#### |
| 23 | Virtual | 2 | V session active | Logical | 5 |
| 24 | Virtual | 3 | V User ouverture | Alpha | 8 |
| 25 | Virtual | 4 | V Date ouverture | Date | ##/##/#### |
| 26 | Virtual | 5 | V Time ouverture | Time | HH:MM:SS |
| 27 | (comment) | - | pour le bouton re imp ticket recap | - | - |
| 28 | Virtual | 6 | V Date Fin session | Date | ##/##/#### |
| 30 | Virtual | 7 | V Last Chrono | Numeric | 12 |
| 32 | Virtual | 8 | V N° caisse reception mini | Numeric | 3 |
| 33 | Virtual | 9 | V N° caisse reception maxi | Numeric | 3 |
| 35 | Virtual | 10 | V Cloture en cours | Logical | 5 |
| 36 | Virtual | 11 | COFFRE 2 est ouvert | Logical | 5 |

### Structure Navigator (32 sous-tâches)
- Gestion caisse
  - Paramètres caisse
  - Controle COFFRE2
  - Paramètres caisse
  - Date comptable
  - Lecture session
  - Pilotage (avec sous-tâches imbriquées)
    - Existe histo
    - Ouverture caisse (Cloture en cours, Controle monnaie, Creation histo sess...)
    - Fermeture caisse (Clôture histo sessi)
    - Apport coffre
    - Apport produit
    - Remise au coffre (RAZ Saisie devises)
    - Historique
    - Consultation
    - reimprimer tickets
    - Pointage AppRem
    - Open sessions (Pointage, Read Sessions > Calcul > Ligne Initia, histo sessio...)
    - Browse - Concurrence

---

## Screenshot 3: Expression Rules 121 - Gestion caisse

**7 Expressions Task 1**:
| # | Expression IDE | Expanded View |
|---|----------------|---------------|
| 1 | FA='O' | Param VIL open sessions='O' |
| 2 | 'FALSE'LOG | - |
| 3 | 'D' | - |
| 4 | FR | v.fin |
| 5 | 'TRUE'LOG | - |
| 6 | NOT(FR) | NOT(v.fin) |
| 7 | EB | (global variable) |

### Variables Panel (EJ à FQ visibles)
| Var | Nom | Attribut | Data Source |
|-----|-----|----------|-------------|
| EJ | VG.Devise locale | Alpha | Virtual |
| EK | VG.Masque | Alpha | Virtual |
| EN | Param Libelle caisse | Alpha | Parameter |
| EO | Param Etat caisse | Alpha | Parameter |
| EP | Param societe | Alpha | Parameter |
| EQ | Param devise locale | Alpha | Parameter |
| ER | Param nbre decimale | Numeric | Parameter |
| ES | Param masque montant | Alpha | Parameter |
| ET | Param code village | Alpha | Parameter |
| EU | Param nom village | Alpha | Parameter |
| EV | Param masque cumul | Alpha | Parameter |
| EW | Param Uni/Bi | Alpha | Parameter |
| EX | Param Village TAI | Alpha | Parameter |
| EY | Param Mode consultation | Logical | Parameter |
| EZ | p.i.Terminal coffre2 | Numeric | Parameter |
| FA | Param VIL open sessions | Alpha | Parameter |
| FB | Param FROM_IMS | Alpha | Parameter |
| FC | p.i.Hostl coffre2 | Unicode | Parameter |
| FD | i.Host courant coffre 2 ? | Logical | Parameter |
| FE | V Date comptable | Date | Virtual |
| FF | V session active | Logical | Virtual |
| FG | V User ouverture | Alpha | Virtual |
| FH | V Date ouverture | Date | Virtual |
| FI | V Time ouverture | Time | Virtual |
| FJ | V Date Fin session | Date | Virtual |
| FK | V Last Chrono | Numeric | Virtual |
| FL | V N° caisse reception mini | Numeric | Virtual |
| FM | V N° caisse reception maxi | Numeric | Virtual |
| FN | V Cloture en cours | Logical | Virtual |
| FO | COFFRE 2 est ouvert | Logical | Virtual |
| FP | V avec coffre 2 | Alpha | Virtual |
| FQ | V cloture auto | Alpha | Virtual |

---

## Screenshot 4: Logic Task 121 - Task Prefix + Record Suffix

### Task Prefix
| Ligne | Opération | Type | Cible | Description | Condition | With |
|-------|-----------|------|-------|-------------|-----------|------|
| 2 | Call | SubTask | 1 | Paramètres caisse | Cnd: 1 | Param VIL open sessions |
| 3 | (comment) | - | - | deblocage concurrence session | - | - |
| 4 | Call | Program | **116** | Calcul concurrence sessions | **[2 Arguments]** | - |
| 5 | (vide) | - | - | - | - | - |
| 6 | (comment) | - | - | Contrôle unicite session sur le COFFRE2 | - | - |
| 7 | Call | SubTask | 2 | Controle COFFRE2 | - | - |
| 9 | Call | SubTask | 3 | Paramètres caisse | - | - |
| 11 | (comment) | - | - | deblocage concurrence session | - | - |
| 12 | Call | Program | **116** | Calcul concurrence sessions | **[2 Arguments]** | - |
| 14 | Update | Variable | FR | v.fin | With: 5 | 'TRUE'LOG |

### Record Suffix
| Ligne | Opération | Type | Cible | Description | Condition | With |
|-------|-----------|------|-------|-------------|-----------|------|
| 16 | Update | Variable | EY | Param Mode consultation | With: 2 | 'FALSE'LOG |
| 18 | Call | SubTask | 4 | Date comptable | - | - |
| 19 | Call | SubTask | 5 | Lecture session | - | - |
| 20 | Block | If | 6 | {NOT(v.fin)} | - | - |
| 21 | Call | Program | **231** | Raisons utilisation ADH | Cnd: 7 | VG.Utilisation Odyssey |
| 22 | Update | Variable | FR | v.fin | With: 5 | 'TRUE'LOG |
| 23 | Block | End | - | } | - | - |
| 24 | Call | SubTask | 6 | Pilotage | - | - |

---

## Screenshot 5: Logic Task 121.5 - Lecture session (Record Suffix)

| Ligne | Opération | Cible | Nom | With | Valeur |
|-------|-----------|-------|-----|------|--------|
| 2 | (comment) | - | Initialisation | - | - |
| 3 | Update | EN | Param Libelle caisse | With: 3 | MlsTrans ('Fermee') |
| 4 | Update | EO | Param Etat caisse | With: 4 | 'F' |
| 5 | Update | FF | V session active | With: 5 | 'FALSE'LOG |
| 6 | Update | FG | V User ouverture | With: 6 | '' |
| 7 | Update | FH | V Date ouverture | With: 7 | '00/00/0000'DATE |
| 8 | Update | FI | V Time ouverture | With: 8 | '00:00:00'TIME |
| 9 | Update | FK | V Last Chrono | With: 9 | chrono |
| 11 | (comment) | - | dernière session active | - | - |
| 12 | Block If | 2 | {Existe session AND date_fin_session='00/00/0000'DATE} | - | - |
| 13 | Update | EN | Param Libelle caisse | With: 10 | MlsTrans ('Ouverte') |
| 14 | Update | EO | Param Etat caisse | With: 11 | 'O' |
| 15 | Update | FF | V session active | With: 12 | 'TRUE'LOG |
| 16 | Update | FG | V User ouverture | With: 13 | utilisateur |
| 17 | Update | FH | V Date ouverture | With: 14 | date_debut_session |
| 18 | Update | FI | V Time ouverture | With: 15 | heure_debut_session |
| 19 | Block End | - | } | - | - |
| 21 | (comment) | - | pour bouton re imp ticket recap | - | - |
| 22 | Update | FJ | V Date Fin session | With: 16 | date_fin_session |

---

## Screenshot 6: Expression Rules 121.5 - Lecture session

**16 Expressions**:
| # | Expression |
|---|------------|
| 1 | A |
| 2 | FS AND FX='00/00/0000'DATE |
| 3 | MlsTrans ('Fermee') |
| 4 | 'F' |
| 5 | 'FALSE'LOG |
| 6 | '' |
| 7 | '00/00/0000'DATE |
| 8 | '00:00:00'TIME |
| 9 | FU |
| 10 | MlsTrans ('Ouverte') |
| 11 | 'O' |
| 12 | 'TRUE'LOG |
| 13 | FT |
| 14 | FV |
| 15 | FW |
| 16 | FX |

### Variables (EZ à FX visibles)
| Var | Nom | Attribut | Data Source |
|-----|-----|----------|-------------|
| EZ | p.i.Terminal coffre2 | Numeric | Parameter |
| FA | Param VIL open sessions | Alpha | Parameter |
| FB | Param FROM_IMS | Alpha | Parameter |
| FC | p.i.Hostl coffre2 | Unicode | Parameter |
| FD | i.Host courant coffre 2 ? | Logical | Parameter |
| FE | V Date comptable | Date | Virtual |
| FF | V session active | Logical | Virtual |
| FG | V User ouverture | Alpha | Virtual |
| FH | V Date ouverture | Date | Virtual |
| FI | V Time ouverture | Time | Virtual |
| FJ | V Date Fin session | Date | Virtual |
| FK | V Last Chrono | Numeric | Virtual |
| FL | V N° caisse reception mini | Numeric | Virtual |
| FM | V N° caisse reception maxi | Numeric | Virtual |
| FN | V Cloture en cours | Logical | Virtual |
| FO | COFFRE 2 est ouvert | Logical | Virtual |
| FP | V avec coffre 2 | Alpha | Virtual |
| FQ | V cloture auto | Alpha | Virtual |
| FR | v.fin | Logical | Virtual |
| FS | Existe session | Logical | Virtual |
| FT | utilisateur | Unicode | histo_sessions_caisse |
| FU | chrono | Numeric | histo_sessions_caisse |
| FV | date_debut_session | Date | histo_sessions_caisse |
| FW | heure_debut_session | Time | histo_sessions_caisse |
| FX | date_fin_session | Date | histo_sessions_caisse |

---

## Screenshot 7: Task 121.6.11.2.1 - Calcul (sous-tâche profonde)

**Position**: Gestion caisse > Pilotage > Open sessions > Read Sessions > Calcul

### Logic (Task Suffix)
| Ligne | Opération | Type | Cible | Description | Arguments |
|-------|-----------|------|-------|-------------|-----------|
| 2 | (comment) | - | - | Fermeture caisse restée ouverte | - |
| 3 | Call | Program | **131** | Fermeture caisse | **[17 Arguments]** |
| 4 | Call | Program | **122** | Ouverture caisse | **[15 Arguments]** |
| 5 | Call | SubTask | 1 | Ligne Initiale | - |
| 6 | Call | SubTask | 2 | histo session ouverture | - |

### Expression Rules (2 expressions)
| # | Expression |
|---|------------|
| 1 | 'TRUE'LOG |
| 2 | GL+1 |

### Variables (GI à GZ visibles)
| Var | Nom | Attribut | Data Source |
|-----|-----|----------|-------------|
| GI | uti_flag_responsable | Unicode | utilisateur____uti |
| GK | utilisateur | Unicode | histo_sessions_caisse |
| GL | chrono | Numeric | histo_sessions_caisse |
| GM | date_fin_session | Date | histo_sessions_caisse |
| GN | heure_fin_session | Time | histo_sessions_caisse |
| GO | date_comptable | Date | histo_sessions_caisse |
| GP | pointage | Logical | histo_sessions_caisse |
| GQ | uti_societe | Unicode | utilisateur____uti |
| GR | uti_user | Unicode | utilisateur____uti |
| GS | uti_password | Unicode | utilisateur____uti |
| GT | uti_description | Unicode | utilisateur____uti |
| GU | userFromVillage | Alpha | Virtual |
| GV | uti_societe | Unicode | utilisateur____uti |
| GW | uti_user | Unicode | utilisateur____uti |
| GX | uti_password | Unicode | utilisateur____uti |
| GY | v.Logon reussi | Logical | Virtual |
| GZ | Montant calcule | Numeric | Virtual |

---

## VALIDATION KB vs IDE - ÉCARTS RÉSOLUS

### ✅ ÉCART 1: Comptage Arguments Program Calls - CORRIGÉ (2026-01-23)
| Source | Program 116 | Program 131 | Program 122 |
|--------|-------------|-------------|-------------|
| **IDE** | [2 Arguments] | [17 Arguments] | [15 Arguments] |
| **KB** | **2** ✅ | **17** ✅ | **15** ✅ |

**FIX**: Bug corrigé - `Elements("Arg")` → `Elements("Argument")` dans ProgramParser.cs

### ✅ ÉCART 2: Expression Count - CORRIGÉ (2026-01-23)
| Tâche | Expressions IDE | KB |
|-------|-----------------|-----|
| Task 121 (main) | 7 | ✓ inclus |
| Task 121.5 (Lecture session) | 16 | ✓ inclus |
| Task 121.6.11.2.1 (Calcul) | 2 | ✓ inclus |
| **TOTAL Programme** | **235** | **235** ✅ |

**FIX**: Bug corrigé - `FirstOrDefault()` → `Descendants("Expressions").ToList()` pour parser TOUTES les sections Expressions de chaque tâche.

### ✅ Éléments corrects
- Public Name: Gestion_Caisse_142 ✓
- Task Count: 32 ✓
- Expressions: 235 ✓
- Program Calls: 42 ✓
- Variables Task 1: EN-FQ mapping correct ✓
- Program Calls détectés: 116, 131, 122, 231 ✓

---

## VALIDATION FINALE KB (2026-01-23)

| Métrique | IDE | KB | Status |
|----------|-----|-----|--------|
| Public Name | Gestion_Caisse_142 | Gestion_Caisse_142 | ✅ |
| Tasks | 32 | 32 | ✅ |
| Expressions | 235 | 235 | ✅ |
| Program Calls | 42 | 42 | ✅ |

**100% ISO avec IDE Magic**
