# Pattern : Ajout d'un parametre de filtrage dans Magic

> **Source** : Commit `000d134ef` - PMS-1373 (Masquer annulations extrait compte)
> **Auteur** : Anthony Le Berre
> **Date** : 2026-01-08

## Description

Ce pattern montre comment ajouter un parametre Boolean pour filtrer des lignes dans une edition Magic, en utilisant le mecanisme de **Range Expression**.

## Cas d'usage

- Filtrer des lignes selon un critere optionnel
- Masquer certains types d'enregistrements (annulations, doublons, etc.)
- Permettre a l'utilisateur de choisir entre vue complete et vue filtree

## Implementation

### Etape 1 : Ajouter le parametre dans le programme appelant

**Fichier** : `Prg_69.xml` (ADH IDE 69 - EXTRAIT_COMPTE)

```xml
<!-- Dans les Arguments du CallTask -->
<Argument>
  <id val="121"/>
  <Expression val="116"/>  <!-- Expression qui contient la valeur du parametre -->
  <Skip val="N"/>
</Argument>
```

### Etape 2 : Declarer le parametre dans les programmes appeles

**Fichiers** : `Prg_72.xml`, `Prg_73.xml` (EXTRAIT_CUM, EXTRAIT_IMP)

```xml
<!-- 1. Augmenter le nombre de parametres -->
<TSK_PARAMS val="15"/>  <!-- Etait 14 -->
<ParametersCount val="15"/>

<!-- 2. Ajouter l'attribut du parametre -->
<ParametersAttributes>
  ...
  <Attr MgAttr="B"/>  <!-- B = Boolean -->
</ParametersAttributes>

<!-- 3. Declarer la colonne du parametre -->
<Column id="44" name="P. Sans annulations">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_LOGICAL" id="1"/>
    <_FieldStyle id="276" val="1"/>
  </PropertyList>
</Column>

<!-- 4. Ajouter le Select dans la logique DATAVIEW_SRC -->
<LogicLine>
  <Select FieldID="25" FlowIsn="50" id="25">
    <Column val="15"/>
    <Type val="V"/>
    <IsParameter val="Y"/>
    ...
  </Select>
</LogicLine>
```

### Etape 3 : Ajouter les colonnes de reference pour le filtrage

```xml
<!-- Colonnes de la table principale utilisees dans le filtre -->
<LogicLine>
  <Select FieldID="28" FlowIsn="53" id="28">
    <Column val="43"/>  <!-- Montant annulation -->
    <Type val="R"/>     <!-- R = Real/Table column -->
    ...
  </Select>
</LogicLine>
<LogicLine>
  <Select FieldID="29" FlowIsn="54" id="29">
    <Column val="9"/>   <!-- Flag type operation -->
    <Type val="R"/>
    ...
  </Select>
</LogicLine>
```

### Etape 4 : Creer l'expression de filtrage (Range)

```xml
<Expression id="44">
  <ExpSyntax val="IF({2,25},{0,28}=0 AND {0,29}&lt;>'A','TRUE'LOG)"/>
  <ExpAttribute val="B"/>
</Expression>
```

**Decodage** :
| Element | Signification |
|---------|---------------|
| `{2,25}` | Parametre Boolean du parent (niveau 2, colonne 25) |
| `{0,28}` | Colonne 28 de la tache courante (montant) |
| `{0,29}` | Colonne 29 de la tache courante (flag type) |
| `'A'` | Valeur a exclure (Annulation) |

**Logique** :
```
SI P.SansAnnulations = TRUE ALORS
  Retourner TRUE seulement si (montant=0 ET flag<>'A')
SINON
  Retourner TRUE (garder toutes les lignes)
```

### Etape 5 : Appliquer l'expression au Range

```xml
<!-- Avant -->
<Range Direction="A"/>

<!-- Apres -->
<Range Direction="A" Exp="44"/>
```

## Fichiers modifies (exemple PMS-1373)

| Fichier | Modifications |
|---------|---------------|
| `Prg_69.xml` | +2 arguments CallTask (Expression 116) |
| `Prg_72.xml` | +1 parametre, +1 colonne, decalage colonnes |
| `Prg_73.xml` | +1 parametre, +2 colonnes Select, Expression 44, Range Exp |

## Points d'attention

1. **Decalage des colonnes** : Quand on insere un nouveau parametre, toutes les colonnes suivantes sont decalees de +1
2. **Coherence des niveaux** : `{2,25}` signifie niveau 2 (grand-parent), verifier la hierarchie
3. **Type de colonne** : `Type val="R"` pour colonnes table, `Type val="V"` pour virtuelles
4. **Expression logique** : Utiliser `'TRUE'LOG` pour retourner un Boolean

## Avantages de ce pattern

- **Performance** : Filtrage au niveau SQL/Range, pas en post-traitement
- **Reutilisabilite** : Le parametre peut etre passe a plusieurs sous-programmes
- **Retrocompatibilite** : Valeur par defaut FALSE = comportement existant

## Variantes

### Filtrage multi-criteres

```xml
IF({2,25}, {0,28}=0 AND {0,29}<>'A' AND {0,30}<>'X', 'TRUE'LOG)
```

### Filtrage avec valeur parametre

```xml
IF({2,25}<>'', {0,29}={2,25}, 'TRUE'LOG)
```

---

## Specs concernees

Ces specs documentent les programmes utilisant ce pattern:

| Spec | Programme | Role |
|------|-----------|------|
| [ADH-IDE-69](../specs/ADH-IDE-69.md) | EXTRAIT_COMPTE | Programme appelant avec Range filtre |
| [ADH-IDE-72](../specs/ADH-IDE-72.md) | EXTRAIT_CUM | Sous-programme avec parametre filter |
| [ADH-IDE-73](../specs/ADH-IDE-73.md) | EXTRAIT_IMP | Sous-programme avec parametre filter |

### Tables impactees
- `#50` cafil028_dat - moyens_reglement_mor
- `#89` cafil067_dat - moyen_paiement___mop

---

*Pattern documente: 2026-01-12*
*Ticket source: PMS-1373*
