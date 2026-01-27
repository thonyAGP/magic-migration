# ADH IDE 298 - Programme supprime (Prg_295)

> **Version spec**: 3.5
> **Analyse**: 2026-01-27 17:57
> **Source**: `Prg_XXX.xml`

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur |
| **Quoi** | Programme supprime (Prg_295) |
| **Pourquoi** | A documenter |
| **Declencheur** | A identifier |

### 1.2 Regles metier

| Code | Regle | Condition |
|------|-------|-----------|
| RM-001 | A documenter | - |

### 1.3 Flux utilisateur

1. Demarrage programme
2. Traitement principal
3. Fin programme

### 1.4 Cas d'erreur

| Erreur | Comportement |
|--------|--------------|
| - | A documenter |

---

<!-- TAB:Technique -->

## SPECIFICATION TECHNIQUE

### 2.1 Identification

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 298 |
| **Description** | Programme supprime (Prg_295) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 1x |
| 50 | moyens_reglement_mor | `cafil028_dat` | R | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | R | 1x |
| 197 | articles_en_stock | `caisse_artstock` | L | 1x |
| 198 | coupures_monnaie_locale | `caisse_banknote` | R | 1x |
| 219 | communication_ims | `caisse_com_ims` | R | 2x |
| 227 | concurrence_sessions | `caisse_concurrences` | **W** | 1x |
| 232 | gestion_devise_session | `caisse_devise` | R | 2x |
| 244 | saisie_approvisionnement | `caisse_saisie_appro_dev` | L | 1x |
| 244 | saisie_approvisionnement | `caisse_saisie_appro_dev` | **W** | 1x |
| 246 | histo_sessions_caisse | `caisse_session` | L | 1x |
| 246 | histo_sessions_caisse | `caisse_session` | R | 1x |
| 246 | histo_sessions_caisse | `caisse_session` | **W** | 5x |
| 248 | sessions_coffre2 | `caisse_session_coffre2` | L | 1x |
| 248 | sessions_coffre2 | `caisse_session_coffre2` | **W** | 3x |
| 249 | histo_sessions_caisse_detail | `caisse_session_detail` | R | 4x |
| 249 | histo_sessions_caisse_detail | `caisse_session_detail` | **W** | 3x |
| 497 | ventes_par_mop | `%club_user%_caisse_vente_par_mop` | L | 1x |
| 497 | ventes_par_mop | `%club_user%_caisse_vente_par_mop` | R | 1x |
| 497 | ventes_par_mop | `%club_user%_caisse_vente_par_mop` | **W** | 1x |
| 697 | droits_applications | `droits` | R | 2x |
| 740 | pv_stock_movements | `pv_stockmvt_dat` | R | 1x |
### 2.3 Parametres d'entree

| Variable | Nom | Type | Picture |
|----------|-----|------|---------|
| - | Aucun parametre | - | - |
### 2.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    PROCESS[Traitement]
    ENDOK([END])
    START --> PROCESS --> ENDOK
    style START fill:#3fb950
    style ENDOK fill:#f85149
```

### 2.5 Expressions cles

| IDE | Expression | Commentaire |
|-----|------------|-------------|
| 1 | `{0,14}='O'` | - |
| 2 | `'FALSE'LOG` | - |
| 3 | `'D'` | - |

> **Total**: 3 expressions (affichees: 3)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 44 |
| **Lignes logique** | 1100 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    T[298 Gestion caisse 142]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| - | **Aucun caller** (point d'entree ou orphelin) | - |
### 3.3 Callees

```mermaid
graph LR
    T[298 Programme]
    C116[116 Calcul concu]
    T --> C116
    C142[142 Devise updat]
    T --> C142
    C134[134 Mise  jour d]
    T --> C134
    C139[139 Ticket appro]
    T --> C139
    C155[155 Controle fer]
    T --> C155
    C48[48 Contrles   I]
    T --> C48
    C122[122 Ouverture ca]
    T --> C122
    C131[131 Fermeture ca]
    T --> C131
    style T fill:#58a6ff,color:#000
    style C116 fill:#3fb950
    style C142 fill:#3fb950
    style C134 fill:#3fb950
    style C139 fill:#3fb950
    style C155 fill:#3fb950
    style C48 fill:#3fb950
    style C122 fill:#3fb950
    style C131 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 116 | Calcul concurrence sessions | 12 |
| 1 | 142 | Devise update session WS | 4 |
| 1 | 134 | Mise à jour detail session WS | 3 |
| 1 | 139 | Ticket appro remise | 3 |
| 1 | 155 | Controle fermeture caisse WS | 3 |
| 1 | 48 | Contrôles - Integrite dates | 2 |
| 1 | 122 | Ouverture caisse | 2 |
| 1 | 131 | Fermeture caisse | 2 |
| 1 | 140 | Init apport article session WS | 2 |
| 1 | 141 | Init devise session WS | 2 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 119 | Affichage sessions | 1 |
| 1 | 123 | Apport coffre | 1 |
| 1 | 124 | Apport articles | 1 |
| 1 | 125 | Remise en caisse | 1 |
| 1 | 132 | Historique session | 1 |
| 1 | 151 | Reimpression tickets fermeture | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:25 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (3 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
