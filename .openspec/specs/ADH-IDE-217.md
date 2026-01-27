# ADH IDE 217 - Programme supprime (Prg_216)

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
| **Quoi** | Programme supprime (Prg_216) |
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
| **Format IDE** | ADH IDE 217 |
| **Description** | Programme supprime (Prg_216) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #31 | `Table_31` | LINK | 1x |
| #47 | `Table_47` | **W** | 2x |
| #80 | `Table_80` | R | 2x |
| #87 | `Table_87` | LINK | 1x |
| #88 | `Table_88` | R | 1x |
| #104 | `Table_104` | LINK | 1x |
| #169 | `Table_169` | LINK | 1x |
| #188 | `Table_188` | LINK | 1x |
| #367 | `Table_367` | **W** | 1x |
| #454 | `Table_454` | LINK | 1x |
| #786 | `Table_786` | LINK | 1x |
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
    T[217 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 163 | Menu caisse GM - scroll | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[217 Programme]
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing Num]
    T --> C181
    C183[183 Other Listing]
    T --> C183
    C43[43 Recuperation du]
    T --> C43
    C44[44 Appel programme]
    T --> C44
    C180[180 Printer choice]
    T --> C180
    C209[209 Affectation cod]
    T --> C209
    C182[182 Raz Current Pri]
    T --> C182
    style T fill:#58a6ff,color:#000
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C183 fill:#3fb950
    style C43 fill:#3fb950
    style C44 fill:#3fb950
    style C180 fill:#3fb950
    style C209 fill:#3fb950
    style C182 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 179 | Get Printer | 5 |
| 1 | 181 | Set Listing Number | 5 |
| 1 | 183 | Other Listing | 3 |
| 1 | 43 | Recuperation du titre | 2 |
| 1 | 44 | Appel programme | 2 |
| 1 | 180 | Printer choice | 2 |
| 1 | 209 | Affectation code autocom | 2 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 208 | Print Reçu code autocom | 1 |
| 1 | 210 | Changement de chambre | 1 |
| 1 | 211 | Opposition code autocom | 1 |
| 1 | 214 | Menu impression des appels | 1 |
| 1 | 215 | Visu du contenu d'un poste | 1 |
| 1 | 218 |    Envoi table autocom PABX | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:49 | **DATA POPULATED** - Tables, Callgraph (9 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
