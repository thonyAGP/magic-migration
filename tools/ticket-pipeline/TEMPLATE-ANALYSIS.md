# {TICKET_KEY} - {TITRE_COURT}

> **Jira** : [{TICKET_KEY}](https://clubmed.atlassian.net/browse/{TICKET_KEY})
> **Protocole** : `.claude/protocols/ticket-analysis.md` applique
> **Analyse** : {DATE} {HEURE_DEBUT} -> {HEURE_FIN}
> **Score pipeline** : {X}/6 phases completees

---

## 1. Contexte Jira

### Informations ticket

| Element | Valeur |
|---------|--------|
| **Titre** | {TITRE_COMPLET} |
| **Type** | {TYPE} (Bug / Story / Task) |
| **Statut Jira** | {STATUT} |
| **Priorite** | {PRIORITE} |
| **Reporter** | {REPORTER} |
| **Assignee** | {ASSIGNEE} |
| **Label** | {LABEL} |
| **Cree le** | {DATE_CREATION} |
| **Mis a jour** | {DATE_MAJ} |

### Description originale (citation)

> "{DESCRIPTION_VERBATIM}"

### Extraction des indices

| Indice | Valeur | Interpretation |
|--------|--------|----------------|
| {INDICE_1} | {VALEUR_1} | {INTERPRETATION_1} |

### Attachments

| Fichier | Type | Lien |
|---------|------|------|
| {NOM_FICHIER} | Screenshot / Document | [Lien]({URL_OU_PATH}) |

---

## 2. Localisation Programmes

### Appel MCP : magic_get_position("{PROJET}", {PROGRAM_ID})

**Commande executee** :
```
magic_get_position(project="{PROJET}", programId={PROGRAM_ID})
```

**Resultat** :
| Parametre | Valeur |
|-----------|--------|
| Projet | {PROJET} |
| Program ID (XML) | {ISN} |
| **Position IDE** | **{IDE}** |
| **Nom** | **{NOM_PROGRAMME}** |

**Reference complete** : **{PROJET} IDE {IDE} - {NOM_PROGRAMME}**

> **IMPORTANT** : Le fichier source est `Prg_{ISN}.xml` (ISN={ISN}) mais dans l'IDE Magic, ce programme apparait en position **{IDE}**. Ne JAMAIS confondre ISN et position IDE.

### Appel MCP : magic_get_tree("{PROJET}", {PROGRAM_ID})

**Commande executee** :
```
magic_get_tree(project="{PROJET}", programId={PROGRAM_ID})
```

**Resultat** : Arborescence de {N} taches sur {NIVEAUX} niveaux.

**Structure complete** :
```
{PROJET} IDE {IDE} (Main: {NOM_PROGRAMME})
+-- {IDE}.1  {NOM_TACHE_1}
+-- {IDE}.2  {NOM_TACHE_2}
+-- {IDE}.3  {NOM_TACHE_3}  <-- BRANCHE CONCERNEE
    +-- {IDE}.3.1  {NOM_SOUS_TACHE}
```

### Programmes identifies

| Fichier XML | IDE Verifie | Nom | Role dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_{ISN}.xml | **{PROJET} IDE {IDE}** | {NOM} | {ROLE} |

---

## 3. Tables identifiees

### Tableau des tables

| N Table | Nom physique | Nom logique | Cle | Access | Role |
|---------|--------------|-------------|-----|--------|------|
| {NUM} | {NOM_PHYSIQUE} | {NOM_LOGIQUE} | Key {N} | R/W/L | {ROLE} |

### Relations entre tables

```
Table {NUM_MAIN} ({NOM_MAIN})
    |
    | MAIN SOURCE
    v
+----------------------------------------------------------+
| Tache {IDE}.{TACHE} - {NOM_TACHE}                       |
|                                                          |
|  LINK (R) -> Table {NUM_LINK1} ({NOM_LINK1})            |
|              Filtre: {COLONNES_FILTRE}                   |
|              Recupere: {COLONNES_RECUPEREES}              |
|                                                          |
|  LINK (W) -> Table {NUM_LINK2} ({NOM_LINK2})            |
|              Cle: {CLE_WRITE}                            |
+----------------------------------------------------------+
```

---

## 4. Tracage Flux

### Appel MCP : magic_get_logic("{PROJET}", {PROGRAM_ID}, {TASK_ISN2})

**Commande executee** :
```
magic_get_logic(project="{PROJET}", programId={PROGRAM_ID}, taskIsn2={TASK_ISN2})
```

**Resultat** : Tache {IDE}.{TACHE} (ISN_2={TASK_ISN2}) - "{NOM_TACHE}"

### Logic Unit 1 : Record Main (Handler M - Level R)

**Condition globale** : Expression {EXP_ID}

| Ligne | Operation | Variable | Details |
|-------|-----------|----------|---------|
| 1 | DATAVIEW_SRC | | Main source (Table {NUM}), Type=M, Index {IDX} |
| 2 | Select | {VAR_LETTRE} | Column {COL}, Range=Exp {N} |
| 3 | **Link** | | Table n{NUM_LINK}, Key {K}, Mode=Read |
| 4 | Select | {VAR_LETTRE} | Column {COL}, Locate=Exp {N} |
| 5 | END_LINK | | Fin Link table {NUM_LINK} |

### Logic Unit 2 : Task Prefix (Handler P - Level T)

**Condition** : Expression {EXP_ID}

| Ligne | Operation | Variable | Details |
|-------|-----------|----------|---------|
| 1 | **Update** | **{VAR}** ({NOM_VARIABLE}) | With: Exp {N} = `{FORMULE_TRADUITE}`, Forced=Yes |

### Logic Unit 3 : Record Suffix (Handler S - Level R)

**Condition** : Expression {EXP_ID}

| Ligne | Operation | Condition/Details |
|-------|-----------|-------------------|
| 1 | **Block IF** | Exp {N} : `{VAR}<>0` -> `{TRADUCTION}` |
| 2 | **Call SubTask** | {SOUS_TACHE} = {NOM}, Cnd Exp {N} : `{CONDITION_TRADUITE}` |
| 3 | **Block End** | `}` |

### Diagramme du flux complet

```
+---------------------------------------------------------------------+
| {PROJET} IDE {IDE} - {NOM_PROGRAMME}                                |
| {DESCRIPTION}                                                       |
+-----------------------------------+---------------------------------+
                                    |
                                    v
+---------------------------------------------------------------------+
| Tache {IDE}.{T1} (ISN_2={ISN2}) - {NOM_TACHE}                      |
|                                                                     |
| RECORD MAIN :                                                       |
|   Source: Table {NUM} ({NOM})                                       |
|   Link -> Table {NUM2} ({NOM2}) : {COLONNES}                       |
|                                                                     |
| RECORD SUFFIX :                                                     |
|   IF ({CONDITION}) THEN                                             |
|     CallTask {SOUS_TACHE_1}                                         |
|     CallTask {SOUS_TACHE_2}                                         |
|   END IF                                                            |
+-----------------------------------+---------------------------------+
                          +---------+---------+
                          v                   v
            +---------------------+ +---------------------+
            | Tache {IDE}.{T2}    | | Tache {IDE}.{T3}    |
            | {NOM_1}             | | {NOM_2}             |
            +---------------------+ +---------------------+
```

### Variables par tache

**Main Source (Table {NUM})** :
| Variable | Nom | Type |
|----------|-----|------|
| **{LETTRE}** | {NOM} | {TYPE} |

**Link Table {NUM2} ({NOM_TABLE})** :
| Variable | Nom | Type |
|----------|-----|------|
| **{LETTRE}** | {NOM} | {TYPE} |

---

## 5. Analyse Expressions

### Offset de decodage

```
Main_VG = {MAIN_VG} (colonnes Main Task)
+ Selects ancetres = {SELECTS}
= Offset total : {OFFSET}
```

### Expressions de la tache {IDE}.{TACHE} (ISN_2={ISN2})

| # | Formule (variables) | Formule (traduction) | Type | Description |
|---|---------------------|----------------------|------|-------------|
| {N} | `{FORMULE_VAR}` | `{FORMULE_TRADUITE}` | {TYPE} | {DESC} |

> **Regle** : Aucune reference `{N,Y}` brute ne doit apparaitre dans ce document. Si le decodage echoue, marquer `[NON DECODE - offset {X}]`.

### Variables parentes utilisees

| Variable | Niveau | Nom | Tache source |
|----------|--------|-----|--------------|
| **{LETTRE}** | {NIVEAU} | {NOM} | {TACHE_SOURCE} |

---

## 6. Diagnostic

### Root Cause

**Localisation precise** : {PROJET} IDE {IDE}, tache {IDE}.{TACHE}, ligne {LIGNE}, expression {EXP}

**Description** : {DESCRIPTION_ROOT_CAUSE}

### Points d'attention

1. **{POINT_1}** : {DESCRIPTION}
2. **{POINT_2}** : {DESCRIPTION}

### Pattern KB

| Pattern | Score | Source |
|---------|-------|--------|
| {NOM_PATTERN} | {SCORE}/10 | {TICKET_SOURCE} |

> Aucun pattern matche = "Nouveau pattern a capitaliser si resolution confirmee"

### Piste de correction (ou Avant/Apres)

**Si resolution connue :**

| Element | Avant | Apres |
|---------|-------|-------|
| {ELEMENT} | {ETAT_AVANT} | {ETAT_APRES} |

**Si piste uniquement :**
{DESCRIPTION_PISTE}

---

## 7. Checklist + Impact

### Checklist protocole

- [ ] Tous les programmes ont un IDE verifie par `magic_get_position`
- [ ] Les tables sont identifiees avec N, nom physique et access mode
- [ ] Au moins une expression est decodee avec formule traduite
- [ ] La localisation precise identifie : Programme.Tache.Ligne.Expression
- [ ] Le diagramme de flux ASCII box-drawing est present
- [ ] Aucune reference {N,Y} brute dans le document
- [ ] Root cause OU piste de correction documentee

### Impact downstream

| Programme | Type | Description |
|-----------|------|-------------|
| {PROJET} IDE {IDE2} | Caller / Callee | {DESCRIPTION} |

> Impact : Si modifie, **{N} programmes downstream** affectes.

---

## 8. Commits / Historique

| Hash | Date | Message | Auteur |
|------|------|---------|--------|
| `{HASH}` | {DATE} | {MESSAGE} | {AUTEUR} |

> Si aucun commit lie : "Pas encore de code pousse pour ce ticket"

---

## 9. Screenshots IDE

{CAPTURES_ECRAN}

> Si applicable : captures de l'IDE Magic montrant les taches/expressions concernees.
> Format : `![Description](attachments/{NOM_FICHIER})`

---

*Analyse realisee le {DATE}*
*Protocole : ticket-analysis.md v2.0*
