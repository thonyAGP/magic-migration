# ADH IDE 152 - Recup Classe et Lib du MOP

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
| **Quoi** | Recup Classe et Lib du MOP |
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
| **Format IDE** | ADH IDE 152 |
| **Description** | Recup Classe et Lib du MOP |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 50 | moyens_reglement_mor | `cafil028_dat` | R | 1x |
| 89 | moyen_paiement___mop | `cafil067_dat` | L | 1x |
| 140 | moyen_paiement___mop | `cafil118_dat` | R | 1x |
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
| 1 | `{0,4}<>'B'` | - |
| 2 | `{0,4}='B'` | - |

> **Total**: 2 expressions (affichees: 2)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 3 |
| **Lignes logique** | 29 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N316[316 Saisie trans]
    N310[310 Saisie trans]
    N298[298 Gestion cais]
    N233[233 Appel Print ]
    N299[299 Fermeture ca]
    T[152 Recup Classe]
    M --> N316
    N316 --> N310
    N310 --> N298
    N298 --> N233
    N233 --> N299
    N299 --> T
    style M fill:#8b5cf6,color:#fff
    style N316 fill:#f59e0b
    style N310 fill:#f59e0b
    style N298 fill:#f59e0b
    style N233 fill:#f59e0b
    style N299 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 234 |  Print ticket vente | 5 |
| 235 |  Print ticket vente LEX | 5 |
| 236 |  Print ticket vente PMS-584 | 5 |
| 285 |  Print ticket vente LEX | 5 |
| 323 |  Print ticket vente | 5 |
| 237 | Transaction Nouv vente avec GP | 4 |
| 238 | Transaction Nouv vente PMS-584 | 4 |
| 239 | Transaction Nouv vente PMS-721 | 4 |
| 240 | Transaction Nouv vente PMS-710 | 4 |
| 307 | Saisie transaction 154  N.U | 4 |
| 310 | Saisie transaction Nouv vente | 4 |
| 316 | Saisie transaction Nouv vente | 4 |
| 155 | Controle fermeture caisse WS | 3 |
| 300 | Saisie transaction 154 N.U | 2 |
| 306 | Print ticket vente/OD N.U | 2 |
### 3.3 Callees

```mermaid
graph LR
    T[152 Programme]
    NONE[Aucun callee]
    T -.-> NONE
    style T fill:#58a6ff,color:#000
    style NONE fill:#6b7280,stroke-dasharray: 5 5
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| - | - | Programme terminal | - |
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
| 2026-01-27 19:47 | **DATA POPULATED** - Tables, Callgraph (2 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
