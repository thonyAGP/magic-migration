# type_mail_a_traiter

**Nom logique Magic** : `type_mail_a_traiter`

| Info | Valeur |
|------|--------|
| Lignes | 17 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tmt_code_traitement` | nvarchar | 10 | non |  | 17 |
| 2 | `tmt_libelle_traitement` | nvarchar | 100 | non |  | 17 |
| 3 | `tmt_a_traiter` | bit |  | non |  | 2 |
| 4 | `tmt_date_last_traitement` | char | 8 | non |  | 2 |
| 5 | `tmt_heure_last_traitement` | char | 6 | non |  | 7 |

## Valeurs distinctes

### `tmt_code_traitement` (17 valeurs)

```
CHECKINS, DUPLICADH, DUPLICMOB, EXTRCOMPTE, GARANTMOB, PAYMENTVAD, RECEIPTBOO, TICKETADH, TICKETMOB, VAE, WELEXTRAIT, WELFACTURE, WELLIST, WELPHONE, WELPHONE_C, WELPHONE_S, WELSALES
```

### `tmt_libelle_traitement` (17 valeurs)

```
Envoyer les mails bi-journaliers de locations VAE, Envoyer les mails gÃ©nÃ©rÃ©s par (Welcome Extraits), Envoyer les mails gÃ©nÃ©rÃ©s par (Welcome Factures), Envoyer les mails gÃ©nÃ©rÃ©s par (Welcome LISTE), Envoyer les mails gÃ©nÃ©rÃ©s par (Welcome Phone code), Envoyer les mails gÃ©nÃ©rÃ©s par (Welcome Phone statement), Envoyer les mails gÃ©nÃ©rÃ©s par (Welcome Phone), Envoyer les mails gÃ©nÃ©rÃ©s par (Welcome SALES), Envoyer les mails gÃ©nÃ©rÃ©s par ADH (Duplicata ticket), Envoyer les mails gÃ©nÃ©rÃ©s par ADH (Ticket de garantie MobilitÃ©), Envoyer les mails gÃ©nÃ©rÃ©s par ADH (Ticket de vente), Envoyer les mails gÃ©nÃ©rÃ©s par Extrait de Compte, Envoyer les mails gÃ©nÃ©rÃ©s par les paiements par VAD, Envoyer les mails gÃ©nÃ©rÃ©s par POS (Duplicata ticket), Envoyer les mails gÃ©nÃ©rÃ©s par PVE (RÃ©capitulatif de rendez-vous Booker), Envoyer les mails gÃ©nÃ©rÃ©s par PVE (Ticket de vente MobilitÃ©), Envoyer un email en cas de vente d'assurance non transmise ou reÃ§ue
```

### `tmt_a_traiter` (2 valeurs)

```
0, 1
```

### `tmt_date_last_traitement` (2 valeurs)

```
00000000, 20251225
```

### `tmt_heure_last_traitement` (7 valeurs)

```
000000, 020505, 020506, 020507, 020508, 020509, 020510
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| type_mail_a traiter_IDX1 | NONCLUSTERED | oui | tmt_code_traitement |

