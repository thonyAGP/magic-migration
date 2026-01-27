# ADH IDE 131 - Fermeture caisse

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
| **Quoi** | Fermeture caisse |
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
| **Format IDE** | ADH IDE 131 |
| **Description** | Fermeture caisse |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 50 | moyens_reglement_mor | `cafil028_dat` | R | 2x |
| 67 | tables___________tab | `cafil045_dat` | R | 1x |
| 139 | moyens_reglement_mor | `cafil117_dat` | R | 2x |
| 232 | gestion_devise_session | `caisse_devise` | L | 1x |
| 232 | gestion_devise_session | `caisse_devise` | R | 1x |
| 241 | pointage_appro_remise | `caisse_pointage_apprem` | **W** | 2x |
| 242 | pointage_article | `caisse_pointage_article` | **W** | 2x |
| 243 | pointage_devise | `caisse_pointage_devise` | **W** | 2x |
| 249 | histo_sessions_caisse_detail | `caisse_session_detail` | R | 2x |
| 250 | histo_sessions_caisse_devise | `caisse_session_devise` | L | 2x |
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
| 1 | `{0,19}=0` | - |
| 2 | `{0,18}` | - |
| 3 | `{0,79}` | - |
| 4 | `{0,80}` | - |
| 5 | `{0,81}` | - |
| 6 | `{0,82}` | - |
| 7 | `'FALSE'LOG` | - |
| 8 | `'F'` | - |
| 9 | `{0,58}<>0 OR {0,59}<>0 OR {0,52}<>0 OR {0,54}<>...` | - |
| 10 | `'D'` | - |
| 11 | `'TRUE'LOG` | - |
| 12 | `NOT {0,17}` | - |

> **Total**: 12 expressions (affichees: 12)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 22 |
| **Lignes logique** | 628 |
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
    T[131 Fermeture ca]
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
    T[131 Programme]
    C134[134 Mise  jour d]
    T --> C134
    C136[136 Generation t]
    T --> C136
    C142[142 Devise updat]
    T --> C142
    C144[144 Devises fina]
    T --> C144
    C145[145 Devises fina]
    T --> C145
    C155[155 Controle fer]
    T --> C155
    C133[133 Mise a jour ]
    T --> C133
    C135[135 Generation t]
    T --> C135
    style T fill:#58a6ff,color:#000
    style C134 fill:#3fb950
    style C136 fill:#3fb950
    style C142 fill:#3fb950
    style C144 fill:#3fb950
    style C145 fill:#3fb950
    style C155 fill:#3fb950
    style C133 fill:#3fb950
    style C135 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 134 | Mise à jour detail session WS | 14 |
| 1 | 136 | Generation ticket WS | 7 |
| 1 | 142 | Devise update session WS | 5 |
| 1 | 144 | Devises finales F/F Nbre WS | 4 |
| 1 | 145 | Devises finales F/F Qte WS | 4 |
| 1 | 155 | Controle fermeture caisse WS | 3 |
| 1 | 133 | Mise a jour comptage caisse WS | 2 |
| 1 | 135 | Generation tableau recap WS | 2 |
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
| 2026-01-27 20:21 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:47 | **DATA POPULATED** - Tables, Callgraph (12 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
