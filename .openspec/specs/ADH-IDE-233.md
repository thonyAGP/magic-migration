# ADH IDE 233 - Appel Print ticket vente PMS28

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
| **Quoi** | Appel Print ticket vente PMS28 |
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
| **Format IDE** | ADH IDE 233 |
| **Description** | Appel Print ticket vente PMS28 |
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
| 1 | `{32768,59}` | - |
| 2 | `Left({32768,22},Len(Trim({32768,22}))-1)` | - |

> **Total**: 2 expressions (affichees: 2)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 44 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N0[0 Transaction ]
    N0[0 Transaction ]
    N316[316 Saisie trans]
    N242[242 Menu Choix S]
    N0[0 Transaction ]
    T[233 Appel Print ]
    M --> N0
    N0 --> N0
    N0 --> N316
    N316 --> N242
    N242 --> N0
    N0 --> T
    style M fill:#8b5cf6,color:#fff
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N316 fill:#f59e0b
    style N242 fill:#f59e0b
    style N0 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 312 | Historique des ventes - Gratui | 4 |
| 319 | Annulation Ventes Gratuites | 4 |
| 245 | Histo ventes payantes /PMS-623 | 3 |
| 237 | Transaction Nouv vente avec GP | 2 |
| 239 | Transaction Nouv vente PMS-721 | 2 |
| 240 | Transaction Nouv vente PMS-710 | 2 |
| 243 | Histo ventes payantes | 2 |
| 244 | Histo ventes payantes /PMS-605 | 2 |
| 252 | Histo ventes IGR | 2 |
| 253 | Histo ventes Gratuités | 2 |
| 255 | VAD validés à imprimer | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[233 Programme]
    C234[234  Print ticke]
    T --> C234
    C235[235  Print ticke]
    T --> C235
    style T fill:#58a6ff,color:#000
    style C234 fill:#3fb950
    style C235 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 234 |  Print ticket vente | 1 |
| 1 | 235 |  Print ticket vente LEX | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:24 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (2 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
