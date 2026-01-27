# ADH IDE 23 - Print reçu change achat

> **Version spec**: 3.5
> **Analyse**: 2026-01-27 17:56
> **Source**: `Prg_XXX.xml`

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur |
| **Quoi** | Print reçu change achat |
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
| **Format IDE** | ADH IDE 23 |
| **Description** | Print reçu change achat |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 5x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 2x |
| 31 | gm-complet_______gmc | `cafil009_dat` | R | 1x |
| 34 | hebergement______heb | `cafil012_dat` | L | 1x |
| 44 | change___________chg | `cafil022_dat` | L | 2x |
| 44 | change___________chg | `cafil022_dat` | R | 6x |
| 122 | unilateral_bilateral | `cafil100_dat` | L | 1x |
| 324 | frais_change___fchg | `fraissurchange_dat` | L | 1x |
| 368 | pms_village | `pmsvillage` | L | 1x |
| 474 | comptage_caisse_devise | `%club_user%_caisse_compcais_devise` | L | 7x |
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
| 1 | `SetCrsr (2)` | - |
| 2 | `SetCrsr (1)` | - |
| 3 | `{0,1}` | - |
| 4 | `{0,2}` | - |
| 5 | `{0,4}` | - |
| 6 | `{0,5}` | - |
| 7 | `GetParam ('CURRENTPRINTERNUM')=1` | - |
| 8 | `GetParam ('CURRENTPRINTERNUM')=4` | - |
| 9 | `GetParam ('CURRENTPRINTERNUM')=5` | - |
| 10 | `GetParam ('CURRENTPRINTERNUM')=8` | - |
| 11 | `GetParam ('CURRENTPRINTERNUM')=9` | - |
| 12 | `{0,15}` | - |
| 13 | `{0,3}` | - |
| 14 | `'A'` | - |
| 15 | `'Z'` | - |
| 16 | `IF ({0,38}='010','Opération N°','Transaction N°')` | - |
| 17 | `IF ({0,38}='010','Mode de paiement','Payment me...` | - |
| 18 | `IF ({0,38}='010','Taux','Rate')` | - |
| 19 | `IF ({0,38}='010','Montant devise locale','Amoun...` | - |
| 20 | `IF ({0,38}='010','Frais de change','Change fees')` | - |

> **Total**: 30 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 14 |
| **Lignes logique** | 471 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N25[25 Change GM]
    N174[174 VersementRet]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    N190[190 Menu solde d]
    T[23 Print reu ch]
    N25 --> N174
    N174 --> N163
    N163 --> N1
    N1 --> N190
    N190 --> T
    style M fill:#8b5cf6,color:#fff
    style N25 fill:#f59e0b
    style N174 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style N190 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 193 | Solde compte fin sejour | 2 |
| 25 | Change GM | 1 |
| 174 | Versement/Retrait | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[23 Programme]
    C22[22 Calcul equiv]
    T --> C22
    style T fill:#58a6ff,color:#000
    style C22 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 22 | Calcul equivalent | 7 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:18 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (30 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
