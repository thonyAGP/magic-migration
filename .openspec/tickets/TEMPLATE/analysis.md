# {TICKET_KEY} - {TITRE}

> **Jira** : [{TICKET_KEY}](https://clubmed.atlassian.net/browse/{TICKET_KEY})
> **Protocole** : `.claude/protocols/ticket-analysis.md` appliqué

---

## 1. Contexte Jira

| Élément | Valeur |
|---------|--------|
| **Symptôme** | {citation exacte du ticket} |
| **Données entrée** | {valeurs précises qui déclenchent le bug} |
| **Attendu** | {comportement correct} |
| **Obtenu** | {comportement actuel} |
| **Reporter** | {nom} |
| **Date** | {date création} |

### Indices extraits du ticket
- Programme mentionné : `{nom}` → à vérifier ÉTAPE 2
- Table mentionnée : `{nom}` → à vérifier ÉTAPE 2
- Village concerné : {code}
- Date des données : {date}

---

## 2. Localisation Programmes

### magic_find_program("{recherche}")

| Project | IDE | ID | Name | Public |
|---------|-----|----|------|--------|
| ... | ... | ... | ... | ... |

### magic_get_position("{projet}", {id})

Résultat : **{PROJET} IDE {N} - {Nom}**

### magic_get_tree("{projet}", {id})

| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| ... | ... | ... | ... |

### Programmes identifiés

| Fichier XML | IDE Vérifié | Nom | Rôle dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_{X}.xml | **{PROJET} IDE {N}** | {Nom} | {Rôle} |

---

## 3. Traçage Flux

### magic_get_logic("{projet}", {id}, {isn2})

| Ligne | Opération | Condition | Cible |
|-------|-----------|-----------|-------|
| ... | ... | ... | ... |

### Résolution des CallTask/CallProgram

- Ligne {N} : TargetPrg={X} → `magic_get_position()` → **{PROJET} IDE {Y}**

### Diagramme du flux

```
┌─────────────────┐
│ {PROJET} IDE {N}│ {Nom}
│ Tâche {N.X}     │ {Description}
└────────┬────────┘
         │ {Type appel} (condition Exp {N})
         ▼
┌─────────────────┐
│ {PROJET} IDE {M}│ {Nom}
│ {Zone suspecte} │ ← POINT D'INTÉRÊT
└─────────────────┘
```

---

## 4. Analyse Expressions

### Calcul mainOffset

Tâche analysée : {PROJET} IDE {N.X.Y.Z}

| Niveau | Colonnes | Cumul |
|--------|----------|-------|
| Main | {offset Main projet} | {offset} |
| Tâche {N} | {colonnes} | {cumul} |
| Tâche {N.X} | {colonnes} | {cumul} |
| **TOTAL** | | **{TOTAL}** |

### magic_get_line("{projet}", "{task}", {ligne}, {mainOffset})

| Variable | Nom logique | Type | Format |
|----------|-------------|------|--------|
| {LETTRE} | {nom} | {type} | {format} |

### Décodage {N,Y} → Variables globales

| Référence | Position locale | Index global | Variable | Nom logique |
|-----------|-----------------|--------------|----------|-------------|
| {0,X} | {pos} | {index} | **{VAR}** | {nom} |

### Formule décodée (lisible)

```
{Formule avec noms de variables au lieu de {N,Y}}
```

---

## 5. Root Cause

| Élément | Valeur |
|---------|--------|
| **Programme** | {PROJET} IDE {N} - {Nom} |
| **Sous-tâche** | Tâche {N.X.Y} |
| **Ligne Logic** | Ligne {L} |
| **Expression** | Expression {E} |
| **Erreur** | {Description précise} |
| **Impact** | {Conséquence observable} |

---

## Données requises

- Base de données : Village {NOM} à la date {JJ/MM/AAAA}
- Fichier(s) : {nom_fichier.ext}
- Table(s) à extraire : {nom_table}

---

*Analyse : {DATE}*
