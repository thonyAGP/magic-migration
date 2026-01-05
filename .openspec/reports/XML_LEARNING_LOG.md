# Journal des Sessions d'Apprentissage XML Magic

**Objectif** : Valider ma compréhension du XML Magic Unipaas via sessions interactives

---

## Session 5: Événements

**Date** : 2026-01-05
**Statut** : 🔄 En cours

### Cas 5.1: User Actions / Handlers / RaiseEvent

**Statut** : ✅ Validé

**Question** : Comment fonctionnent les User Events et les Handlers dans Magic ?

**Programme testé** : ADH 121.6 Nom : Gestion caisse.Pilotage

**Réponse validée (screenshot IDE) :**

**Types d'événements :**
| Type IDE | Description | Exemple |
|----------|-------------|---------|
| User Action X | Événement utilisateur numéroté | User Action 4 |
| Nom personnalisé | User Event avec nom lisible | "Ouverture de Caisse" |
| Zoom on: [Control] | Événement Zoom sur un contrôle | Zoom on: Bouton Pointage |
| Ctrl+X | Raccourci clavier | Ctrl+J |
| Internal | Événement système | Zoom, Exit |

**Scope des handlers :**
| Scope | Signification |
|-------|---------------|
| Task | Handler actif dans cette tâche seulement |
| SubTree | Handler actif dans toute l'arborescence descendante |

**Mapping User Action → Action :**
| User Action | Appelle | Description |
|-------------|---------|-------------|
| User Action 1 | Raise Event Exit System | Quitter |
| User Action 3 | SubTask 9 | reimprimer tickets |
| User Action 4 | SubTask 3 | Fermeture caisse |
| User Action 5 | SubTask 4 | Apport coffre |
| User Action 6 | SubTask 5 | Apport produit |
| User Action 7 | SubTask 6 | Remise au coffre |
| User Action 8 | SubTask 7 | Historique |
| User Action 9 | SubTask 8 | Consultation |
| User Action 10 | Program 119 | Affichage sessions |

**Chaînage d'événements (Raise Event) :**
- Un handler peut déclencher un autre événement via `Raise Event`
- Exemple : Ligne 9 `Raise Event User Action 4` déclenche le handler de fermeture
- Exemple : Ligne 117 `Raise Event Fin Log ADH` puis `Raise Event Exit`

**Mise à jour skill** : Section Events enrichie avec User Actions, Scope, Raise Event

---

## Session 4: GUI

**Date** : 2026-01-05
**Statut** : ✅ Terminé

### Cas 4.1: Font/Color/Data Binding

**Statut** : ✅ Validé

**Question** : Comment fonctionnent les références Font/Color et le Data Binding ?

**Réponse validée** : Les Fonts et Colors sont référencés par leur numéro dans les repositories Settings. Le Data Binding lie les contrôles aux colonnes du DataView via l'attribut `model`.

### Cas 4.2: ISN_FATHER (Hiérarchie Contrôles)

**Statut** : ✅ Validé

**Question** : Comment fonctionne la hiérarchie des contrôles avec ISN_FATHER ?

**Réponse validée** : `ISN_FATHER` référence l'ISN du contrôle parent. ISN_FATHER="0" = contrôle racine (directement sur le form).

---

## Session 3: IO/Export

**Date** : 2026-01-05
**Statut** : ✅ Terminé

### Cas 3.3: Counter/Page functions

**Statut** : ✅ Validé

**Question** : Comment fonctionnent les fonctions Counter() et Page() ?

**Programme testé** : ADH 79.3.1.1 Nom : Print A4 # Pages

**Documentation CHM validée :**

**Counter(generation)** :
| Paramètre | Description |
|-----------|-------------|
| generation | 0 = tâche courante, 1 = parent, 2 = grand-parent... |
| Retour | Nombre d'itérations au niveau Record |

**Page(generation, device)** :
| Paramètre | Description |
|-----------|-------------|
| generation | 0 = tâche courante, 1 = parent... |
| device | N° séquentiel du I/O device de sortie |
| Retour | Numéro de page courant |

**Exemples validés :**
| Expression | Signification |
|------------|---------------|
| `Counter(0)` | Itération courante de cette tâche |
| `Counter(0)>=GetParam('NUMBERCOPIES')` | Condition fin après N copies |
| `Page(0,1)` | Page courante du 1er I/O device |
| `SetParam('CURRENTPAGENUMBER',Page(0,1))` | Stocke le n° de page |

**Source** : `C:\Appwin\Magic\Magicxpa23\SUPPORT\mghelpw.chm` - Expression_Editor/Counter.htm, Page.htm

---

### Cas 3.2: FormIO Operation

**Statut** : ✅ Validé

**Question** : Comment fonctionnent les opérations FormIO et la structure des Forms Output ?

**Programme testé** : ADH 79.3.1.1 Nom : Print A4 # Pages

**Réponse validée (screenshot IDE) :**

Logic - Task Suffix:
| # | Operation | Type | Form | I/O | Device |
|---|-----------|------|------|-----|--------|
| 4 | Form | Output | TOTAL | 1 | extrait compte |
| 5 | Form | Output | PIED | 1 | extrait compte |
| 9 | Form | Output | LIGNE | 1 | extrait compte |

Forms List:
| # | Name | Class | Area | Interface Type |
|---|------|-------|------|----------------|
| 6 | ENTETE | 1 | Page Header | GUI Output |
| 7 | LIGNE | 1 | Detail | GUI Output |
| 8 | TOTAL | 1 | Detail | GUI Output |
| 9 | PIED | 1 | Detail | GUI Output |

**Mapping validé :**

| Attribut XML | Valeur | IDE |
|--------------|--------|-----|
| `OperationType` | O | Form Output |
| `FormEntryIndex` | N | Index **local à la tâche** (pas global) |
| `IoDeviceIndex` | 1 | I/O Device #1 dans la tâche |

**Area types validés :**
| XML Area | IDE Area | Description |
|----------|----------|-------------|
| P | Page Header | En-tête de page |
| (absent) | Detail | Zone de détail |
| H | (à vérifier) | Header ? |

**Interface Types :**
| Type | Usage |
|------|-------|
| GUI Display | Écrans interactifs |
| GUI Output | Éditions/Rapports |

**Règle importante** : `FormEntryIndex` dans le XML est l'index du Form **dans la liste locale de la tâche**, pas l'index global du programme.

**Mise à jour skill** : Section FormIO enrichie avec Area types et Interface Types

---

### Cas 3.1: IO Device Media Types

**Statut** : ✅ Validé

**Question** : À quoi correspondent les valeurs de l'attribut Media dans les I/O Devices ?

**Programme testé** : ADH 287 Nom : Solde Easy Check Out

**Réponse validée (screenshot IDE) :**

I/O Devices: 287 - Solde Easy Check Out
| # | Name | Media | Access | Format |
|---|------|-------|--------|--------|
| 1 | EditionPDF | Graphic Printer | Write | Page |

**Mapping validé :**
| XML | IDE | Description |
|-----|-----|-------------|
| G | Graphic Printer | Impression graphique (PDF possible) |
| P | Printer | Impression texte (character-based) |
| S | File | Fichier disque |

**Autres attributs I/O validés :**
| Attribut XML | Exemple | Colonne IDE |
|--------------|---------|-------------|
| `Description` | "EditionPDF" | Name |
| `Media` | "G" | Media |
| `Access` | "W" | Access (Write) |
| `Format` | "P" | Format (Page) |
| `IOExpression` | "26" | Exp/Var |
| `OpenPrintDialog` | "N" | PDlg (No) |

**Règle importante** : Les I/O Devices sont définis au niveau de chaque **tâche**. Pour voir les I/O, il faut sélectionner la bonne tâche puis Task > I/O Devices.

**Mise à jour skill** : Section IO Devices enrichie

---

## Session 2: Expressions Avancées

**Date** : 2026-01-05
**Statut** : ✅ Terminé (4 cas validés)

### Cas 2.1: ExpCalc (expressions imbriquées)

**Statut** : ✅ Validé

**Question** : Comment fonctionne `ExpCalc('N'EXP)` ?

**Réponse validée (screenshot IDE) :**

**1 Nom : Main Program Expression : 16**
```
'Caisse Adhérent -V '&Trim(ExpCalc('13'EXP))&' - '&...
```

| Référence | Appelle | Résultat |
|-----------|---------|----------|
| `ExpCalc('13'EXP)` | Expression #13 | `'4.11'` |
| `ExpCalc('14'EXP)` | Expression #14 | `'27/11/2025'` |

**Règle validée** : `ExpCalc('N'EXP)` appelle l'Expression **#N** (numéro affiché dans l'IDE).

**Mise à jour skill** : Section ExpCalc enrichie

### Cas 2.2: DSOURCE (Référence Table)

**Statut** : ✅ Validé

**Question** : Comment fonctionne `'N'DSOURCE` ?

**Réponse validée (screenshot IDE) :**

**122.1.1.3 Nom : Generation ticket Ligne : 2**
```
DbDel ('493'DSOURCE,'')
```

| # | Table |
|---|-------|
| 493 | Ref_Tables.edition_ticket |
| 494 | Ref_Tables.edition_ticket_arti |

**Règle validée** : `'N'DSOURCE` référence la table **#N** dans la **Data Source List**.

**Usage** : `DbDel(table,'')` supprime tous les enregistrements de la table.

**Mise à jour skill** : Section DSOURCE enrichie

### Cas 2.3: PROG (Référence Programme)

**Statut** : ✅ Validé

**Question** : Comment fonctionne `'N'PROG` ?

**Réponse validée (screenshot IDE) :**

**111 Nom : Garantie sur compte Ligne : 5**
```
CallProg('229'PROG)
```

| # | Programme |
|---|-----------|
| 229 | Caisse ouverte |

**Règle validée** : `'N'PROG` référence le programme **#N** dans la liste **Programs**.

**Usage** : `CallProg('N'PROG)` appelle dynamiquement le programme #N.

**Mise à jour skill** : Section PROG enrichie

### Cas 2.4: VAR (Référence Variable)

**Statut** : ✅ Validé

**Question** : Comment fonctionne `'XX'VAR` ?

**Réponse validée (screenshot IDE) :**

**184 Nom : Retour coffre Expression : 3**
```
VarSet ('ET'VAR,VarCurr ('EN'VAR+Counter (0)))
```

| Code | Variable IDE |
|------|--------------|
| EN | P Listing Nombre |
| ET | ListingToDo |

**Règle validée** : `'XX'VAR` utilise des **codes lettres** (A, B, ..., Z, AA, AB, ...), PAS des numéros.

**Conversion position → lettre** :
- Position 1 = A, Position 2 = B, ..., Position 26 = Z
- Position 27 = AA, Position 28 = AB, ...

**Fonctions associées** (documentation CHM) :
| Fonction | Description |
|----------|-------------|
| `VarSet(var, value)` | Affecte une valeur à la variable |
| `VarCurr(var)` | Retourne la valeur courante |
| `VarPrev(var)` | Retourne la valeur précédente |
| `VarMod(var)` | Vérifie si la variable a été modifiée |

**Usage avancé** : `VarSet('P'VAR+1, X)` → Met à jour variable Q (suivante après P)

**Source** : `C:\Appwin\Magic\Magicxpa23\SUPPORT\mghelpw.chm` - Expression_Editor/VarSet.htm

**Mise à jour skill** : Section VAR enrichie + référence magic-literals.md créée

---

## Session 1: Opérations Logic

**Date** : 2026-01-05
**Statut** : ✅ Terminé

### Cas 1.1: LNK - Attribut Mode (Link/Join)

**Statut** : ✅ Validé

**Question** : À quoi correspondent les valeurs de l'attribut Mode dans les éléments LNK ?

**Réponse validée (screenshots IDE) :**

| Mode XML | Type IDE | Description |
|----------|----------|-------------|
| R | Link Query | Lecture seule |
| W | Link Write | Écriture |
| A | Link Create | Création/Insertion |
| O | Link O. Join | Left Outer Join |

**Exemples validés :**
- 112.2.11 Nom : MAJ CMP Ligne : 7 → `Mode="O"` = Link O. Join
- 112.2.9 Nom : Creation Versement v1 Ligne : 9 → `Mode="W"` = Link Write
- 112.2.9 Nom : Creation Versement v1 Ligne : 32 → `Mode="A"` = Link Create
- 102 Nom : Maj lignes saisies archive V3 Ligne : 22 → `Mode="R"` = Link Query

**Mise à jour skill** : Section LNK enrichie avec tableau des 4 valeurs Mode

### Cas 1.2: STP - Verify Operation (Messages/Alertes)

**Statut** : ✅ Validé

**Question** : À quoi correspondent les attributs Buttons, Image et Mode des éléments STP ?

**Réponse validée (screenshots IDE) :**

**Buttons :**
| XML | IDE |
|-----|-----|
| O | OK |
| K | OK Cancel |
| N | Yes No |

**Image :**
| XML | IDE |
|-----|-----|
| C | Critical (panneau rouge) |
| E | Exclamation (warning) |
| Q | Question |
| I | Information |
| N | None |

**Mode :**
| XML | IDE |
|-----|-----|
| E | Error |
| W | Warning |

**Mise à jour skill** : Section STP ajoutée avec tableaux complets

### Cas 1.3: Evaluate vs Update

**Statut** : ✅ Validé (documentation Magic)

**Différence :**
- **Update** : Affecte une valeur à une variable (résultat obligatoire)
- **Evaluate** : Exécute une expression pour ses effets de bord (résultat optionnel)

**Cas d'usage Evaluate :**
- Fonctions sans résultat utile (Delay, INIPut)
- Combiner fonctions et vérifier si toutes réussissent
- Appeler programme sans récupérer le retour

**Mise à jour skill** : Section Update vs Evaluate ajoutée

---

## Légende

| Symbole | Signification |
|---------|---------------|
| ✅ | Validé par utilisateur |
| ❌ | Corrigé - j'avais tort |
| ⚠️ | Partiellement correct |
| 🔄 | En attente de validation |

---

## Statistiques

| Catégorie | Cas testés | Validés | Corrigés |
|-----------|------------|---------|----------|
| Logic | 3 | 3 | 0 |
| Expressions | 4 | 4 | 0 |
| IO/Export | 3 | 3 | 0 |
| GUI | 2 | 2 | 0 |
| Events | 1 | 1 | 0 |
| **Total** | **13** | **13** | **0** |
