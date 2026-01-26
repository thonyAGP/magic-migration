# Pattern: Validation heure manquante (FIELD_TIME sans Picture)

> **Source**: PMS-1453
> **Domaine**: Validation / Saisie
> **Type**: Bug validation

---

## Symptomes typiques

- Utilisateur peut saisir des heures invalides (ex: 70:00, 99:59)
- Valeurs incorrectes stockees en base
- Pas d'erreur de saisie affichee
- Champ TIME accepte n'importe quel numerique

---

## Detection

### Mots-cles dans le ticket
- "heure invalide"
- "saisie heure"
- "70:00" ou autre heure impossible
- "format heure"
- "FIELD_TIME"

### Verification
1. Identifier le champ de saisie d'heure
2. Verifier la colonne dans DataView du programme
3. Controler presence du Picture format "HH:MM" ou "HH:MM:SS"

---

## Cause racine typique

| Element | Valeur |
|---------|--------|
| Zone | DataView > Column > PropertyList |
| Erreur | Picture absent sur colonne FIELD_TIME |
| Consequence | Magic accepte toute valeur numerique |

### Explication technique

Dans Magic, le type `FIELD_TIME` definit le **format de stockage** (secondes depuis minuit) mais **PAS la validation de saisie**.

La validation de plage (00:00 a 23:59) est controlee par l'element `<Picture>` :
- Sans Picture : pas de limite, accepte 70:00, 99:99, etc.
- Avec Picture "HH:MM" : valide plage horaire

### Diagnostic

```
SI type colonne = FIELD_TIME
   ET Picture absent ou vide
   ALORS = BUG validation heure
```

---

## Solution type

### Etape 1: Localiser la colonne fautive

```
magic_get_tree(project, ide)  # Structure taches
magic_get_line(project, tache, "dataview")  # Colonnes
```

Chercher les colonnes avec:
- `<Model attr_obj="FIELD_TIME"/>`
- Picture absent

### Etape 2: Corriger le XML

**AVANT (bug)**
```xml
<Column id="5" name="W1 Heure transfert">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <!-- MISSING: Picture -->
  </PropertyList>
</Column>
```

**APRES (fix)**
```xml
<Column id="5" name="W1 Heure transfert">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <Picture id="157" valUnicode="HH:MM"/>
  </PropertyList>
</Column>
```

### Formats Picture valides pour TIME

| Format | Plage acceptee | Usage |
|--------|---------------|-------|
| `HH:MM` | 00:00-23:59 | Heure standard |
| `HH:MM:SS` | 00:00:00-23:59:59 | Heure avec secondes |
| `H:MM` | 0:00-23:59 | Heure sans zero |

---

## Exemple PMS-1453

**Contexte**: Saisie heure de transfert

| Element | Valeur |
|---------|--------|
| Programme | **ADH IDE 307** - Saisie transaction Nouv vente |
| Fichier | Prg_304.xml |
| Tache | 307.37 - Affiche details transfert |
| Colonnes | id=5 (Aller), id=13 (Retour) |
| Table cible | `transfertn` (champ `trf_heure`) |

### Colonnes a corriger

| Colonne | Nom | Ligne XML | Action |
|---------|-----|-----------|--------|
| id=5 | W1 Heure transfert Aller | ~31823 | Ajouter Picture HH:MM |
| id=13 | W1 Heure transfert Retour | ~31880 | Ajouter Picture HH:MM |

---

## Checklist resolution

- [ ] Identifier tous les champs FIELD_TIME concernes
- [ ] Verifier presence Picture sur chaque champ
- [ ] Ajouter Picture "HH:MM" si absent
- [ ] Verifier variantes du programme (ADH IDE 313 pour PMS-1453)
- [ ] Tester saisie 00:00, 12:30, 23:59 (valide)
- [ ] Tester saisie 24:00, 70:00, 99:99 (doit etre rejete)

---

## Programmes similaires a verifier

Autres ecrans avec saisie d'heure potentiellement affectes :
- Planification activites
- Reservations restaurants
- Heures d'ouverture services
- Pointage personnel

---

## Approche alternative

Si modification XML impossible, ajouter validation applicative :

### Control Verify handler
```
IF heure_saisie > 86399 OR heure_saisie < 0 THEN
   Verify Error "L'heure doit etre entre 00:00 et 23:59"
   Annuler
END IF
```

### Expression Range
```
Range(heure_saisie, 0, 86399)
```
Retourne TRUE si valide, FALSE sinon.

> Note: 86399 = 23*3600 + 59*60 + 59 = derniere seconde valide

---

*Pattern capitalise le 2026-01-26*
*Specs liees: ADH-IDE-307, ADH-IDE-313*
