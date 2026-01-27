# ADH IDE 190 - Menu solde d'un compte

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
| **Quoi** | Menu solde d'un compte |
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
| **Format IDE** | ADH IDE 190 |
| **Description** | Menu solde d'un compte |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 40 | comptable________cte | `cafil018_dat` | R | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | R | 1x |
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
| 3 | `Trim ({0,24})` | - |
| 4 | `37` | - |
| 5 | `''` | - |
| 6 | `{0,22}='1'` | - |
| 7 | `{0,9}<>0` | - |
| 8 | `{0,26}` | - |
| 9 | `'TRUE'LOG` | - |
| 10 | `{0,22}='2' AND {0,10}='S'` | - |
| 11 | `NOT ({0,27})` | - |
| 12 | `{0,27}` | - |
| 13 | `{0,23}=6` | - |
| 14 | `{0,10}='S'` | - |
| 15 | `{0,1}` | - |
| 16 | `{0,2}` | - |
| 17 | `{0,31} = 'S' AND {32768,53} AND {0,22}='1'` | - |
| 18 | `{0,32} = 1` | - |
| 19 | `IF(Trim({32768,115})<>'','\|','')&'ANNULATION D...` | - |
| 20 | `{32768,111} AND {32768,112}<>0` | - |

> **Total**: 22 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 2 |
| **Lignes logique** | 103 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N163[163 Menu caisse ]
    N1[1 Main Program]
    T[190 Menu solde d]
    N163 --> N1
    N1 --> T
    style M fill:#8b5cf6,color:#fff
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 163 | Menu caisse GM - scroll | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[190 Programme]
    C43[43 Recuperation]
    T --> C43
    C44[44 Appel progra]
    T --> C44
    C47[47 DateHeure se]
    T --> C47
    C97[97 Factures Tbl]
    T --> C97
    C191[191 Annulation s]
    T --> C191
    C193[193 Solde compte]
    T --> C193
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C44 fill:#3fb950
    style C47 fill:#3fb950
    style C97 fill:#3fb950
    style C191 fill:#3fb950
    style C193 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 44 | Appel programme | 1 |
| 1 | 47 | Date/Heure session user | 1 |
| 1 | 97 | Factures (Tble Compta&Vent) V3 | 1 |
| 1 | 191 | Annulation solde | 1 |
| 1 | 193 | Solde compte fin sejour | 1 |
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
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (22 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
