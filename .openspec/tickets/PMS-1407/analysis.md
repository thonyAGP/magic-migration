# PMS-1407 - Validation automatique Back Office

## Informations Jira

| Champ | Valeur |
|-------|--------|
| **Titre** | [Back Office] impossible de valider en automatique |
| **Type** | Bug |
| **Priorite** | Basse |
| **Statut** | En cours |
| **Reporter** | Jessica Palermo |
| **Cree** | 2025-11-13 |

## Description

Regression: lorsque le valide en automatique, je dois pouvoir valider des GM qui sont en arrivee par VV et par vol. Cela n'est plus possible.

## Analyse Magic IDE

### Programme principal

| Projet | IDE | Nom | Public Name |
|--------|-----|-----|-------------|
| PBG | 121 | Validation Auto filiations | VALID_AUTO_FILIATION |

### Arborescence des taches

```
PBG IDE 121 - Validation Auto filiations
├── 121.1 - Verif Logement et Vol        ← Point de verification VV/Vol
├── 121.2 - Creation VV Aller
├── 121.3 - Creation VV retour
├── 121.4 - Zoom Village/Village
└── 121.5 - Validation Arrivee
    ├── 121.5.1 - Marquage Periodes
    ├── 121.5.2 - Marquage Periodes Circuit
    ├── 121.5.3 - Marquage Recherche
    ├── 121.5.4 - Marquage Validation
    ├── 121.5.5 - Creation Historique
    └── 121.5.6 - Creation Specif Greque
```

### Hypothese

Le bug se situe probablement dans **Tache 121.1 - Verif Logement et Vol** qui bloque la validation si les conditions VV/Vol ne sont pas remplies.

## Pistes d'investigation

1. Analyser la logique de **Tache 121.1** pour comprendre les conditions de validation
2. Verifier si une modification recente a change les regles de verification
3. Comparer avec le comportement attendu (valider par VV OU par vol)

## Statut

- [x] Ticket fetche depuis Jira
- [x] Programme Magic identifie
- [ ] Analyse detaillee de la logique
- [ ] Identification du bug
- [ ] Proposition de correction
