# ADH IDE 121 - Gestion caisse

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
| **Quoi** | Gestion caisse |
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
| **Format IDE** | ADH IDE 121 |
| **Description** | Gestion caisse |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #23 | `Table_23` | R | 1x |
| #70 | `Table_70` | R | 1x |
| #197 | `Table_197` | LINK | 1x |
| #198 | `Table_198` | R | 1x |
| #227 | `Table_227` | **W** | 1x |
| #232 | `Table_232` | R | 1x |
| #244 | `Table_244` | LINK | 1x |
| #244 | `Table_244` | **W** | 1x |
| #246 | `Table_246` | LINK | 1x |
| #246 | `Table_246` | R | 1x |
| #246 | `Table_246` | **W** | 4x |
| #248 | `Table_248` | LINK | 1x |
| #248 | `Table_248` | **W** | 2x |
| #249 | `Table_249` | LINK | 1x |
| #249 | `Table_249` | R | 3x |
| #697 | `Table_697` | R | 2x |
| #740 | `Table_740` | R | 2x |
### 2.3 Parametres d'entree



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



### 2.6 Variables importantes



### 2.7 Statistiques



---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    T[121 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 163 | Menu caisse GM - scroll | 2 |
| 281 | Fermeture Sessions | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[121 Programme]
    C116[116 Calcul concurre]
    T --> C116
    C134[134 Mise  jour deta]
    T --> C134
    C139[139 Ticket appro re]
    T --> C139
    C48[48 Contrles   Inte]
    T --> C48
    C122[122 Ouverture caiss]
    T --> C122
    C131[131 Fermeture caiss]
    T --> C131
    C155[155 Controle fermet]
    T --> C155
    C43[43 Recuperation du]
    T --> C43
    style T fill:#58a6ff,color:#000
    style C116 fill:#3fb950
    style C134 fill:#3fb950
    style C139 fill:#3fb950
    style C48 fill:#3fb950
    style C122 fill:#3fb950
    style C131 fill:#3fb950
    style C155 fill:#3fb950
    style C43 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 116 | Calcul concurrence sessions | 12 |
| 1 | 134 | Mise à jour detail session WS | 3 |
| 1 | 139 | Ticket appro remise | 3 |
| 1 | 48 | Contrôles - Integrite dates | 2 |
| 1 | 122 | Ouverture caisse | 2 |
| 1 | 131 | Fermeture caisse | 2 |
| 1 | 155 | Controle fermeture caisse WS | 2 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 119 | Affichage sessions | 1 |
| 1 | 123 | Apport coffre | 1 |
| 1 | 124 | Apport articles | 1 |
| 1 | 125 | Remise en caisse | 1 |
| 1 | 132 | Historique session | 1 |
| 1 | 140 | Init apport article session WS | 1 |
| 1 | 141 | Init devise session WS | 1 |
| 1 | 151 | Reimpression tickets fermeture | 1 |
| 1 | 156 | Verif session caisse ouverte2 | 1 |
| 1 | 231 | Raisons utilisation ADH | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:43 | **DATA POPULATED** - Tables, Callgraph (7 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
