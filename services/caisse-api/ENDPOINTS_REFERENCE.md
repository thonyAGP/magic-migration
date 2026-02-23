# Endpoints Factures - Référence complète

## Base URL
```
https://api.example.com/api/factures
```

---

## Endpoints GET

### 1. Récupérer les factures V2
```http
GET /liste-v2/{societe}/{codeGm}/{filiation}
```

**Description**: Migration Prg_89 - Liste complète des factures avec table comptable

**Paramètres obligatoires**:
- `societe` (string, 1-2 caractères): Code societe (ex: "01")
- `codeGm` (int): Numéro de compte client
- `filiation` (int): Numéro de filiation

**Paramètres optionnels**:
- `dateDebut` (date): Date de début pour filtrer (format: yyyy-MM-dd)
- `dateFin` (date): Date de fin pour filtrer (format: yyyy-MM-dd)

**Réponse (200)**:
```json
{
  "success": true,
  "societe": "01",
  "codeGm": 12345,
  "filiation": 0,
  "nombreFactures": 5,
  "totalHT": 1500.00,
  "totalTVA": 300.00,
  "totalTTC": 1800.00,
  "factures": [
    {
      "numeroFacture": "F2025010100001",
      "dateFacture": "2025-01-01",
      "typeFacture": "FACT",
      "montantHT": 300.00,
      "montantTVA": 60.00,
      "montantTTC": 360.00,
      "etat": "V",
      "nombreLignes": 3
    }
  ],
  "message": "5 factures trouvées"
}
```

**Codes d'erreur**:
- 404: Client non trouvé
- 400: Paramètres invalides

---

### 2. Récupérer les factures V3
```http
GET /liste-v3/{societe}/{codeGm}/{filiation}
```

**Description**: Migration Prg_97 - Liste des factures V3 avec catégorisation

**Paramètres obligatoires**:
- `societe` (string): Code societe
- `codeGm` (int): Numéro de compte
- `filiation` (int): Numéro de filiation

**Paramètres optionnels**:
- `dateDebut` (date): Date de début
- `dateFin` (date): Date de fin
- `typeFacture` (string): Filtrer par type (ex: "FACT", "AVR")

**Réponse (200)**:
```json
{
  "success": true,
  "societe": "01",
  "codeGm": 12345,
  "filiation": 0,
  "nombreFactures": 3,
  "totalHebergement": 600.00,
  "totalVentes": 500.00,
  "totalBoutique": 200.00,
  "totalTTC": 1300.00,
  "factures": [
    {
      "numeroFacture": "F2025010100001",
      "dateFacture": "2025-01-01",
      "typeFacture": "FACT",
      "montantHebergement": 200.00,
      "montantVentes": 150.00,
      "montantBoutique": 50.00,
      "montantTTC": 400.00,
      "etat": "V"
    }
  ],
  "message": "3 factures V3 trouvées"
}
```

---

### 3. Vérifier l'existence d'une facture de vente
```http
GET /verifier-vente/{societe}/{codeGm}/{filiation}/{numeroFacture}
```

**Description**: Migration Prg_96 - Vérifier si une facture existe

**Paramètres**:
- `societe` (string): Code societe
- `codeGm` (int): Numéro de compte
- `filiation` (int): Numéro de filiation
- `numeroFacture` (string): Numéro de facture à chercher

**Réponse (200) - Facture trouvée**:
```json
{
  "success": true,
  "factureExiste": true,
  "numeroFacture": "F2025010100001",
  "dateFacture": "2025-01-01",
  "montantTTC": 360.00,
  "etat": "V",
  "message": "Facture trouvée"
}
```

**Réponse (200) - Facture non trouvée**:
```json
{
  "success": true,
  "factureExiste": false,
  "numeroFacture": "F2025010100999",
  "message": "Facture non trouvée"
}
```

---

## Endpoints POST

### 4. Vérifier les lignes boutique
```http
POST /verifier-boutique
Content-Type: application/json
```

**Description**: Migration Prg_91/Prg_99 - Vérifier si une ligne boutique existe

**Body**:
```json
{
  "societe": "01",
  "compte": 12345,
  "rowIdVente": 1001,
  "ligneManquante": false
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "existeLigneBoutique": true,
  "message": "Ligne boutique existe",
  "lignesManquantes": 2
}
```

**Validations**:
- `societe`: Required, max 2 caractères
- `compte`: > 0
- `rowIdVente`: >= 0

---

### 5. Marquer les lignes boutique comme facturées
```http
POST /flag-ligne-boutique
Content-Type: application/json
```

**Description**: Migration Prg_92/Prg_100 - Marquer les lignes comme facturées

**Body**:
```json
{
  "societe": "01",
  "rowIdVente": 1001
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "lignesMarquees": 5,
  "message": "5 lignes marquées comme facturées"
}
```

**Validations**:
- `societe`: Required, max 2 caractères
- `rowIdVente`: > 0

---

### 6. Créer le pied de facture
```http
POST /creer-pied-facture
Content-Type: application/json
```

**Description**: Migration Prg_93/Prg_101 - Calculer et créer le pied de facture

**Body**:
```json
{
  "societe": "01",
  "codeGm": 12345,
  "filiation": 0,
  "typeFacture": "FACT",
  "numeroFacture": "F2025010100001"
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "montantHT": 300.00,
  "montantTVA": 60.00,
  "montantTTC": 360.00,
  "nombreLignes": 3,
  "message": "Pied de facture créé: 360.00 €"
}
```

**Validations**:
- `societe`: Required, max 2 caractères
- `codeGm`: > 0
- `filiation`: >= 0
- `typeFacture`: Required, max 10 caractères
- `numeroFacture`: Required, max 20 caractères

---

### 7. Mettre à jour les lignes saisies
```http
POST /maj-lignes-saisies
Content-Type: application/json
```

**Description**: Migration Prg_94/Prg_105 - Mettre à jour les lignes de facture

**Body**:
```json
{
  "societe": "01",
  "codeGm": 12345,
  "filiation": 0,
  "numeroFacture": "F2025010100001",
  "typeFacture": "FACT",
  "lignes": [
    {
      "rowId": 1,
      "montant": 100.00,
      "montantTVA": 20.00,
      "codeArticle": "ART001",
      "quantite": 1
    },
    {
      "rowId": 2,
      "montant": 200.00,
      "montantTVA": 40.00,
      "codeArticle": "ART002",
      "quantite": 2
    }
  ]
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "lignesMisesAJour": 2,
  "montantTotal": 300.00,
  "message": "2 lignes mises à jour, montant total: 300.00 €"
}
```

**Validations**:
- `societe`: Required, max 2 caractères
- `codeGm`: > 0
- `filiation`: >= 0
- `numeroFacture`: Required
- `typeFacture`: Required
- `lignes`: Non-vide
  - `rowId`: > 0
  - `montant`: >= 0

---

### 8. Mettre à jour l'hébergement temporaire
```http
POST /maj-hebergement-tempo
Content-Type: application/json
```

**Description**: Migration Prg_104 - Mettre à jour les charges d'hébergement

**Body**:
```json
{
  "societe": "01",
  "codeGm": 12345,
  "filiation": 0,
  "numeroFacture": "F2025010100001",
  "dateFacture": "2025-01-01",
  "typeFacture": "FACT",
  "montant": 500.00
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "nuits": 5,
  "montantNuit": 100.00,
  "montantTotal": 500.00,
  "message": "5 nuits mises à jour - Montant: 500.00 €"
}
```

**Validations**:
- `societe`: Required, max 2 caractères
- `codeGm`: > 0
- `filiation`: >= 0
- `numeroFacture`: Required
- `dateFacture`: Required
- `typeFacture`: Required
- `montant`: > 0

---

## Gestion des erreurs

### Format d'erreur standard
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

### Codes HTTP
- **200 OK**: Succès
- **400 Bad Request**: Validation échouée ou erreur métier
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur

### Exemples d'erreurs
```json
// Validation échouée
{
  "success": false,
  "message": "Societe must be 1-2 characters"
}

// Client non trouvé
{
  "success": false,
  "message": "Client non trouvé: 12345"
}

// Exception DB
{
  "success": false,
  "message": "Erreur lors de la mise à jour: Connection timeout"
}
```

---

## Exemples d'utilisation (cURL)

### Récupérer factures V2
```bash
curl -X GET \
  "https://api.example.com/api/factures/liste-v2/01/12345/0?dateDebut=2025-01-01&dateFin=2025-01-31" \
  -H "Authorization: Bearer TOKEN"
```

### Marquer les lignes comme facturées
```bash
curl -X POST \
  "https://api.example.com/api/factures/flag-ligne-boutique" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "societe": "01",
    "rowIdVente": 1001
  }'
```

### Mettre à jour les lignes saisies
```bash
curl -X POST \
  "https://api.example.com/api/factures/maj-lignes-saisies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "societe": "01",
    "codeGm": 12345,
    "filiation": 0,
    "numeroFacture": "F2025010100001",
    "typeFacture": "FACT",
    "lignes": [
      {
        "rowId": 1,
        "montant": 100.00,
        "montantTVA": 20.00,
        "codeArticle": "ART001",
        "quantite": 1
      }
    ]
  }'
```

---

## Swagger/OpenAPI

Tous les endpoints sont documentés dans Swagger.
Accédez à: `https://api.example.com/swagger/index.html`

Tag: **Factures**
