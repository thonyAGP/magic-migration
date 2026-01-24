# Protocole Analyse Ticket Magic

> **LECTURE OBLIGATOIRE** avant toute analyse de ticket.
> Ce protocole garantit une analyse structurée et vérifiable.
>
> **Skill orchestrateur**: `/ticket-analyze {KEY}` - Force toutes les phases automatiquement

---

## SKILL ORCHESTRATEUR (RECOMMANDÉ)

Pour garantir le respect du protocole, utiliser le skill:

```
/ticket-analyze PMS-1234
```

Ce skill:
1. Force les 6 phases dans l'ordre
2. Bloque si une phase est incomplete
3. Suggere des patterns KB similaires
4. Valide automatiquement avant commit

**Fichiers du skill**:
- Skill: `skills/ticket-analyze/SKILL.md`
- Templates questions: `skills/ticket-analyze/templates/questions.json`
- Index patterns: `skills/ticket-analyze/templates/patterns.json`
- Patterns KB: `.openspec/patterns/*.md`

---

## RÈGLES IMPÉRATIVES (MANDATORY)

### 1. JAMAIS D'ANALYSE MANUELLE - TOUJOURS MCP

> **RÈGLE ABSOLUE** : Ne JAMAIS décoder ou calculer manuellement. TOUJOURS appeler MCP.

| Action | INTERDIT (manuel) | OBLIGATOIRE (MCP) |
|--------|-------------------|-------------------|
| Décoder `{0,21}` | "Variable V = prix" (deviné) | `magic_decode_expression()` |
| Calculer offset | `143 + 119 + 3 = 265` (à la main) | `magic_calculate_offset()` |
| Trouver variable ligne N | "Variable C = date" (lu dans XML) | `magic_get_line()` |
| Convertir index → lettre | "Index 21 = V" (calculé) | MCP retourne la lettre |

**POURQUOI** : Le calcul manuel est source d'erreurs. Seul OffsetCalculator a la formule validée.

### 2. HEURE = HEURE SYSTÈME (JAMAIS HARDCODÉ)

| Champ | Source | Exemple |
|-------|--------|---------|
| `dga_heure` | `Time(0)` ou `MTime()` | Heure système au moment du traitement |
| `dga_date` | `Date(0)` ou paramètre | Date comptable |

**INTERDIT** : `dga_heure = '08:00:00'` (hardcodé)
**OBLIGATOIRE** : `dga_heure = Time(0)` (heure système)

### 2. STRUCTURE AVEC ONGLETS (TABS)

L'analyse DOIT utiliser des onglets pour organiser les sections :

```markdown
<!-- ONGLET: Contexte -->
## 1. Contexte Jira
...

<!-- ONGLET: Localisation -->
## 2. Localisation
...

<!-- ONGLET: Tables -->
## 3. Tables concernées
...

<!-- ONGLET: Spécification -->
## 4. Spécification technique
...

<!-- ONGLET: Tests -->
## 5. Tests de validation
...
```

### 3. FORMAT DOCUMENTATION SPÉCIFICATION

| Section | Obligatoire | Contenu |
|---------|-------------|---------|
| **Logic** | OUI | Pseudo-code avec `Time(0)` pour heure système |
| **Variables** | OUI | Tableau avec source (système/config/table) |
| **Tests** | OUI | Scénarios avec heures variées |

---

## PRINCIPE FONDAMENTAL

**Chaque affirmation doit être VÉRIFIÉE par un appel MCP.**

| Affirmation | Vérification obligatoire |
|-------------|-------------------------|
| "Programme PVE IDE 186" | `magic_get_position("PVE", 180)` appelé et documenté |
| "Variable MK" | `magic_get_line()` appelé (offset automatique) |
| "Expression calcule X" | `magic_decode_expression()` appelé et formule décodée |
| "Table n°40" | `magic_get_table()` appelé avec structure documentée |

---

## PARALLÉLISATION (OPTIMISATION TEMPS)

> Pour réduire le temps d'analyse, lancer les appels **indépendants** en parallèle.

### Appels parallélisables par étape

| Étape | Appels pouvant être parallélisés |
|-------|----------------------------------|
| **ÉTAPE 2** | `magic_find_program()` pour chaque nom de programme |
| **ÉTAPE 2** | `magic_get_table()` pour chaque table mentionnée |
| **ÉTAPE 3** | `magic_get_logic()` pour chaque tâche du flux |
| **ÉTAPE 4** | `magic_get_expression()` pour chaque expression |

### Exemple de parallélisation

```
// Mauvais (séquentiel) - ~20 min
magic_find_program("Main Sale")  // attendre
magic_get_position("PVE", 180)   // attendre
magic_get_table("246")           // attendre
magic_get_table("249")           // attendre

// Bon (parallèle) - ~5 min
[EN PARALLÈLE]
  - magic_find_program("Main Sale")
  - magic_get_table("246")
  - magic_get_table("249")
[SÉQUENTIEL après]
  - magic_get_position("PVE", 180)  // dépend du résultat find
```

### Règle

Utiliser **Task tool avec plusieurs appels** dans un seul message pour paralléliser.

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
magic_decode_expression(project, programId, taskIsn2, expressionId)
→ Decode automatiquement {N,Y} en variables globales
→ Offset calcule automatiquement via formule validee
→ Retourne formule lisible + tableau de correspondances
```

### Outil automatise

```
magic_decode_expression(project, programId, taskIsn2, expressionId)

Parametres :
- project     : PVE, ADH, VIL, PBG, PBP, REF
- programId   : ID du programme (ex: 180)
- taskIsn2    : ISN_2 de la tache (ex: 45)
- expressionId: ID de l'expression (ex: 30)

Retourne :
- Formule originale
- Formule decodee avec lettres de variables
- Tableau de correspondances {N,Y} → Variable
- Offset calcule automatiquement
```

### Formule d'offset (reference)

L'offset est calcule automatiquement par OffsetCalculator :
```
Offset = Main_VG + Σ(Selects des ancetres, SAUF Access=W)
```
Aucun calcul manuel requis.

### Documentation verbeuse requise

```markdown
## Analyse Expressions

### Appel MCP : magic_decode_expression("PVE", 180, 45, 30)
Expression 30 decodee (offset automatique) :

| Référence | Position locale | Index global | Variable |
|-----------|-----------------|--------------|----------|
| {0,3} | 2 | 432 | **QQ** |
| {0,1} | 0 | 430 | **QO** |

### Formule décodée (lisible)
Round(QQ * (1 - QO/100), 10, 0)
      ↑         ↑
      Prix      % Remise

### Appel MCP : magic_get_line("PVE", "186.1.5.4", 3)
Résultat (offset automatique) :
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
- [ ] Toutes les variables sont décodées automatiquement via `magic_get_line`
- [ ] Au moins une expression est décodée avec formule lisible
- [ ] La root cause identifie : Programme + Tâche + Ligne + Expression
- [ ] La solution donne : Avant/Après avec variables nommées
- [ ] Le diagramme de flux ASCII est présent

---

## RÈGLES D'OR

1. **JAMAIS** déduire un IDE d'un nom de fichier XML
2. **TOUJOURS** documenter chaque appel MCP avec son résultat
3. **TOUJOURS** utiliser `magic_get_line` (offset automatique via OffsetCalculator)
4. **JAMAIS** citer une expression sans la décoder en variables lisibles
5. **TOUJOURS** donner la localisation exacte : Programme.Tâche.Ligne

---

## KNOWLEDGE BASE PATTERNS

Avant d'analyser un ticket, consulter les patterns KB existants:

### Patterns disponibles

| Pattern | Symptômes | Solution type |
|---------|-----------|---------------|
| `date-format-inversion.md` | Date +1 mois, inversion MM/DD | Corriger parsing YYMMDD |
| `add-filter-parameter.md` | Masquer lignes, filtrer données | Ajouter param + Range/Locate |
| `picture-format-mismatch.md` | Prix sans décimales | Corriger Picture Format |
| `table-link-missing.md` | Données incomplètes, jointure | Ajouter Link Table |
| `ski-rental-duration-calc.md` | Calcul selon durée séjour | Condition sur dates |

### Utilisation

```
# Rechercher patterns similaires
/ticket-search "date incorrecte"

# Après résolution, capitaliser
/ticket-learn PMS-1234
```

**Index complet**: `.openspec/patterns/README.md`

---

## VALIDATION HOOK (v2.0)

Le hook `.claude/hooks/validate-ticket-analysis.ps1` valide:

### Phases vérifiées

| Phase | Validation |
|-------|------------|
| 1. Contexte | Lien Jira présent |
| 2. Localisation | magic_get_position/find_program appelé |
| 3. Flux | Diagramme ASCII présent |
| 4. Expressions | {N,Y} décodées via MCP |
| 5. Root Cause | Localisation précise (Programme + Tâche) |
| 6. Solution | Avant/Après documenté |

### Patterns bloquants

Le hook BLOQUE si:
- ISN_2 utilisé au lieu de position IDE
- FieldID utilisé au lieu de nom variable
- Calcul offset manuel détecté
- Référence {N,Y} non décodée

### Score minimum

**5/6 phases validées** pour passer

---

*Protocole v2.0 - 2026-01-24*
*Skill orchestrateur: `/ticket-analyze`*
