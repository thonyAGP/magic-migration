# Spécification d'Implémentation PMS-1373

> **Jira** : [PMS-1373](https://clubmed.atlassian.net/browse/PMS-1373)

## Résumé

**Demande** : Masquer les lignes d'annulation (+/-) dans l'extrait de compte GM.

**Solution** : Ajouter une question "Extrait complet ?" avant l'édition, puis filtrer sur `cte_flag_annulation = 'Normal'` si NON.

---

## 1. Découverte Clé : Champ Annulation Existant

La table `cafil018_dat` (operations_dat, obj=40) possède déjà un champ de flag :

| Champ | Type | Valeurs |
|-------|------|---------|
| `cte_flag_annulation` | Unicode | `Normal`, `Annulation`, `X-annule` |

**Pas besoin de logique complexe de matching** - il suffit de filtrer sur ce champ !

---

## 2. Architecture Actuelle

```
ADH IDE 69 (EXTRAIT_COMPTE)
└── Sous-tâche 5 "scroll sur compte"
    └── LogicUnit id="10" (Handler W1 Choix_action)
        ├── Choix 'N' → CallTask ADH IDE 70 (EXTRAIT_NOM)      [14 params]
        ├── Choix 'D' → CallTask ADH IDE 71 (EXTRAIT_DATE)     [13 params]
        ├── Choix 'C' → CallTask ADH IDE 72 (EXTRAIT_CUM)      [12 params]
        ├── Choix 'I' → CallTask ADH IDE 73 (EXTRAIT_IMP)      [12 params]
        └── Choix 'S' → CallTask ADH IDE 76 (EXTRAIT_SERVICE)  [13 params]
```

---

## 3. Modifications ADH IDE 69 (EXTRAIT_COMPTE)

### 3.1 Ajouter Variable

| Variable | Type | Description |
|----------|------|-------------|
| `W.ExtraitComplet` | Boolean | TRUE = extrait complet, FALSE = masquer annulations |

**Emplacement** : Section `<Columns>` de la sous-tâche 5

### 3.2 Ajouter Question (Message Box)

**Point d'injection** : LogicUnit id="10", AVANT ligne 4549 (premier CallTask obj="180")

```xml
<!-- NOUVEAU : Question Extrait Complet -->
<STP FlowIsn="XXX">
  <Condition val="Y"/>
  <Modifier val="S"/>
  <Message>
    <Text val="Voulez-vous éditer l'extrait de compte complet ?"/>
    <Title val="Option Extrait"/>
    <Buttons val="YN"/>  <!-- Oui/Non -->
    <DefaultButton val="1"/>
    <ReturnVariable val="W.ExtraitComplet"/>  <!-- TRUE si Oui -->
  </Message>
</STP>
```

**Alternative UX** : Checkbox sur l'écran plutôt que popup (meilleure ergonomie)

### 3.3 Modifier les 5 CallTask

Ajouter le paramètre 15 à chaque appel :

| CallTask | Ligne | Ajouter |
|----------|-------|---------|
| ADH IDE 70 | 4620 | `<Argument><id val="88"/><Variable val="W.ExtraitComplet"/></Argument>` |
| ADH IDE 71 | 4805 | `<Argument><id val="89"/><Variable val="W.ExtraitComplet"/></Argument>` |
| ADH IDE 72 | 4998 | `<Argument><id val="90"/><Variable val="W.ExtraitComplet"/></Argument>` |
| ADH IDE 73 | 5180 | `<Argument><id val="91"/><Variable val="W.ExtraitComplet"/></Argument>` |
| ADH IDE 76 | 5371 | `<Argument><id val="92"/><Variable val="W.ExtraitComplet"/></Argument>` |

---

## 4. Modifications Programmes Édition (ADH IDE 70, 71, 72, 73, 76)

### 4.1 Ajouter Paramètre 15

Pour CHAQUE programme d'édition :

| # | Nom Paramètre | Type | Direction | Description |
|---|---------------|------|-----------|-------------|
| 15 | P.ExtraitComplet | Boolean | Entrée | TRUE=tout, FALSE=masquer annulations |

**Emplacement** : Section `<Parameters>` du programme

### 4.2 Modifier le Filtrage MainSource

Dans CHAQUE sous-tâche d'impression (A4, TMT88, etc.) :

**Avant** (Range/Locate actuel) :
```
cte_societe = P.societe AND cte_compte_gm = P.compte
```

**Après** (ajouter condition) :
```
cte_societe = P.societe AND cte_compte_gm = P.compte
AND (P.ExtraitComplet OR cte_flag_annulation = 'Normal')
```

**Expression Magic équivalente** :
```
IF(P.ExtraitComplet, TRUE, cte_flag_annulation = 'Normal')
```

### 4.3 Localisation des Modifications par Programme

| Programme | Sous-tâches à modifier | MainSource obj |
|-----------|------------------------|----------------|
| ADH IDE 70 | 2-19 (impressions) | 40 (cafil018_dat) |
| ADH IDE 71 | 2-17 (impressions) | 40 (cafil018_dat) |
| ADH IDE 72 | 2-15 (impressions) | 40 (cafil018_dat) |
| ADH IDE 73 | 2-14 (impressions) | 40 (cafil018_dat) |
| ADH IDE 76 | 2-17 (impressions) | 40 (cafil018_dat) |

---

## 5. Résumé des Modifications

| Programme | Action | Complexité |
|-----------|--------|------------|
| ADH IDE 69 | +1 variable, +1 question, +5 arguments CallTask | Moyenne |
| ADH IDE 70 | +1 paramètre, modifier Range ~17 sous-tâches | Haute |
| ADH IDE 71 | +1 paramètre, modifier Range ~15 sous-tâches | Haute |
| ADH IDE 72 | +1 paramètre, modifier Range ~13 sous-tâches | Haute |
| ADH IDE 73 | +1 paramètre, modifier Range ~12 sous-tâches | Haute |
| ADH IDE 76 | +1 paramètre, modifier Range ~15 sous-tâches | Haute |

**Total** : 6 programmes, ~75 sous-tâches à modifier

---

## 6. Tests de Recette

### Scénarios de Test

| # | Scénario | Résultat Attendu |
|---|----------|------------------|
| 1 | Extrait par Nom, répondre OUI | Toutes les lignes affichées |
| 2 | Extrait par Nom, répondre NON | Lignes `Annulation` et `X-annule` masquées |
| 3 | Extrait par Date, répondre NON | Idem - annulations masquées |
| 4 | Extrait par Service, répondre NON | Idem - annulations masquées |
| 5 | Extrait Cumulé, répondre NON | Idem - annulations masquées |
| 6 | Impression, répondre NON | Idem - annulations masquées |
| 7 | Compte sans annulations | Comportement identique OUI/NON |

### Données de Test

| Village | Compte GM | Caractéristique |
|---------|-----------|-----------------|
| ADH (Alpe d'Huez) | 572185684 (BENNUN Rachel) | Annulations visibles |
| ADH | À identifier | Compte sans annulations (contrôle) |

---

## 7. Risques et Points d'Attention

| Risque | Mitigation |
|--------|------------|
| Recette KO précédente | Vérifier ce qui avait été implémenté avant |
| Impact Odyssey | Mentionné par @Nelly Becquart - à évaluer |
| Performance filtrage | Le champ `cte_flag_annulation` devrait être indexé |
| Cohérence calculs | Vérifier que les totaux restent corrects après filtrage |

---

## 8. Étapes d'Implémentation

1. [ ] Créer branche `feature/PMS-1373-masquer-annulations` ✅
2. [ ] Modifier ADH IDE 69 (variable + question + CallTask)
3. [ ] Modifier ADH IDE 70 (paramètre + Range)
4. [ ] Modifier ADH IDE 71 (paramètre + Range)
5. [ ] Modifier ADH IDE 72 (paramètre + Range)
6. [ ] Modifier ADH IDE 73 (paramètre + Range)
7. [ ] Modifier ADH IDE 76 (paramètre + Range)
8. [ ] Tests unitaires Magic
9. [ ] Déployer sur environnement de recette
10. [ ] Validation Jessica Palermo
11. [ ] Merge et déploiement production

---

*Spécification générée le 2026-01-08*
*Branche : feature/PMS-1373-masquer-annulations*
