# Pattern: Liaison table manquante

> **Source**: PMS-1451
> **Domaine**: Data / Jointure
> **Type**: Bug donnees

---

## Symptomes typiques

- Donnees non affichees ou incompletes
- Champ vide alors que donnee existe
- Jointure manquante
- "Ne prend pas en compte tous les X"

---

## Detection

### Mots-cles dans le ticket
- "manquant"
- "incomplet"
- "ne prend pas en compte"
- "jointure"
- "relation"
- "table liee"

### Verification
1. Identifier les tables impliquees
2. Verifier le DataView du programme
3. Comparer avec les tables necessaires

---

## Cause racine typique

| Element | Valeur |
|---------|--------|
| Zone | DataView > Link Tables |
| Erreur | Table necessaire non jointe |
| Impact | Donnees ignorees ou filtrage incorrect |

---

## Solution type

### Etape 1: Analyser le DataView actuel
```
magic_get_dataview(project, programId, isn2)
```

Resultat attendu :
| Source | Table | Acces | Role |
|--------|-------|-------|------|
| Main | Table principal | READ | Iteration |
| Link 1 | Table X | READ | Jointure existante |
| Link 2 | ... | ... | ... |
| **MANQUANT** | Table Y | - | **Donnees ignorees** |

### Etape 2: Identifier la table manquante
```
magic_kb_table_usage(tableName="nom_table")
magic_get_table(tableId) pour voir structure
```

### Etape 3: Ajouter le Link

| Element | Configuration |
|---------|---------------|
| Type | Link (pas Main Source) |
| Access | READ (ou WRITE si modification) |
| Keys | Cles de jointure avec Main Source |

### Expression de jointure

```magic
// Format: TableLink.champ = MainSource.champ AND ...
A.cle1 = B.cle1 AND A.cle2 = B.cle2
```

---

## Exemple PMS-1451

**Contexte**: Archivage premature des GO avec plusieurs troncons

| Element | Valeur |
|---------|--------|
| Programme | **REF IDE 749.1** - selection (Prg_726.xml) |
| Main Source | Table n31 - gm_complet |
| Table manquante | **Table n167** - troncon (cafil145_dat) |
| Impact | Seul 1er troncon verifie, 2eme troncon ignore |

### DataView avant (BUG)

| Source | Table | Acces | Role |
|--------|-------|-------|------|
| Main | Table n31 - gm_complet | READ | Iteration GM |
| Link 1 | Table n34 - hebergement | READ | Joint hebergement |
| Link 2 | Table n34 - hebergement | READ | Autre cle |
| Link 3 | Table n808 - zselect | WRITE | Liste suppression |

### DataView apres (FIX)

| Source | Table | Acces | Role |
|--------|-------|-------|------|
| Main | Table n31 - gm_complet | READ | Iteration GM |
| Link 1 | Table n34 - hebergement | READ | Joint hebergement |
| Link 2 | Table n34 - hebergement | READ | Autre cle |
| Link 3 | Table n808 - zselect | WRITE | Liste suppression |
| **Link 4** | **Table n167 - troncon** | **READ** | **Jointure troncons** |

### Cles de jointure ajoutees

```magic
tro_societe = gmc.societe
AND tro_compte = gmc.code_gm
AND tro_filiation = gmc.filiation
```

### Variable virtuelle ajoutee

| Variable | Type | Expression | Description |
|----------|------|------------|-------------|
| V.MaxDateRetour | Date | DbSum(T167, tro_date_depart_vol, ..., MAX) | Dernier vol retour |

### Modification Range

| Avant (bug) | Apres (fix) |
|-------------|-------------|
| `date_gm < Variable C` | `V.MaxDateRetour < Variable C` |

---

## Checklist resolution

- [ ] DataView actuel documente (Main + Links)
- [ ] Table manquante identifiee
- [ ] Cles de jointure definies
- [ ] Link ajoute avec bon Access (READ/WRITE)
- [ ] Variables virtuelles creees si necessaire
- [ ] Condition/Range modifiee pour utiliser nouvelles donnees
- [ ] Tests non-regression effectues

---

## Points d'attention

1. **Access type** : READ seulement si consultation, WRITE si modification
2. **Performance** : Ajouter index sur cles de jointure si gros volumes
3. **Null handling** : Prevoir cas ou jointure ne retourne rien (ISNULL, fallback)
4. **Multiple lignes** : Si 1-N, utiliser DbSum/DbCount pour aggreger

---

*Pattern capitalise le 2026-01-24*
