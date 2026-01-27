# ADH IDE 169 - Messages

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
| **Quoi** | Messages |
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
| **Format IDE** | ADH IDE 169 |
| **Description** | Messages |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #36 | `Table_36` | R | 1x |
| #47 | `Table_47` | **W** | 2x |
| #80 | `Table_80` | R | 1x |
| #88 | `Table_88` | **W** | 2x |
| #123 | `Table_123` | LINK | 3x |
| #123 | `Table_123` | R | 1x |
| #131 | `Table_131` | **W** | 1x |
| #136 | `Table_136` | **W** | 2x |
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
    T[169 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 0 |  Print ticket vente LEX | 1 |
| 0 | Garantie sur compte PMS-584 | 1 |
| 0 | Histo ventes Gratuités | 1 |
| 0 | Histo ventes IGR | 1 |
| 0 | Histo ventes payantes /PMS-605 | 1 |
| 0 | Histo ventes payantes /PMS-623 | 1 |
| 0 | Print creation garanti PMS-584 | 1 |
| 0 | Print extrait compte /Service | 1 |
| 0 | Print transferts | 1 |
| 0 | Transaction Nouv vente PMS-584 | 1 |
| 0 | Transaction Nouv vente PMS-710 | 1 |
| 0 | Transaction Nouv vente PMS-721 | 1 |
| 163 | Menu caisse GM - scroll | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[169 Programme]
    C43[43 Recuperation du]
    T --> C43
    C170[170 Messagerie]
    T --> C170
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C170 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 170 | Messagerie | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (6 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
