# Documentation SADT - Projet ADH (Adherents)

> **Structured Analysis and Design Technique**
> Projet Magic Unipaas v12.03 - Module Gestion Adherents/Caisse

---

## Vue d'ensemble

| Attribut | Valeur |
|----------|--------|
| **Projet** | ADH (Adherents) |
| **Version Magic** | 12.03 |
| **Nombre de programmes** | ~350 |
| **Nombre de dossiers** | 27 |
| **Composants utilises** | REF.ecf (tables partagees), ADH.ecf (30 progs partages) |

---

## A-0 : Diagramme de contexte

```
                           REGLES METIER
                           PARAMETRES VILLAGE
                                  |
                                  v
    +---------------------------------------------------------------+
    |                                                               |
    |                    GESTION ADHERENTS                          |
 -->|                         (ADH)                                 |-->
    |                                                               |
    |        Gerer les comptes adherents, operations                |
    |        financieres, caisse et services village                |
    |                                                               |
    +---------------------------------------------------------------+
          ^                                                   |
          |                                                   v
    IDENTIFICATION                                      TICKETS/RECUS
    OPERATEUR                                          RAPPORTS
                                                       SOLDES

ENTREES (gauche):
- Identification operateur
- Donnees adherent (societe, compte, filiation)
- Operations financieres
- Devises etrangeres

SORTIES (droite):
- Tickets et recus
- Extraits de compte
- Rapports de session
- Soldes calcules

CONTROLES (haut):
- Regles metier caisse
- Parametres village
- Droits operateur
- Configuration devises

MECANISMES (bas):
- Base de donnees SQL Server
- Composant REF.ecf (tables)
- Imprimantes tickets
- Systeme telephonique PBX
```

---

## A0 : Decomposition niveau 1

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  A1: GESTION     |---->|  A2: OPERATIONS  |---->|  A3: EDITIONS    |
|     CAISSE       |     |     COMPTE       |     |     RAPPORTS     |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  A4: CHANGE      |     |  A5: VENTES      |     |  A6: TELEPHONE   |
|     DEVISES      |     |     PRODUITS     |     |     PBX          |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  A7: ZOOMS       |     |  A8: UTILITAIRES |     |  A9: SUPPORT     |
|     REFERENCE    |     |     SYSTEME      |     |     SPECIFIQUE   |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
```

---

## A1 : Gestion Caisse (41 programmes)

### Description
Module central gerant les sessions de caisse, ouverture/fermeture, coffre et controles.

### Diagramme SADT

```
                    PARAMETRES CAISSE
                    DROITS OPERATEUR
                           |
                           v
    +--------------------------------------------------+
    |                                                  |
    |              A1: GESTION CAISSE                  |
 -->|                                                  |-->
    |                                                  |
    +--------------------------------------------------+
          ^                                       |
          |                                       v
    OPERATEUR                               SESSIONS
    SESSION ID                              COFFRE
    MONTANTS                                ECARTS

ENTREES:
- Identification operateur (login, mot de passe)
- Montants comptes (cash, cartes, cheques)
- Details coffre (devises, objets)

SORTIES:
- Session ouverte/fermee
- Etat coffre mis a jour
- Tickets de session
- Ecarts calcules

CONTROLES:
- Seuil alerte ecart
- Etats autorises (Ouverte, Fermee, Bloquee)
- Droits ouverture/fermeture

MECANISMES:
- Tables: caisse_session, caisse_session_detail, caisse_session_coffre2
- Composant ADH.ecf (Gestion_Caisse_142)
```

### Programmes principaux

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 121 | Gestion_Caisse_142 | Ecran principal caisse (CA0142) | 17 |
| 122 | - | Ouverture session | 15 |
| 131 | - | Fermeture session | 17 |
| 294 | - | Ouverture session (CA0143) grille | - |
| 77 | - | Liste sessions | - |
| 80 | - | Consultation session | - |
| 163 | - | Coffre consultation | - |
| 197 | - | Coffre modification | - |

### Sous-modules A1.x

| Ref | Fonction | Programmes |
|-----|----------|------------|
| A1.1 | Ouverture session | ADH IDE 122, ADH IDE 294 |
| A1.2 | Fermeture session | ADH IDE 131 |
| A1.3 | Gestion coffre | ADH IDE 163, ADH IDE 197, ADH IDE 233-235 |
| A1.4 | Historique sessions | ADH IDE 77, ADH IDE 80, ADH IDE 236 |
| A1.5 | Appro/Regulation | ADH IDE 123-130 |

---

## A2 : Operations Compte

### Sous-modules

#### A2.1 : Extrait de Compte (9 programmes)

```
                    FILTRES (date, service)
                           |
                           v
    +--------------------------------------------------+
    |                                                  |
    |           A2.1: EXTRAIT DE COMPTE                |
 -->|                                                  |-->
    |                                                  |
    +--------------------------------------------------+
          ^                                       |
          |                                       v
    SOCIETE                                 MOUVEMENTS
    COMPTE                                  CUMULS
    FILIATION                               SOLDE

ENTREES:
- Societe, Compte, Filiation
- Filtres: date debut/fin, service, type

SORTIES:
- Liste mouvements avec cumul progressif
- Solde final
- Edition imprimable

CONTROLES:
- Filtres par nom, date, service, type cumulatif

MECANISMES:
- Table: operations_dat (operations)
- Table: cafil048_dat (services)
```

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 69 | EXTRAIT_COMPTE | Extrait compte complet | 12 |
| 70 | EXTRAIT_NOM | Extrait par nom | - |
| 71 | EXTRAIT_DATE | Extrait par date | - |
| 72 | EXTRAIT_CUM | Extrait cumulatif | - |
| 73 | EXTRAIT_IMP | Impression extrait | - |
| 76 | EXTRAIT_SERVICE | Extrait par service | - |

#### A2.2 : Changement Compte (12 programmes)

```
                    REGLES SEPARATION/FUSION
                           |
                           v
    +--------------------------------------------------+
    |                                                  |
    |         A2.2: CHANGEMENT COMPTE                  |
 -->|                                                  |-->
    |                                                  |
    +--------------------------------------------------+
          ^                                       |
          |                                       v
    COMPTE SOURCE                           COMPTE CIBLE
    OPERATIONS                              HISTORIQUE
    A TRANSFERER                            TRANSFERT

ENTREES:
- Compte source (societe, compte, filiation)
- Compte cible
- Operations a transferer

SORTIES:
- Compte cible mis a jour
- Historique transfert
- Ticket separation/fusion

CONTROLES:
- Regles de separation
- Regles de fusion
- Droits utilisateur

MECANISMES:
- Tables: histo_fus_sep, histo_fus_sep_det, histo_fus_sep_log
```

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 27 | Separation | Separer un compte | 13 |
| 28 | Fusion | Fusionner comptes | 11 |
| 29 | - | Write histo Fus_Sep | 5 |
| 30 | - | Read histo Fus_Sep_Det | 8 |
| 31 | - | Write histo_Fus_Sep_Det | 4 |
| 32 | - | Write histo_Fus_Sep_Saisie | 11 |
| 36 | - | Print Separation ou fusion | 13 |
| 37 | - | Menu changement compte | 9 |

#### A2.3 : Solde Compte (9 programmes)

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 192 | SOLDE_COMPTE | Calcul solde fin sejour | 27 |
| 64 | SOLDE_EASY_CHECK_OUT | Solde Easy Checkout | - |
| 187-195 | - | Sous-programmes solde | - |

#### A2.4 : Garantie (9 programmes)

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 111 | GARANTIE | Gestion garanties | - |
| 112-114 | - | Sous-programmes garantie | - |

---

## A3 : Editions et Rapports

### A3.1 : Easy Check Out (15 programmes)

```
                    WORKFLOW CHECKOUT
                           |
                           v
    +--------------------------------------------------+
    |                                                  |
    |           A3.1: EASY CHECK OUT                   |
 -->|                                                  |-->
    |                                                  |
    +--------------------------------------------------+
          ^                                       |
          |                                       v
    COMPTE                                  SOLDE FINAL
    ADHERENT                                FACTURE
                                            TICKET C/O

ENTREES:
- Identification adherent
- Compte a solder

SORTIES:
- Solde final calcule
- Facture generee
- Ticket Check-Out

CONTROLES:
- Workflow validation
- Regles facture TVA
```

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 53 | EXTRAIT_EASY_CHECKOUT | Extrait Easy C/O | - |
| 54 | FACTURES_CHECK_OUT | Factures C/O | - |
| 64 | SOLDE_EASY_CHECK_OUT | Solde Easy C/O | - |
| 65 | EDITION_EASY_CHECK_OUT | Edition Easy C/O | - |
| 55-67 | - | Sous-programmes Easy C/O | - |

### A3.2 : Factures (8 + 10 programmes V3)

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 89-96 | - | Gestion factures | - |
| 97 | Saisie_facture_tva | Saisie facture TVA | - |

---

## A4 : Change Devises (7 programmes)

```
                    TAUX DE CHANGE
                    TYPE (Achat/Vente)
                           |
                           v
    +--------------------------------------------------+
    |                                                  |
    |            A4: CHANGE DEVISES                    |
 -->|                                                  |-->
    |                                                  |
    +--------------------------------------------------+
          ^                                       |
          |                                       v
    DEVISE SOURCE                           DEVISE LOCALE
    MONTANT                                 EQUIVALENT
    SENS OPERATION                          RECU CHANGE

ENTREES:
- Devise source (code ISO)
- Montant a changer
- Sens (Achat UNI/BI, Vente)

SORTIES:
- Equivalent en devise locale
- Recu de change
- Historique operation

CONTROLES:
- Taux achat / Taux vente
- Type (Unidirectionnel/Bidirectionnel)

MECANISMES:
- Table: cafil028_dat (taux_change)
```

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 20 | - | Definition monnaie | 0 |
| 21 | - | Recupere devise locale | 1 |
| 22 | - | Calcul equivalent | 11 |
| 23 | - | Print recu change achat | 14 |
| 24 | - | Print recu change vente | 14 |
| 25 | - | Change GM | 16 |

---

## A5 : Ventes Produits (24 programmes)

```
                    CATALOGUE PRODUITS
                    PRIX/DISPONIBILITE
                           |
                           v
    +--------------------------------------------------+
    |                                                  |
    |            A5: VENTES PRODUITS                   |
 -->|                                                  |-->
    |                                                  |
    +--------------------------------------------------+
          ^                                       |
          |                                       v
    COMPTE ADHERENT                         VENTE ENREGISTREE
    PRODUIT CHOISI                          TICKET VENTE
    QUANTITE                                HISTORIQUE

ENTREES:
- Compte adherent
- Selection produit
- Quantite

SORTIES:
- Vente enregistree
- Ticket imprime
- Historique ventes

CONTROLES:
- Stock disponible
- Prix catalogue

MECANISMES:
- Table: ccventes (cc_ventes)
- Table: ccpartyp (cc_total_par_type)
- Table: resort_credit
```

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 229 | PRINT_TICKET | Impression ticket | - |
| 237 | - | Solde Gift Pass | - |
| 238 | - | Historique ventes | - |
| 250 | - | Solde Resort Credit | - |
| 232-255 | - | Sous-programmes ventes | - |

---

## A6 : Telephone PBX (20 programmes)

```
                    CONFIGURATION PBX
                    TARIFS APPELS
                           |
                           v
    +--------------------------------------------------+
    |                                                  |
    |            A6: TELEPHONE PBX                     |
 -->|                                                  |-->
    |                                                  |
    +--------------------------------------------------+
          ^                                       |
          |                                       v
    LIGNE                                   LIGNE OUVERTE/FERMEE
    COMPTE                                  DETAIL APPELS
    OPERATION                               STATISTIQUES

ENTREES:
- Numero ligne telephone
- Compte associe
- Operation (OPEN/CLOSE)

SORTIES:
- Ligne ouverte/fermee
- Detail des appels
- Statistiques

CONTROLES:
- Etats ligne (O=Ouvert, F=Ferme, B=Bloque)

MECANISMES:
- Table: pi_dat (lignes_telephone)
- Table: histoticket_dat
```

| ID | Nom Public | Description | Params |
|----|------------|-------------|--------|
| 208 | OPEN_PHONE_LINE | Ouvrir ligne | - |
| 210 | CLOSE_PHONE_LINE | Fermer ligne | - |
| 202-220 | - | Gestion telephone | - |

---

## A7 : Zooms Reference (22 programmes)

### Description
Tables de reference consultables pour selection de valeurs.

| ID | Fonction | Table REF |
|----|----------|-----------|
| 164-165 | Moyens reglement | cafil045_dat |
| 166-167 | Tables reference | diverses |
| 168-169 | Devises | cafil028_dat |
| 170-171 | Garanties | cafil069_dat |
| 172-173 | Depots objets | depot_objet |
| 174-175 | Depots devises | depot_devise |
| 176-177 | Pays | pays |
| 178-189 | Autres zooms | diverses |

---

## A8 : Utilitaires Systeme (10 programmes)

| ID | Description |
|----|-------------|
| 222-231 | Utilitaires divers |

---

## A9 : Modules Support

### A9.1 : Brazil DataCatching (15 programmes)

| ID | Description | Params |
|----|-------------|--------|
| 4-18 | Data Catching Bresil | Varies |

### A9.2 : Identification (4 programmes)

| ID | Description | Params |
|----|-------------|--------|
| 42 | Controle Login Informaticien | 3 |
| 43 | Recuperation du titre | 3 |
| 45 | Recuperation langue | 0 |
| - | Verification session | - |

### A9.3 : EzCard (12 programmes)

| ID | Fonction |
|----|----------|
| 76-87 | Gestion cartes EzCard |

### A9.4 : Great Members / Operations GM (12 programmes)

| ID | Fonction |
|----|----------|
| 156 | Great Members |
| 166-176 | Operations GM |

### A9.5 : Printer Management (10 programmes)

| ID | Nom Public | Description |
|----|------------|-------------|
| 178 | GET_PRINTER | Recuperer imprimante |
| 180 | SET_LIST_NUMBER | Definir numero liste |
| 181 | RAZ_PRINTER | Reset imprimante |
| 177-186 | - | Gestion impressions |

---

## Modele de Donnees (Tables REF)

### Tables Principales

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| caisse_session | Sessions caisse | session_id, operateur, etat, date |
| caisse_session_detail | Details comptage | session_id, type, montant |
| caisse_session_coffre2 | Contenu coffre | session_id, devise, quantite |
| caisse_parametres | Parametres | societe, devise_locale, seuil_alerte |
| operations_dat | Operations compte | societe, compte, filiation, credit, debit |
| cafil048_dat | Services | code_service, libelle |
| cafil028_dat | Taux change | devise, taux_achat, taux_vente |
| cafil045_dat | Moyens reglement | code, libelle |
| cafil069_dat | Types garantie | code, libelle |
| ccventes | Ventes | compte, produit, montant, date |
| ccpartyp | Totaux par type | compte, type, total |
| resort_credit | Credits resort | compte, attribue, utilise |
| pi_dat | Lignes telephone | ligne, etat, compte |
| depot_garantie | Depots garantie | compte, type, montant |
| ez_card | Cartes EzCard | membre, card_code, status |
| histo_fus_sep | Historique transferts | id, date, type |
| user_dat | Utilisateurs | login, droits |

---

## Flux de Donnees Principal

```
                              +-----------------+
                              | IDENTIFICATION  |
                              |   (Login)       |
                              +-----------------+
                                      |
                                      v
                              +-----------------+
                              | GESTION CAISSE  |
                              | (ADH IDE 121)   |
                              +-----------------+
                                      |
          +---------------------------+---------------------------+
          |                           |                           |
          v                           v                           v
   +-----------+             +--------------+             +-------------+
   | OPERATIONS|             |    VENTES    |             |  TELEPHONE  |
   |  COMPTE   |             |   PRODUITS   |             |    PBX      |
   +-----------+             +--------------+             +-------------+
          |                           |                           |
          v                           v                           v
   +-----------+             +--------------+             +-------------+
   |  EXTRAIT  |             |   TICKET     |             |   DETAIL    |
   |  COMPTE   |             |   VENTE      |             |   APPELS    |
   +-----------+             +--------------+             +-------------+
          |                           |                           |
          +---------------------------+---------------------------+
                                      |
                                      v
                              +-----------------+
                              |  EASY CHECK    |
                              |     OUT        |
                              +-----------------+
                                      |
                                      v
                              +-----------------+
                              |   FACTURE      |
                              |   FINALE       |
                              +-----------------+
```

---

## Statistiques de Complexite

| Module | Programmes | Lignes Logic | Tables | Parametres max |
|--------|------------|--------------|--------|----------------|
| Gestion Caisse | 41 | ~2000 | 6 | 17 |
| Changement Compte | 12 | ~800 | 4 | 13 |
| Easy Check Out | 15 | ~600 | 5 | 12 |
| Change | 7 | ~300 | 2 | 16 |
| Ventes | 24 | ~1000 | 3 | 14 |
| Telephone | 20 | ~800 | 2 | 8 |
| Extrait Compte | 9 | ~400 | 3 | 12 |
| Zooms | 22 | ~200 | 10 | 4 |
| **TOTAL** | **~350** | **~8000** | **~20** | - |

---

## Programmes Partages (ADH.ecf)

Ces 30 programmes sont exposes dans le composant ADH.ecf pour utilisation par d'autres projets (PBP, PVE):

| ID | Nom Public | Domaine |
|----|------------|---------|
| 27 | Separation | Compte |
| 28 | Fusion | Compte |
| 53 | EXTRAIT_EASY_CHECKOUT | Easy Checkout |
| 54 | FACTURES_CHECK_OUT | Factures |
| 64 | SOLDE_EASY_CHECK_OUT | Solde |
| 65 | EDITION_EASY_CHECK_OUT | Edition |
| 69-76 | EXTRAIT_* | Extrait |
| 84 | CARACT_INTERDIT | Utilitaire |
| 97 | Saisie_facture_tva | Factures |
| 111 | GARANTIE | Garantie |
| 121 | Gestion_Caisse_142 | Caisse |
| 149 | CALC_STOCK_PRODUIT | Stock |
| 152 | RECUP_CLASSE_MOP | MOP |
| 178-181 | GET/SET/RAZ_PRINTER | Impression |
| 185 | CHAINED_LIST_DEFAULT | Liste |
| 192 | SOLDE_COMPTE | Solde |
| 208, 210 | OPEN/CLOSE_PHONE_LINE | Telephone |
| 229 | PRINT_TICKET | Impression |
| 243 | DEVERSEMENT | Caisse |

---

## Glossaire

| Terme | Definition |
|-------|------------|
| **Adherent** | Client/membre avec compte |
| **Filiation** | Sous-compte d'un adherent |
| **Societe** | Code etablissement (1 car) |
| **Session** | Periode ouverture caisse |
| **Coffre** | Stock devises/objets en caisse |
| **C/O** | Check-Out (depart client) |
| **GM** | Great Members (programme fidelite) |
| **EzCard** | Carte membre electronique |
| **PBX** | Systeme telephonique |
| **Resort Credit** | Credit prepaye village |
| **Gift Pass** | Bon cadeau |

---

---

## Annexe A : Detail des Dossiers

| # | Dossier | Programmes | StartsAt | Entries |
|---|---------|------------|----------|---------|
| 1 | Brazil DataCatching | 15 | 4 | 15 |
| 2 | Change | 7 | 19 | 7 |
| 3 | Changement Compte | 12 | 26 | 12 |
| 4 | Depot | 3 | 38 | 3 |
| 5 | Divers | 11 | 41 | 11 |
| 6 | Easy Check Out | 15 | 52 | 15 |
| 7 | Extrait de Compte | 9 | 67 | 9 |
| 8 | EzCard | 12 | 76 | 12 |
| 9 | Factures | 8 | 88 | 8 |
| 10 | Factures V3 | 10 | 96 | 10 |
| 11 | Garantie | 9 | 106 | 9 |
| 12 | Gestion Caisse | 41 | 115 | 41 |
| 13 | Great Members | 1 | 156 | 1 |
| 14 | Identification | 4 | 157 | 4 |
| 15 | Menus | 5 | 161 | 5 |
| 16 | Operations GM | 11 | 166 | 11 |
| 17 | Printer Management | 10 | 177 | 10 |
| 18 | Solde | 9 | 187 | 9 |
| 19 | Specif Bresil | 3 | 196 | 3 |
| 20 | Synchro Serveur | 3 | 199 | 3 |
| 21 | Telephone | 20 | 202 | 20 |
| 22 | Utilitaires | 10 | 222 | 10 |
| 23 | Ventes | 24 | 232 | 24 |
| 24 | Zooms | 22 | 256 | 22 |
| 25 | Developpement | 6 | 278 | 6 |
| 26 | Sauvegarde | 5 | 284 | 5 |
| 27 | Suppr | 34 | 289 | 34 |

---

## Annexe B : Programmes Analyses (Extrait)

### Module Brazil DataCatching (ADH IDE 4-18)

| ID | Description | Type | Params |
|----|-------------|------|--------|
| 5 | Alimentation Combos NATION P | B | 0 |
| 6 | Suppression Carac interdit | B | 1 |
| 7 | Menu Data Catching | B | 0 |
| 8 | Set Village info | B | 0 |
| 9 | System avail (top left corner) | B | 1 |
| 10 | Print list Checkout (shift F9) | B | 0 |
| 11 | Export - address | B | 0 |
| 12 | Catching stats | B | 0 |
| 13 | calculate week # | B | 2 |
| 14 | e-mail list | O | 0 |
| 15 | keyboard | O | 1 |
| 16 | Browse - Countries iso | B | 2 |
| 17 | Print C/O confirmation | B | 7 |
| 18 | Print extrait compte | B | 7 |

### Module Change (ADH IDE 20-25)

| ID | Description | Type | Params |
|----|-------------|------|--------|
| 20 | Definition monnaie | B | 0 |
| 21 | Recupere devise local | B | 1 |
| 22 | Calcul equivalent | B | 11 |
| 23 | Print recu change achat | B | 14 |
| 24 | Print recu change vente | B | 14 |
| 25 | Change GM | B | 16 |

### Module Changement Compte (ADH IDE 27-37)

| ID | Description | Public | Type | Params |
|----|-------------|--------|------|--------|
| 27 | Separation | Separation | B | 13 |
| 28 | Fusion | Fusion | B | 11 |
| 29 | Write histo Fus_Sep | - | B | 5 |
| 30 | Read histo Fus_Sep_Det | - | B | 8 |
| 31 | Write histo_Fus_Sep_Det | - | B | 4 |
| 32 | Write histo_Fus_Sep_Saisie | - | B | 11 |
| 33 | Delete histo_Fus_Sep_Saisie | - | B | 6 |
| 34 | Read histo_Fus_Sep_Log | - | B | 3 |
| 35 | Write histo_Fus_Sep_Log | - | B | 7 |
| 36 | Print Separation ou fusion | - | B | 13 |
| 37 | Menu changement compte | - | O | 9 |

### Module Depot (ADH IDE 39-40)

| ID | Description | Type | Params |
|----|-------------|------|--------|
| 39 | Print extrait ObjDevSce | B | 5 |
| 40 | Comptes de depot | B | 8 |

### Module Divers (ADH IDE 42-52)

| ID | Description | Type | Params |
|----|-------------|------|--------|
| 42 | Controle Login Informaticien | B | 3 |
| 43 | Recuperation du titre | B | 3 |
| 44 | Appel programme | B | 1 |
| 45 | Recuperation langue | B | 0 |
| 46 | Affichage Version | O | 0 |
| 47 | Date/Heure session user | B | 1 |
| 48 | Controles - Integrite dates | B | 3 |
| 49 | Truncate table SQL | B | 1 |
| 50 | Initialisation Easy Arrival | B | 0 |
| 51 | Recherche Droit Solde Free Ext | B | 2 |
| 52 | Creation adresse_village | B | 0 |

### Module Easy Check Out (ADH IDE 53-66)

| ID | Description | Public | Type | Params |
|----|-------------|--------|------|--------|
| 53 | Extrait Easy Check Out a J+1 | EXTRAIT_EASY_CHECKOUT | B | 0 |
| 54 | Factures_Check_Out | FACTURES_CHECK_OUT | B | 8 |
| 55 | Easy Check-Out V2.00 | - | O | 0 |
| 56 | Recap Trait Easy Check-Out | - | O | 0 |
| 57 | Factures_Sejour | - | B | 4 |
| 58 | Incremente N Facture | - | B | 2 |
| 59 | Facture chargement boutique | - | B | 2 |
| 60 | Creation entete facture | - | B | 7 |
| 61 | Maj des lignes saisies | - | B | 5 |
| 62 | Maj Hebergement Tempo | - | B | 6 |
| 63 | Test Easy Check-Out Online | - | O | 0 |
| 64 | Solde Easy Check Out | SOLDE_EASY_CHECK_OUT | B | - |

### Module Gestion Caisse (ADH IDE 123-155)

| ID | Description | Type | Params | Tables |
|----|-------------|------|--------|--------|
| 123 | Apport coffre | B | 9 | - |
| 126 | Calcul solde initial WS | B | 12 | obj=249 |
| 127 | Lecture session WS | B | 15 | - |
| 128 | Ecriture session WS | B | 25 | - |
| 129 | Lecture session detail WS | B | 6 | - |
| 130 | Ecriture session detail WS | B | 25 | - |

---

## Annexe C : Programmes Vides (ISEMPTY_TSK)

Les programmes suivants sont marques vides dans les headers:

| ID | Notes |
|----|-------|
| 4 | Vide - Brazil DataCatching |
| 19 | Vide - Change |
| 26 | Vide - Changement Compte |
| 38 | Vide - Depot |
| 41 | Vide - Divers |

---

## Annexe D : Types de Parametres MgAttr

| Code | Type | Description |
|------|------|-------------|
| A | Alpha | Chaine de caracteres |
| N | Numeric | Nombre entier ou decimal |
| D | Date | Date (format Magic) |
| T | Time | Heure |
| B | Boolean | Vrai/Faux |
| U | Unicode | Chaine Unicode |

---

*Document genere le 2026-01-06 via analyse XML Magic Unipaas*
*Mis a jour avec details programmes extraits des fichiers Prg_*.xml*
*Source: D:\Data\Migration\XPA\PMS\ADH\Source\*
