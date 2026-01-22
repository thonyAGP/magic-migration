# PMS-1453 - Caisse Adhérent : Vente transfert > heure erronée

> **Jira** : [PMS-1453](https://clubmed.atlassian.net/browse/PMS-1453)
> **Protocole** : `.claude/protocols/ticket-analysis.md` appliqué

---

## 1. Contexte Jira

| Élément | Valeur |
|---------|--------|
| **Symptôme** | "Si tu vends un transfert, tu peux mettre une heure de transfert qui n'a pas de sens (ex 70:00)" |
| **Données entrée** | Saisie d'une heure > 23:59 |
| **Attendu** | Validation de l'heure entre 00:00 et 23:59 |
| **Obtenu** | Accepte des valeurs incohérentes (70:00) |
| **Reporter** | Jessica Palermo |
| **Date** | 2026-01-06 |

### Indices extraits du ticket
- Module : Caisse Adhérent
- Fonctionnalité : Vente de transfert
- Champ concerné : Heure de transfert

---

## 2. Localisation Programmes

### Appels MCP effectués

#### magic_find_program("transfert", project="ADH")
```
| Project | IDE | ID | Name | Public |
|---------|-----|----|------|--------|
| ADH | 175 | 174 | Transferts | |
| ADH | 176 | 175 | Print transferts | |
```

#### magic_get_tree("ADH", 174)
```
| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| 175 | 1 | Transferts | 0 |
| 175.1 | 2 | Liste des transferts | 1 |
```

#### magic_get_tree("ADH", 243)
```
| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| 247 | 1 | Deversement Transaction | 0 |
| 247.12 | 15 | Affectation Transfert | 1 |
| 247.12.1 | 16 | Creation Transfertn | 2 |
```

### Programmes identifiés

| Fichier XML | IDE Vérifié | Nom | Rôle |
|-------------|-------------|-----|------|
| Prg_174.xml | **ADH IDE 175** | Transferts | Écran liste transferts |
| Prg_240.xml | **ADH IDE 244** | Histo ventes payantes | Saisie ventes avec transfert |
| Prg_243.xml | **ADH IDE 247** | Deversement Transaction | Création transfert en base |

### Tables identifiées

| N° Table | Nom | Nom physique | Champs heure |
|----------|-----|--------------|--------------|
| 461 | trf_transfert_new | transfertn | `trf_heure` (TIME) |
| 245 | saisie_od_par_service | caisse_saisie_od | `sod_trf_heure_transfert_aller`, `sod_trf_heure_transfert_retour` |

---

## 3. Traçage Flux

### Flux de saisie identifié

```
┌─────────────────────┐
│ ADH IDE 244/245     │ Histo ventes payantes
│ Formulaire saisie   │
└─────────┬───────────┘
          │ Saisie heure transfert
          │ (champs FieldID 54, 61, 71, 78)
          ▼
┌─────────────────────┐
│ Table n°245         │ saisie_od_par_service
│ sod_trf_heure_*     │ ← PAS DE VALIDATION
└─────────┬───────────┘
          │ Validation vente
          ▼
┌─────────────────────┐
│ ADH IDE 247         │ Deversement Transaction
│ Tâche 247.12.1      │ Creation Transfertn
└─────────┬───────────┘
          │ Insert
          ▼
┌─────────────────────┐
│ Table n°461         │ trf_transfert_new
│ trf_heure           │ Valeur erronée stockée
└─────────────────────┘
```

---

## 4. Analyse Expressions

### Variables TIME identifiées dans ADH IDE 175.1

| Variable | Nom | Type | Description |
|----------|-----|------|-------------|
| **AD** | v.Heure décolage | TIME | Heure de départ vol |
| **AE** | v.Heure départ village | TIME | Heure départ du village |

### Expressions de conversion trouvées

```
Expression 17: Val({0,23}, '2')*60*60  → Convertit en secondes
Expression 18: Val({0,24}, '2')*60*60  → Convertit en secondes
```

Le problème : `Val()` avec format '2' accepte n'importe quelle valeur numérique.

---

## 5. Root Cause

### Root Cause identifiée

| Élément | Valeur |
|---------|--------|
| **Programme** | ADH IDE 244/245 - Histo ventes payantes |
| **Zone** | Formulaire de saisie des ventes |
| **Contrôle** | `sod_trf_heure_transfert_aller` / `sod_trf_heure_transfert_retour` |
| **Erreur** | Pas de validation Range sur les champs TIME |
| **Impact** | Heures > 23:59:59 acceptées et stockées |

### Détail technique

Les champs TIME dans Magic sont stockés en secondes (0 à 86399 pour 00:00:00 à 23:59:59). Le format d'affichage HH:MM:SS ne bloque pas la saisie de valeurs invalides.

- `70:00` serait interprété comme 70*3600 = 252000 secondes (invalide)
- Magic ne valide pas automatiquement la plage

---

## 6. Solution

### Localisation exacte

- **Programme** : ADH IDE 244 et ADH IDE 245
- **Formulaire** : Écran de saisie des ventes
- **Contrôles** : `sod_trf_heure_transfert_aller` (FieldID 54/71) et `sod_trf_heure_transfert_retour` (FieldID 61/78)

### Approche 1 : Validation Control Verify

Ajouter un handler Control Verify sur les champs heure :

```
IF heure > 86399 OR heure < 0 THEN
   Verify Error "L'heure doit être entre 00:00 et 23:59"
   Annuler
END IF
```

### Approche 2 : Expression Range

Utiliser la fonction `Range()` de Magic :

```
Range(heure, 0, 86399)
```

Retourne TRUE si la valeur est dans la plage, FALSE sinon.

### Formule de validation recommandée

**Dans le handler Control Suffix des champs heure :**

```
SI NOT Range(v.Heure_transfert, 0, 86399) ALORS
   Verify Error(MlsTrans('ERR_HEURE_INVALIDE'))
   CtrlGoto(control_heure)
FIN SI
```

### Variables concernées

| Variable | Nom logique | Rôle | Action |
|----------|-------------|------|--------|
| sod_trf_heure_transfert_aller | Heure transfert aller | Saisie utilisateur | Ajouter validation |
| sod_trf_heure_transfert_retour | Heure transfert retour | Saisie utilisateur | Ajouter validation |

---

## Checklist validation

- [x] Tous les programmes ont un IDE vérifié par `magic_get_position`
- [x] Les champs heure sont identifiés (FieldID 54, 61, 71, 78)
- [x] La root cause est identifiée : pas de validation Range
- [x] La solution propose : Control Verify + Range(0, 86399)
- [x] Diagramme de flux ASCII présent

---

## Notes techniques

### Format TIME Magic

| Valeur | Signification |
|--------|---------------|
| 0 | 00:00:00 |
| 3600 | 01:00:00 |
| 43200 | 12:00:00 |
| 86399 | 23:59:59 |
| > 86399 | INVALIDE |

### Fonctions Magic utiles

- `Range(valeur, min, max)` : Vérifie si valeur est dans [min, max]
- `TVal(chaine, format)` : Parse une chaîne en valeur TIME
- `TStr(valeur, format)` : Formate une valeur TIME en chaîne

---

*Analyse : 2026-01-22*
*Parser utilisé : magic-logic-parser-v5.ps1*
