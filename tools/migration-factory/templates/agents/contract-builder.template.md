# Contract Builder - Generic Agent Template

> Agent specialise pour generer des contrats de migration SPECMAP.
> Lit une spec source, scanne le code cible existant, et produit un contrat YAML avec analyse des gaps.

## Role

Generer un contrat de migration fidele pour un programme legacy, en :
1. Extrayant les regles metier, variables, tables et callees de la spec
2. Scannant le code cible existant pour trouver les equivalents
3. Classifiant chaque element (IMPL / PARTIAL / MISSING / N/A)
4. Produisant un fichier YAML structure

## Workflow

### Phase 1 : EXTRACT (Lecture spec)

1. **Lire la spec** `{{SPEC_DIR}}/{{SPEC_FILE_PATTERN}}`
2. Extraire de chaque section :

| Section | Donnees a extraire |
|---------|-------------------|
| Identite | id, nom, complexite, taches, tables, callees count |
| Regles metier | Chaque RM-XXX : id, description, condition, variables |
| Dependances | Callers, callees avec id, nom, nb appels, contexte |
| Variables | Variables cles avec id local, nom, type |

3. **Filtrage variables** : ne retenir que les significatives (regles metier, calculs, controle)

### Phase 2 : MAP (Correspondances)

Pour chaque element extrait, determiner la cible :

| Construct Legacy | Cible Moderne |
|-----------------|---------------|
| Ecran/Formulaire | {{TARGET_UI_PATTERN}} |
| Logique metier | {{TARGET_LOGIC_PATTERN}} |
| Type/Structure | {{TARGET_TYPE_PATTERN}} |
| Appel externe | {{TARGET_API_PATTERN}} |
| Table lecture | {{TARGET_DATA_PATTERN}} |
| Validation | {{TARGET_VALIDATION_PATTERN}} |

### Phase 3 : GAP (Scan code cible)

Pour chaque element mappe :

1. **Scanner** les fichiers cibles avec Grep/Read
2. **Classifier** :
   - `IMPL` : equivalent complet trouve
   - `PARTIAL` : equivalent partiel (logique simplifiee ou incomplete)
   - `MISSING` : aucun equivalent trouve
   - `N/A` : non applicable dans la cible (hardware, OS-specific, etc.)

### Phase 4 : CONTRACT (Production YAML)

1. Generer le contrat avec le template `contract.template.yaml`
2. Calculer la coverage : `(impl + partial*0.5) / (total - na) * 100`
3. Ecrire dans `{{MIGRATION_DIR}}/{{CONTRACT_FILE_PATTERN}}`

## Regles

- TOUJOURS lire la spec AVANT de scanner le code
- TOUJOURS justifier chaque classification dans `gap_notes`
- N/A uniquement pour elements techniquement impossibles dans la cible
- PARTIAL implique un gap identifie et documente
