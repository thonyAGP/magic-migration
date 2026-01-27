# ADH IDE 299 - Programme supprime (Prg_296)

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
| **Quoi** | Programme supprime (Prg_296) |
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
| **Format IDE** | ADH IDE 299 |
| **Description** | Programme supprime (Prg_296) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #50 | `Table_50` | R | 1x |
| #67 | `Table_67` | R | 1x |
| #139 | `Table_139` | R | 1x |
| #232 | `Table_232` | LINK | 1x |
| #241 | `Table_241` | **W** | 1x |
| #242 | `Table_242` | **W** | 1x |
| #243 | `Table_243` | **W** | 1x |
| #693 | `Table_693` | R | 1x |
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
    T[299 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| - | **Aucun caller** (point d'entree ou orphelin) | - |
### 3.3 Callees

```mermaid
graph LR
    T[299 Programme]
    C134[134 Mise  jour deta]
    T --> C134
    C136[136 Generation tick]
    T --> C136
    C144[144 Devises finales]
    T --> C144
    C155[155 Controle fermet]
    T --> C155
    C135[135 Generation tabl]
    T --> C135
    C142[142 Devise update s]
    T --> C142
    C145[145 Devises finales]
    T --> C145
    C146[146 Devises tableau]
    T --> C146
    style T fill:#58a6ff,color:#000
    style C134 fill:#3fb950
    style C136 fill:#3fb950
    style C144 fill:#3fb950
    style C155 fill:#3fb950
    style C135 fill:#3fb950
    style C142 fill:#3fb950
    style C145 fill:#3fb950
    style C146 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 134 | Mise à jour detail session WS | 7 |
| 1 | 136 | Generation ticket WS | 7 |
| 1 | 144 | Devises finales F/F Nbre WS | 3 |
| 1 | 155 | Controle fermeture caisse WS | 3 |
| 1 | 135 | Generation tableau recap WS | 2 |
| 1 | 142 | Devise update session WS | 2 |
| 1 | 145 | Devises finales F/F Qte WS | 2 |
| 1 | 146 | Devises tableau recap WS | 2 |
| 1 | 147 | Devises des tickets WS | 2 |
| 1 | 148 | Devises RAZ WS | 2 |
| 1 | 154 | Tableau recap fermeture | 2 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 120 | Saisie contenu caisse | 1 |
| 1 | 123 | Apport coffre | 1 |
| 1 | 124 | Apport articles | 1 |
| 1 | 125 | Remise en caisse | 1 |
| 1 | 127 | Calcul solde ouverture WS | 1 |
| 1 | 130 | Ecart fermeture caisse | 1 |
| 1 | 133 | Mise a jour comptage caisse WS | 1 |
| 1 | 138 | Ticket fermeture session | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (11 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
