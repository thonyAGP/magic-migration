# ADH IDE 182 - Raz Current Printer

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
| **Quoi** | Raz Current Printer |
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
| **Format IDE** | ADH IDE 182 |
| **Description** | Raz Current Printer |
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
| 1 | `SetParam ('CURRENTPRINTERNUM',0)` | - |
| 2 | `SetParam ('CURRENTPRINTERNAME','VOID')` | - |
| 3 | `SetParam ('SPECIFICPRINT','VOID')` | - |
| 4 | `SetParam ('NUMBERCOPIES',0)` | - |
| 5 | `SetParam ('LISTINGNUMPRINTERCHOICE',0)` | - |

> **Total**: 5 expressions (affichees: 5)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 12 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N37[37 Menu changem]
    N24[24 Print reu ch]
    N174[174 VersementRet]
    N1[1 Main Program]
    N163[163 Menu caisse ]
    T[182 Raz Current ]
    N37 --> N24
    N24 --> N174
    N174 --> N1
    N1 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N37 fill:#f59e0b
    style N24 fill:#f59e0b
    style N174 fill:#f59e0b
    style N1 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 24 | Print reçu change vente | 1 |
| 25 | Change GM | 1 |
| 27 | Separation | 1 |
| 28 | Fusion | 1 |
| 36 | Print Separation ou fusion | 1 |
| 39 | Print extrait ObjDevSce | 1 |
| 40 | Comptes de depôt | 1 |
| 69 | Extrait de compte | 1 |
| 70 | Print extrait compte /Nom | 1 |
| 71 | Print extrait compte /Date | 1 |
| 72 | Print extrait compte /Cum | 1 |
| 73 | Print extrait compte /Imp | 1 |
| 74 | Print extrait DateImp /O | 1 |
| 76 | Print extrait compte /Service | 1 |
| 77 | Club Med Pass menu | 1 |
| 78 | Print Ventes Club Med Pass | 1 |
| 79 | Balance Credit de conso | 1 |
| 86 | Bar Limit | 1 |
| 107 | Print creation garantie | 1 |
| 108 | Print annulation garantie | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[182 Programme]
    C179[179 Get Printer]
    T --> C179
    style T fill:#58a6ff,color:#000
    style C179 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 179 | Get Printer | 1 |
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
