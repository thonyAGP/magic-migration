# Calcul du sous-ensemble LIVE (non-orphelins) des programmes ADH

Calcule les programmes LIVE en parcourant le graphe d'appels depuis les points d'entree.

## Algorithme

### Phase 1 : Collecte des donnees

1. **Lire `.openspec/index.json`** pour obtenir la liste complete des 350 programmes ADH
   - Filtrer sur `project === "ADH"` et fichiers principaux (pas les `-summary`)
   - Extraire : `ide`, `complexity`, `orphanStatus`, `tasks`, `tables`

2. **Lire `.openspec/cross-project-callers.json`** pour obtenir les 30 programmes ECF
   - Ces programmes sont TOUJOURS LIVE (appeles depuis PBP/PVE)

3. **Pour chaque programme, extraire les callees depuis sa spec** `.openspec/specs/ADH-IDE-{N}.md`
   - Section `## 6. CONTEXTE` : ligne `**Appelle**: N programmes`
   - Section `### 13.4 Detail Callees` : table `| [IDE](ADH-IDE-{N}.md) | Nom |`
   - Parser les numeros IDE des callees avec regex : `\| \[(\d+)\]\(ADH-IDE-`
   - Aussi parser les callers : `**Appele par**: [Nom (IDE N)](ADH-IDE-N.md)`

### Phase 2 : Parcours du graphe (BFS)

4. **Initialiser les graines LIVE** :
   - IDE 1 (Main Program)
   - IDE 163 (Menu caisse GM)
   - IDE 281 (Fermeture Sessions)
   - IDE 166 (Start)
   - Les 30 programmes ECF de `cross-project-callers.json`
   - Tout programme avec `orphanStatus === ""` ET des callers dans les specs

5. **Parcours en largeur (BFS)** depuis chaque graine :
   ```
   queue = [...seeds]
   live = new Set(seeds)
   while (queue.length > 0) {
     current = queue.shift()
     for each callee of callees[current] {
       if (!live.has(callee)) {
         live.add(callee)
         queue.push(callee)
       }
     }
   }
   ```

6. **Programmes restants** = ORPHELIN candidats

### Phase 3 : Calcul des niveaux de dependance (leaf-first)

7. **Calculer le niveau** de chaque programme LIVE :
   ```
   Niveau 0 : programmes sans callees (feuilles)
   Niveau N : max(niveau de ses callees) + 1
   ```

8. **Grouper par domaine SADT** (prefixe IDE) :
   - A1.1 Ouverture session : IDE 120-148
   - A1.2 Fermeture session : IDE 130-160
   - A2 Extrait/Separation : IDE 27-76
   - A5 Ventes : IDE 237-250
   - etc.

### Phase 4 : Stockage

9. **Ecrire `live-programs.json`** :
   ```json
   {
     "generated": "2026-02-11",
     "total_adh": 350,
     "live_count": N,
     "orphan_count": M,
     "programs": [
       {
         "ide": 122,
         "name": "Ouverture caisse",
         "complexity": "BASSE",
         "level": 2,
         "callers": [121, 298],
         "callees": [120, 123, 124, 126, 128, 129, 133, 134, 136, 137, 139, 142, 143, 147, 148, 156, 43],
         "source": "bfs",
         "domain": "A1.1"
       }
     ]
   }
   ```

10. **Ecrire `dependency-graph.json`** :
    ```json
    {
      "generated": "2026-02-11",
      "levels": {
        "0": [43, 128, 134, 136, 148, 156, ...],
        "1": [120, 123, 124, 126, 129, 133, ...],
        "2": [122, 131, ...],
        "3": [121, 298, ...],
        "4": [163, 281, ...],
        "5": [1]
      },
      "max_level": 5
    }
    ```

11. **Mettre a jour `tracker.json`** avec les stats

12. **Afficher le resume** :
    ```
    === SPECMAP Live Subset ===
    Total ADH: 350 | LIVE: N | ORPHELIN: M | ECF: 30

    Par niveau:
      Niveau 0 (feuilles): X programmes
      Niveau 1: Y programmes
      ...

    Fichiers generes:
      .openspec/migration/live-programs.json
      .openspec/migration/dependency-graph.json
    ```

## Regles

- NE PAS inclure les programmes `-summary` (doublons)
- Traiter les programmes CAB-IDE separement (autre projet)
- Si une spec est absente pour un callee, le signaler comme WARNING
- Les programmes ECF sont TOUJOURS niveau 0+ (meme sans callees propres, ils sont appeles externement)
