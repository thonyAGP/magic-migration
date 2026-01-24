# Pattern: Inversion format date (MM/DD vs DD/MM)

> **Source**: CMDS-174321
> **Domaine**: Import / Parsing
> **Type**: Bug logique

---

## Symptomes typiques

- Date incorrecte (decalee d'un mois)
- "25/12 devient 25/01"
- Inversion mois/jour
- Bug apres import fichier externe

---

## Detection

### Mots-cles dans le ticket
- "date incorrecte"
- "mauvaise date"
- "date arrivee"
- "import NA"
- "decalage mois"

### Verification
1. Comparer date source (fichier) vs date en base
2. Verifier format attendu (YYMMDD, DDMMYY, etc.)
3. Identifier le programme d'import

---

## Cause racine typique

| Element | Valeur |
|---------|--------|
| Zone | Parsing de date dans import |
| Erreur | Inversion position MM et DD |
| Exemple | `YYMMDD` lu comme `YYDDMM` |

### Expression Magic typique

```magic
// Bug: STRtoDAT(Substr(date_str,3,2) & '/' & Substr(date_str,5,2) & '/' & Substr(date_str,1,2))
// Fix: STRtoDAT(Substr(date_str,5,2) & '/' & Substr(date_str,3,2) & '/' & Substr(date_str,1,2))
```

---

## Solution type

### Etape 1: Localiser le parsing
```
magic_kb_search("STRtoDAT", scope="expressions")
magic_find_program("import")
```

### Etape 2: Verifier format
| Format source | Position Jour | Position Mois | Position Annee |
|---------------|---------------|---------------|----------------|
| YYMMDD | 5-6 | 3-4 | 1-2 |
| DDMMYY | 1-2 | 3-4 | 5-6 |
| MMDDYY | 3-4 | 1-2 | 5-6 |

### Etape 3: Corriger expression
- Identifier les Substr() ou Mid() dans l'expression
- Corriger les positions pour matcher le format source

---

## Tests de validation

| Test | Donnee | Attendu | Verifie |
|------|--------|---------|---------|
| Date normale | 251225 (YYMMDD) | 25/12/2025 | |
| Debut annee | 260101 | 01/01/2026 | |
| Fin mois | 251231 | 31/12/2025 | |

---

## Cas CMDS-174321 specifique

**Contexte**: Import fichiers NA (RV.HST) avec dates arrivee

| Element | Valeur |
|---------|--------|
| Programme | **PBG IDE 315** - Import NA |
| Table | **Table n14** - cafil014_dat (clients) |
| Champ | gm_date_arrivee |
| Bug | Date +1 mois pour certaines filiations |
| Cause | Parsing YYMMDD avec inversion MM/DD pour filiation 004 |

---

## Checklist resolution

- [ ] Format source identifie et documente
- [ ] Expression de parsing localisee
- [ ] Positions Substr/Mid corrigees
- [ ] Tests avec plusieurs dates effectues
- [ ] Donnees existantes corrigees si necessaire

---

*Pattern capitalise le 2026-01-24*
