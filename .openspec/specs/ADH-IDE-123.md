# ADH IDE 123 - Apport coffre

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
| **Quoi** | Apport coffre |
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
| **Format IDE** | ADH IDE 123 |
| **Description** | Apport coffre |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 67 | tables___________tab | `cafil045_dat` | R | 2x |
| 141 | devises__________dev | `cafil119_dat` | R | 2x |
| 215 | comptage_coffre_devise_histo | `caisse_coffre_compcais_devise_histo` | L | 1x |
| 232 | gestion_devise_session | `caisse_devise` | **W** | 1x |
| 244 | saisie_approvisionnement | `caisse_saisie_appro_dev` | L | 1x |
| 244 | saisie_approvisionnement | `caisse_saisie_appro_dev` | R | 2x |
| 244 | saisie_approvisionnement | `caisse_saisie_appro_dev` | **W** | 2x |
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
| 1 | `{0,11}` | - |
| 2 | `{0,6}<>'B'` | - |
| 3 | `{0,6}='B'` | - |
| 4 | `NOT ({0,10})` | - |
| 5 | `{0,10}` | - |
| 6 | `NOT ({0,8}) AND NOT {0,9}` | - |
| 7 | `'TRUE'LOG` | - |
| 8 | `NOT(ExpCalc('6'EXP))` | - |

> **Total**: 8 expressions (affichees: 8)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 15 |
| **Lignes logique** | 166 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N121[121 Gestion cais]
    N298[298 Gestion cais]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    N281[281 Fermeture Se]
    T[123 Apport coffr]
    N121 --> N298
    N298 --> N163
    N163 --> N1
    N1 --> N281
    N281 --> T
    style M fill:#8b5cf6,color:#fff
    style N121 fill:#f59e0b
    style N298 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style N281 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 121 | Gestion caisse | 1 |
| 122 | Ouverture caisse | 1 |
| 131 | Fermeture caisse | 1 |
| 297 | Ouverture caisse 143 | 1 |
| 298 | Gestion caisse 142 | 1 |
| 299 | Fermeture caisse 144 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[123 Programme]
    C43[43 Recuperation]
    T --> C43
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 2 |
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
| 2026-01-27 19:46 | **DATA POPULATED** - Tables, Callgraph (8 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
