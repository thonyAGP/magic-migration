# ADH IDE 151 - Reimpression tickets fermeture

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
| **Quoi** | Reimpression tickets fermeture |
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
| **Format IDE** | ADH IDE 151 |
| **Description** | Reimpression tickets fermeture |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 246 | histo_sessions_caisse | `caisse_session` | R | 1x |
| 249 | histo_sessions_caisse_detail | `caisse_session_detail` | R | 1x |
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
| 1 | `'F'` | - |
| 2 | `'FALSE'LOG` | - |
| 3 | `'TRUE'LOG` | - |
| 4 | `{0,23}='00/00/0000'DATE` | - |
| 5 | `{0,24}<>'00/00/0000'DATE` | - |
| 6 | `NOT ({0,22})` | - |

> **Total**: 6 expressions (affichees: 6)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 5 |
| **Lignes logique** | 152 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N121[121 Gestion cais]
    N298[298 Gestion cais]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    N281[281 Fermeture Se]
    T[151 Reimpression]
    N121 --> N298
    N298 --> N163
    N163 --> N1
    N1 --> N281
    N281 --> T
    style M fill:#8b5cf6,color:#fff
    style N121 fill:#f59e0b
    style N298 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style N281 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 121 | Gestion caisse | 1 |
| 298 | Gestion caisse 142 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[151 Programme]
    C154[154 Tableau reca]
    T --> C154
    C138[138 Ticket ferme]
    T --> C138
    C139[139 Ticket appro]
    T --> C139
    style T fill:#58a6ff,color:#000
    style C154 fill:#3fb950
    style C138 fill:#3fb950
    style C139 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 154 | Tableau recap fermeture | 2 |
| 1 | 138 | Ticket fermeture session | 1 |
| 1 | 139 | Ticket appro remise | 1 |
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
| 2026-01-27 19:47 | **DATA POPULATED** - Tables, Callgraph (6 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
