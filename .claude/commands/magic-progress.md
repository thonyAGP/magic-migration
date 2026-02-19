# Dashboard de progression SPECMAP

Affiche le rapport de progression global de la migration SPECMAP.

## Etapes

### 1. Lire les donnees

- `.openspec/migration/tracker.json` - stats globales
- `.openspec/migration/live-programs.json` - programmes LIVE
- `.openspec/migration/dependency-graph.json` - niveaux
- `.openspec/migration/batches/*.md` - status par batch
- `.openspec/migration/ADH-IDE-*.contract.yaml` - contrats individuels

### 2. Calculer les metriques

| Metrique | Source | Calcul |
|----------|--------|--------|
| Total LIVE | live-programs.json | count(programs) |
| Contracted | contract files | count(*.contract.yaml) |
| Enriched | contracts avec status=enriched | count(status=enriched) |
| Verified | contracts avec status=verified | count(status=verified) |
| Coverage globale | tous les contrats | avg(coverage_pct) |

### 3. Afficher le rapport

```
╔══════════════════════════════════════════════╗
║           SPECMAP Migration Dashboard        ║
╠══════════════════════════════════════════════╣
║ Total ADH: 350 | LIVE: 212 | Orphelins: 138 ║
╠══════════════════════════════════════════════╣
║ Contracted:  N/212 (N%)                      ║
║ Enriched:    N/212 (N%)                      ║
║ Verified:    N/212 (N%)                      ║
║ Coverage:    N% moyenne                      ║
╚══════════════════════════════════════════════╝

=== Par Batch ===

| Batch | Domaine | Programmes | Contracted | Enriched | Verified | Coverage |
|-------|---------|:----------:|:----------:|:--------:|:--------:|:--------:|
| B1 | Ouverture session | 18 | 18/18 | 5/18 | 0/18 | 45% |
| B2 | Fermeture session | 20 | 0/20 | 0/20 | 0/20 | - |
| ... | ... | ... | ... | ... | ... | ... |

=== Par Niveau ===

| Niveau | Total | Contracted | Enriched | Verified |
|--------|:-----:|:----------:|:--------:|:--------:|
| 0 (feuilles) | 91 | N | N | N |
| 1 | 8 | N | N | N |
| ... | ... | ... | ... | ... |

=== Derniere activite ===

[5 derniers contrats generes ou mis a jour]
```

### 4. Identifier les prochaines actions

```
=== Prochaines actions recommandees ===

1. [Si aucun batch contracted] Executer /magic-batch-contract B1 (pilote)
2. [Si batch contracted] Executer /magic-enrich pour les programmes PARTIAL/MISSING
3. [Si batch enriched] Executer /magic-verify pour valider
```
