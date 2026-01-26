# {{ project }} IDE {{ ide }} - {{ title }}

> **Version spec** : 3.0
> **Genere le** : {{ generated_at }}
> **Source** : `{{ source_xml }}`

---

## PARTIE I: SPECIFICATION FONCTIONNELLE

### 1.1 Objectif Metier

{{ #if annotations.functional.objective }}
- **Qui**: {{ annotations.functional.objective.who }}
- **Quoi**: {{ annotations.functional.objective.what }}
- **Pourquoi**: {{ annotations.functional.objective.why }}
{{ else }}
> :warning: A completer dans `.openspec/annotations/{{ project }}-IDE-{{ ide }}.yaml`
{{ /if }}

### 1.2 Regles Metier

| Code | Description | Expression | Validee |
|------|-------------|------------|---------|
{{ #each business_rules }}
| {{ code }} | {{ description }} | #{{ expression_id }} | {{ validated }} |
{{ else }}
> Regles metier a extraire et valider dans annotations YAML
{{ /each }}

### 1.3 Flux Utilisateur

{{ #each annotations.functional.user_flow }}
{{ @index + 1 }}. {{ this }}
{{ else }}
> Flux utilisateur a completer dans annotations YAML
{{ /each }}

### 1.4 Cas d'Erreur

{{ #each annotations.functional.error_cases }}
- **{{ condition }}** -> {{ message }}
{{ else }}
> Cas d'erreur a completer dans annotations YAML
{{ /each }}

---

## PARTIE II: SPECIFICATION TECHNIQUE

### 2.1 Tables ({{ tables.length }} total - {{ write_table_count }} en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
{{ #each tables }}
| #{{ id }} | `{{ physical }}` | {{ logical }} | {{ #if (eq access 'W') }}**W**{{ else }}R{{ /if }} | {{ usage }}x |
{{ /each }}

### 2.2 Parametres ({{ parameter_count }})

| # | Nom | Type | Description |
|---|-----|------|-------------|
{{ #each parameters }}
| P{{ @index + 1 }} | {{ name }} | {{ type }} | - |
{{ /each }}

### 2.3 Variables ({{ variable_count }} total)

| Ref | Nom | Type |
|-----|-----|------|
{{ #each variables limit=30 }}
| `{{ ref }}` | {{ name }} | {{ type }} |
{{ /each }}

> Affichage limite aux 30 premieres variables

### 2.4 Structure des Taches

```
{{ task_tree }}
```

### 2.5 Expressions ({{ expression_count }} total)

| # | Expression | Variables |
|---|------------|-----------|
{{ #each expressions limit=50 }}
| {{ id }} | `{{ decoded }}` | {{ variables }} |
{{ /each }}

> Affichage limite aux 50 premieres expressions

---

## PARTIE III: CARTOGRAPHIE APPLICATIVE

### 3.1 Call Graph

```mermaid
{{ call_graph_mermaid }}
```

### 3.2 Dependances Cross-Projet

{{ #each cross_project_deps }}
- {{ direction }}: {{ project }} IDE {{ ide }} ({{ reason }})
{{ else }}
Aucune dependance cross-projet detectee
{{ /each }}

### 3.3 Zones d'Impact

| Modification | Programmes Affectes | Severite |
|--------------|---------------------|----------|
{{ #each impact_zones }}
| {{ change_type }} | {{ affected_count }} | {{ severity }} |
{{ else }}
| Tables W | A calculer via magic_impact_table | - |
| Expressions | A calculer via magic_impact_expression | - |
{{ /each }}

### 3.4 ECF Membership

{{ #if ecf_membership }}
- **ECF**: {{ ecf_membership.name }}
- **Utilise par**: {{ ecf_membership.used_by | join ', ' }}
{{ else }}
> Verifier appartenance ECF via `magic_ecf_usedby`
{{ /if }}

---

## PARTIE IV: ANTI-REGRESSION

### 4.1 Patterns Connus

{{ #each known_patterns }}
- **{{ name }}** ({{ source_ticket }}): {{ description }}
{{ else }}
Aucun pattern connu affectant ce programme
{{ /each }}

### 4.2 Baseline Metriques

| Metrique | Valeur | Seuil Alerte |
|----------|--------|--------------|
{{ #each baseline_metrics }}
| {{ name }} | {{ value }} | +/-{{ threshold }} |
{{ else }}
| expression_count | {{ expression_count }} | +/-10 |
| table_count | {{ table_count }} | +/-3 |
| write_table_count | {{ write_table_count }} | +/-1 |
{{ /each }}

### 4.3 Historique Changements

{{ #each change_history }}
- {{ date }}: {{ description }} ({{ author }})
{{ else }}
- {{ generated_at }}: Generation specification V3.0 (Claude)
{{ /each }}

---

## PARTIE V: NOTES MIGRATION

### 5.1 Score Complexite

**{{ complexity_score }}** ({{ complexity_level }})

- Tables en ecriture: {{ write_table_count }}
- Expressions: {{ expression_count }}
- Parametres: {{ parameter_count }}

### 5.2 Architecture Cible

{{ annotations.migration.target_architecture | default 'CQRS' }}

### 5.3 Notes Migration

{{ #each annotations.migration.notes }}
- {{ this }}
{{ else }}
> Notes de migration a completer dans annotations YAML
{{ /each }}

### 5.4 Couverture Tests Requise

- [ ] Tests unitaires (80%)
- [ ] Tests integration tables
- [ ] Tests regression patterns

---

*Specification V3.0 - Generee par Render-Spec.ps1*
*KB Data + Annotations: `.openspec/annotations/{{ project }}-IDE-{{ ide }}.yaml`*
