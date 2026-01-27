# ADH IDE 274 - Programme supprime (Prg_270)

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
| **Quoi** | Programme supprime (Prg_270) |
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
| **Format IDE** | ADH IDE 274 |
| **Description** | Programme supprime (Prg_270) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 34 | hebergement______heb | `cafil012_dat` | R | 1x |
| 103 | logement_client__loc | `cafil081_dat` | L | 1x |
| 105 | logement_complement | `cafil083_dat` | L | 1x |
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
| 1 | `Date ()` | - |
| 2 | `{32768,2}` | - |
| 3 | `'Tous'` | - |
| 4 | `{0,4}` | - |
| 5 | `{32768,20}>1` | - |
| 6 | `''` | - |
| 7 | `IF(Trim({0,17})='','',Trim({0,17})&' AND ')&'lo...` | - |
| 8 | `Trim({0,8})<>'T'` | - |
| 9 | `IF(Trim({0,17})='','',Trim({0,17})&' AND ')&
'...` | - |
| 10 | `Trim({0,9})<>'Tous'` | - |
| 11 | `IF(Trim({0,17})='','',Trim({0,17})&' AND ')&'lo...` | - |
| 12 | `Trim({0,10})<>'To'` | - |
| 13 | `IF(Trim({0,17})='','',Trim({0,17})&' AND ')&'lo...` | - |
| 14 | `Trim({0,13})<>'To'` | - |
| 15 | `IF(Trim({0,17})='','',Trim({0,17})&' AND ')&'lo...` | - |
| 16 | `Trim({0,11})<>'To'` | - |
| 17 | `IF(Trim({0,17})='','',Trim({0,17})&' AND ')&'lo...` | - |
| 18 | `Trim({0,12})<>'To'` | - |
| 19 | `IF(Trim({0,17})='','',Trim({0,17})&' AND ')&'lo...` | - |
| 20 | `Trim({0,14})<>'T'` | - |

> **Total**: 38 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 3 |
| **Lignes logique** | 116 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N316[316 Saisie trans]
    N0[0 Transaction ]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    N242[242 Menu Choix S]
    T[274 Zoom Logemen]
    N316 --> N0
    N0 --> N163
    N163 --> N1
    N1 --> N242
    N242 --> T
    style M fill:#8b5cf6,color:#fff
    style N316 fill:#f59e0b
    style N0 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style N242 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 248 | Choix PYR (plusieurs chambres) | 2 |
| 0 | Transaction Nouv vente PMS-584 | 1 |
| 0 | Transaction Nouv vente PMS-710 | 1 |
| 0 | Transaction Nouv vente PMS-721 | 1 |
| 237 | Transaction Nouv vente avec GP | 1 |
| 238 | Transaction Nouv vente PMS-584 | 1 |
| 239 | Transaction Nouv vente PMS-721 | 1 |
| 240 | Transaction Nouv vente PMS-710 | 1 |
| 316 | Saisie transaction Nouv vente | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[274 Programme]
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
| 2026-01-27 20:25 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (38 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
