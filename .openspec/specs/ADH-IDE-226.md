# ADH IDE 226 - Programme supprime (Prg_225)

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
| **Quoi** | Programme supprime (Prg_225) |
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
| **Format IDE** | ADH IDE 226 |
| **Description** | Programme supprime (Prg_225) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | **W** | 1x |
| 130 | fichier_langue | `cafil108_dat` | L | 1x |
| 285 | email | `email` | L | 1x |
| 285 | email | `email` | R | 1x |
| 285 | email | `email` | **W** | 2x |
| 720 | arc_transac_entete_bar | `arc_bartransacent` | L | 2x |
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
| 2 | `{0,2}` | - |
| 3 | `{0,8}` | - |
| 4 | `{0,9}` | - |
| 5 | `{0,10}` | - |
| 6 | `NOT({0,17})` | - |
| 7 | `{0,3}` | - |
| 8 | `{0,17}` | - |
| 9 | `{0,21}` | - |
| 10 | `{0,21}<>''` | - |
| 11 | `'Email adress is empty ! Confirm '` | - |
| 12 | `{0,21}=''` | - |
| 13 | `{0,22}=6 OR {0,21}<>''` | - |
| 14 | `{0,13}` | - |
| 15 | `IF({0,16}='FR','FRA','ENG')` | - |
| 16 | `'TRUE'LOG` | - |

> **Total**: 16 expressions (affichees: 16)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 5 |
| **Lignes logique** | 315 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N190[190 Menu solde d]
    N163[163 Menu caisse ]
    N193[193 Solde compte]
    N1[1 Main Program]
    N174[174 VersementRet]
    T[226 Recherche Ad]
    N190 --> N163
    N163 --> N193
    N193 --> N1
    N1 --> N174
    N174 --> T
    style M fill:#8b5cf6,color:#fff
    style N190 fill:#f59e0b
    style N163 fill:#f59e0b
    style N193 fill:#f59e0b
    style N1 fill:#f59e0b
    style N174 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 69 | Extrait de compte | 1 |
| 97 | Factures (Tble Compta&Vent) V3 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[226 Programme]
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
| 2026-01-27 20:23 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:49 | **DATA POPULATED** - Tables, Callgraph (16 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
