# PMS-1419 - Validation qualites GO (toutes)

> **Analyse**: 2026-01-29 09:30 -> 09:55

## Informations Jira

| Champ | Valeur |
|-------|--------|
| **Type** | Story |
| **Statut** | En cours |
| **Priorite** | Moderee |
| **Rapporteur** | Jessica Palermo |
| **Assigne** | Anthony Leberre |

## Demande fonctionnelle

Lors de la **validation d'une personne en qualite GO** (ARTI, MISS, VILL, etc.), la validation doit prendre en compte **l'heure du pays** :

1. **Avant 14h00 (heure pays)** : comptabiliser 0.5 JH pour dejeuner + repas du soir
2. **Apres 14h00 (heure pays)** : comptabiliser uniquement le repas du soir
3. **Perimetre** : validation individuelle et par filiation uniquement
4. **Exclusion** : validation automatique NON concernee
5. **Exclusion** : qualites GM NON concernees
6. **Integration Odyssey** : doit fonctionner si validation depuis Odyssey

## Programmes concernes

| Programme | Description | Impact |
|-----------|-------------|--------|
| **PBG IDE 56** | Validation Arrivants (102 sous-taches) | **CRITIQUE** - Programme principal |
| PBG IDE 59 | Validation Auto filiations | HAUT - PublicName `VALID_AUTO_FILIATION` |
| **PBG IDE 650** | Calcul JH | **CRITIQUE** - Calcul JHP/JHD/JHE |
| **PBG IDE 751** | Gestion des repas new | **CRITIQUE** - Seuils horaires existants |
| PBG IDE 750 | Gestion des effectifs new | HAUT - Checks heure existants |
| PBG IDE 612 | Affectation qualite | MOYEN - Distinction GO/GM via F_QUALITY |
| PBG IDE 335 | Calcul validation | MOYEN |
| PBG IDE 410 | Browse - Validation VAL | MOYEN - Ecran validation |
| PBG IDE 664 | Recalcul effectif | BAS |

## Analyse technique

### Taches cibles dans PBG IDE 56

| Tache | Description | Action |
|-------|-------------|--------|
| 56.10 | Validation Arrivant | **MODIFIER** - Validation individuelle |
| 56.16 | Validation Arrivee | **MODIFIER** - Check heure + qualite GO |
| 56.53 | Valide un seul | **MODIFIER** - Validation par filiation (un seul) |
| 56.54 | Valide tous | **MODIFIER** - Validation par filiation (tous) |
| 56.38 | Validation Automatique v1 | **EXCLURE** |
| 56.81 | Validation Automatique TRA 2.0 | **EXCLURE** |

### Distinction GO/GM existante

Le programme 56 distingue deja GO et GM :
- Expression ligne 16579 : `{0,6}='GM' OR {0,6}='GO' AND {0,8}`
- Expression ligne 16583 : `{0,6}='GO'`

### Seuils horaires existants

**PBG IDE 751 (Gestion des repas new)** :
- Expression 8 : `Val(TStr({0,9},'HH'),'2')>12` - Heure fin > 12h
- Expression 9 : `Val(TStr({0,9},'HH'),'2')>20` - Heure fin > 20h
- Expression 11 : `Val(TStr(Time(),'HH'),'2')<15` - Heure actuelle < **15h**
- Expression 12 : `Val(TStr(Time(),'HH'),'2')<23` - Heure actuelle < 23h

**PBG IDE 750 (Gestion des effectifs new)** :
- Seuils existants : `<12` et `<20` pour DEJ/DIN

## Points d'attention

### 1. Seuil 14h vs 15h
Le code existant dans PBG IDE 751 utilise le seuil **15h** (`<15`). Le ticket demande **14h**. A clarifier avec le metier.

### 2. Heure pays vs heure serveur
Le code actuel utilise `Time()` (heure serveur). Si les villages sont dans des fuseaux differents, il faut une conversion. Verifier si un mecanisme de fuseau horaire existe deja.

### 3. Calcul 0.5 JH
PBG IDE 650 utilise deja une division par 2 dans les expressions 5/6/7/9. Verifier que le calcul s'applique correctement lors de la validation individuelle/filiation.

### 4. Integration Odyssey
Le trigger SQL `E_IU_cafil009_dat` dans `DB_Odyssey/09_CREATE_TRIGGER_PMS_NEW.sql` gere la replication. Le trigger actuel ne contient pas de logique horaire. Si Odyssey declenche des validations, il faudra ajouter un check d'heure cote SQL ou s'assurer que l'appel passe par le programme Magic.

## Schema d'impact

```
PBG IDE 56 (Validation Arrivants)
|
+-- Tache 10: Validation individuelle -> MODIFIER (check heure + GO)
|     +-- Tache 16: Validation Arrivee
|           +-- Tache 17: Marquage Periodes
|           +-- Tache 20: Marquage Validation
|
+-- Tache 52: Liste Filiations
      +-- Tache 53: Valide un seul -> MODIFIER
      +-- Tache 54: Valide tous -> MODIFIER

Programmes appeles:
+-- PBG IDE 751 (Gestion repas) -> MODIFIER seuil 15h -> 14h ?
+-- PBG IDE 750 (Gestion effectifs) -> VERIFIER coherence
+-- PBG IDE 650 (Calcul JH) -> VERIFIER calcul 0.5 JH

Integration externe:
+-- DB_Odyssey triggers -> VERIFIER
```
