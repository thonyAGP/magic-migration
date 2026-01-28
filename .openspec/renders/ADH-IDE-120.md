# ADH IDE 120 - Saisie contenu caisse

> **Version spec**: 4.0
> **Analyse**: 2026-01-27 23:05
> **Source**: `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_116.xml`
> **Methode**: APEX + PDCA (Auto-generated)

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur (utilisateur connecte) |
| **Quoi** | Saisie contenu caisse |
| **Pourquoi** | Fonction metier du module ADH |
| **Declencheur** | Appel depuis programme parent ou menu |
| **Resultat** | Traitement effectue selon logique programme |

### 1.2 Regles metier

| Code | Regle | Condition |
|------|-------|-----------|
| RM-001 | Execution du traitement principal | Conditions d'entree validees |
| RM-002 | Gestion des tables (39 tables) | Acces selon mode (R/W/L) |
| RM-003 | Appels sous-programmes (0 callees) | Selon logique metier |

### 1.3 Flux utilisateur

1. Reception des parametres d'entree (0 params)
2. Initialisation et verification conditions
3. Traitement principal (105 taches)
4. Appels sous-programmes si necessaire
5. Retour resultats

### 1.4 Cas d'erreur

| Erreur | Comportement |
|--------|--------------|
| Conditions non remplies | Abandon avec message |
| Erreur sous-programme | Propagation erreur |

---

<!-- TAB:Technique -->

## SPECIFICATION TECHNIQUE

### 2.1 Identification

| Attribut | Valeur |
|----------|--------|
| **IDE Position** | 120 |
| **Fichier XML** | `Prg_116.xml` |
| **Description** | Saisie contenu caisse |
| **Module** | ADH |
| **Public Name** |  |
| **Nombre taches** | 105 |
| **Lignes logique** | 1378 |
| **Expressions** | 0 |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 40 | comptable________cte | cafil018_dat | READ | Lecture |
| 50 | moyens_reglement_mor | cafil028_dat | READ | Lecture |
| 67 | tables___________tab | cafil045_dat | READ | Lecture |
| 70 | date_comptable___dat | cafil048_dat | READ | Lecture |
| 77 | articles_________art | cafil055_dat | READ | Lecture |
| 89 | moyen_paiement___mop | cafil067_dat | LINK/READ | Jointure+Lecture |
| 90 | devises__________dev | cafil068_dat | LINK | Jointure |
| 139 | moyens_reglement_mor | cafil117_dat | READ | Lecture |
| 140 | moyen_paiement___mop | cafil118_dat | READ | Lecture |
| 141 | devises__________dev | cafil119_dat | LINK | Jointure |
| 197 | articles_en_stock | caisse_artstock | LINK | Jointure |
| 198 | coupures_monnaie_locale | caisse_banknote | LINK | Jointure |
| 199 | fond_de_caisse_std_montant | caisse_caissstd_montant | LINK | Jointure |
| 200 | fond_de_caisse_std | caisse_caisstd | LINK/READ | Jointure+Lecture |
| 219 | communication_ims | caisse_com_ims | READ | Lecture |
| 220 | comptage_caisse_devise_histo | caisse_compcais_devise_histo | LINK | Jointure |
| 222 | comptage_caisse_histo | caisse_compcais_histo2 | LINK/READ | Jointure+Lecture |
| 223 | comptage_caisse_montant_histo | caisse_compcais_montant_histo | LINK | Jointure |
| 232 | gestion_devise_session | caisse_devise | LINK/WRITE | Jointure+Ecriture |
| 246 | histo_sessions_caisse | caisse_session | LINK/READ | Jointure+Lecture |
| 249 | histo_sessions_caisse_detail | caisse_session_detail | READ | Lecture |
| 263 | vente | caisse_vente | READ | Lecture |
| 372 | pv_budget | pv_budget_dat | READ | Lecture |
| 491 | soldes_par_mop | %club_user%_caisse_solde_par_mop | LINK/READ/WRITE | Jointure+R/W |
| 492 | edition_tableau_recap | caisse_tabrecap | LINK/READ/WRITE | Jointure+R/W |
| 493 | edition_ticket | %club_user%_caisse_ticket | LINK/READ/WRITE | Jointure+R/W |
| 501 | email_reprise | %club_user%_email_reprise | LINK/WRITE | Jointure+Ecriture |

**Resume**: 39 tables accedees dont **5 en ecriture**

### 2.3 Parametres d'entree (0 parametres)

| Var | Nom | Type | Picture |
|-----|-----|------|---------|
| - | Aucun parametre | - | - |

### 2.4 Algorigramme

```mermaid
flowchart TD
    START([START - 0 params])
    INIT["Initialisation"]
    PROCESS["Traitement principal<br/>105 taches"]
    CALLS["Appels sous-programmes<br/>0 callees"]
    ENDOK([END])

    START --> INIT --> PROCESS --> CALLS --> ENDOK

    style START fill:#3fb950
    style ENDOK fill:#f85149
    style PROCESS fill:#58a6ff
```

### 2.5 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 105 |
| **Lignes logique** | 1378 |
| **Expressions** | 0 |
| **Parametres** | 0 |
| **Tables accedees** | 39 |
| **Tables en ecriture** | 5 |
| **Callees niveau 1** | 0 |

---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    T[120 Saisie contenu ]
    ORPHAN([ORPHELIN ou Main])
    T -.-> ORPHAN
    style T fill:#58a6ff,color:#000
    style ORPHAN fill:#6b7280,stroke-dasharray: 5 5
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| - | ORPHELIN ou Main direct | - |

### 3.3 Callees (3 niveaux)

```mermaid
graph LR
    T[120 Saisie contenu ]
    TERM([TERMINAL])
    T -.-> TERM
    style TERM fill:#6b7280,stroke-dasharray: 5 5
    style T fill:#58a6ff,color:#000
```

| Niv | IDE | Programme | Nb appels | Status |
|-----|-----|-----------|-----------|--------|
| - | - | TERMINAL | - | - |

### 3.4 Composants ECF utilises

| ECF | IDE | Public Name | Description |
|-----|-----|-------------|-------------|
| - | - | Aucun composant ECF | - |

### 3.5 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | 0 programmes |
| PublicName | Non defini |
| ECF partage | NON |
| **Conclusion** | **ORPHELIN** - Pas de callers actifs |

---

## NOTES MIGRATION

### Complexite

| Critere | Score | Detail |
|---------|-------|--------|
| Taches | 105 | Complexe |
| Tables | 39 | Ecriture |
| Callees | 0 | Faible couplage |
| **Score global** | **HAUTE** | - |

### Points d'attention migration

| Point | Solution moderne |
|-------|-----------------|
| Variables globales (VG*) | Service/Repository injection |
| Tables Magic | Entity Framework / Dapper |
| CallTask | Service method calls |
| Forms | React/Angular components |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 23:05 | **V4.0 APEX/PDCA** - Generation automatique complete | Script |

---

*Specification V4.0 - Auto-generated with APEX/PDCA methodology*

