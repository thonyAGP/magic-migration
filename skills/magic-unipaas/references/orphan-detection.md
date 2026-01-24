# Orphan Program Detection

> Algorithme complet pour determiner si un programme Magic est orphelin

## Definition

Un programme est **orphelin** s'il:
1. N'est jamais appele par d'autres programmes
2. N'a pas de PublicName (ne peut pas etre appele par ProgIdx)
3. N'est pas dans un composant ECF partage
4. N'est pas vide (ISEMPTY_TSK)

## Algorithme de Validation

```
ENTREE: Programme P du projet PROJ

ETAPE 1: Verifier les appels directs
─────────────────────────────────────
  callers = magic_kb_callers(PROJ, P.ide_position)
  SI callers.count > 0 ALORS
    → P est UTILISE (non orphelin)
    FIN

ETAPE 2: Verifier PublicName
─────────────────────────────────────
  SI P.PublicName IS NOT NULL ALORS
    → P est CALLABLE_BY_NAME (non orphelin)
    → Peut etre appele via ProgIdx('PublicName')
    FIN

ETAPE 3: Verifier appartenance ECF
─────────────────────────────────────
  SI P.ide_position IN ECF_PROGRAMS[PROJ] ALORS
    → P est CROSS_PROJECT_POSSIBLE (non orphelin)
    → Peut etre appele depuis PBP, PVE, etc.
    FIN

ETAPE 4: Verifier programme vide
─────────────────────────────────────
  SI P.task_count == 0 ALORS
    → P est EMPTY_PROGRAM (shell vide)
    → Non orphelin mais inutile
    FIN

ETAPE 5: Conclusion
─────────────────────────────────────
  → P est ORPHAN (orphelin confirme)
```

## Schema de Decision

```
┌─────────────────────────────────────────────────────────────┐
│                   Programme Candidat P                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │ magic_kb_callers(P) > 0 ?   │
              └─────────────────────────────┘
                       │              │
                      YES             NO
                       │              │
                       ▼              ▼
               ┌──────────┐  ┌─────────────────────────┐
               │ UTILISE  │  │ P.PublicName != null ?  │
               │ (used)   │  └─────────────────────────┘
               └──────────┘         │              │
                                   YES             NO
                                    │              │
                                    ▼              ▼
                            ┌──────────┐  ┌─────────────────┐
                            │ CALLABLE │  │ P IN ECF list ? │
                            │ BY NAME  │  └─────────────────┘
                            └──────────┘         │        │
                                               YES       NO
                                                │        │
                                                ▼        ▼
                                        ┌──────────┐ ┌──────────┐
                                        │ CROSS-   │ │ ORPHELIN │
                                        │ PROJECT  │ │ CONFIRME │
                                        └──────────┘ └──────────┘
```

## Composants ECF Partages

### ADH.ecf - Sessions_Reprises (30 programmes)

Ces programmes sont partages avec PBP et PVE via le composant ECF.
Ils ne sont JAMAIS orphelins meme si callers=0 dans ADH.

| IDE | PublicName | Domaine |
|-----|------------|---------|
| 27 | Separation | Compte |
| 28 | Fusion | Compte |
| 53 | EXTRAIT_EASY_CHECKOUT | Easy Checkout |
| 54 | FACTURES_CHECK_OUT | Factures |
| 64 | SOLDE_EASY_CHECK_OUT | Solde |
| 65 | EDITION_EASY_CHECK_OUT | Edition |
| 69 | EXTRAIT_COMPTE | Extrait |
| 70 | EXTRAIT_NOM | Extrait |
| 71 | EXTRAIT_DATE | Extrait |
| 72 | EXTRAIT_CUM | Extrait |
| 73 | EXTRAIT_IMP | Extrait |
| 76 | EXTRAIT_SERVICE | Extrait |
| 84 | CARACT_INTERDIT | Utilitaire |
| 97 | Saisie_facture_tva | Factures |
| 111 | GARANTIE | Garantie |
| 121 | Gestion_Caisse_142 | Caisse |
| 149 | CALC_STOCK_PRODUIT | Stock |
| 152 | RECUP_CLASSE_MOP | MOP |
| 178 | GET_PRINTER | Impression |
| 180 | SET_LIST_NUMBER | Impression |
| 181 | RAZ_PRINTER | Impression |
| 185 | CHAINED_LIST_DEFAULT | Liste |
| 192 | SOLDE_COMPTE | Solde |
| 208 | OPEN_PHONE_LINE | Telephone |
| 210 | CLOSE_PHONE_LINE | Telephone |
| 229 | PRINT_TICKET | Impression |
| 243 | DEVERSEMENT | Caisse |

### REF.ecf - Tables et Utilitaires

Tables partagees (~1000) et programmes utilitaires (~30).
Utilise par tous les projets: ADH, PBP, PBG, PVE, VIL.

### UTILS.ecf - Calendrier .NET

1 programme: Calendrier avec integration .NET Framework.
Utilise par ADH uniquement.

## Outils MCP Disponibles

### magic_kb_orphan_programs

Detection complete avec tous les criteres:

```
magic_kb_orphan_programs ADH
magic_kb_orphan_programs VIL --only-orphans
magic_kb_orphan_programs PBP --include-ecf
```

### magic_kb_orphan_stats

Resume rapide sans details:

```
magic_kb_orphan_stats ADH
→ Total: 350, Used: 280, Callable: 20, ECF: 30, Empty: 5, Orphan: 15
```

### magic_kb_callers

Verification manuelle des appels:

```
magic_kb_callers ADH 69
→ Liste tous les programmes appelant ADH IDE 69
```

## Erreurs Courantes a Eviter

| Erreur | Correction |
|--------|------------|
| "0 callers = orphelin" | Verifier PublicName et ECF d'abord |
| "Ignorer PublicName" | Toujours verifier ProgramHeaders.xml |
| "ADH IDE 121 orphelin" | C'est dans ADH.ecf (callable externe) |
| "Programme REF orphelin" | Verifier appels cross-projet |

## Workflow Recommande

1. **magic_kb_orphan_stats** - Vue d'ensemble rapide
2. **magic_kb_orphan_programs --only-orphans** - Liste des vrais orphelins
3. Pour chaque orphelin candidat:
   - Verifier manuellement le PublicName
   - Chercher des appels via ProgIdx('nom')
   - Verifier si reference dans configuration externe

## Cas Speciaux

### Programmes Menu

Les programmes de menu (Main.prg, Menus/) sont souvent des points d'entree.
Ils n'ont pas de callers mais ne sont pas orphelins.

**Verification**: WindowType=Menu ou nom contenant "Menu"

### Programmes Batch

Les programmes batch peuvent etre lances par l'OS ou un scheduler.
Pas de callers internes mais appeles exterieurement.

**Verification**: Prefix "Batch_" ou presence dans config scheduler

### Programmes de Test

Programmes de developpement/debug souvent non appeles en production.
Peuvent etre orphelins legitimes.

**Verification**: Nom contenant "Test", "Debug", "Dev"
