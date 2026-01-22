# Protocole Analyse Ticket Magic

> **LECTURE OBLIGATOIRE** avant toute analyse de ticket.
> Ce protocole garantit une analyse structurée et vérifiable.

---

## PRINCIPE FONDAMENTAL

**Chaque affirmation doit être VÉRIFIÉE par un appel MCP.**

| Affirmation | Vérification obligatoire |
|-------------|-------------------------|
| "Programme PVE IDE 186" | `magic_get_position("PVE", 180)` appelé et documenté |
| "Variable MK" | `magic_get_line()` avec mainOffset appelé et documenté |
| "Expression calcule X" | `magic_get_expression()` appelé et formule décodée |
| "Table n°40" | `magic_get_table()` appelé avec structure documentée |

---

## ÉTAPE 1 : CONTEXTE JIRA (5 min)

### Actions obligatoires
```powershell
# Toujours exécuter en premier
powershell -File ".claude/scripts/jira-fetch.ps1" -IssueKey "{KEY}" -WithComments
```

### Extraire et documenter
- [ ] **Symptôme** : Qu'est-ce qui ne fonctionne pas ? (citation Jira)
- [ ] **Données d'entrée** : Quelles données déclenchent le bug ?
- [ ] **Résultat attendu** : Que devrait-il se passer ?
- [ ] **Résultat obtenu** : Que se passe-t-il réellement ?
- [ ] **Indices** : Noms de programmes, tables, villages mentionnés

### Output attendu
```markdown
## Contexte Jira

| Élément | Valeur |
|---------|--------|
| Symptôme | [citation exacte] |
| Données entrée | [valeurs précises] |
| Attendu | [comportement correct] |
| Obtenu | [comportement actuel] |

### Indices extraits
- Programme mentionné : "xxx" → à vérifier
- Table mentionnée : "yyy" → à vérifier
- Village : ZZZ
```

---

## ÉTAPE 2 : LOCALISATION PROGRAMMES (10 min)

### Actions obligatoires

Pour **CHAQUE** programme mentionné ou suspecté :

```
1. magic_find_program("nom partiel")     → Obtenir liste candidats
2. magic_get_position(project, id)       → Confirmer IDE exact
3. magic_get_tree(project, id)           → Voir structure tâches
```

### Documentation verbeuse requise

```markdown
## Localisation

### Appel MCP : magic_find_program("Main Sale")
Résultat :
| Project | IDE | ID | Name | Public |
|---------|-----|----|------|--------|
| PVE | 186 | 180 | Main Sale | MAIN_SALE |

### Appel MCP : magic_get_position("PVE", 180)
Résultat : `PVE IDE 186 - Main Sale`

### Appel MCP : magic_get_tree("PVE", 180)
Résultat :
| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| 186 | 0 | Main Sale | 0 |
| 186.1 | 2 | Init | 1 |
| 186.1.5 | 45 | Sales | 2 |
...
```

### Tableau récapitulatif obligatoire

```markdown
### Programmes identifiés

| Fichier XML | IDE Vérifié | Nom | Rôle dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_180.xml | **PVE IDE 186** | Main Sale | Programme principal |
| Prg_195.xml | **PVE IDE 201** | Discounts | Calcul remises |
```

---

## ÉTAPE 3 : TRAÇAGE FLUX (15 min)

### Actions obligatoires

Pour chaque programme du flux :

```
1. magic_get_logic(project, id)           → Voir opérations principales
2. magic_get_logic(project, id, isn2)     → Voir sous-tâche spécifique
3. Pour chaque CallTask trouvé :
   - Noter le TargetPrg
   - Appeler magic_get_position() pour résoudre l'IDE cible
```

### Documentation verbeuse requise

```markdown
## Traçage Flux

### Appel MCP : magic_get_logic("PVE", 180)
Tâche : PVE IDE 186 (Main)

| Ligne | Opération | Condition | Cible |
|-------|-----------|-----------|-------|
| 5 | Call Task | Exp 12 | Tâche 186.1 |
| 12 | Update | - | Variable BK |
| 15 | Call Program | Exp 30 | TargetPrg=195 |

### Résolution CallTask ligne 15
- TargetPrg=195 → magic_get_position("PVE", 195)
- Résultat : **PVE IDE 201 - Discounts**
```

### Diagramme ASCII obligatoire

```markdown
### Flux identifié

┌─────────────────┐
│ PVE IDE 186     │ Main Sale
│ Tâche 186.1     │ Init
└────────┬────────┘
         │ CallTask (condition Exp 12)
         ▼
┌─────────────────┐
│ PVE IDE 186.1.5 │ Sales
│ Ligne 15        │ Call Program
└────────┬────────┘
         │ TargetPrg=195
         ▼
┌─────────────────┐
│ PVE IDE 201     │ Discounts
│ Expression 30   │ ← SUSPECT
└─────────────────┘
```

---

## ÉTAPE 4 : ANALYSE EXPRESSIONS (20 min)

### Actions obligatoires

Pour chaque expression suspecte :

```
1. magic_get_expression(project, expressionId)  → Obtenir formule brute
2. magic_get_line(project, task, line, mainOffset) → Contexte variables
3. Décoder manuellement les {N,Y} en variables globales
```

### Calcul mainOffset (CRITIQUE)

```
mainOffset = Offset Main projet + Σ(colonnes de chaque ancêtre)

Exemple PVE IDE 186.1.5.4 :
  mainOffset = 143 (Main PVE)
             + 119 (colonnes de 186)
             + 3   (colonnes de 186.1)
             + 165 (colonnes de 186.1.5)
             = 430
```

### Documentation verbeuse requise

```markdown
## Analyse Expressions

### Appel MCP : magic_get_expression("PVE", 30)
Expression 30 :
```
Round({0,3}*(1-{0,1}/100), 10, 0)
```

### Décodage {N,Y} → Variables globales

Contexte : Tâche 186.1.5.4, mainOffset = 430

| Référence | FieldID | Position locale | Index global | Variable |
|-----------|---------|-----------------|--------------|----------|
| {0,3} | 3 | 2 | 432 | **QQ** |
| {0,1} | 1 | 0 | 430 | **QO** |

### Formule décodée (lisible)
```
Round(QQ * (1 - QO/100), 10, 0)
      ↑         ↑
      Prix      % Remise
```

### Appel MCP : magic_get_line("PVE", "186.1.5.4", 3, 430)
Résultat :
- Variable QQ = v.Prix (Virtual, Numeric 10.2)
- Variable QO = v.Remise (Virtual, Numeric 5.2)
```

---

## ÉTAPE 5 : ROOT CAUSE (10 min)

### Méthode

1. **Formuler hypothèse** : "Le bug vient de X parce que Y"
2. **Vérifier hypothèse** : Appel MCP pour confirmer
3. **Si invalide** : Retour ÉTAPE 3 avec nouvelle piste

### Documentation requise

```markdown
## Root Cause

### Hypothèse 1
"L'expression 30 utilise la mauvaise variable pour le prix"

### Vérification
- magic_get_line("PVE", "186.1.5.4", 3, 430)
- Variable QQ = v.Compte (Numeric 8) ← C'est un numéro de compte, pas un prix !
- Variable attendue : QR = v.Prix (Numeric 10.2)

### Confirmation
**ROOT CAUSE IDENTIFIÉE** :
- **Localisation** : PVE IDE 186.1.5.4, Expression 30
- **Erreur** : Utilise {0,3} (v.Compte) au lieu de {0,5} (v.Prix)
- **Impact** : Le calcul multiplie le numéro de compte par la remise
```

---

## ÉTAPE 6 : SOLUTION (5 min)

### Format obligatoire

```markdown
## Solution

### Localisation exacte
- **Programme** : PVE IDE 186 - Main Sale
- **Sous-tâche** : Tâche 186.1.5.4
- **Ligne Logic** : Ligne 12 (Update)
- **Expression** : Expression 30

### Modification

| Élément | Avant (bug) | Après (fix) |
|---------|-------------|-------------|
| Expression 30, position 1 | {0,3} (QQ = v.Compte) | {0,5} (QR = v.Prix) |

### Formule complète

**Avant** :
```
Round(QQ*(1-QO/100), 10, 0)  -- QQ = v.Compte (ERREUR)
```

**Après** :
```
Round(QR*(1-QO/100), 10, 0)  -- QR = v.Prix (CORRECT)
```

### Variables concernées

| Variable | Nom logique | Rôle | Statut |
|----------|-------------|------|--------|
| QQ | v.Compte | Numéro GM | Retiré de l'expression |
| QR | v.Prix | Prix unitaire | Ajouté à l'expression |
| QO | v.Remise | % remise | Inchangé |
```

---

## CHECKLIST FINALE

Avant de committer l'analyse :

- [ ] Tous les programmes ont un IDE vérifié par `magic_get_position`
- [ ] Toutes les variables utilisent le mainOffset correct
- [ ] Au moins une expression est décodée avec formule lisible
- [ ] La root cause identifie : Programme + Tâche + Ligne + Expression
- [ ] La solution donne : Avant/Après avec variables nommées
- [ ] Le diagramme de flux ASCII est présent

---

## RÈGLES D'OR

1. **JAMAIS** déduire un IDE d'un nom de fichier XML
2. **TOUJOURS** documenter chaque appel MCP avec son résultat
3. **TOUJOURS** calculer le mainOffset pour les variables
4. **JAMAIS** citer une expression sans la décoder en variables lisibles
5. **TOUJOURS** donner la localisation exacte : Programme.Tâche.Ligne
