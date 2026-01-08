# Notes de travail - PMS-1373

## 2026-01-07 - Initialisation

- Ticket récupéré depuis Jira
- 2 captures d'écran téléchargées
- Statut "Recette KO" → une première implémentation a échoué
- Programmes Extrait identifiés (ADH IDE 69-76)

## 2026-01-07 - Analyse complète

### ADH IDE 69 (EXTRAIT_COMPTE)
- 466 KB - Découpage tronçons appliqué
- 12 sous-tâches identifiées
- Sous-tâche 5 "scroll sur compte" = écran principal
- Variable clé : `W1 Choix_action` (N/D/C/I/S)
- Appels vers ADH IDE 70, 71, 72, 73, 76

### ADH IDE 70 (EXTRAIT_NOM) & ADH IDE 76 (EXTRAIT_SERVICE)
- Structure identique : 14 paramètres
- 17-19 sous-tâches (imprimantes A4, TMT88, etc.)
- MainSource : obj=40 = `operations_dat`
- Pas de paramètre "masquer annulations" existant

### Solution technique validée
- **Option A : Ajouter paramètre 15** `P.MasquerAnnulations` (Boolean)
- Modifier les 5 programmes d'édition
- Modifier ADH IDE 69 pour passer le paramètre

## Questions ouvertes

- [ ] Pourquoi la recette a échoué ? → Contacter Jessica Palermo
- [x] Branche Git de la tentative précédente ? → Sources non synchronisées GitLab
- [ ] Impact Odyssey à prévoir → Mentionné par @Nelly Becquart

## Recommandation GitLab

Synchroniser les sources Magic sur GitLab pour :
- Traçabilité des modifications
- Branches pour évolutions (feature/PMS-1373)
- Historique complet
- Code review avant déploiement

## Prochaines étapes

1. ~~Analyser ADH IDE 69 (point d'entrée)~~ ✅
2. ~~Tracer le flux d'édition~~ ✅
3. ~~Identifier où injecter la question~~ ✅ → Sous-tâche 5
4. ~~Proposer solution technique~~ ✅ → Paramètre 15
5. ~~Synchroniser sources GitHub~~ ✅ → github.com/thonyAGP/PMS-Magic-Sources
6. ~~Créer branche feature~~ ✅ → feature/PMS-1373-masquer-annulations
7. ~~Spécification d'implémentation~~ ✅ → implementation.md
8. Implémenter dans Magic IDE
9. Tests de recette

## 2026-01-08 - Découverte Majeure

**Le champ `cte_flag_annulation` existe déjà !**

Table `cafil018_dat` (operations_dat) :
- Valeur `Normal` = opération normale
- Valeur `Annulation` = annulation
- Valeur `X-annule` = annulée

→ Pas besoin de logique complexe de matching +/-
→ Simple filtre WHERE sur ce champ
