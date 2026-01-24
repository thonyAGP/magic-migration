# Pattern: Calcul dynamique selon duree sejour

> **Source**: PMS-1446
> **Domaine**: Business Logic
> **Type**: Nouvelle fonctionnalite

---

## Symptomes typiques

- Regle differente selon duree sejour
- "Courts sejours" vs "sejours standard"
- Calcul conditionnel base sur dates

---

## Detection

### Mots-cles dans le ticket
- "duree sejour"
- "court sejour"
- "jour arrivee vs lendemain"
- "MODEDAYINC"
- "seuil"

### Verification
1. Identifier le parametre a calculer dynamiquement
2. Trouver les dates de debut/fin sejour
3. Definir le seuil de separation

---

## Cause racine typique

| Element | Valeur |
|---------|--------|
| Zone | Initialisation parametre |
| Besoin | Calcul conditionnel selon duree |
| Impact | Comportement different courts/longs sejours |

---

## Solution type

### Etape 1: Identifier les variables de dates

| Variable | Role | Exemple |
|----------|------|---------|
| v.Deb_Sejour | Date debut | Variable MG |
| v.Fin_Sejour | Date fin | Variable MH |

### Etape 2: Calculer la duree

```magic
DureeSejour = Variable MH - Variable MG
// Resultat en jours
```

### Etape 3: Appliquer la condition

```magic
SI DureeSejour < SEUIL_COURT_SEJOUR ALORS
    PARAMETRE = VALEUR_COURT
SINON
    PARAMETRE = VALEUR_LONG
FIN SI
```

### Etape 4: Configuration sans developpement

| Parametre config | Valeur defaut | Description |
|------------------|---------------|-------------|
| SEUIL_COURT_SEJOUR | 7 | Nombre nuits seuil |
| VALEUR_COURT | 0 | Valeur courts sejours |
| VALEUR_LONG | 1 | Valeur longs sejours |

---

## Exemple PMS-1446

**Contexte**: Location materiel ski - materiel jour arrivee vs lendemain

| Element | Valeur |
|---------|--------|
| Programme init | **PVE IDE 145** - Initialization |
| Programme principal | **PVE IDE 186** - Main Sale |
| Parametre | MODEDAYINC |
| Regle | < 7 nuits = jour arrivee (0), >= 7 nuits = lendemain (1) |

### Variables cles (offset Main PVE = 143)

| Variable | Nom | Type | Role |
|----------|-----|------|------|
| MG | v.Deb_Sejour | Date | Date debut sejour GM |
| MH | v.Fin_sejour | Date | Date fin sejour GM |

### Pseudo-code solution

```
// Dans PVE IDE 145 - Tache 145.1 (Init mode day)

DureeSejour = GetParam('FIN_SEJOUR') - GetParam('DEB_SEJOUR')

IF DureeSejour < 7 THEN
    SetParam('MODEDAYINC', 0)   // Court sejour: jour arrivee
ELSE
    SetParam('MODEDAYINC', 1)   // Semaine: lendemain
END IF
```

### Impact downstream

Les expressions utilisant `GetParam('MODEDAYINC')` dans PVE IDE 186 et PVE IDE 263 beneficient automatiquement de la nouvelle valeur.

---

## Configuration annuelle (sans dev)

Pour permettre ajustement sans developpement :

### Option 1: Parametres dans table config

| Table | Champ | Type | Description |
|-------|-------|------|-------------|
| pv_config | seuil_court_sejour | Numeric | Nuits seuil |
| pv_config | modedayinc_court | Numeric | Valeur < seuil |
| pv_config | modedayinc_long | Numeric | Valeur >= seuil |

### Option 2: Variables globales

```magic
// Lire depuis config au demarrage
G.SeuilCourtSejour = DbGet(Table config, 'seuil_court_sejour')
G.ModeDayIncCourt = DbGet(Table config, 'modedayinc_court')
G.ModeDayIncLong = DbGet(Table config, 'modedayinc_long')
```

---

## Checklist resolution

- [ ] Variables de dates identifiees (debut/fin sejour)
- [ ] Calcul duree implemente
- [ ] Seuil defini (fixe ou configurable)
- [ ] Condition ajoutee dans programme init
- [ ] Tests courts sejours (< seuil)
- [ ] Tests longs sejours (>= seuil)
- [ ] Configuration annuelle documentee

---

## Variantes du pattern

### Variante 1: Seuil par village
```magic
Seuil = GetParam('SEUIL_' & Village)
```

### Variante 2: Plusieurs seuils
```magic
IF Duree < 3 THEN TresCourt
ELSIF Duree < 7 THEN Court
ELSIF Duree < 14 THEN Semaine
ELSE LongSejour
```

### Variante 3: Dates specifiques (periodes)
```magic
IF DateSejour BETWEEN '15/12' AND '05/01' THEN HauteSaison
ELSE BasseSaison
```

---

*Pattern capitalise le 2026-01-24*
