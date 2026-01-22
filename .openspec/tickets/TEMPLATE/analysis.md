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

### Appels MCP effectués

#### magic_find_program("{recherche}")
```
| Project | IDE | ID | Name | Public |
|---------|-----|----|------|--------|
| ... | ... | ... | ... | ... |
```

#### magic_get_position("{projet}", {id})
```
Résultat : {PROJET} IDE {N} - {Nom}
```

#### magic_get_tree("{projet}", {id})
```
| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| ... | ... | ... | ... |
```

### Programmes identifiés

| Fichier XML | IDE Vérifié | Nom | Rôle dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_{X}.xml | **{PROJET} IDE {N}** | {Nom} | {Rôle} |

---

## 3. Traçage Flux

### Appels MCP effectués

#### magic_get_logic("{projet}", {id})
```
| Ligne | Opération | Condition | Cible |
|-------|-----------|-----------|-------|
| ... | ... | ... | ... |
```

#### Résolution des CallTask/CallProgram
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

```
Tâche analysée : {PROJET} IDE {N.X.Y.Z}

mainOffset = {offset Main projet}
           + {colonnes de N}
           + {colonnes de N.X}
           + {colonnes de N.X.Y}
           = {TOTAL}
```

### Appels MCP effectués

#### magic_get_expression("{projet}", {expressionId})
```
Expression {N} :
{formule brute}
```

#### magic_get_line("{projet}", "{task}", {ligne}, {mainOffset})
```
Variable {LETTRE} = {nom logique} ({Type}, {Format})
```

### Décodage {N,Y} → Variables globales

| Référence | FieldID | Position locale | Index global | Variable | Nom logique |
|-----------|---------|-----------------|--------------|----------|-------------|
| {0,X} | X | {pos} | {index} | **{VAR}** | {nom} |

### Formule décodée (lisible)

```
{Formule avec noms de variables au lieu de {N,Y}}
```

---

## 5. Root Cause

### Hypothèse

"{Description de l'hypothèse}"

### Vérification

- Appel MCP : `{outil}("{params}")`
- Résultat : {observation}
- Conclusion : {confirme ou infirme}

### Root Cause identifiée

| Élément | Valeur |
|---------|--------|
| **Programme** | {PROJET} IDE {N} - {Nom} |
| **Sous-tâche** | Tâche {N.X.Y} |
| **Ligne Logic** | Ligne {L} |
| **Expression** | Expression {E} |
| **Erreur** | {Description précise} |
| **Impact** | {Conséquence observable} |

---

## 6. Solution

### Localisation exacte

- **Programme** : {PROJET} IDE {N} - {Nom}
- **Sous-tâche** : Tâche {N.X.Y}
- **Ligne Logic** : Ligne {L}
- **Expression** : Expression {E}

### Modification

| Élément | Avant (bug) | Après (fix) |
|---------|-------------|-------------|
| {cible} | {valeur actuelle} | {valeur corrigée} |

### Formule complète

**Avant** :
```
{formule avec erreur, variables nommées}
```

**Après** :
```
{formule corrigée, variables nommées}
```

### Variables concernées

| Variable | Nom logique | Rôle | Statut |
|----------|-------------|------|--------|
| {VAR} | {nom} | {rôle} | {Modifié/Ajouté/Retiré/Inchangé} |

---

## Checklist validation

- [ ] Tous les programmes ont un IDE vérifié par `magic_get_position`
- [ ] Toutes les variables utilisent le mainOffset correct
- [ ] Au moins une expression est décodée avec formule lisible
- [ ] La root cause identifie : Programme + Tâche + Ligne + Expression
- [ ] La solution donne : Avant/Après avec variables nommées
- [ ] Le diagramme de flux ASCII est présent
- [ ] Les deux index.json sont mis à jour

---

*Analyse : {DATE}*
*Protocole : ticket-analysis.md v1.0*
