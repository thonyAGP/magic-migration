# Dead Code Patterns in Magic

> Identification et gestion du code mort dans les applications Magic Unipaas

## Types de Code Mort

### 1. Lignes Desactivees [D]

L'indicateur le plus visible de code mort dans l'IDE Magic.

**Detection XML**:
```xml
<LogicLine>
  <Operation Disabled="1">...</Operation>
</LogicLine>
```

**Signification**:
- Code intentionnellement desactive par un developpeur
- Conserve pour reference ou rollback eventuel
- N'est JAMAIS execute a runtime

**Outils**:
- `magic_kb_disabled_blocks` - Liste toutes les lignes [D]
- `magic_kb_dead_code` - Statistiques par programme
- `magic-task-analyzer.ps1 -ShowDeadCode` - Details par tache

### 2. Conditions Toujours Fausses

Branches qui ne seront jamais executees car la condition est constante.

**Patterns XML**:
```xml
<!-- Condition litterale 0 -->
<Condition val="{0,0}"/>

<!-- Expression constante = 0 -->
<Condition val="{32768,X}"/> <!-- Si X est une constante = 0 -->

<!-- Chaine vide toujours fausse -->
<Condition val=""/>
```

**Impact**:
- Le code sous cette condition n'est jamais atteint
- Peut masquer des bugs ou des fonctionnalites obsoletes

### 3. Programmes Vides (ISEMPTY_TSK)

Programmes sans aucune tache ou avec uniquement des taches vides.

**Detection ProgramHeaders.xml**:
```xml
<Header id="123" Description="Old_Program" ISEMPTY_TSK="1"/>
```

**Caracteristiques**:
- task_count = 0
- Aucune logique metier
- Souvent des shells crees puis abandonnes

### 4. Taches Sans Logic

Taches avec DataView mais sans LogicLines.

**Detection XML**:
```xml
<Task>
  <Header ISN_2="3" Description="Unused_Task"/>
  <Resource>
    <Columns>...</Columns>  <!-- DataView existe -->
  </Resource>
  <TaskLogic/>              <!-- Vide! -->
</Task>
```

**Impact**:
- La tache est definie mais ne fait rien
- Les colonnes DataView sont allouees inutilement

### 5. Expressions Non Referencees

Expressions definies mais jamais utilisees dans la logique.

**Detection**:
```
Expression IDE 45: 'Date()'
Aucune reference {45,...} dans les conditions ou affectations
→ Expression potentiellement morte
```

**Outils**:
- `magic_kb_dead_expressions` - Liste par programme

### 6. Hierarchie Desactivee

Quand une tache parent est [D], toutes ses sous-taches sont implicitement mortes.

```
Task 121.1 [D] - Desactive
  └── Task 121.1.1 - Active mais JAMAIS atteint
      └── Task 121.1.1.1 - Active mais JAMAIS atteint
```

**Regle**: Ne pas analyser le contenu d'une branche [D].

## Metriques de Qualite

### Ratio de Code Mort

```
DisabledRatio = DisabledLines / TotalLogicLines * 100
```

| Ratio | Interpretation |
|-------|----------------|
| 0-5% | Excellent - Code propre |
| 5-15% | Acceptable - Maintenance normale |
| 15-30% | Attention - Nettoyage recommande |
| 30-50% | Alerte - Refactoring necessaire |
| >50% | Critique - Programme a revoir |

### Health Score

```
HealthScore = 100 - (OrphanPenalty + EmptyPenalty + DisabledPenalty)

OrphanPenalty = ConfirmedOrphans * 2
EmptyPenalty = EmptyPrograms * 1
DisabledPenalty = TotalDisabledLines / 10
```

| Score | Grade |
|-------|-------|
| 90-100 | A - Excellent |
| 80-89 | B - Bon |
| 70-79 | C - Acceptable |
| 60-69 | D - A ameliorer |
| <60 | F - Critique |

## Outils MCP

### magic_kb_dead_code

Statistiques de code mort pour un programme:

```
magic_kb_dead_code ADH 121

## Dead Code Stats: ADH IDE 121
| Metric | Value |
|--------|-------|
| Total logic lines | 450 |
| Disabled lines [D] | 23 |
| Disabled ratio | 5.1% |
```

### magic_kb_disabled_blocks

Liste toutes les lignes desactivees d'un projet:

```
magic_kb_disabled_blocks ADH

## Disabled Blocks: ADH
Found 156 disabled line(s)

### Summary by Program
| Program IDE | Name | Disabled Lines |
|-------------|------|----------------|
| 69 | EXTRAIT_COMPTE | 45 |
| 121 | Gestion_Caisse_142 | 23 |
```

### magic_kb_dead_expressions

Expressions potentiellement mortes:

```
magic_kb_dead_expressions ADH 69

## Dead Expressions: ADH IDE 69
Found 3 potentially dead expression(s)
| Expr IDE | Content | Reason |
|----------|---------|--------|
| 45 | Date() | Not referenced in any logic |
```

### magic_kb_project_health

Rapport de sante global:

```
magic_kb_project_health ADH

## Project Health Report: ADH

### Program Status
Total Programs:     350
├── Active:         280 (80.0%)
├── Cross-project:  30 (8.6%)
├── Empty:          5 (1.4%)
└── Orphan:         35 (10.0%)

### Dead Code
| Metric | Value |
|--------|-------|
| Programs with disabled code | 45 |
| Total disabled lines | 156 |

### Health Score
**Score: 75/100** - C (Fair)
```

## Script PowerShell

### magic-task-analyzer.ps1

Analyse detaillee avec flag `-ShowDeadCode`:

```powershell
.\magic-task-analyzer.ps1 -Project ADH -PrgId 121 -ShowDeadCode

=== CODE MORT [D] ===
| ISN_2 | Description | Disabled | Total | Ratio |
|-------|-------------|----------|-------|-------|
| 5 | Old_Feature | 15 | 15 | 100% |
| 8 | Legacy_Code | 8 | 20 | 40% |
```

## Workflow d'Analyse

### Phase 1: Vue d'ensemble

```
magic_kb_project_health {PROJECT}
→ Identifier les zones a problemes
```

### Phase 2: Zoom sur programmes

```
magic_kb_dead_code {PROJECT} {IDE}
→ Statistiques detaillees
```

### Phase 3: Details

```
magic-task-analyzer.ps1 -Project {PROJECT} -PrgId {IDE} -ShowDeadCode
→ Liste des taches avec code mort
```

### Phase 4: Documentation

Dans l'analyse de ticket, mentionner:
- Ratio de code mort du programme concerne
- Taches 100% desactivees (a ignorer)
- Impact sur l'analyse (branches a ne pas suivre)

## Bonnes Pratiques

### Avant Analyse

1. **Verifier le ratio global** du programme
2. **Identifier les taches [D]** avant de plonger
3. **Ignorer les branches mortes** lors du tracage de flux

### Pendant Analyse

1. **Ne pas analyser le contenu [D]**
2. **Mentionner les lignes mortes** dans le rapport
3. **Distinguer code actif vs mort** dans les diagrammes

### Apres Analyse

1. **Suggerer un nettoyage** si ratio > 20%
2. **Documenter les orphelins** dans la spec
3. **Mettre a jour le health score** dans OpenSpec

## Anti-patterns

| A eviter | Alternative |
|----------|-------------|
| Analyser une branche [D] | Mentionner "desactive" et ignorer |
| Compter les lignes [D] comme actives | Utiliser TotalLines - DisabledLines |
| Ignorer le ratio de code mort | Inclure dans le rapport |
| Confondre [D] et commentaire | [D] = desactive, Remark = commentaire |
