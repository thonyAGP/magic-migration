# ADH IDE 147 - Devises des tickets WS

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
| **Quoi** | Devises des tickets WS |
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
| **Format IDE** | ADH IDE 147 |
| **Description** | Devises des tickets WS |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 50 | moyens_reglement_mor | `cafil028_dat` | R | 2x |
| 139 | moyens_reglement_mor | `cafil117_dat` | L | 1x |
| 139 | moyens_reglement_mor | `cafil117_dat` | R | 1x |
| 232 | gestion_devise_session | `caisse_devise` | L | 1x |
| 232 | gestion_devise_session | `caisse_devise` | R | 2x |
| 250 | histo_sessions_caisse_devise | `caisse_session_devise` | L | 1x |
| 250 | histo_sessions_caisse_devise | `caisse_session_devise` | R | 1x |
| 513 | pv_invoiceprintfiliationtmp | `%club_user%_pv_filiations` | L | 1x |
| 513 | pv_invoiceprintfiliationtmp | `%club_user%_pv_filiations` | **W** | 5x |
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
| 1 | `{0,4}='O'` | - |
| 2 | `{0,4}='F'` | - |
| 3 | `DbDel ('{513,4}'DSOURCE,'')` | - |

> **Total**: 3 expressions (affichees: 3)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 14 |
| **Lignes logique** | 149 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N298[298 Gestion cais]
    N121[121 Gestion cais]
    N281[281 Fermeture Se]
    N1[1 Main Program]
    N163[163 Menu caisse ]
    T[147 Devises des ]
    N298 --> N121
    N121 --> N281
    N281 --> N1
    N1 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N298 fill:#f59e0b
    style N121 fill:#f59e0b
    style N281 fill:#f59e0b
    style N1 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 131 | Fermeture caisse | 2 |
| 299 | Fermeture caisse 144 | 2 |
| 122 | Ouverture caisse | 1 |
| 297 | Ouverture caisse 143 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[147 Programme]
    C145[145 Devises fina]
    T --> C145
    style T fill:#58a6ff,color:#000
    style C145 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 145 | Devises finales F/F Qte WS | 2 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:21 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:47 | **DATA POPULATED** - Tables, Callgraph (3 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
