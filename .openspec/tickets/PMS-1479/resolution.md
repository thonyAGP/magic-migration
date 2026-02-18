# PMS-1479 - Resolution

## Status: BUG CONFIRME - INVESTIGATION PARTIELLE

### Verdict

| Element | Valeur |
|---------|--------|
| **Type** | Bug de donnees (WRITE) |
| **Severite** | Moderee |
| **Cause racine** | Le programme qui cree l'OD de taxe de sejour ecrit le libelle du service ("Caisse") dans `cte_libelle` au lieu d'un libelle descriptif |
| **Programme fautif** | **Non identifie avec certitude** - l'appelant de ADH IDE 61/105 qui fournit les libelles |

### Ce qui est confirme

1. `cte_libelle` contient "Caisse" (nom du service) → **INCORRECT**
2. `cte_libelle_supplem_` contient "TAXE SEJOURS" → **CORRECT**
3. Le bug est dans l'**ecriture** (pas dans l'affichage)
4. ADH IDE 61 et 105 sont les programmes qui ecrivent physiquement dans la table comptable
5. Ces programmes recoivent le libelle en parametre - le bug est dans l'**appelant**
6. PBG IDE 343 (Gestion Taxes Sejour) calcule les montants mais ne touche pas la table comptable

### Ce qui reste a investiguer

1. **Identifier le programme appelant** qui appelle ADH 61/105 pour les OD de taxe de sejour
   - Probablement dans la chaine de cloture/checkout/solde ECO
   - Les programmes 61 et 105 n'ont pas de callers statiques ni de PublicName dans la KB
   - Ils sont appeles comme sous-taches d'un programme parent (chaine de compilation)

2. **Verifier si le probleme est specifique a Pragelato** ou global
   - Le code service dans `cte_service` doit etre verifie
   - Le mapping VSERV → libelle pourrait varier par village

3. **Impact sur les donnees existantes**
   - Combien d'OD de taxe de sejour sont affectees ?
   - Faut-il un script correctif pour les anciennes lignes ?

### Pistes de correction

#### Option A : Corriger a l'ecriture (RECOMMANDE)
Modifier le programme appelant pour passer "TAXE DE SEJOUR" (ou le libelle descriptif) dans `cte_libelle` au lieu du nom du service.

#### Option B : Inverser les libelles
Si le `cte_libelle_supplem_` contient toujours la bonne info, on pourrait afficher `cte_libelle_supplem_` en priorite quand `cte_code_type='O'` et `cte_mode_de_paiement='OD'`. Mais cela ne corrige pas la cause racine.

#### Option C : Script correctif data
UPDATE les lignes existantes dans cafil018_dat pour les OD de taxe de sejour :
```sql
-- A VALIDER avant execution
UPDATE cafil018_dat
SET cte_libelle = cte_libelle_supplem_
WHERE cte_code_type = 'O'
  AND cte_mode_de_paiement = 'OD'
  AND cte_libelle_supplem_ LIKE '%TAXE%'
  AND cte_libelle = 'Caisse'
```

### Prochaines etapes

1. Identifier le programme parent qui appelle ADH 61/105 dans le contexte de la taxe de sejour
2. Tracer la chaine d'appel depuis le checkout/solde ECO jusqu'a l'ecriture OD
3. Proposer le correctif precis sur le programme fautif
4. Script correctif pour les donnees existantes si necessaire
