# ADH IDE 122 - Ouverture caisse

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
| **Quoi** | Ouverture caisse |
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
| **Format IDE** | ADH IDE 122 |
| **Description** | Ouverture caisse |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 67 | tables___________tab | `cafil045_dat` | R | 1x |
| 232 | gestion_devise_session | `caisse_devise` | L | 1x |
| 232 | gestion_devise_session | `caisse_devise` | R | 1x |
| 693 | devise_in | `devisein_par` | R | 1x |
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
| 1 | `{0,17}=0` | - |
| 2 | `{0,16}` | - |
| 3 | `0` | - |
| 4 | `'FALSE'LOG` | - |
| 5 | `{0,56}` | - |
| 6 | `{0,57}` | - |
| 7 | `'O'` | - |
| 8 | `{0,26}<>0 OR {0,27}<>0 OR {0,28}<>0` | - |

> **Total**: 8 expressions (affichees: 8)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 9 |
| **Lignes logique** | 336 |
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
    T[122 Ouverture ca]
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
| 121 | Gestion caisse | 2 |
| 298 | Gestion caisse 142 | 2 |
### 3.3 Callees

```mermaid
graph LR
    T[122 Programme]
    C134[134 Mise  jour d]
    T --> C134
    C136[136 Generation t]
    T --> C136
    C148[148 Devises RAZ ]
    T --> C148
    C142[142 Devise updat]
    T --> C142
    C43[43 Recuperation]
    T --> C43
    C120[120 Saisie conte]
    T --> C120
    C123[123 Apport coffr]
    T --> C123
    C124[124 Apport artic]
    T --> C124
    style T fill:#58a6ff,color:#000
    style C134 fill:#3fb950
    style C136 fill:#3fb950
    style C148 fill:#3fb950
    style C142 fill:#3fb950
    style C43 fill:#3fb950
    style C120 fill:#3fb950
    style C123 fill:#3fb950
    style C124 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 134 | Mise à jour detail session WS | 7 |
| 1 | 136 | Generation ticket WS | 7 |
| 1 | 148 | Devises RAZ WS | 3 |
| 1 | 142 | Devise update session WS | 2 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 120 | Saisie contenu caisse | 1 |
| 1 | 123 | Apport coffre | 1 |
| 1 | 124 | Apport articles | 1 |
| 1 | 126 | Calcul solde initial WS | 1 |
| 1 | 128 | Controle ouverture caisse WS | 1 |
| 1 | 129 | Ecart ouverture caisse | 1 |
| 1 | 133 | Mise a jour comptage caisse WS | 1 |
| 1 | 137 | Ticket ouverture session | 1 |
| 1 | 139 | Ticket appro remise | 1 |
| 1 | 143 | Devises calcul ecart WS | 1 |
| 1 | 147 | Devises des tickets WS | 1 |
| 1 | 156 | Verif session caisse ouverte2 | 1 |
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
