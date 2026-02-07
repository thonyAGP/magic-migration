# ADH IDE 131 - Sessions ouvertes WS

> **Analyse**: Phases 1-4 2026-02-07 07:04 -> 07:05 (16s) | Assemblage 07:09
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 131 |
| Nom Programme | Sessions ouvertes WS |
| Fichier source | `Prg_131.xml` |
| Dossier IDE | Gestion |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 0 |
| :warning: Statut | **ORPHELIN_POTENTIEL** |

## 2. DESCRIPTION FONCTIONNELLE

### 2.1 Objectif metier

**Fermeture caisse** cloture une session de caisse en comparant les montants COMPTES physiquement par le caissier aux montants CALCULES theoriquement par le systeme. Le processus:

1. **Affiche un tableau recapitulatif** avec 6 colonnes de moyens de paiement (Cash, Cartes, Cheques, Produits, OD, Devises)
2. **Compare 4 lignes de valeurs** pour chaque moyen:
   - Solde ouverture (montant initial)
   - Montant compte (saisi par le caissier)
   - Montant calcule (theorique systeme)
   - Ecart (difference compte - calcule)
3. **Detecte les ecarts** et oblige le caissier a les justifier via commentaire
4. **Calcule le solde final** = Montant compte - Versement au coffre
5. **Genere les tickets de fermeture** (fermeture session, remises/appros, tableau recap)
6. **Met a jour l'historique** dans les tables pointage_*

### 2.2 Flux utilisateur principal

```
DEBUT
  |
  v
[Affichage ecran principal 131.1]
  - Tableau 6 colonnes x 4 lignes
  - Boutons: Saisie, Apport coffre, Apport articles, Remise, Ecart, Valider
  |
  v
[Caissier saisit les montants comptes]
  -> Appelle IDE 120 (Saisie contenu caisse)
  |
  v
[Systeme calcule ecarts]
  Ecart = Montant_compte - Montant_calcule
  |
  +-- Si Ecart <> 0 --> [Justification obligatoire]
  |                      -> Appelle IDE 130 (Ecart fermeture caisse)
  |                      -> Saisie commentaire ecart
  v
[Caissier effectue versement au coffre]
  -> Appelle IDE 123 (Apport coffre)
  -> Appelle IDE 125 (Remise en caisse)
  |
  v
[Validation fermeture - IDE 155]
  - Controle: tous les moyens ont ete pointes
  - Controle: ecarts justifies si existants
  |
  v
[Generation tickets]
  -> IDE 138 (Ticket fermeture session)
  -> IDE 136 (Generation ticket WS) pour remises/appros
  -> IDE 154 (Tableau recap fermeture)
  |
  v
[Mise a jour tables historique]
  -> IDE 134 (MAJ detail session WS)
  -> pointage_devise, pointage_article, pointage_appro_remise
  |
  v
FIN
```

### 2.3 Acces au programme

Appele depuis:
- [Gestion caisse (IDE 121)](ADH-IDE-121.md) - Mode standard
- [Gestion caisse 142 (IDE 298)](ADH-IDE-298.md) - Mode 142

### 2.4 Donnees modifiees

| Table | Role | Operations |
|-------|------|------------|
| pointage_devise | Enregistre les comptages par devise | WRITE - Maj montants et ecarts |
| pointage_article | Enregistre les comptages produits | WRITE - Maj stocks produits |
| pointage_appro_remise | Enregistre les mouvements coffre | WRITE - Flag edition ticket |

<details>
<summary>Detail : phases du traitement</summary>

#### Phase 1 : Traitement (19 taches)

- **131** - Fermeture caisse
- **131.1** - Fermeture caisse **[[ECRAN]](#ecran-t2)**
- **131.1.1** - (sans nom) **[[ECRAN]](#ecran-t3)**
- **131.1.2** - (sans nom) **[[ECRAN]](#ecran-t7)**
- **131.1.2.1** - Devises finales
- **131.1.2.1.1** - Devises finales
- **131.1.2.1.2** - Devises finales
- **131.1.2.2** - Update AppRem
- **131.1.2.2.1** - Update devises
- **131.1.2.2.2** - Update produits
- **131.1.3** - (sans nom) **[[ECRAN]](#ecran-t14)**
- **131.1.3.1** - Devises finales
- **131.1.3.1.1** - Devises finales
- **131.1.3.1.2** - Devises finales
- **131.1.3.2** - Update AppRem
- **131.1.3.2.1** - Update devises
- **131.1.3.2.2** - Update produits
- **131.1.4** - Detail devises **[[ECRAN]](#ecran-t21)**
- **131.1.4.1** - Detail devises **[[ECRAN]](#ecran-t22)**

Delegue a : [Mise à jour detail session WS (IDE 134)](ADH-IDE-134.md), [Devise update session WS (IDE 142)](ADH-IDE-142.md), [Devises finales F/F Nbre WS (IDE 144)](ADH-IDE-144.md), [Devises finales F/F Qte WS (IDE 145)](ADH-IDE-145.md), [Generation tableau recap WS (IDE 135)](ADH-IDE-135.md), [Devises tableau recap WS (IDE 146)](ADH-IDE-146.md), [Tableau recap fermeture (IDE 154)](ADH-IDE-154.md), [Recuperation du titre (IDE 43)](ADH-IDE-43.md), [Apport coffre (IDE 123)](ADH-IDE-123.md), [Apport articles (IDE 124)](ADH-IDE-124.md), [Remise en caisse (IDE 125)](ADH-IDE-125.md), [Ecart fermeture caisse (IDE 130)](ADH-IDE-130.md)

#### Phase 2 : Initialisation (1 tache)

- **131.1.1.1** - raz

Delegue a : [Devises RAZ WS (IDE 148)](ADH-IDE-148.md)

#### Phase 3 : Validation (1 tache)

- **131.1.1.2** - Validation

Delegue a : [Controle fermeture caisse WS (IDE 155)](ADH-IDE-155.md)

#### Phase 4 : Calcul (1 tache)

- **131.1.1.3** - Maj devises comptees

Delegue a : [Mise a jour comptage caisse WS (IDE 133)](ADH-IDE-133.md), [Calcul solde ouverture WS (IDE 127)](ADH-IDE-127.md)

#### Tables impactees

| Table | Operations | Role metier |
|-------|-----------|-------------|
| pointage_devise | **W** (2 usages) | Devises / taux de change |
| pointage_article | **W** (2 usages) | Articles et stock |
| pointage_appro_remise | **W** (2 usages) |  |

</details>

## 3. BLOCS FONCTIONNELS

## 5. REGLES METIER

*(Aucune regle metier identifiee)*

## 6. CONTEXTE

- **Appele par**: (aucun)
- **Appelle**: 0 programmes | **Tables**: 1 (W:0 R:1 L:0) | **Taches**: 1 | **Expressions**: 5

<!-- TAB:Ecrans -->

## 8. ECRANS

*(Programme sans ecran visible)*

## 9. NAVIGATION

### 9.3 Structure hierarchique (0 tache)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|

### 9.4 Algorigramme Metier

```mermaid
flowchart TD
    START([DEBUT Fermeture])
    INIT[Tache 4: RAZ variables<br/>IDE 148]
    AFFICHE[Ecran principal 131.1<br/>Tableau 6 colonnes]

    ACTION{Action utilisateur?}

    SAISIE[Saisie montants<br/>IDE 120]
    APPORT_C[Apport coffre<br/>IDE 123]
    APPORT_A[Apport articles<br/>IDE 124]
    REMISE[Remise caisse<br/>IDE 125]

    CALC[Calcul ecarts<br/>Ecart = Compte - Calcule]

    ECART{Ecart <> 0?}
    JUSTIF[Justification ecart<br/>IDE 130]

    VALID{Validation?}
    CTRL[Controle fermeture<br/>IDE 155]

    CTRLOK{Controles OK?}

    UNIBI{Mode UNI/BI?}
    UNI[Taches 9,16: UNI<br/>Devise unique]
    BI[Taches 10,17: BI<br/>Multi-devises<br/>IDE 144, 145, 142]

    UPDATE[MAJ tables<br/>pointage_devise<br/>pointage_article<br/>pointage_appro_remise]

    TICKET{Montants <> 0?}
    EDIT_T[Generation tickets<br/>IDE 136, 138, 154]

    MAJ[MAJ session<br/>IDE 134]

    ENDOK([FIN OK])
    ENDKO([FIN KO])

    START --> INIT --> AFFICHE --> ACTION

    ACTION -->|Saisie| SAISIE --> CALC
    ACTION -->|Apport coffre| APPORT_C --> CALC
    ACTION -->|Apport articles| APPORT_A --> CALC
    ACTION -->|Remise| REMISE --> CALC
    ACTION -->|Valider| VALID

    CALC --> ECART
    ECART -->|OUI| JUSTIF --> AFFICHE
    ECART -->|NON| AFFICHE

    VALID --> CTRL --> CTRLOK
    CTRLOK -->|NON| ENDKO
    CTRLOK -->|OUI| UNIBI

    UNIBI -->|UNI| UNI --> UPDATE
    UNIBI -->|BI| BI --> UPDATE

    UPDATE --> TICKET
    TICKET -->|OUI| EDIT_T --> MAJ
    TICKET -->|NON| MAJ

    MAJ --> ENDOK

    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
    style ENDKO fill:#f85149,color:#000
    style ACTION fill:#58a6ff,color:#000
    style ECART fill:#58a6ff,color:#000
    style VALID fill:#58a6ff,color:#000
    style CTRLOK fill:#58a6ff,color:#000
    style UNIBI fill:#58a6ff,color:#000
    style TICKET fill:#58a6ff,color:#000
    style UPDATE fill:#ffeb3b,color:#000
    style EDIT_T fill:#ffeb3b,color:#000
```

> **Legende**: Vert = START/END OK | Rouge = END KO | Bleu = Decisions | Jaune = Actions cles

#### Resume du flux

1. **Initialisation**: RAZ des variables de travail (IDE 148)
2. **Ecran principal**: Affichage tableau recapitulatif 6 colonnes (Cash, Cartes, Cheques, Produits, OD, Devises)
3. **Boucle saisie**: L'utilisateur peut saisir, apporter au coffre, remettre en caisse
4. **Calcul ecarts**: Automatique apres chaque saisie
5. **Justification**: Obligatoire si ecart <> 0
6. **Validation**: Controles IDE 155 (tous moyens pointes, ecarts justifies, sessions VIL fermees)
7. **Traitement devises**: UNI (devise unique) ou BI (multi-devises)
8. **Mise a jour tables**: pointage_devise, pointage_article, pointage_appro_remise
9. **Edition tickets**: Si montants non nuls
10. **Cloture session**: MAJ historique via IDE 134


<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (1)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 246 | histo_sessions_caisse | Sessions de caisse | DB | R |   |   | 1 |

### Colonnes par table (1 / 1 tables avec colonnes identifiees)

<details>
<summary>Table 246 - histo_sessions_caisse (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | Param existe session | R | Logical |
| B | Param existe session ouverte | R | Logical |

</details>

## 11. VARIABLES

### 11.1 Autres (2)

Variables diverses.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | Param existe session | Logical | 1x refs |
| B | Param existe session ouverte | Logical | - |

## 12. EXPRESSIONS

**5 / 5 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CONSTANTE | 1 | 0 |
| CAST_LOGIQUE | 2 | 0 |
| CONDITION | 1 | 0 |
| OTHER | 1 | 0 |

### 12.2 Expressions cles par type

#### CONSTANTE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 2 | `0` | - |

#### CAST_LOGIQUE (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 3 | `'TRUE'LOG` | - |
| CAST_LOGIQUE | 1 | `'FALSE'LOG` | - |

#### CONDITION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 4 | `[C]=0` | - |

#### OTHER (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 5 | `Param existe session [A] AND Param existe session o... [B]` | - |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

**Chemin**: (pas de callers directs)

```mermaid
graph LR
    T131[131 Sessions ouvertes WS]
    style T131 fill:#58a6ff
    NONE[Aucun caller]
    NONE -.-> T131
    style NONE fill:#6b7280,stroke-dasharray: 5 5
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| - | (aucun) | - |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T131[131 Sessions ouvertes WS]
    style T131 fill:#58a6ff
    NONE[Aucun callee]
    T131 -.-> NONE
    style NONE fill:#6b7280,stroke-dasharray: 5 5
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| - | (aucun) | - | - |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 10 | Programme compact |
| Expressions | 5 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 0 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 10) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

### 14.2 Plan de migration par bloc

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 07:09*
