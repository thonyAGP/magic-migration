# ADH IDE 181 - Set Listing Number

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
| **Quoi** | Set Listing Number |
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
| **Format IDE** | ADH IDE 181 |
| **Description** | Set Listing Number |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| - | Aucune table | - | - | - |
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
| 1 | `SetParam ('CURRENTLISTINGNUM',{0,1})` | - |
| 2 | `SetParam ('CURRENTPRINTERNUM',0)` | - |
| 3 | `SetParam ('CURRENTPRINTERNAME','VOID')` | - |
| 4 | `SetParam ('NUMBERCOPIES',0)` | - |
| 5 | `GetParam ('SPECIFICPRINT')='VOID'` | - |

> **Total**: 5 expressions (affichees: 5)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 11 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N283[283 Easy Check O]
    N66[66 Lancement So]
    N163[163 Menu caisse ]
    N55[55 Easy Check O]
    N37[37 Menu changem]
    T[181 Set Listing ]
    M --> N283
    N283 --> N66
    N66 --> N163
    N163 --> N55
    N55 --> N37
    N37 --> T
    style M fill:#8b5cf6,color:#fff
    style N283 fill:#f59e0b
    style N66 fill:#f59e0b
    style N163 fill:#f59e0b
    style N55 fill:#f59e0b
    style N37 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 69 | Extrait de compte | 7 |
| 193 | Solde compte fin sejour | 5 |
| 217 | Menu telephone | 5 |
| 111 | Garantie sur compte | 4 |
| 112 | Garantie sur compte PMS-584 | 4 |
| 174 | Versement/Retrait | 4 |
| 288 | Garantie sur compte | 4 |
| 40 | Comptes de depôt | 3 |
| 255 | VAD validés à imprimer | 3 |
| 79 | Balance Credit de conso | 2 |
| 173 | Gestion forfait TAI LOCAL | 2 |
| 25 | Change GM | 1 |
| 27 | Separation | 1 |
| 28 | Fusion | 1 |
| 64 | Solde Easy Check Out | 1 |
| 70 | Print extrait compte /Nom | 1 |
| 71 | Print extrait compte /Date | 1 |
| 72 | Print extrait compte /Cum | 1 |
| 73 | Print extrait compte /Imp | 1 |
| 76 | Print extrait compte /Service | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[181 Programme]
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
| 2026-01-27 20:22 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (5 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
