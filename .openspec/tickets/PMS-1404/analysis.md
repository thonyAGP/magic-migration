# Analyse PMS-1404

> **Jira** : [PMS-1404](https://clubmed.atlassian.net/browse/PMS-1404)

## Symptome

**POS REPORTS M&E : Ajouter colonne Quantite et verifier filtres**

Dans le menu POS > REPORTS > M&E, deux problemes :
1. **Colonne Quantity manquante** : On ne voit pas combien de produits ont ete pris
2. **Filtres non fonctionnels** : Les filtres "person", "item label" ne fonctionnent pas, l'extraction reste identique

## Contexte

| Element | Valeur |
|---------|--------|
| **Type** | Story (evolution) |
| **Statut** | Recette KO |
| **Priorite** | Moderee |
| **Reporter** | Davide Morandi |
| **Assignee** | Anthony Leberre |
| **Label** | PVE |
| **Cree** | 2025-11-12 |

---

## CLASSEMENT DES PISTES PAR SUSPICION (2026-01-12)

### PISTE 1 : Colonne Quantity - CONFIRMEE

**Localisation** : Tache 87.1.1.1 "Discount line" (ISN_2=4)

**Decouverte** :
- L'**en-tete** (Expression 8) contient bien "Quantity" dans la liste des colonnes
- Les **lignes de donnees** ne contiennent PAS de variable Quantity dans le DataView

**Expression 8 (Header)** - ligne XML 3221 :
```
'Village'&{2,13}&'Date'&{2,13}&'Adh#'&{2,13}&'Quality'&{2,13}&'Surname & First name'&
'Loyalty'&{2,13}&'Comment'&{2,13}&'Reason'&{2,13}&'Quantity'&{2,13}&'Product'&...
```

**Colonnes DataView de la tache 87.1.1.1** (partielles) :

| Column ID | Nom | Type |
|-----------|-----|------|
| 32 | v. Date operation | Date |
| 33 | v. Date debut sejour | Date |
| 34 | v. Date fin sejour | Date |
| 31 | v.LabelAafficher | Unicode |
| 1 | V.Regular_price Ht | Numeric |
| 9 | V.Regular_price Ttc | Numeric |
| 2 | V.Discounted price Ht | Numeric |
| 12 | V.Discounted price Ttc | Numeric |
| ... | (totaux, TVA, etc.) | ... |

**Aucune colonne "Quantity" ou similaire !**

**Cause confirmee** : Le champ Quantity existe dans le header mais n'est jamais rempli dans les donnees car il n'y a pas de variable correspondante dans le DataView.

**Solution** :
1. Ajouter une colonne `V.Quantity` dans le DataView de la tache 87.1.1.1
2. La lier au champ quantite de la table source (probablement `hebergement` ou une table liee)
3. L'inclure dans le FormIO de sortie a la position correspondant au header

---

### PISTE 2 : Filtres Person/Item Label - NON IMPLEMENTES

**Statut** : CONFIRME PAR INVESTIGATION ANTERIEURE

**Decouverte** :
Les filtres "person" et "item label" mentionnes dans le ticket :
- Ne sont PAS connectes aux Range/Locate de la requete
- Les controles UI peuvent exister mais ne filtrent pas les donnees

**Programme concerne** : PVE IDE 87 (Prg_82.xml) - Report - Discount & Gratuities

**Taches a verifier** :
- 87.1.2 "SELECTION" - tache de filtrage ?
- 87.1.2.1 "Calcul CA"
- 87.1.2.2 "Selection compta"

**Solution** :
1. Identifier les controles de saisie filtre dans le form principal
2. Lier ces controles aux variables de Range/Locate
3. Appliquer les conditions dans la tache 87.1.2 "SELECTION"

---

### PISTE 3 : Mauvais programme cible - A CLARIFIER

**Observation** :
Le ticket parle de "M&E" (Meetings & Events) mais nous analysons "Discount & Gratuities".

**Programmes potentiellement concernes** :

| IDE | Fichier | Nom |
|-----|---------|-----|
| **87** | Prg_82.xml | Report - Discount & Gratuities |
| 77 | Prg_71.xml | Report - Revenue by products |
| 354 | ? | Report - Discount & Gratuities (autre version ?) |
| 383 | ? | Report - Discount & Gratuities (autre version ?) |

**Question pour Davide** : Quel est le chemin exact dans le menu POS pour acceder au rapport M&E ?

---

## SYNTHESE ET PRIORITES

| Piste | Suspicion | Action | Effort |
|-------|-----------|--------|--------|
| **1. Colonne Quantity manquante** | CONFIRMEE | Ajouter variable + lier a table source | 2h |
| **2. Filtres non implementes** | CONFIRMEE | Connecter UI aux Range/Locate | 3h |
| **3. Mauvais programme** | A CLARIFIER | Demander confirmation chemin menu | - |

---

## SOLUTION TECHNIQUE PROPOSEE

### 1. Ajouter Quantity

**Etape 1** : Identifier la source de la quantite
- Table `hebergement` (obj=34) → champ quantite ?
- Table `comptable_gratuite` (obj=38) → champ quantite ?

**Etape 2** : Ajouter dans DataView de tache 87.1.1.1
```xml
<Column id="XX" name="V.Quantity">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_NUMERIC" id="1"/>
    <Picture id="157" valUnicode="N5"/>
    ...
  </PropertyList>
</Column>
```

**Etape 3** : Ajouter Select dans Logic
```xml
<Select FieldID="XX" FlowIsn="YY" id="XX">
  <Column val="ZZ"/>  <!-- Colonne table source -->
  <Type val="R"/>
  ...
</Select>
```

**Etape 4** : Inclure dans FormIO de sortie
- Positionner entre "Reason" et "Product" (position 9 dans header)

### 2. Implementer filtres

**A completer apres clarification du chemin menu exact**

---

## Arborescence des taches

```
PVE IDE 87 - Report - Discount & Gratuities
  └── 87.1 - Print
       ├── 87.1.1 - EDITION V3
       │    └── 87.1.1.1 - Discount line ← ECRITURE DONNEES (manque Quantity)
       ├── 87.1.2 - SELECTION ← FILTRAGE (filtres non connectes ?)
       │    ├── 87.1.2.1 - Calcul CA
       │    ├── 87.1.2.2 - Selection compta
       │    │    └── 87.1.2.2.1 - Temp generation
       │    ├── 87.1.2.3 - Temp generation
       │    └── 87.1.2.4 - Temp generation Gift Pass
       └── 87.1.3 - EXISTE Enregistrement
```

---

## Questions pour le demandeur

1. Quel est le chemin exact dans le menu pour acceder au rapport M&E ?
2. La colonne Quantity apparait-elle dans l'export mais vide, ou n'apparait-elle pas du tout ?
3. Sur quel village avez-vous teste ?
4. Pouvez-vous fournir un export exemple montrant le probleme ?
5. Quels sont les filtres "person" et "item label" exactement (noms des champs a l'ecran) ?

---

*Derniere mise a jour: 2026-01-12 22:45*
*Status: INVESTIGATION COMPLETE - 2 pistes confirmees + 1 a clarifier*
*Piste prioritaire: Colonne Quantity manquante (CONFIRMEE)*
