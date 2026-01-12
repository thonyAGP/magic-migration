# Analyse PMS-1437

> **Jira** : [PMS-1437](https://clubmed.atlassian.net/browse/PMS-1437)

## Symptome

**POS SKI: early return mauvaise date affichee**

Lors d'un EARLY RETURN sur location ski, les dates affichees sur la ligne de vente sont incorrectes.

### Exemple du ticket

| Element | Valeur |
|---------|--------|
| **Village** | VTHC (Val Thorens) |
| **Article** | SKI PRESTIGE 6 jours |
| **Periode location** | 15/12 au 20/12 |
| **Early Return** | 16/12 (2 jours utilises) |
| **Dates attendues** | 15 au 16 |
| **Dates affichees** | 16 au 17 (BUG) |

**IMPORTANT** : Les montants calcules sont CORRECTS. C'est uniquement un souci d'affichage.

## Contexte

| Element | Valeur |
|---------|--------|
| **Type** | Bug |
| **Priority** | Haute |
| **Status** | Recette KO |
| **Reporter** | Davide Morandi |
| **Assignee** | Anthony Leberre |
| **Labels** | PVE |

## Investigation

### Programmes identifies

| IDE | Fichier | Description | Role |
|-----|---------|-------------|------|
| **PVE IDE 186** | Prg_180.xml | Main Sale | Programme principal ventes |
| **PVE IDE 437** | Prg_431.xml | OD credit PoS Early Return | Credit OD Early Return |
| **PVE IDE 189** | Prg_183.xml | Generate Preview Payments | Calcul paiements |
| **PVE IDE 194** | Prg_188.xml | Delete Product | Suppression produit |

### Tache suspecte

**PVE IDE 186.1.5.4 "actions"**

Chemin hierarchique :
```
PVE IDE 186 (Main Sale)
  └── 186.1 (Choix Onglet) [ISN=2]
        └── 186.1.5 (Sales) [ISN=37]
              └── 186.1.5.4 (actions) [ISN=45]
```

### Variables pertinentes (Tache 186.1.5.4)

**Offset cumulatif** : 143 (Main PVE) + 119 (186) + 3 (186.1) + 165 (186.1.5) = **430**

| Position | Variable | Column ID | Nom | Type | Role |
|----------|----------|-----------|-----|------|------|
| 0 | QO | 4 | BP. Exit | Alpha 1 | Bouton sortie |
| 1 | QP | 5 | V days difference | Numeric 2.1 | Difference jours |
| 2 | QQ | 6 | V allow cancel | Logical | Autorisation annulation |
| 3 | **QR** | **7** | **V.Comment annulation** | **Alpha 100** | **Commentaire** |
| 4 | **QS** | **11** | **V.PremierJourLocation** | **Date** | **Premier jour location** |
| 5 | QT | 10 | V.DernierJourLocation | Date | Dernier jour location |
| 6 | QU | 14 | V.NumberDaysAFacture | Numeric 2 | Nb jours a facturer |
| 7 | QV | 15 | V.AnnulerToutLaPeriode | Logical | Flag annulation complete |

### Expression suspecte

**Expression 28** (Tache 186.1.5.4 "actions", ligne XML 61792)

```magic
Date()- GetParam('MODEDAYINC')+ {0,7}
```

**Traduction** :
```
Date() - MODEDAYINC + Variable QR (V.Comment annulation)
```

### PROBLEME IDENTIFIE

L'Expression 28 utilise **{0,7} = Variable QR = "V.Comment annulation"** qui est de type **ALPHA (string)**.

Pour un calcul de date, la variable correcte devrait etre :
- **{0,11} = Variable QS = "V.PremierJourLocation"** (type DATE)

### Relation avec PMS-1446

Ce bug utilise le meme parametre **MODEDAYINC** que PMS-1446 (Location ski courts sejours).

| Ticket | Probleme | Parametre |
|--------|----------|-----------|
| PMS-1446 | Calcul mode jour incorrect | MODEDAYINC |
| **PMS-1437** | **Date affichee incorrecte (+1 jour)** | **MODEDAYINC** |

## Hypotheses

### Hypothese 1 : Variable incorrecte (HAUTE probabilite)

L'Expression 28 reference la mauvaise variable :
- **Actuel** : {0,7} = Variable QR = V.Comment annulation (string)
- **Attendu** : {0,11} = Variable QS = V.PremierJourLocation (date)

### Hypothese 2 : Logique MODEDAYINC (MOYENNE probabilite)

Le calcul `Date() - MODEDAYINC + offset` ajoute systematiquement 1 jour quand MODEDAYINC = 0 (meme jour).

### Hypothese 3 : Affichage vs Calcul (BASSE probabilite)

Le calcul est correct mais l'affichage utilise une autre source de donnees.

## Fix propose

### Localisation

| Element | Valeur |
|---------|--------|
| **Programme** | PVE IDE 186 - Main Sale |
| **Tache** | Tache 186.1.5.4 - "actions" |
| **Expression** | Expression 28 (ligne XML 61792) |
| **Fichier** | `D:\Data\Migration\XPA\PMS\PVE\Source\Prg_180.xml` |

### Modification

| Element | Avant (bug) | Apres (fix) |
|---------|-------------|-------------|
| Expression 28 | `Date()- GetParam('MODEDAYINC')+ {0,7}` | `Date()- GetParam('MODEDAYINC')+ {0,11}` |
| Variable | QR (V.Comment annulation) | QS (V.PremierJourLocation) |

### XML avant

```xml
<Expression id="28">
  <ExpSyntax val="Date()- GetParam('MODEDAYINC')+ {0,7}"/>
  <ExpAttribute val="N"/>
</Expression>
```

### XML apres

```xml
<Expression id="28">
  <ExpSyntax val="Date()- GetParam('MODEDAYINC')+ {0,11}"/>
  <ExpAttribute val="N"/>
</Expression>
```

## Verification requise

Avant d'appliquer le fix, verifier :

1. **Logique metier** : Le calcul `Date() - MODEDAYINC + PremierJourLocation` a-t-il du sens ?
2. **Autres utilisations** : Expression 28 est-elle utilisee ailleurs ?
3. **Tests** : Valider sur un cas Early Return en environnement de test

## Autres occurrences MODEDAYINC

Le parametre MODEDAYINC est utilise 3 fois dans Prg_180.xml (PVE IDE 186) :

| Ligne XML | Tache | Expression |
|-----------|-------|------------|
| 20610 | Tache 186.1.2 CreateSales | `Date()- GetParam('MODEDAYINC')+ {0,16}` |
| 61792 | Tache 186.1.5.4 actions | `Date()- GetParam('MODEDAYINC')+ {0,7}` |
| 63415 | Tache 186.1.5.5/6 | `Date()- GetParam('MODEDAYINC')+ {0,27}` |

**Toutes ces expressions doivent etre verifiees** pour s'assurer qu'elles utilisent la bonne variable.

---

*Analyse: 2026-01-12*
*Status: A verifier avec l'equipe avant fix*
