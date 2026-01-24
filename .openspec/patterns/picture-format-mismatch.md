# Pattern: Format Picture incorrect (decimales)

> **Source**: CMDS-176521
> **Domaine**: Display / Affichage
> **Type**: Bug format

---

## Symptomes typiques

- Prix affiche sans decimales
- "41857 au lieu de 41.85"
- Valeur multipliee par 100 ou 1000
- Montant incorrect mais facture correct

---

## Detection

### Mots-cles dans le ticket
- "format"
- "decimales"
- "prix incorrect"
- "montant affiche"
- "picture"

### Verification
1. Comparer valeur affichee vs valeur facturee
2. Si facturation correcte = bug affichage seulement
3. Verifier Picture Format dans DataView

---

## Cause racine typique

| Element | Valeur |
|---------|--------|
| Zone | DataView > Column > Picture Format |
| Erreur | Format numerique sans decimales |
| Exemple | `N10` au lieu de `N10.2` |

### Diagnostic

```
SI valeur_affichee = valeur_correcte * 100
   ALORS decimales manquantes (N10 au lieu de N10.2)

SI valeur_affichee = numero_adherent ou autre champ
   ALORS mauvaise variable referencee
```

---

## Solution type

### Etape 1: Localiser l'affichage
```
magic_find_program("nom ecran")
magic_get_dataview() pour voir colonnes
```

### Etape 2: Identifier la colonne fautive
```
magic_get_line() pour la ligne d'affichage
Verifier Picture Format de chaque colonne
```

### Etape 3: Corriger le format

| Type | Format correct | Exemple |
|------|---------------|---------|
| Prix | N10.2 | 1234567890.12 |
| Montant | N12.2 | 123456789012.12 |
| Quantite | N8.3 | 12345678.123 |
| Pourcentage | N5.2 | 12345.12 |

---

## Exemple CMDS-176521

**Contexte**: Prix remise affiche incorrectement dans POS

| Element | Valeur |
|---------|--------|
| Programme | **PVE IDE 181** - Main Sale-664 |
| Symptome | Prix 41,857 au lieu de 5,400 |
| Cause | Variable affichee = numero adherent au lieu de prix_net |
| Fix | Remplacer reference variable dans expression |

### Programmes corriges

| Programme | Description |
|-----------|-------------|
| PVE IDE 180 | Main Sale |
| PVE IDE 181 | Main Sale-664 |
| PVE IDE 284 | Main Sale Sale Bar Code |

### Note importante

Le bug etait une **mauvaise variable** (numero adherent au lieu de prix), pas un format incorrect. Mais les symptomes sont similaires.

---

## Checklist resolution

- [ ] Valeur facturee verifiee (correcte ou non)
- [ ] Picture Format identifie dans DataView
- [ ] Variable referencee verifiee
- [ ] Format corrige ou variable remplacee
- [ ] Test affichage sur plusieurs valeurs

---

## Variantes du pattern

### Variante 1: Decimales manquantes
- Valeur affichee * 100 = valeur correcte
- Fix: Ajouter .2 au Picture Format

### Variante 2: Mauvaise variable
- Valeur affichee = autre champ
- Fix: Corriger reference {N,Y} dans expression

### Variante 3: Format date
- Date affichee au mauvais format
- Fix: Corriger Picture Format date (DD/MM/YYYY vs MM/DD/YYYY)

---

*Pattern capitalise le 2026-01-24*
