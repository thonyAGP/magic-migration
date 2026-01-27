# ADH IDE 44 - Appel programme

> **Version spec**: 3.5
> **Analyse**: 2026-01-27 17:56
> **Source**: `Prg_XXX.xml`

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur |
| **Quoi** | Appel programme |
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
| **Format IDE** | ADH IDE 44 |
| **Description** | Appel programme |
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
| 1 | `LastClicked ()` | - |

> **Total**: 1 expressions (affichees: 1)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 4 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N0[0 Garantie sur]
    N25[25 Change GM]
    N69[69 Extrait de c]
    N1[1 Main Program]
    N163[163 Menu caisse ]
    T[44 Appel progra]
    N0 --> N25
    N25 --> N69
    N69 --> N1
    N1 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N0 fill:#f59e0b
    style N25 fill:#f59e0b
    style N69 fill:#f59e0b
    style N1 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 25 | Change GM | 3 |
| 40 | Comptes de depôt | 3 |
| 0 | Garantie sur compte PMS-584 | 2 |
| 111 | Garantie sur compte | 2 |
| 112 | Garantie sur compte PMS-584 | 2 |
| 168 | Gratuités | 2 |
| 174 | Versement/Retrait | 2 |
| 217 | Menu telephone | 2 |
| 288 | Garantie sur compte | 2 |
| 317 | Gratuités P157 | 2 |
| 37 | Menu changement compte | 1 |
| 69 | Extrait de compte | 1 |
| 77 | Club Med Pass menu | 1 |
| 86 | Bar Limit | 1 |
| 158 | Menu Great Member | 1 |
| 163 | Menu caisse GM - scroll | 1 |
| 173 | Gestion forfait TAI LOCAL | 1 |
| 190 | Menu solde d'un compte | 1 |
| 214 | Menu impression des appels | 1 |
| 242 | Menu Choix Saisie/Annul vente | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[44 Programme]
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
| 2026-01-27 20:18 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (1 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
