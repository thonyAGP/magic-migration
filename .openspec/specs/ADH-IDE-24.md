# ADH IDE 24 - Print reçu change vente

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
| **Quoi** | Print reçu change vente |
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
| **Format IDE** | ADH IDE 24 |
| **Description** | Print reçu change vente |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 7x |
| 31 | gm-complet_______gmc | `cafil009_dat` | R | 1x |
| 34 | hebergement______heb | `cafil012_dat` | L | 1x |
| 147 | change_vente_____chg | `cafil125_dat` | L | 7x |
| 147 | change_vente_____chg | `cafil125_dat` | R | 1x |
| 368 | pms_village | `pmsvillage` | L | 1x |
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
| 3 | `GetParam ('CURRENTPRINTERNUM')=1` | - |
| 4 | `GetParam ('CURRENTPRINTERNUM')=4` | - |
| 5 | `GetParam ('CURRENTPRINTERNUM')=5` | - |
| 6 | `GetParam ('CURRENTPRINTERNUM')=8` | - |
| 7 | `GetParam ('CURRENTPRINTERNUM')=9` | - |
| 8 | `{0,1}` | - |
| 9 | `{0,2}` | - |
| 10 | `{0,3}` | - |
| 11 | `'A'` | - |
| 12 | `'Z'` | - |
| 13 | `IF ({0,28}='010','Opération N°','Transaction N°')` | - |
| 14 | `IF ({0,28}='010','Mode de paiement','Payment me...` | - |
| 15 | `IF ({0,28}='010','Taux','Rate')` | - |
| 16 | `IF ({0,28}='010','Montant devise locale','Amoun...` | - |
| 17 | `IF ({0,28}='010','VENTE DE DEVISES','CURRENCY S...` | - |
| 18 | `IF ({0,28}='010','Merci de votre visite','Thank...` | - |
| 19 | `IF ({0,28}='010','Paiement','Payment')` | - |
| 20 | `IF ({0,28}='010','Devise','Currency')` | - |

> **Total**: 22 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 14 |
| **Lignes logique** | 417 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N25[25 Change GM]
    N174[174 VersementRet]
    N1[1 Main Program]
    N163[163 Menu caisse ]
    T[24 Print reu ch]
    N25 --> N174
    N174 --> N1
    N1 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N25 fill:#f59e0b
    style N174 fill:#f59e0b
    style N1 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 25 | Change GM | 1 |
| 174 | Versement/Retrait | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[24 Programme]
    C22[22 Calcul equiv]
    T --> C22
    C182[182 Raz Current ]
    T --> C182
    style T fill:#58a6ff,color:#000
    style C22 fill:#3fb950
    style C182 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 22 | Calcul equivalent | 7 |
| 1 | 182 | Raz Current Printer | 1 |
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
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (22 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
