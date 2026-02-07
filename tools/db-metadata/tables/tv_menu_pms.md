# tv_menu_pms

| Info | Valeur |
|------|--------|
| Lignes | 612 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `TVM_Node_Id` | int | 10 | non |  | 612 |
| 2 | `TVM_Parent_Id` | int | 10 | non |  | 41 |
| 3 | `TVM_Description` | nvarchar | 80 | non |  | 579 |
| 4 | `TVM_Public_Name_Prog` | nvarchar | 30 | non |  | 572 |
| 5 | `TVM_Commentaire` | nvarchar | 200 | non |  | 18 |

## Valeurs distinctes

### `TVM_Parent_Id` (41 valeurs)

```
0, 1, 138, 16, 164, 180, 190, 195, 2, 21, 211, 212, 222, 237, 242, 248, 266, 285, 286, 29, 3, 322, 323, 35, 371, 382, 383, 391, 393, 41, 411, 440, 452, 473, 48, 480, 483, 583, 62, 85, 86
```

### `TVM_Commentaire` (18 valeurs)

```
, Appro / Remises, Appro Devises, Batiments, Vues, Equipement, â€¦, Blocage opÃ©rations pour la cloture, choix liste mini club, DÃ©tail des articles pour la derniÃ¨re session, DÃ©tail des devises pour la derniÃ¨re session, DÃ©tail des sessions (ouverture / fermeture), Devises en circulation, Devises, Services, Pieces identitÃ©, â€¦, Entete session, Erreurs sur les dÃ©bits sur compte, Historique compte adhÃ©rent, Historique des articles en stock par session, Historique des devises par session, Montant par MOP at par session, Types de garantie autorisÃ©s
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tv_menu_pms_IDX_1 | NONCLUSTERED | oui | TVM_Node_Id, TVM_Parent_Id |
| tv_menu_pms_IDX_3 | NONCLUSTERED | non | TVM_Description |
| tv_menu_pms_IDX_2 | NONCLUSTERED | non | TVM_Parent_Id, TVM_Node_Id |

