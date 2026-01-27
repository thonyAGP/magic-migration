# ADH IDE 180 - Printer choice

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
| **Quoi** | Printer choice |
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
| **Format IDE** | ADH IDE 180 |
| **Description** | Printer choice |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 367 | pms_print_param_default | `pmsprintparamdefault` | R | 2x |
| 369 | presents_par_nationalite | `presparn` | L | 2x |
| 370 | pv_accounting_date | `pv_accountdate_dat` | R | 1x |
| 371 | pv_binding_settings | `pv_bindingset_dat` | L | 1x |
| 584 | tempo_type_millesia | `%club_user%tmillesia_dat` | L | 2x |
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
| 1 | `{0,1}` | - |
| 2 | `'FALSE'LOG` | - |
| 3 | `NOT {32768,78}` | - |
| 4 | `{32768,78}` | - |

> **Total**: 4 expressions (affichees: 4)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 5 |
| **Lignes logique** | 97 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N25[25 Change GM]
    N69[69 Extrait de c]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    N37[37 Menu changem]
    T[180 Printer choi]
    N25 --> N69
    N69 --> N163
    N163 --> N1
    N1 --> N37
    N37 --> T
    style M fill:#8b5cf6,color:#fff
    style N25 fill:#f59e0b
    style N69 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style N37 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 173 | Gestion forfait TAI LOCAL | 2 |
| 217 | Menu telephone | 2 |
| 25 | Change GM | 1 |
| 27 | Separation | 1 |
| 28 | Fusion | 1 |
| 40 | Comptes de depôt | 1 |
| 69 | Extrait de compte | 1 |
| 77 | Club Med Pass menu | 1 |
| 86 | Bar Limit | 1 |
| 154 | Tableau recap fermeture | 1 |
| 175 | Transferts | 1 |
| 183 | Other Listing | 1 |
| 185 | Chained Listing Printer Choice | 1 |
| 214 | Menu impression des appels | 1 |
| 237 | Transaction Nouv vente avec GP | 1 |
| 238 | Transaction Nouv vente PMS-584 | 1 |
| 239 | Transaction Nouv vente PMS-721 | 1 |
| 240 | Transaction Nouv vente PMS-710 | 1 |
| 293 | Bi  Change GM Achat | 1 |
| 294 | Bi  Change GM Vente | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[180 Programme]
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
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (4 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
