# Resolution - CMDS-174321

## Statut

**EN COURS** - En attente de donnees pour validation

## Cause racine identifiee

**Hypothese principale:** Incompatibilite type/format entre stockage date (table temporaire) et affichage GUI.

Le terminal affiche correctement `25DEC` tandis que le GUI affiche `25/01/2026`.

## Solution proposee

1. Verifier le type de la Column 12 dans la table obj="171" (REF comp=2)
2. Comparer le Picture du champ FieldID=26 avec le format stocke
3. Corriger le Picture ou le type de colonne selon le diagnostic

## Validation requise

- [ ] Base de donnees VPHUKET pour verification
- [ ] Confirmation du pattern sur d'autres GM avec jour > 12

## Domaine

**dates** - Parsing/affichage de dates

## Programmes concernes

- PBP.62 - Preparation donnees temp
- PBP.63 - Affichage ecran GUI
- PBG.315 - Import fichiers NA

## Tables concernees

- `cafil014_dat` (client_gm)
- Table temporaire planning (obj=171)

---

*A completer une fois le bug resolu*
