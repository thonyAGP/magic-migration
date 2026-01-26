# Analyse Ticket PMS-1453

**Titre**: [Caisse Adhérent] Vente de transfert > heure erronée
**Date analyse**: 2026-01-26
**Statut**: Root Cause identifiée

---

## 1. Contexte

**Symptôme signalé**:
- Dans l'écran de vente de transfert, l'utilisateur peut saisir une heure invalide (ex: 70:00)
- Le système devrait limiter la saisie aux heures valides (00:00 à 23:59)

**Impact**: Données incohérentes stockées dans la table `transfertn`

---

## 2. Localisation

### Programmes identifiés

| Projet | IDE Position | Nom | Rôle |
|--------|--------------|-----|------|
| ADH | 174 | Transferts | Liste des transferts |
| ADH | 175 | Print transferts | Impression |
| ADH | 307 | Saisie transaction Nouv vente | **Écran de saisie** |
| ADH | 313 | Saisie transaction Nouv vente | Variante |

### Table concernée

| Table | Nom physique | Champ | Type |
|-------|--------------|-------|------|
| REF n°461 | transfertn | `trf_heure` | FIELD_TIME (HH:MM:SS) |

---

## 3. Flux de traçage

```
┌─────────────────────┐
│ ADH IDE 307         │ Saisie transaction Nouv vente
│ Tâche 307.1         │ Main
└─────────┬───────────┘
          │ CallTask
          ▼
┌─────────────────────┐
│ ADH IDE 307         │
│ Tâche 307.36        │ Type Transfert
└─────────┬───────────┘
          │ Subform
          ▼
┌─────────────────────┐
│ ADH IDE 307         │
│ Tâche 307.37        │ Affiche détails transfert ← SAISIE HEURE
└─────────┬───────────┘
          │ CallTask
          ▼
┌─────────────────────┐
│ ADH IDE 307         │
│ Tâche 307.39        │ Creation Transfertn → Écriture table
└─────────────────────┘
```

---

## 4. Root Cause

### Problème identifié

Dans la **Tâche 307.37** "Affiche détails transfert", les colonnes de saisie d'heure sont définies **SANS Picture de validation** :

```xml
<!-- Ligne 31821-31825 dans Prg_307.xml -->
<Column id="5" name="W1 Heure transfert Aller">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <_FieldStyle id="276" val="1"/>
    <!-- MISSING: <Picture id="157" valUnicode="HH:MM"/> -->
  </PropertyList>
</Column>

<!-- Ligne 31878-31882 dans Prg_307.xml -->
<Column id="13" name="W1 Heure transfert Retour">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <_FieldStyle id="276" val="1"/>
    <!-- MISSING: <Picture id="157" valUnicode="HH:MM"/> -->
  </PropertyList>
</Column>
```

### Cause technique

Le type `FIELD_TIME` définit le format de stockage mais **le Picture définit la validation de saisie**.
Sans Picture, Magic accepte n'importe quelle valeur numérique.

**Comparaison avec la table REF** (correctement définie) :
```xml
<!-- DataSources.xml ligne 106848-106857 -->
<Column id="5" name="trf_heure">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <Picture id="157" valUnicode="HH:MM:SS"/>  <!-- Validation présente -->
    ...
  </PropertyList>
</Column>
```

---

## 5. Solution

### Correction requise

Ajouter le Picture `HH:MM` aux colonnes de saisie d'heure dans ADH IDE 307 Tâche 307.37 :

| Fichier | Ligne | Colonne | Action |
|---------|-------|---------|--------|
| `Prg_307.xml` | ~31823 | Column id="5" | Ajouter `<Picture id="157" valUnicode="HH:MM"/>` |
| `Prg_307.xml` | ~31880 | Column id="13" | Ajouter `<Picture id="157" valUnicode="HH:MM"/>` |

### XML Avant/Après

**AVANT** (W1 Heure transfert Aller) :
```xml
<Column id="5" name="W1 Heure transfert Aller">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <_FieldStyle id="276" val="1"/>
  </PropertyList>
</Column>
```

**APRÈS** :
```xml
<Column id="5" name="W1 Heure transfert Aller">
  <PropertyList model="FIELD">
    <Model attr_obj="FIELD_TIME" id="1"/>
    <Picture id="157" valUnicode="HH:MM"/>
    <_FieldStyle id="276" val="1"/>
  </PropertyList>
</Column>
```

### Vérification complémentaire

Vérifier également le programme ADH IDE 313 (variante de saisie) pour les mêmes colonnes.

---

## 6. Fichiers de référence

| Fichier | Chemin |
|---------|--------|
| Programme principal | `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_307.xml` |
| Programme variante | `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_313.xml` |
| Définition table | `D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml` (ligne ~106848) |

---

## 7. Tests de validation

1. Ouvrir l'écran de vente de transfert (ADH IDE 307)
2. Tenter de saisir `70:00` dans le champ heure
3. **Attendu** : Le champ refuse la saisie ou affiche une erreur
4. Saisir `14:30`
5. **Attendu** : La saisie est acceptée

---

*Analyse réalisée: 2026-01-26*
*Pattern KB applicable: missing-picture-validation (nouveau)*
