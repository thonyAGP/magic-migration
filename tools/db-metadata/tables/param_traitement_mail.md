# param_traitement_mail

**Nom logique Magic** : `param_traitement_mail`

| Info | Valeur |
|------|--------|
| Lignes | 32 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ptm_type_traitement` | nvarchar | 10 | non |  | 17 |
| 2 | `ptm_langue` | nvarchar | 3 | non |  | 4 |
| 3 | `ptm_sujet` | nvarchar | 250 | non |  | 20 |
| 4 | `ptm_corps_message` | nvarchar | 2000 | oui |  | 21 |
| 5 | `ptm_mail_from` | nchar | 50 | non |  | 2 |
| 6 | `ptm_hiver` | nvarchar | 250 | oui |  | 1 |
| 7 | `ptm_winter` | nvarchar | 250 | oui |  | 1 |

## Valeurs distinctes

### `ptm_type_traitement` (17 valeurs)

```
ACT_GEN, ACT_REST, CHECKINS, DUPLICADH, DUPLICMOB, EXTRCOMPTE, GARANTMOB, PAYMENTVAD, RECEIPTBOO, TICKETADH, TICKETMOB, VAE, WELEXTRAIT, WELFACTURE, WELPHONE_C, WELPHONE_S, WELSALES
```

### `ptm_langue` (4 valeurs)

```
, ANG, ENG, FRA
```

### `ptm_sujet` (20 valeurs)

```
, <TAG_DATE_APPLICATION> <TAG_COMPLEMENT> : Location de VAE au resort de <TAG_VILLAGE> / Biking rental at Club Med <TAG_VILLAGE>, <TAG_VILLAGE>  <TAG_DATE> Your invoice, <TAG_VILLAGE>  <TAG_DATE> Your receipt, <TAG_VILLAGE>  <TAG_DATE> Your Statement, <TAG_VILLAGE>  le : <TAG_DATE> Votre code tÃ©lÃ©phone, <TAG_VILLAGE>  le : <TAG_DATE> Votre Extrait de compte, <TAG_VILLAGE>  le : <TAG_DATE> Votre facture, <TAG_VILLAGE>  le : <TAG_DATE> Votre reÃ§u, <TAG_VILLAGE>  le : <TAG_DATE> Votre relevÃ© de tÃ©lÃ©phone, <TAG_VILLAGE>  le : <TAG_DATE> Your calls statement, <TAG_VILLAGE>  le : <TAG_DATE> Your phone code, Erreur de vente ou de rÃ©siliation d'assurance non transmise, Inscription <NOM_ACTIVITE> <PERIODE_ACTIVITE> du <DATE> / <ACTIVITY_NAME> <ACTIVITY_PERIOD> registration of <DATE>, Inscription restaurant du <DATE> / Lunch registration of <DATE>, Vos rendez-vous au <TAG_SERVICE> de <TAG_VILLAGE> / Your appointments at the <TAG_SERVICE> in <TAG_VILLAGE>, Votre duplicata de reÃ§u au resort de <TAG_VILLAGE> / Your receipt duplicate at Club Med <TAG_VILLAGE>, Votre extrait de compte au resort de <TAG_VILLAGE> / Your account statement at Club Med <TAG_VILLAGE>, Votre garantie de compte au resort de <TAG_VILLAGE> / Your security desposit at Club Med <TAG_VILLAGE>, Votre reÃ§u au resort de <TAG_VILLAGE> / Your receipt at Club Med <TAG_VILLAGE>
```

### `ptm_corps_message` (21 valeurs)

```
, 
 Cher(e) <TAG_PRENOM> ,

Veuillez trouver en piÃ¨ce jointe votre rÃ©capitulatif de rendez-vous pour le service <TAG_SERVICE>.

Nous vous souhaitons un agrÃ©able sÃ©jour et restons Ã  votre entiÃ¨re di, 
Cher(e) <TAG_PRENOM>,

Veuillez trouver votre duplicata de reÃ§u en piÃ¨ce jointe pour les achats effectuÃ©s dans le service <TAG_SERVICE>.

Nous restons Ã  votre entiÃ¨re disposition pour toute ques, Bonjour,  
 
Veuillez trouver, en piÃ¨ce jointe de cet email, l'extraction des locations de vÃ©los pour le <TAG_DATE_APPLICATION> <TAG_COMPLEMENT>.

Club Med <TAG_VILLAGE>.

______________________, Bonjour, veuillez trouver en piÃ¨ce jointe votre code tÃ©lÃ©phone, Bonjour, veuillez trouver en piÃ¨ce jointe votre dernier relevÃ© de tÃ©lÃ©phone, Bonjour, veuillez trouver en piÃ¨ce jointe votre extrait de compte, Bonjour, veuillez trouver en piÃ¨ce jointe votre facture, Bonjour, veuillez trouver en piÃ¨ce jointe votre reÃ§u, Bonjour,
Vous trouverez ci-joint la liste des enfants dÃ©jeunant avec le Mini Club aujourd'hui, le <DATE>
Hello,
Please find attached the list of children having lunch with the Mini Club today <DATE, Bonjour,
Vous trouverez ci-joint la liste des enfants inscrits Ã  l'activitÃ© <NOM_ACTIVITE> le <DATE> <PERIODE_ACTIVITE>
Hello,
Please find attached the list of children registered for the activity , Cher(e) <TAG_PRENOM>,  
 
Veuillez trouver, en piÃ¨ce jointe de cet email, votre garantie de compte en resort au <TAG_DATE> Ã  <TAG_HEURE>.

Nous vous souhaitons un agrÃ©able sÃ©jour et restons Ã  votr, Cher(e) <TAG_PRENOM>,  
Â 
Veuillez trouver, en piÃ¨ce jointe de cet email, votre relevÃ© de dÃ©penses effectuÃ©es en resort au <TAG_DATE> Ã  <TAG_HEURE>.

Nous vous souhaitons un agrÃ©able sÃ©jour et res, Cher(e) <TAG_PRENOM>,

Veuillez trouver votre duplicata de reÃ§u en piÃ¨ce jointe pour les achats effectuÃ©s au Club Med.

Nous restons Ã  votre entiÃ¨re disposition pour toute question.
L'Ã©quipe de C, Cher(e) <TAG_PRENOM>,

Veuillez trouver votre reÃ§u en piÃ¨ce jointe pour les achats effectuÃ©s Ã  la rÃ©ception.

Nous vous souhaitons un agrÃ©able sÃ©jour et restons Ã  votre entiÃ¨re disposition pour to, Hello, you will find in the attached file your last calls statement, Hello, you will find in the attached file your last invoice, Hello, you will find in the attached file your last phone code, Hello, you will find in the attached file your last receipt, Hello, you will find in the attached file your last statement, Il y a  <TAG_ERREUR_CHECKINS> pour la date du <TAG_DATE>
```

### `ptm_mail_from` (2 valeurs)

```
HOLIDAY_VILLAGES_do_not_reply@clubmed.com         , Phuket_DO_NOT_REPLY@clubmed.com                   
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| param_traitement_mail_IDX_1 | NONCLUSTERED | oui | ptm_type_traitement, ptm_langue |

