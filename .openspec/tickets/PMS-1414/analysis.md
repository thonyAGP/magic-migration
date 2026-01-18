# PMS-1414 - Validation groupee seminaire

## Informations Jira

| Champ | Valeur |
|-------|--------|
| **Titre** | [Planning Back office] Validation groupee d'un seminaire |
| **Type** | Story |
| **Priorite** | Basse |
| **Statut** | En cours |
| **Reporter** | Jessica Palermo |
| **Cree** | 2025-11-18 |

## Description

Base VTHC "vierge" (avant ouverture du village). Voulu valider un seminaire en arrivee le 17/11 (AYLO VOYAGE) et impossible car il demande le code vol retour.

**Besoin**: Pouvoir valider le groupe en se basant uniquement sur le vol aller ou sur VV2.

## Analyse Magic IDE

### Programme principal

| Projet | IDE | Nom |
|--------|-----|-----|
| PBG | 122 | Validation Auto seminaire |

### Arborescence des taches

```
PBG IDE 122 - Validation Auto seminaire
├── 122.1 - Verification Logement         ← Verification initiale
├── 122.2 - Marquage Periodes Circuit
├── 122.3 - Marquage Validation
├── 122.4 - Creation Historique
├── 122.5 - Creation Specif Greque
│   ├── 122.5.1 - Creation Specif Greque
│   └── 122.5.2 - Verif si GO Greek
└── 122.6 - Marquage Periodes
```

### Programmes lies

| Projet | IDE | Nom | Role |
|--------|-----|-----|------|
| PBG | 121 | Validation Auto filiations | Validation individuelle (avec verif vol) |
| PBG | 359 | Zoom VOL | Reference vols |

### Hypothese

Le programme **PBG IDE 122** appelle probablement **PBG IDE 121** (Validation Auto filiations) qui exige le vol retour dans **Tache 121.1 - Verif Logement et Vol**.

La demande est de permettre la validation avec vol aller seul OU VV2.

## Pistes d'investigation

1. Analyser **Tache 122.1 - Verification Logement** pour voir si elle appelle 121
2. Verifier les conditions dans **Tache 121.1** concernant le vol retour
3. Identifier le point ou ajouter la logique "vol aller seul OK"

## Statut

- [x] Ticket fetche depuis Jira
- [x] Programme Magic identifie
- [ ] Analyse detaillee de la logique
- [ ] Identification du point de modification
- [ ] Proposition de correction
