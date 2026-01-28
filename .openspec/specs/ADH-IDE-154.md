# ADH IDE 154 - Tableau recap fermeture

> **Version spec**: 4.0
> **Analyse**: 2026-01-27 23:07
> **Source**: `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_150.xml`
> **Methode**: APEX + PDCA (Auto-generated)

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur (utilisateur connecte) |
| **Quoi** | Tableau recap fermeture |
| **Pourquoi** | Fonction metier du module ADH |
| **Declencheur** | Appel depuis programme parent ou menu |
| **Resultat** | Traitement effectue selon logique programme |

### 1.2 Regles metier

| Code | Regle | Condition |
|------|-------|-----------|
| RM-001 | Execution du traitement principal | Conditions d'entree validees |
| RM-002 | Gestion des tables (33 tables) | Acces selon mode (R/W/L) |
| RM-003 | Appels sous-programmes (0 callees) | Selon logique metier |

### 1.3 Flux utilisateur

1. Reception des parametres d'entree (0 params)
2. Initialisation et verification conditions
3. Traitement principal (93 taches)
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
| **IDE Position** | 154 |
| **Fichier XML** | `Prg_150.xml` |
| **Description** | Tableau recap fermeture |
| **Module** | ADH |
| **Public Name** |  |
| **Nombre taches** | 93 |
| **Lignes logique** | 1934 |
| **Expressions** | 0 |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | cafil008_dat | READ | Lecture |
| 31 | gm-complet_______gmc | cafil009_dat | READ | Lecture |
| 44 | change___________chg | cafil022_dat | LINK | Jointure |
| 50 | moyens_reglement_mor | cafil028_dat | READ | Lecture |
| 67 | tables___________tab | cafil045_dat | LINK/READ | Jointure+Lecture |
| 70 | date_comptable___dat | cafil048_dat | READ | Lecture |
| 77 | articles_________art | cafil055_dat | READ | Lecture |
| 139 | moyens_reglement_mor | cafil117_dat | LINK | Jointure |
| 147 | change_vente_____chg | cafil125_dat | LINK | Jointure |
| 196 | gestion_article_session | caisse_article | READ | Lecture |
| 197 | articles_en_stock | caisse_artstock | LINK | Jointure |
| 222 | comptage_caisse_histo | caisse_compcais_histo2 | READ | Lecture |
| 232 | gestion_devise_session | caisse_devise | LINK/READ | Jointure+Lecture |
| 247 | histo_sessions_caisse_article | caisse_session_article | LINK/READ | Jointure+Lecture |
| 249 | histo_sessions_caisse_detail | caisse_session_detail | READ | Lecture |
| 251 | histo_sessions_caisse_remise | caisse_session_remise | READ | Lecture |
| 266 | cc_comptable | cccompta | READ | Lecture |
| 324 | frais_change___fchg | fraissurchange_dat | LINK | Jointure |
| 463 | heure_de_passage | verifpool_dat | LINK/READ | Jointure+Lecture |
| 474 | comptage_caisse_devise | %club_user%_caisse_compcais_devise | LINK | Jointure |
| 487 | saisie_remise_en_caisse | %club_user%_caisse_remise | LINK/READ/WRITE | Jointure+R/W |
| 505 | pv_comptable | %club_user%_pv_cafil18_dat | READ | Lecture |
| 510 | pv_discounts | %club_user%_pv_disctmp_dat | LINK/READ/WRITE | Jointure+R/W |
| 693 | devise_in | devisein_par | LINK/READ | Jointure+Lecture |

**Resume**: 33 tables accedees dont **2 en ecriture**

### 2.3 Parametres d'entree (0 parametres)

| Var | Nom | Type | Picture |
|-----|-----|------|---------|
| - | Aucun parametre | - | - |

### 2.4 Algorigramme

```mermaid
flowchart TD
    START([START - 0 params])
    INIT["Initialisation"]
    PROCESS["Traitement principal<br/>93 taches"]
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
| **Taches** | 93 |
| **Lignes logique** | 1934 |
| **Expressions** | 0 |
| **Parametres** | 0 |
| **Tables accedees** | 33 |
| **Tables en ecriture** | 2 |
| **Callees niveau 1** | 0 |

---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    T[154 Tableau recap f]
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
    T[154 Tableau recap f]
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
| Taches | 93 | Complexe |
| Tables | 33 | Ecriture |
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
| 2026-01-27 23:07 | **V4.0 APEX/PDCA** - Generation automatique complete | Script |

---

*Specification V4.0 - Auto-generated with APEX/PDCA methodology*

