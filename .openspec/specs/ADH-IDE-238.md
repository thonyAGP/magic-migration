# ADH IDE 238 - Menu Choix Saisie/Annul vente

> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_238.xml`
> **Modele** : Specification Programme Magic v1.0

---

## 1. SPECIFICATION FONCTIONNELLE

### 1.1 Identification

| Attribut | Valeur |
|----------|--------|
| **IDE Position** | 238 |
| **Nom Public** | - |
| **Description** | Menu Choix Saisie/Annul vente |
| **Type** | Online (O) - Menu interactif |
| **Module** | ADH (Adherents/Caisse) |

### 1.2 Objectif Metier

**Quoi ?** Programme de menu permettant a l'utilisateur de choisir entre plusieurs actions liees aux ventes :
- Saisie d'une nouvelle vente
- Annulation d'une vente existante
- Annulation d'un solde
- Annulation de gratuites

**Pour qui ?** Operateurs de caisse (cashiers) du Club Med

**Pourquoi ?** Point d'entree unique pour toutes les operations de vente/annulation, avec controle des droits et de l'etat de la session.

### 1.3 Regles Metier

| Regle | Description | Expression |
|-------|-------------|------------|
| **RM-001** | Session obligatoire | L'utilisateur doit avoir une session ouverte (`{32768,3} OR {32768,47}`) |
| **RM-002** | Systeme disponible | Le systeme ne doit pas etre verrouille (`{32768,89} AND NOT {32768,93}`) |
| **RM-003** | Droits action | Chaque action (1-4) necessite des droits specifiques |
| **RM-004** | Gratuites hors Gift Pass | Les annulations de gratuites excluent les Gift Pass |

### 1.4 Actions Disponibles

| Code | Action | Condition | Programme appele |
|------|--------|-----------|------------------|
| **1** | Saisie vente | Session ouverte | Vers ecran saisie |
| **2** | Annulation vente | Session ouverte + Droits | `DbDel('{933,4}'DSOURCE)` |
| **3** | Annulation solde | Session ouverte + Droits | Historique IGR |
| **4** | Annulation gratuites | Session ouverte + Droits | Historique Gratuites |

### 1.5 Messages Utilisateur

| Contexte | Message |
|----------|---------|
| Session fermee | "Votre session est fermee" |
| Menu Vente | "[Contexte]\|VENTE" |
| Historique Ventes | "[Contexte]\|HISTORIQUE DES VENTES" |
| Historique IGR | "[Contexte]\|HISTORIQUE DES IGR" |
| Historique Gratuites | "[Contexte]\|HISTORIQUE DES GRATUITES" |

---

## 2. SPECIFICATION TECHNIQUE

### 2.1 Parametres d'Entree (16)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| 1 | P.Societe | Alpha(1) | Code societe |
| 2 | P.Devise locale | Alpha(3) | Code devise (EUR, USD...) |
| 3 | P.Masque montant | Alpha(16) | Format d'affichage montant |
| 4 | P.Solde compte | Num(11,3) | Solde actuel du compte |
| 5 | P.Code GM | Num(4) | Code adherent GM |
| 6 | P.Filiation | Alpha | Filiation adherent |
| 7 | P.Date fin sejour | Date | Date de depart |
| 8 | P.Etat compte | Alpha | Etat du compte (actif/ferme) |
| 9 | P.Date solde | Date | Date du dernier solde |
| 10 | P.Garanti O/N | Bool | Compte garanti |
| 11 | P.Nom & prenom | Alpha | Identite adherent |
| 12 | P.UNI/BI | Alpha | Mode de change |
| 13 | P.Date debut sejour | Date | Date d'arrivee |
| 14 | P.Valide ? | Bool | Compte valide |
| 15 | P.Nb decimales | Num | Nombre de decimales devise |
| 16 | P.Mode consultation | Alpha | Mode lecture seule |

### 2.2 Tables Utilisees

| ID | Nom Physique | Nom Logique | Access | Role |
|----|--------------|-------------|--------|------|
| **38** | `cafil016_dat` | comptable_gratuite | **R/W** | Enregistrement transactions gratuites |
| **264** | `caisse_vente_gratuite` | vente_gratuite | R | Verification ventes gratuites existantes |
| **400** | `pv_rentals_dat` | pv_cust_rentals | R | Verification packages locations |
| **804** | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | R | Parametres credit bar |

### 2.3 Structure des Taches

```
ADH IDE 238 - Menu Choix Saisie/Annul vente
|
+-- Tache 238.1 (ISN_2=1) - Main Menu
|   +-- Type: Online (O)
|   +-- Tables: Aucune (parametres uniquement)
|   +-- Variables: 21 colonnes DataView
|   +-- Logic: Controle actions 1-4, verif session
|
+-- Tache 238.2 (ISN_2=2) - Existe vente gratuite ou IGR ?
|   +-- Type: Batch (B)
|   +-- Tables: 38(R), 264(R), 804(R)
|   +-- Logic: Verification existence gratuites/IGR
|
+-- Tache 238.3 (ISN_2=3) - Existe gratuite hors gift pass ?
    +-- Type: Batch (B)
    +-- Tables: 38(W), 400(R)
    +-- Logic: Exclusion Gift Pass des gratuites
```

### 2.4 Variables Principales

| Variable | Type | Role |
|----------|------|------|
| `W0 choix action` | Alpha | Stocke le choix utilisateur (1-4) |
| `v.fin` | Bool | Flag de sortie du menu |
| `V.Existe IGR ?` | Bool | Resultat verif IGR |
| `V.Existe Gratuite ?` | Bool | Resultat verif gratuites |
| `V.Session ouverte ?` | Bool | Etat session |

### 2.5 Expressions Cles

| ID | Expression | Signification |
|----|------------|---------------|
| **4** | `{0,17}='1'` | Action = Saisie vente |
| **7** | `{0,17}='2'` | Action = Annulation vente |
| **9** | `{0,17}='3'` | Action = Annulation solde |
| **10** | `{0,17}='4'` | Action = Annulation gratuites |
| **11** | `{32768,3} OR {32768,47}` | Session ouverte (2 flags) |
| **8** | `DbDel('{933,4}'DSOURCE,'')` | Suppression enregistrement vente |
| **23** | `CallProg('{323,-1}'PROG)` | Appel programme Caisse ouverte |

### 2.6 Flux de Decision

```
+-------------------------------------------------------------+
|                    ENTREE MENU (238)                        |
+---------------------+---------------------------------------+
                      |
                      v
              +---------------+
              | Session       | {32768,3} OR {32768,47}
              | ouverte ?     |
              +-------+-------+
                 NON  |  OUI
          +----------+----------+
          v                     v
    +----------+         +--------------+
    | ERREUR   |         | Afficher     |
    | "Session |         | Menu Actions |
    | fermee"  |         +------+-------+
    +----------+                |
                                v
                    +-----------------------+
                    |  Choix Action (1-4)   |
                    +-----------+-----------+
          +---------+-----------+-----------+---------+
          v         v           v           v         |
       Action=1  Action=2   Action=3    Action=4      |
       SAISIE    ANNUL      ANNUL       ANNUL         |
       VENTE     VENTE      SOLDE       GRATUIT       |
          |         |           |           |         |
          v         v           v           v         |
    +---------+ +---------+ +---------+ +---------+   |
    |CallTask | | DbDel   | | Histo   | | Histo   |   |
    |  233    | | 933,4   | |  IGR    | | Gratuit |   |
    +---------+ +---------+ +---------+ +---------+   |
                                                      |
                      +-------------------------------+
                      v
               +------------+
               |   SORTIE   | v.fin = TRUE
               +------------+
```

---

## 3. CARTOGRAPHIE APPLICATIVE

### 3.1 Programmes Appelants (Callers)

| Caller | IDE | Nom | Type Appel | Condition |
|--------|-----|-----|------------|-----------|
| **Prg_1** | 1 | Main Program | CallTask(238) | Event 238 (Popup) |
| **Prg_28** | 28 | Fusion | CallTask(238) | Expression 81 |

### 3.2 Programmes Appeles (Callees)

| Callee | IDE | Nom | Type Appel | Contexte |
|--------|-----|-----|------------|----------|
| **Prg_323** | 323 | Caisse ouverte | CallProg() | Verification caisse |
| **Prg_233** | 233 | (Saisie) | CallTask() | Action=1 |

### 3.3 Diagramme de Dependances

```
                    +-----------------+
                    |   ADH IDE 1     |
                    |  Main Program   |
                    +--------+--------+
                             | CallTask(238)
                             v
+-----------------+    +-----------------+    +-----------------+
|   ADH IDE 28    |--->|   ADH IDE 238   |--->|   ADH IDE 323   |
|     Fusion      |    | Menu Saisie/    |    | Caisse ouverte  |
+-----------------+    |  Annul vente    |    +-----------------+
                       +--------+--------+
                                | CallTask(233)
                                v
                       +-----------------+
                       |   ADH IDE 233   |
                       |   (Saisie)      |
                       +-----------------+
```

### 3.4 Tables Partagees (Cross-Reference)

| Table | Programmes utilisant | Access |
|-------|---------------------|--------|
| cafil016_dat (38) | 238, 243, ... | R/W |
| caisse_vente_gratuite (264) | 238, 243, ... | R |
| pv_rentals_dat (400) | 238, 241, 389, ... | R |

---

## 4. NOTES DE MIGRATION

### 4.1 Complexite

| Critere | Score | Justification |
|---------|-------|---------------|
| Nombre de taches | 3 | Faible |
| Tables en ecriture | 1 | Faible |
| Expressions complexes | 22+ | Moyen |
| Appels externes | 2 | Faible |
| **Total** | **Moyen** | |

### 4.2 Points d'Attention

1. **Gestion Session** : 3 variables systeme pour etat session - mapper vers AuthService
2. **Appel Dynamique** : `DbDel()` et `CallProg()` - creer endpoints REST
3. **Labels Conditionnels** : Construction dynamique via IF/Trim - i18n service
4. **Droits Actions** : 4 actions avec controles differents - middleware authorization

### 4.3 Suggestion Architecture Cible

```
API Endpoint: POST /api/ventes/menu
+-- Request: { societe, codeGM, filiation, action }
+-- Middleware: AuthService.checkSession()
+-- Controller: VentesController.handleMenuAction()
|   +-- action=1 -> VentesService.initSaisie()
|   +-- action=2 -> VentesService.annulerVente()
|   +-- action=3 -> VentesService.annulerSolde()
|   +-- action=4 -> VentesService.annulerGratuite()
+-- Response: { success, redirect, message }
```

---

## 5. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification | Claude |

---

*Modele de specification v1.0 - Applicable a tout programme Magic ADH*
