# ADH IDE 114 - Club Med Pass Filiations

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
| **Quoi** | Club Med Pass Filiations |
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
| **Format IDE** | ADH IDE 114 |
| **Description** | Club Med Pass Filiations |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | L | 1x |
| 312 | ez_card | `ezcard` | L | 1x |
| 312 | ez_card | `ezcard` | **W** | 1x |
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
| 3 | `{0,1}` | - |
| 4 | `{0,2}` | - |
| 5 | `Trim ({0,5})&' '&{0,6}` | - |
| 6 | `IF ({0,16}>0,Str ({0,16},'###'),IF ({0,17}=0,''...` | - |
| 7 | `IF ({0,16}>0,'ans',IF ({0,17}=0,'','mois'))` | - |
| 8 | `'-'` | - |
| 9 | `IF ({0,15}<Date (),MlsTrans ('dernier sejour :'...` | - |
| 10 | `MlsTrans ('du')` | - |
| 11 | `MlsTrans ('au')` | - |
| 12 | `{0,11}=0` | - |
| 13 | `{0,19} AND ({0,4}*1000+{0,11}<>{0,22}*1000+{0,2...` | - |
| 14 | `{0,18}` | - |
| 15 | `'TRUE'LOG` | - |
| 16 | `CallProg('{160,-1}'PROG,{0,3},{0,4},{0,11})` | - |
| 17 | `{0,30}` | - |
| 18 | `'FALSE'LOG` | - |
| 19 | `Trim({0,30})<>'' AND Trim({0,30})<>Trim({0,18})` | - |
| 20 | `1` | - |

> **Total**: 25 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 2 |
| **Lignes logique** | 90 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N112[112 Garantie sur]
    N163[163 Menu caisse ]
    N111[111 Garantie sur]
    N1[1 Main Program]
    N288[288 Garantie sur]
    T[114 Club Med Pas]
    N112 --> N163
    N163 --> N111
    N111 --> N1
    N1 --> N288
    N288 --> T
    style M fill:#8b5cf6,color:#fff
    style N112 fill:#f59e0b
    style N163 fill:#f59e0b
    style N111 fill:#f59e0b
    style N1 fill:#f59e0b
    style N288 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 111 | Garantie sur compte | 1 |
| 112 | Garantie sur compte PMS-584 | 1 |
| 163 | Menu caisse GM - scroll | 1 |
| 288 | Garantie sur compte | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[114 Programme]
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
| 2026-01-27 20:20 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:46 | **DATA POPULATED** - Tables, Callgraph (25 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
