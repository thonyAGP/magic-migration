# ADH IDE 237 - Transaction Nouv vente avec GP

> **Version spec**: 4.0
> **Analyse**: 2026-01-28 12:29
> **Source**: `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_233.xml`
> **Methode**: APEX 4-Phase Workflow (Auto-generated)

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur (utilisateur connecte) |
| **Quoi** | Transaction Nouv vente avec GP |
| **Pourquoi** | Fonction metier du module ADH |
| **Declencheur** | Appel depuis programme parent ou menu |
| **Resultat** | Traitement effectue selon logique programme |

### 1.2 Regles metier

| Code | Regle | Condition |
|------|-------|-----------|
| RM-001 | Traitement principal | Conditions initiales validees |

### 1.3 Flux utilisateur

1. Reception des parametres d'entree (0 params)
2. Initialisation et verification conditions
3. Traitement principal (49 taches)
4. Appels sous-programmes (0 callees)
5. Retour resultats

### 1.4 Cas d'erreur

| Erreur | Comportement |
|--------|--------------|
| Conditions non remplies | Abandon avec message |
| Erreur sous-programme | Propagation erreur |
| Donnees invalides | Validation et rejet |

### 1.5 Dependances ECF

Programme local ADH - Non partage via ECF

---

<!-- TAB:Technique -->

## SPECIFICATION TECHNIQUE

### 2.1 Identification

| Attribut | Valeur |
|----------|--------|
| **IDE Position** | 237 |
| **Fichier XML** | `Prg_233.xml` |
| **Description** | Transaction Nouv vente avec GP |
| **Module** | ADH |
| **Public Name** | - |
| **Nombre taches** | 49 |
| **Lignes logique** | 1818 |
| **Expressions** | 0 |

### 2.2 Tables - 30 tables dont 9 en ecriture

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **READ/WRITE** | 5x |
| #26 | `cafil004_dat` | comptes_speciaux_spc | **LINK** | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | **LINK/READ** | 3x |
| #32 | `cafil010_dat` | prestations | **READ/WRITE** | 3x |
| #34 | `cafil012_dat` | hebergement______heb | **LINK** | 1x |
| #39 | `cafil017_dat` | depot_garantie___dga | **READ** | 1x |
| #46 | `cafil024_dat` | mvt_prestation___mpr | **LINK/WRITE** | 2x |
| #47 | `cafil025_dat` | compte_gm________cgm | **WRITE** | 2x |
| #50 | `cafil028_dat` | moyens_reglement_mor | **READ** | 3x |
| #67 | `cafil045_dat` | tables___________tab | **LINK** | 1x |
| #68 | `cafil046_dat` | compteurs________cpt | **WRITE** | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | **LINK** | 1x |
| #77 | `cafil055_dat` | articles_________art | **LINK/READ** | 4x |
| #79 | `cafil057_dat` | gratuites________gra | **READ** | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | **LINK/READ** | 8x |
| #96 | `cafil074_dat` | table_prestation_pre | **LINK** | 1x |
| #103 | `cafil081_dat` | logement_client__loc | **READ** | 1x |
| #109 | `cafil087_dat` | table_utilisateurs | **READ** | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | **READ** | 1x |
| #140 | `cafil118_dat` | moyen_paiement___mop | **LINK** | 1x |

> *Liste limitee aux 20 tables principales*

### 2.3 Parametres d'entree - 0 parametres

| Var | Nom | Type | Direction | Picture |
|-----|-----|------|-----------|---------|
| - | Aucun parametre | - | - | - |

### 2.4 Algorigramme

```mermaid
flowchart TD
    START([START - 0 params])
    INIT["Initialisation"]
    PROCESS["Traitement principal<br/>49 taches"]
    CALLS["Appels sous-programmes<br/>0 callees"]
    ENDOK([END])

    START --> INIT --> PROCESS --> CALLS --> ENDOK

    style START fill:#3fb950
    style ENDOK fill:#f85149
    style PROCESS fill:#58a6ff
```

### 2.5 Expressions cles (selection)

| # | Expression | Commentaire |
|---|------------|-------------|
| - | Aucune expression | - |

> *0 expressions au total. Liste limitee aux 10 premieres.*

### 2.6 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 49 |
| **Lignes logique** | 1818 |
| **Expressions** | 0 |
| **Parametres** | 0 |
| **Tables accedees** | 30 |
| **Tables en ecriture** | 9 |
| **Callees niveau 1** | 0 |

---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    T[237 Transaction Nou]
    ORPHAN([ORPHELIN ou Main])
    T -.-> ORPHAN
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| - | Point d'entree ou orphelin | - |

### 3.3 Callees (3 niveaux)

```mermaid
graph LR
    T[237 Transaction Nou]
    TERM([TERMINAL])
    T -.-> TERM
    style TERM fill:#6b7280,stroke-dasharray: 5 5
    style T fill:#58a6ff,color:#000
```

| Niv | IDE | Programme | Nb appels | Status |
|-----|-----|-----------|-----------|--------|
| - | - | TERMINAL (aucun appel) | - | - |

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
| **Conclusion** | **ORPHELIN** - No callers, no PublicName, not ECF |

---

## NOTES MIGRATION

### Complexite

| Critere | Score | Detail |
|---------|-------|--------|
| Taches | 49 | Complexe |
| Tables | 30 | Ecriture (9 tables) |
| Callees | 0 | Faible couplage |
| **Score global** | **2458** | **HAUTE** |

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
| 2026-01-28 12:29 | **V4.0 APEX Workflow** - Generation automatique 4 phases | Script |

---

*Specification V4.0 - Generated with APEX 4-Phase Workflow*

