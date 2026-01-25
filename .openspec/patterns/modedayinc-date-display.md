# Pattern: Bug affichage date avec MODEDAYINC

> **Source**: PMS-1437
> **Domaine**: POS / Location ski
> **Type**: Bug affichage

---

## Symptomes typiques

- Date affichee decalee de 1 jour
- Bug uniquement a l'affichage (montant correct)
- Early Return avec mauvaises dates
- "Dates affichees 16-17 au lieu de 15-16"

---

## Detection

### Mots-cles dans le ticket
- "date affichee"
- "early return"
- "mauvaise date"
- "location ski"
- "MODEDAYINC"
- "decalage 1 jour"

### Verification
1. Le montant facture est-il correct ? (OUI = bug affichage)
2. Y a-t-il un decalage de +1 ou -1 jour ?
3. Le village utilise-t-il MODEDAYINC ?

---

## Cause racine typique

| Element | Valeur |
|---------|--------|
| Zone | Expression de calcul date affichage |
| Parametre | MODEDAYINC (0=AM, 1=PM) |
| Erreur | Utilisation incorrecte du parametre dans expression |
| Exemple | `Date() - GetParam('MODEDAYINC') + Variable` |

### Parametre MODEDAYINC

| Valeur | Signification | Impact |
|--------|---------------|--------|
| 0 | Mode AM (materiel jour meme) | Pas de decalage |
| 1 | Mode PM (materiel lendemain) | Decalage +1 jour |

### Expression typique problematique

```magic
// Bug: melange date courante et date selectionnee
Expression = Date() - GetParam('MODEDAYINC') + Variable WG
```

---

## Solution type

### Etape 1: Localiser l'expression

```
magic_kb_search("MODEDAYINC", project="PVE")
magic_decode_expression(<expression_id>)
```

### Etape 2: Analyser le calcul

| Element | Verifier |
|---------|----------|
| Date() | Est-ce la bonne date de reference ? |
| GetParam() | Le decalage est-il applique au bon endroit ? |
| Variables | Les dates debut/fin sont-elles correctes ? |

### Etape 3: Corriger l'expression

- Separer calcul affichage et calcul montant
- S'assurer que MODEDAYINC est applique de maniere coherente
- Tester avec MODEDAYINC=0 et MODEDAYINC=1

---

## Programmes concernes

| Programme | Nom | Role |
|-----------|-----|------|
| **PVE IDE 145** | Initialization | SetParam MODEDAYINC |
| **PVE IDE 186** | Main Sale | Programme principal vente |
| PVE IDE 186.1.5.4 | Date Fin location | Saisie dates |

### Variables cles (offset Main PVE = 143)

| Variable | Nom | Type | Role |
|----------|-----|------|------|
| **MG** | v.Deb_Sejour | Date | Debut sejour |
| **MH** | v.Fin_sejour | Date | Fin sejour |
| **WF** | V.PremierJourLocation | Date | Premier jour location |
| **WG** | V.DernierJourLocation | Date | Dernier jour location |

---

## Tests de validation

| Test | Scenario | Attendu | Verifie |
|------|----------|---------|---------|
| Normal | Location 15-20/12 | Affiche 15-20 | |
| Early Return | Retour anticipe 16/12 | Affiche 15-16 | |
| MODEDAYINC=0 | Mode AM | Pas de decalage | |
| MODEDAYINC=1 | Mode PM | Decalage coherent | |

---

## Cas PMS-1437 specifique

**Contexte**: Early Return location ski Val Thorens

| Element | Valeur |
|---------|--------|
| Village | VTHC (Val Thorens) |
| Article | SKI PRESTIGE 6 jours |
| Periode | 15/12 au 20/12 |
| Early Return | 16/12 |
| Bug | Dates affichees 16-17 au lieu de 15-16 |
| Note | Montants CORRECTS - bug affichage uniquement |

### Pistes d'investigation

1. Expression 28 dans Tache 186.1.5.4.3
2. Update desactive dans Tache 186.1.5.4.4
3. Variables WF/WG mal initialisees

---

## Checklist resolution

- [ ] Confirme que montants sont corrects (bug affichage)
- [ ] Identifie valeur MODEDAYINC du village
- [ ] Localise expression d'affichage
- [ ] Analyse calcul date avec MODEDAYINC
- [ ] Corrige expression
- [ ] Teste avec les deux valeurs de MODEDAYINC
- [ ] Valide Early Return fonctionne

---

*Pattern capitalise le 2026-01-25*
*Source: PMS-1437 (Recette OK - 2026-01-12)*
