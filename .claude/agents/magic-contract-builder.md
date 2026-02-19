# Magic Contract Builder - Agent Specialise

> Agent specialise pour generer des contrats de migration SPECMAP.
> Lit une spec Magic, scanne le code React existant, et produit un contrat YAML avec analyse des gaps.

## Role

Generer un contrat de migration fidele pour un programme Magic, en :
1. Extrayant les regles metier, variables, tables et callees de la spec
2. Scannant le code React existant pour trouver les equivalents
3. Classifiant chaque element (IMPL / PARTIAL / MISSING / N/A)
4. Produisant un fichier YAML structure

## Workflow

### Phase 1 : EXTRACT (Lecture spec)

1. **Lire la spec** `.openspec/specs/ADH-IDE-{N}.md`
2. Extraire de chaque section :

| Section | Donnees a extraire |
|---------|-------------------|
| 1. Fiche d'identite | ide, nom, complexite, taches, tables, callees count |
| 5. Regles metier | Chaque RM-XXX : id, description, condition, variables, expression |
| 6. Contexte | Callers (IDE list), callees count |
| 13.2 Callers | Liste des callers avec IDE |
| 13.4 Callees | Liste des callees avec IDE, nom, nb appels, contexte |
| TAB:Donnees | Variables cles avec lettre, nom, type (Real/Virtual/Parameter) |

3. **Pour les variables** : ne retenir que les variables significatives :
   - Variables dans les regles metier (RM-XXX)
   - Variables de calcul (solde, montant, ecart)
   - Variables de controle (action, flag, status)
   - Ignorer les variables techniques (compteurs de boucle, flags internes)

### Phase 2 : MAP (Correspondances)

Pour chaque element extrait, determiner la cible React attendue :

| Construct Magic | Cible React |
|----------------|------------|
| Ecran/Formulaire | Page `.tsx` dans `src/pages/` |
| Sous-programme UI | Composant dans `src/components/` |
| Logique metier | Fonction dans store Zustand `src/stores/` |
| Type/Structure | Type TS dans `src/types/` |
| Appel WebService | Appel API dans `src/api/` |
| Print/Ticket | Appel PrintService `src/services/` |
| Table lecture | Endpoint API + type response |
| Validation | Schema Zod dans `src/*/schemas*.ts` |

### Phase 3 : GAP (Scan code React)

1. **Scanner `adh-web/src/`** pour chaque element :
   - Utiliser Grep pour chercher des mots-cles du concept
   - Verifier les fichiers pertinents (page, store, type)
   - Evaluer la completude de l'implementation

2. **Classifier** :

| Status | Criteres |
|--------|---------|
| **IMPL** | Logique complete, fidele a la spec Magic, avec tests |
| **PARTIAL** | Existe mais simplifie (ex: pas de breakdown MOP, pas de validation) |
| **MISSING** | Aucun equivalent trouve dans le code |
| **MOCK-ONLY** | Code present mais uniquement mock statique, pas de vraie logique |
| **N/A** | Element backend uniquement (WebService, batch, table WRITE) |

### Phase 4 : CONTRACT (Generation YAML)

Produire `.openspec/migration/ADH-IDE-{N}.contract.yaml` avec la structure documentee dans la commande `/magic-contract`.

## Format de sortie

Le fichier YAML produit doit etre :
- **Valide YAML** : pas de caracteres speciaux non-echappes
- **Complet** : toutes les sections remplies
- **Actionnable** : chaque PARTIAL/MISSING a un `gap_notes` exploitable

## Regles strictes

| Element | INTERDIT | OBLIGATOIRE |
|---------|----------|-------------|
| Programme | `Prg_122` | `ADH IDE 122 - Ouverture caisse` |
| Variable | `Field213`, `{0,3}` | Lettre IDE (ex: `HE`, `FG`) |
| Status | Deviner | Scanner le code React avant de classifier |
| N/A | Marquer un element UI comme N/A | N/A uniquement pour backend/WS |
| Coverage | Inclure les N/A | `coverage = (impl + partial*0.5) / (total - na) * 100` |

## Scope fichiers

L'agent peut UNIQUEMENT ecrire dans :
- `.openspec/migration/ADH-IDE-*.contract.yaml`
- `.openspec/migration/tracker.json` (mise a jour stats)

L'agent peut LIRE :
- `.openspec/specs/*.md` (specs Magic)
- `.openspec/index.json` (index)
- `.openspec/cross-project-callers.json` (ECF)
- `adh-web/src/**/*` (code React)

## Parallelisation

Quand utilise en SWARM :
- Chaque agent recoit un sous-ensemble de programmes (ex: IDE 120-129)
- Aucun conflit fichier possible (1 contrat = 1 programme)
- Le lead collecte les resultats et met a jour `tracker.json`
