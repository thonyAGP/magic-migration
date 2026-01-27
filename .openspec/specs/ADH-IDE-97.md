# ADH IDE 97 - Factures (Tble Compta&Vent) V3

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
| **Quoi** | Factures (Tble Compta&Vent) V3 |
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
| **Format IDE** | ADH IDE 97 |
| **Description** | Factures (Tble Compta&Vent) V3 |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 1x |
| 31 | gm-complet_______gmc | `cafil009_dat` | L | 1x |
| 40 | comptable________cte | `cafil018_dat` | **W** | 1x |
| 121 | tables_pays_ventes | `cafil099_dat` | L | 1x |
| 263 | vente | `caisse_vente` | L | 1x |
| 372 | pv_budget | `pv_budget_dat` | L | 1x |
| 744 | pv_lieux_vente | `pv_lieux_vente` | L | 1x |
| 746 | projet | `version` | L | 1x |
| 786 | qualite_avant_reprise | `qualite_avant_reprise` | L | 1x |
| 866 | maj_appli_tpe | `maj_appli_tpe` | L | 2x |
| 866 | maj_appli_tpe | `maj_appli_tpe` | R | 4x |
| 866 | maj_appli_tpe | `maj_appli_tpe` | **W** | 6x |
| 867 | log_maj_tpe | `log_maj_tpe` | R | 2x |
| 868 | Affectation_Gift_Pass | `affectation_gift_pass` | R | 1x |
| 868 | Affectation_Gift_Pass | `affectation_gift_pass` | **W** | 1x |
| 870 | Rayons_Boutique | `rayons_boutique` | L | 5x |
| 870 | Rayons_Boutique | `rayons_boutique` | R | 1x |
| 870 | Rayons_Boutique | `rayons_boutique` | **W** | 1x |
| 871 | Activite | `activite` | L | 1x |
| 911 | log_booker | `log_booker` | **W** | 1x |
| 932 | taxe_add_param | `taxe_add_param` | L | 1x |
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
| 1 | `'Hébergement'` | - |
| 2 | `{0,1}` | - |
| 3 | `{0,2}` | - |
| 4 | `{0,3}` | - |
| 5 | `{0,6}` | - |
| 6 | `{0,8}` | - |
| 7 | `{0,2}` | - |
| 8 | `{0,9}` | - |
| 9 | `StrBuild(MlsTrans('Numéro d''adhérent @1@'),IF(...` | - |
| 10 | `'Quitter'` | - |
| 11 | `'Imprimer'` | - |
| 12 | `'R.à.z'` | - |
| 13 | `MlsTrans('Confirmez vous l''édition de cette fa...` | - |
| 14 | `Trim({0,45}) &Trim(Str(Year(Date()),'4'))&Trim(...` | - |
| 15 | `Trim({0,45}) &Trim(Str(Year(Date()),'4'))&Trim(...` | - |
| 16 | `NOT({0,79}) OR {0,94}` | - |
| 17 | `{0,79} AND NOT({0,94}) AND {0,99} > 2` | - |
| 18 | `MID(GetParam('SERVICE'),4,{0,77}-4)` | - |
| 19 | `{0,70}` | - |
| 20 | `InStr(GetParam('SERVICE'),',')` | - |

> **Total**: 85 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 21 |
| **Lignes logique** | 799 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N190[190 Menu solde d]
    N193[193 Solde compte]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    N174[174 VersementRet]
    T[97 Factures Tbl]
    N190 --> N193
    N193 --> N163
    N163 --> N1
    N1 --> N174
    N174 --> T
    style M fill:#8b5cf6,color:#fff
    style N190 fill:#f59e0b
    style N193 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style N174 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 163 | Menu caisse GM - scroll | 1 |
| 190 | Menu solde d'un compte | 1 |
| 193 | Solde compte fin sejour | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[97 Programme]
    C58[58 Incremente N]
    T --> C58
    C91[91 Verif boutiq]
    T --> C91
    C105[105 Maj des lign]
    T --> C105
    C106[106 Maj lignes s]
    T --> C106
    C278[278 Zoom Pays Ve]
    T --> C278
    C57[57 FacturesSejo]
    T --> C57
    C59[59 Facture   ch]
    T --> C59
    C60[60 Creation ent]
    T --> C60
    style T fill:#58a6ff,color:#000
    style C58 fill:#3fb950
    style C91 fill:#3fb950
    style C105 fill:#3fb950
    style C106 fill:#3fb950
    style C278 fill:#3fb950
    style C57 fill:#3fb950
    style C59 fill:#3fb950
    style C60 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 58 | Incremente N° de Facture | 2 |
| 1 | 91 | Verif boutique | 2 |
| 1 | 105 | Maj des lignes saisies V3 | 2 |
| 1 | 106 | Maj lignes saisies archive V3 | 2 |
| 1 | 278 | Zoom Pays Vente | 2 |
| 1 | 57 | Factures_Sejour | 1 |
| 1 | 59 | Facture - chargement boutique | 1 |
| 1 | 60 | Creation entete facture | 1 |
| 1 | 92 | flag ligne boutique | 1 |
| 1 | 95 | Facture - Sejour archive | 1 |
| 1 | 98 | EditFactureTva(Compta&Ve) V3 | 1 |
| 1 | 101 | Creation Pied Facture V3 | 1 |
| 1 | 104 | Maj Hebergement Tempo V3 | 1 |
| 1 | 226 | Recherche Adresse Mail | 1 |
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
| 2026-01-27 19:46 | **DATA POPULATED** - Tables, Callgraph (85 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
