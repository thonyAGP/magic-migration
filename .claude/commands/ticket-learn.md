---
description: Capitalise la resolution d'un ticket dans la Knowledge Base
arguments:
  - name: ticket_key
    description: Cle du ticket resolu (optionnel, utilise le dernier actif)
    required: false
---

# Capitalisation Pattern

Ajoute un pattern resolu a la Knowledge Base SQLite pour reutilisation future.

## Process

### 1. Identifier le ticket

- Si argument fourni: utiliser `$ARGUMENTS`
- Sinon: lire le dernier ticket avec donnees locales depuis `.openspec/tickets/index.json`

### 2. Lire la resolution

Lire le fichier `.openspec/tickets/{KEY}/resolution.md` et extraire:

- **Symptome**: Description du probleme original
- **Cause racine**: Explication technique du bug
- **Solution**: Correction implementee
- **Domaine**: Classification (dates, import, affichage, calcul, impression)
- **Programmes**: Liste des programmes impliques
- **Tables**: Tables concernees

### 3. Creer entree Knowledge Base

Inserer dans `.openspec/tickets/patterns.sqlite`:

```sql
INSERT INTO patterns (
    ticket_key,
    symptom,
    root_cause,
    solution,
    domain,
    programs,
    tables_involved,
    keywords,
    resolution_time_hours
) VALUES (
    '{KEY}',
    '{symptom}',
    '{root_cause}',
    '{solution}',
    '{domain}',
    '{programs_json}',
    '{tables_json}',
    '{keywords}',
    {hours}
);
```

## Schema SQLite

Si la base n'existe pas, la creer avec:

```sql
CREATE TABLE IF NOT EXISTS patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_key TEXT NOT NULL UNIQUE,
    symptom TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    domain TEXT,
    programs TEXT,
    tables_involved TEXT,
    keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolution_time_hours INTEGER
);

CREATE INDEX IF NOT EXISTS idx_domain ON patterns(domain);
CREATE INDEX IF NOT EXISTS idx_keywords ON patterns(keywords);
```

## Domaines disponibles

| Domaine | Description | Mots-cles typiques |
|---------|-------------|--------------------|
| `dates` | Parsing, affichage, calcul de dates | date, format, parsing, DD/MM |
| `import` | Import de fichiers externes | fichier, TXT, CSV, NA, import |
| `affichage` | Problemes d'affichage GUI | ecran, GUI, affichage, champ |
| `calcul` | Erreurs de calcul metier | calcul, montant, solde, total |
| `impression` | Problemes d'edition/impression | edition, impression, PDF, ticket |
| `performance` | Lenteur, timeout | lent, timeout, performance |
| `donnees` | Corruption, incoherence | donnees, table, enregistrement |

## Questions a poser

Avant d'inserer, demander:

1. **Domaine**: Quel est le domaine fonctionnel principal?
2. **Mots-cles**: Quels termes permettraient de retrouver ce pattern?
3. **Temps**: Combien d'heures pour resoudre (estimation)?

## Exemple d'utilisation

```
/ticket-learn CMDS-174321

Ticket: CMDS-174321
Symptome: Date arrivee affichee incorrecte (+1 mois)
Cause: Parsing DD/MM vs MM/DD dans affichage GUI
Solution: Corriger le Picture du champ FieldID=26 dans Prg_63
Domaine: dates
Programmes: PBP.62, PBP.63, PBG.315
Tables: cafil014_dat
Keywords: date parsing format planning arrivee GM GUI

Pattern ajoute avec succes!
```
