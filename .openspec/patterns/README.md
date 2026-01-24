# Patterns Magic - Knowledge Base

> Capitalisation des patterns de modification Magic Unipaas
> Utilise par le skill `/ticket-analyze` pour suggerer des solutions

## Index des patterns

| Pattern | Fichier | Ticket source | Description |
|---------|---------|---------------|-------------|
| **Inversion format date** | `date-format-inversion.md` | CMDS-174321 | Parsing YYMMDD avec inversion MM/DD |
| **Ajout parametre filtre** | `add-filter-parameter.md` | PMS-1373 | Ajouter un Boolean pour filtrer des lignes via Range Expression |
| **Format Picture incorrect** | `picture-format-mismatch.md` | CMDS-176521 | Picture Format N10 au lieu de N10.2 (decimales) |
| **Liaison table manquante** | `table-link-missing.md` | PMS-1451 | Link Table manquant dans DataView |
| **Calcul duree location ski** | `ski-rental-duration-calc.md` | PMS-1446 | Calcul MODEDAYINC base sur duree sejour |

## Patterns generiques (sans ticket source)

| Pattern | Fichier | Description |
|---------|---------|-------------|
| **Heure hardcodee** | `time-source-hardcoded.md` | Remplacer valeur fixe par Time(0) |
| **Programme orphelin** | `orphan-program-called.md` | Programme sans PublicName appele via ProgIdx |
| **Code desactive** | `dead-code-reactivation.md` | Tache ou ligne marquee [D] |
| **Mauvaise variable** | `expression-wrong-variable.md` | Expression utilise {0,X} au lieu de {0,Y} |
| **Condition toujours fausse** | `calltask-condition-false.md` | IF(0,...) ou variable constante = 0 |

## Structure d'un pattern

Chaque pattern documente :

1. **Symptomes typiques** : Comment identifier ce pattern
2. **Detection** : Mots-cles et verification
3. **Cause racine typique** : Element et erreur
4. **Solution type** : Etapes de correction
5. **Exemple concret** : Cas du ticket source
6. **Checklist resolution** : Points a valider

## Utilisation avec /ticket-analyze

Le skill `/ticket-analyze` :
1. Extrait les mots-cles du symptome
2. Compare avec `symptoms` et `keywords` de chaque pattern
3. Score par nombre de matches
4. Suggere les top 3 patterns avec score > 2

## Algorithme de matching

```
score = 0
pour chaque mot_cle dans symptome_ticket:
    si mot_cle in pattern.keywords: score += 1
    si mot_cle in pattern.symptoms: score += 1
retourner patterns ou score >= 2
```

## Contribution

Apres chaque resolution de ticket :
1. Verifier si un pattern similaire existe
2. Si non, creer un nouveau fichier `.md`
3. Mettre a jour cet index et `patterns.json`
4. Utiliser `/ticket-learn {KEY}` pour automatiser

---

*Derniere mise a jour: 2026-01-24*
*Index genere par skill ticket-analyze v1.0*
