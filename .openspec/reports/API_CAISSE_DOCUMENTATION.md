# API Caisse - Documentation Complete

> **Version**: 1.0.0
> **Date**: 2026-01-27
> **Base URL**: `http://localhost:5287/api`
> **Swagger UI**: `http://localhost:5287/swagger`

---

## Vue d'ensemble

L'API Caisse est une API REST construite avec .NET 8 Minimal API et architecture CQRS (MediatR).
Elle expose **~125 endpoints** couvrant tous les modules de gestion de caisse migrés depuis Magic Unipaas ADH.

### Authentification

Actuellement pas d'authentification (développement local). À implémenter pour production.

### Format des réponses

- Succès: `200 OK` avec données JSON
- Création: `201 Created` avec URL de la ressource
- Non trouvé: `404 Not Found` avec message
- Erreur validation: `400 Bad Request` avec détails
- Non autorisé: `401 Unauthorized`

---

## Modules et Endpoints

### 1. Sessions (4 endpoints)

Gestion des sessions de caisse (ouverture/fermeture).

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/sessions` | Liste des sessions | ADH IDE 77 |
| POST | `/sessions/ouvrir` | Ouvrir une session | ADH IDE 122 |
| POST | `/sessions/fermer` | Fermer une session | ADH IDE 131 |
| GET | `/sessions/concurrence/{utilisateur}` | Vérifier concurrence | ADH IDE 116 |

**Exemple GET /sessions:**
```bash
curl "http://localhost:5287/api/sessions?utilisateur=TOTO&limit=10"
```

---

### 2. Devises (3 endpoints)

Gestion des devises d'une session.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/devises/{utilisateur}/{chronoSession}` | Devises de la session |
| GET | `/devises/{utilisateur}/{chronoSession}/summary` | Résumé devises |
| POST | `/devises` | Ajouter devise à session |

---

### 3. Articles (3 endpoints)

Gestion des articles vendus.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/articles/{utilisateur}/{chronoSession}` | Articles de la session |
| GET | `/articles/{utilisateur}/{chronoSession}/summary` | Résumé articles |
| POST | `/articles` | Ajouter article |

---

### 4. Details (3 endpoints)

Détails des mouvements (ouverture I,C,K,L et fermeture).

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/details/{utilisateur}/{chronoSession}?type=&quand=` | Détails filtrés |
| GET | `/details/{utilisateur}/{chronoSession}/summary` | Résumé détails |
| POST | `/details` | Ajouter détail |

**Paramètres type:** `I` (Initial), `C` (Caisse), `K` (Coffre), `L` (Liquidités)
**Paramètres quand:** `O` (Ouverture), `F` (Fermeture)

---

### 5. Coffre (3 endpoints)

Gestion du coffre-fort.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/coffre` | Liste mouvements coffre |
| GET | `/coffre/{utilisateur}/{chrono}` | Coffre par session |
| POST | `/coffre` | Ajouter mouvement coffre |

---

### 6. Parametres (2 endpoints)

Configuration système.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/parametres` | Tous les paramètres |
| GET | `/parametres/{cle}` | Paramètre par clé |

---

### 7. Devises Reference (2 endpoints)

Table de référence des devises.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/devises-ref` | Toutes les devises |
| GET | `/devises-ref/{codeDevise}` | Devise par code |

---

### 8. Caisse Devises Config (2 endpoints)

Configuration devises par caisse.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/caisse-devises` | Config devises caisse |
| PUT | `/caisse-devises` | Modifier config |

---

### 9. Ecarts (1 endpoint)

Calcul des écarts de caisse.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/ecarts/{utilisateur}/{chronoSession}` | Calculer écart session |

---

### 10. Ventes (14 endpoints)

Gestion complète des ventes - Gift Pass, Resort Credit, etc.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/ventes/solde-giftpass/{societe}/{compte}/{filiation}` | Solde Gift Pass | ADH IDE 237 |
| GET | `/ventes/solde-resortcredit/{societe}/{compte}/{filiation}/{service}` | Solde Resort Credit | ADH IDE 250 |
| GET | `/ventes/historique/{societe}/{codeGm}/{filiation}` | Historique ventes | ADH IDE 238 |
| GET | `/ventes/historique-igr/{societe}/{codeGm}/{filiation}` | Historique IGR | - |
| GET | `/ventes/historique-gratuits/{societe}/{codeGm}/{filiation}` | Historique gratuits | - |
| POST | `/ventes/initiate` | Initier nouvelle vente | - |
| POST | `/ventes/add-detail` | Ajouter détail vente | - |
| POST | `/ventes/validate` | Valider vente | - |
| POST | `/ventes/print-ticket` | Imprimer ticket | ADH IDE 229 |
| POST | `/ventes/deversement` | Déversement transaction | ADH IDE 243 |
| POST | `/ventes/choix-pyr` | Choix PYR | - |
| POST | `/ventes/creation-pied-ticket` | Créer pied de ticket | - |
| GET | `/ventes/zoom/articles/{societe}` | Zoom articles | - |
| GET | `/ventes/zoom/gratuits/{societe}` | Zoom gratuits | - |
| GET | `/ventes/zoom/payment-methods/{societe}` | Zoom moyens paiement | - |
| GET | `/ventes/vad-valides/{societe}/{codeGm}/{filiation}` | VAD validés | - |

---

### 11. EasyCheckOut (3 endpoints)

Workflow Easy Check-Out.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| POST | `/easycheckout/solde` | Solder Easy Checkout | ADH IDE 64 |
| GET | `/easycheckout/edition` | Edition Easy Checkout | ADH IDE 65 |
| GET | `/easycheckout/extrait/{societe}/{dateDepart}` | Extrait Easy Checkout | ADH IDE 53 |

---

### 12. Zooms (10 endpoints)

Tables de référence (lookups).

| Méthode | Endpoint | Description | Table REF |
|---------|----------|-------------|-----------|
| GET | `/zooms/moyens-reglement/{societe}` | Moyens de règlement | cafil034_dat |
| GET | `/zooms/tables/{nomTable}` | Tables de référence | variable |
| GET | `/zooms/devises/{societe}` | Devises | cafil028_dat |
| GET | `/zooms/garanties/{societe}` | Types garanties | cafil069_dat |
| GET | `/zooms/depots-objets/{societe}` | Dépôts objets | - |
| GET | `/zooms/depots-devises/{societe}` | Dépôts devises | - |
| GET | `/zooms/pays` | Liste pays | - |
| GET | `/zooms/types-taux-change/{societe}` | Types taux change | - |
| GET | `/zooms/comptes/{societe}` | Zoom comptes | - |
| GET | `/zooms/services-village` | Services village | cafil048_dat |

---

### 13. Members (1 endpoint)

Gestion membres Club Med Pass.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/members/club-med-pass/{societe}/{compte}/{filiation}` | Get Club Med Pass | ADH IDE 160 |

---

### 14. Solde (3 endpoints)

Consultation solde compte.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/solde/{societe}/{codeAdherent}/{filiation}` | Solde compte | ADH IDE 192 |
| GET | `/solde/menu/{societe}/{codeAdherent}/{filiation}` | Menu solde | - |
| POST | `/solde/print-guarantee` | Imprimer garantie | - |

---

### 15. Extrait (8 endpoints)

Extraits de compte avec différents tris.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/extrait/{societe}/{codeAdherent}/{filiation}` | Extrait compte | ADH IDE 69 |
| GET | `/extrait/detail/{societe}/{codeAdherent}/{filiation}` | Extrait détaillé | - |
| GET | `/extrait/par-nom/{societe}/{codeAdherent}/{filiation}` | Trié par nom | ADH IDE 70 |
| GET | `/extrait/par-date/{societe}/{codeAdherent}/{filiation}` | Trié par date | ADH IDE 71 |
| GET | `/extrait/cumul/{societe}/{codeAdherent}/{filiation}` | Cumul | ADH IDE 72 |
| GET | `/extrait/impression/{societe}/{codeAdherent}/{filiation}` | Pour impression | ADH IDE 73 |
| GET | `/extrait/date-impression/{societe}/{codeAdherent}/{filiation}` | Date + impression | - |
| GET | `/extrait/par-service/{societe}/{codeAdherent}/{filiation}` | Par service | ADH IDE 76 |

---

### 16. Garanties (3 endpoints)

Gestion des garanties et dépôts.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/garanties/{societe}/{codeAdherent}/{filiation}` | Garanties compte | ADH IDE 111 |
| GET | `/garanties/selection` | Sélection garanties | - |
| GET | `/garanties/types/{societe}` | Types de garanties | - |

---

### 17. Change (5 endpoints)

Opérations de change.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/change/devise-locale/{societe}` | Devise locale | - |
| GET | `/change/taux/{societe}` | Taux de change | - |
| GET | `/change/calculer` | Calculer équivalent | ADH IDE 20-25 |
| POST | `/change/receipt/purchase` | Ticket achat | - |
| POST | `/change/receipt/sale` | Ticket vente | - |

**Paramètres calculer:**
- `typeDevise`: UNI (unidirectionnel) ou BI (bidirectionnel)
- `typeOperation`: ACHAT ou VENTE

---

### 18. Telephone (4 endpoints)

Gestion lignes téléphone.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/telephone/{societe}/{codeGm}/{filiation}` | Lignes téléphone | - |
| POST | `/telephone/gerer` | Gérer ligne (OPEN/CLOSE) | ADH IDE 208/210 |
| POST | `/telephone/init` | Initialiser ligne | - |
| GET | `/telephone/detail-appels/{societe}/{codeAutocom}` | Détail appels | - |

---

### 19. Factures (2 endpoints)

Gestion facturation TVA.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| GET | `/factures/checkout/{societe}/{codeGm}/{filiation}` | Factures checkout | ADH IDE 54 |
| POST | `/factures/creer` | Créer facture | ADH IDE 97 |

---

### 20. Identification (6 endpoints)

Authentification et gestion utilisateurs.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/identification/verifier` | Vérifier opérateur |
| GET | `/identification/session/{societe}/{codeOperateur}` | Vérifier session |
| GET | `/identification/great-member-menu/{societe}/{codeGm}/{filiation}` | Menu GM |
| GET | `/identification/great-members` | Liste Great Members |
| POST | `/identification/selection` | Sélectionner identification |

---

### 21. EzCard (3 endpoints)

Gestion cartes EzCard.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/ezcard/member/{societe}/{codeGm}/{filiation}` | EzCard par membre |
| POST | `/ezcard/desactiver` | Désactiver carte |
| POST | `/ezcard/valider-caracteres` | Valider caractères |

---

### 22. Depot (2 endpoints)

Gestion dépôts.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/depot/extrait/{societe}/{codeGm}/{filiation}` | Extrait dépôts |
| POST | `/depot/retirer` | Retirer dépôt |

---

### 23. Divers (7 endpoints)

Fonctions utilitaires diverses.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/divers/langue/{societe}/{codeUtilisateur}` | Langue utilisateur |
| GET | `/divers/titre/{codeEcran}` | Titre écran |
| GET | `/divers/acces-informaticien/{societe}/{codeUtilisateur}` | Vérifier accès IT |
| POST | `/divers/valider-dates` | Valider intégrité dates |
| POST | `/divers/session-timestamp` | Mettre à jour timestamp |
| GET | `/divers/version` | Version API |
| GET | `/divers/droits-utilisateur/{societe}/{codeUtilisateur}` | Droits utilisateur |
| POST | `/divers/appeler-programme` | Appeler programme externe |

---

### 24. Utilitaires (10 endpoints)

Administration système.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/utilitaires/init` | Initialiser |
| POST | `/utilitaires/backup` | Backup config |
| POST | `/utilitaires/restore` | Restaurer config |
| POST | `/utilitaires/export` | Exporter données |
| POST | `/utilitaires/import` | Importer données |
| POST | `/utilitaires/purge` | Purger données |
| POST | `/utilitaires/maintenance` | Maintenance DB |
| POST | `/utilitaires/print-ticket` | Imprimer ticket |
| GET | `/utilitaires/logs` | Viewer logs |
| GET | `/utilitaires/system-info` | Info système |

---

### 25. Changement Compte (12 endpoints)

Séparation et fusion de comptes.

| Méthode | Endpoint | Description | Programme ADH |
|---------|----------|-------------|---------------|
| POST | `/changement-compte/init` | Initialiser changement | - |
| GET | `/changement-compte/separation/{societe}/{codeAdherent}/{filiation}` | Données séparation | ADH IDE 27 |
| GET | `/changement-compte/fusion/{societe}/...` | Données fusion | ADH IDE 28 |
| POST | `/changement-compte/histo-fus-sep` | Écrire historique | - |
| GET | `/changement-compte/histo-fus-sep-det/{societe}/{chrono}` | Lire détails | - |
| POST | `/changement-compte/histo-fus-sep-det` | Écrire détails | - |
| POST | `/changement-compte/histo-fus-sep-saisie` | Écrire saisie | - |
| DELETE | `/changement-compte/histo-fus-sep-saisie/{societe}/{chrono}` | Supprimer saisie | - |
| GET | `/changement-compte/histo-fus-sep-log/{societe}/{chrono}` | Lire log | - |
| POST | `/changement-compte/histo-fus-sep-log` | Écrire log | - |
| POST | `/changement-compte/print` | Imprimer | - |
| GET | `/changement-compte/zoom-comptes-source/{societe}` | Zoom comptes source | - |
| GET | `/changement-compte/zoom-comptes-cible/{societe}` | Zoom comptes cible | - |
| GET | `/changement-compte/menu/{societe}/{codeAdherent}/{filiation}` | Menu changement | - |

---

### 26. Menus (4 endpoints)

Navigation menus.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/menus/principal` | Menu principal |
| GET | `/menus/admin` | Menu admin |
| GET | `/menus/caisse` | Menu caisse |
| GET | `/menus/telephone` | Menu téléphone |

---

## Résumé par module

| Module | Endpoints | Status |
|--------|-----------|--------|
| Sessions | 4 | Complet |
| Devises | 3 | Complet |
| Articles | 3 | Complet |
| Details | 3 | Complet |
| Coffre | 3 | Complet |
| Parametres | 2 | Complet |
| DevisesRef | 2 | Complet |
| CaisseDevises | 2 | Complet |
| Ecarts | 1 | Complet |
| Ventes | 14 | Complet |
| EasyCheckOut | 3 | Complet |
| Zooms | 10 | Complet |
| Members | 1 | Complet |
| Solde | 3 | Complet |
| Extrait | 8 | Complet |
| Garanties | 3 | Complet |
| Change | 5 | Complet |
| Telephone | 4 | Complet |
| Factures | 2 | Complet |
| Identification | 6 | Complet |
| EzCard | 3 | Complet |
| Depot | 2 | Complet |
| Divers | 8 | Complet |
| Utilitaires | 10 | Complet |
| ChangementCompte | 14 | Complet |
| Menus | 4 | Complet |
| **TOTAL** | **~125** | **Complet** |

---

## Tests

### Tests unitaires
```bash
cd migration/caisse
dotnet test
# 527 tests passing
```

### Tests E2E (Playwright)
```bash
npm run test:e2e:api
```

---

## Démarrage

```bash
cd migration/caisse/src/Caisse.Api
dotnet run
# API disponible sur http://localhost:5287
# Swagger UI: http://localhost:5287/swagger
```

---

*Documentation générée: 2026-01-27*
*Version API: 1.0.0*
