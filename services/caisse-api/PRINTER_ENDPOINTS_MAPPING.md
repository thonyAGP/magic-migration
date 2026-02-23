# Printer Management API Endpoints - Mapping Complet

## Récapitulatif des 8 Endpoints

### 1. LIST PRINTERS
```
GET /api/printer/
Migration: Prg_179
Type: Query (Lecture)
Params: Aucun
Response: { success, printers: [ { printerId, printerName, printerType, isDefault, status } ] }
```

### 2. GET PRINTER STATUS
```
GET /api/printer/{printerId}
Migration: Prg_184 (Chained Listing Printer Choice)
Type: Query avec 6 paramètres optionnels
Params:
  - printerId (path, requis)
  - listingNumber (query, optionnel)
  - printerName (query, optionnel)
  - configId (query, optionnel)
  - hostName (query, optionnel)
  - status (query, optionnel)
Response: { success, printerId, printerName, status, hostName, isOnline, lastTestDate }
```

### 3. GET PRINTER INFO
```
GET /api/printer/info/{currentListingNumber}
Migration: Prg_178 (GET_PRINTER - PUBLIC)
Type: Query
Params: currentListingNumber (path, numeric 3)
Response: {
  success,
  currentListingNumber,
  currentListingIndex,
  currentListingName,
  defaultPrinterNumber,
  defaultPrinterName,
  currentPrinterNumber,
  currentPrinterName,
  numberCopies
}
Description: Initialise les paramètres globaux Magic pour l'imprimante courante
```

### 4. SET LISTING NUMBER
```
POST /api/printer/set-listing
Content-Type: application/json
{
  "listingNumber": 1
}

Migration: Prg_180 (SET_LIST_NUMBER - PUBLIC)
Type: Command avec 1 paramètre
Response: { success, listingNumber }
Side Effects:
  - Si NON SPECIFIC (PRINTER CHOICE):
    • CURRENTPRINTERNUM = 0
    • CURRENTPRINTERNAME = 'VOID'
    • NUMBERCOPIES = 0
```

### 5. RESET PRINTER
```
POST /api/printer/reset
Content-Type: application/json
{}

Migration: Prg_181 (RAZ_PRINTER - PUBLIC)
Type: Command (pas de paramètres)
Response: { success, message }
Side Effects:
  - CURRENTPRINTERNUM = 0
  - CURRENTPRINTERNAME = 'VOID'
  - NUMBERCOPIES = 0
```

### 6. CONFIGURE PRINTER
```
POST /api/printer/configure
Content-Type: application/json
{
  "printerId": 1,
  "printerName": "Printer Test",
  "printerType": "THERMAL",
  "isDefault": true,
  "hostName": "192.168.1.100",
  "port": 9100
}

Migration: Prg_182 (Config Printer - Online)
Type: Command
Validation:
  - PrinterId: 1-n
  - PrinterName: max 64 chars
  - PrinterType: required, max 20 chars
  - Port: 1-65535
Response: { success, printerId, message }
```

### 7. TEST PRINTER
```
POST /api/printer/test
Content-Type: application/json
{
  "printerId": 1
}

Migration: Prg_183 (Test Print)
Type: Command
Response: { success, printerId, printerName, status, message }
Side Effect: Crée une entrée dans PrinterLog avec ActionType='TEST'
```

### 8. GET CHAINED LIST DEFAULT
```
GET /api/printer/chained-list-default/{listingNumber}
Migration: Prg_185 (CHAINED_LIST_DEFAULT - PUBLIC)
Type: Query avec 6 paramètres optionnels
Params (path):
  - listingNumber (numeric)
Optional params (query):
  - listingName
  - printerNumber
  - printerName
  - numberCopies
  - configCode
Response: {
  success,
  listingNumber,
  listingName,
  defaultPrinterNumber,
  defaultPrinterName,
  defaultCopies,
  configCode,
  message
}
Description: Charge la configuration par défaut pour une liste chaînée
```

## Programmes NON EXPOSÉS via API

### Prg_177: Init Printer
- Type: Batch (Set Village Address)
- Statut: **Intégré automatiquement** dans application startup
- Logic: SetParam pour paramètres d'adresse village (VI_CLUB, VI_NAME, VI_ADR1, etc.)

### Prg_186: Printer Log
- Type: Online
- Statut: **Stub vide** (ISEMPTY_TSK=1)
- À implémenter: Historique complet des actions/tests

## Schéma de flux (Sequence)

```
Client App
    ↓
[1] GET /api/printer/                  → ListPrinters (Prg_179)
    ↓
[2] GET /api/printer/info/{num}        → GetPrinter (Prg_178) - initialise params globaux
    ↓
[3] POST /api/printer/set-listing      → SetListingNumber (Prg_180) - change listing
    ↓
[4] GET /api/printer/{id}              → GetPrinterStatus (Prg_184) - vérifie statut
    ↓
[5] POST /api/printer/configure        → ConfigurePrinter (Prg_182) - configure
    ↓
[6] POST /api/printer/test             → TestPrinter (Prg_183) - envoie test
    ↓
[7] POST /api/printer/reset            → ResetPrinter (Prg_181) - RAZ si besoin
    ↓
[8] GET /api/printer/chained-list-...  → GetChainedListDefault (Prg_185)
```

## Types de données

### PrinterInfo (ListPrinters response)
```csharp
public record PrinterInfo(
    int PrinterId,
    string PrinterName,
    string PrinterType,
    bool IsDefault,
    string Status);
```

### Status Values
- `ONLINE` : Imprimante active
- `OFFLINE` : Déconnectée
- `CONFIGURED` : Configurée mais non testée
- `ERROR` : Erreur détectée
- `UNKNOWN` : État indéterminé

## Intégration à Program.cs

**Avant (actuel):** Les endpoints sont définis inline dans Program.cs

**Après (avec refactoring):** Les endpoints sont extraits dans `PrinterEndpoints.cs`

```csharp
// Dans Program.cs, après les autres groupes d'endpoints :
app.MapPrinterEndpoints();  // Appel à PrinterEndpoints.MapPrinterEndpoints()
```

## Validation FluentValidation

### GetPrinterQuery
- CurrentListingNumber >= 0

### GetPrinterStatusQuery
- PrinterId > 0

### SetListingNumberCommand
- ListingNumber >= 0

### GetChainedListDefaultQuery
- ListingNumber >= 0

### ConfigurePrinterCommand
- PrinterId > 0
- PrinterName: required, max 64
- PrinterType: required, max 20
- HostName: optional, max 64
- Port: 1-65535 if provided

## Erreurs courantes

1. **Printer not found** (404)
   - Cause: PrinterId/ListingNumber inexistant
   - Solution: Vérifier via GET /api/printer/

2. **Invalid port** (400)
   - Cause: Port < 1 ou > 65535
   - Solution: Utiliser port valide (ex: 9100 pour TCP/IP)

3. **Listing not found** (404)
   - Cause: ListingNumber invalide
   - Solution: Appeler GET /api/printer/ pour voir les listings disponibles

## Performance

- ListPrinters: `AsNoTracking()` (lecture optimisée)
- GetPrinterStatus: `AsNoTracking()` (lecture optimisée)
- GetPrinter: `AsNoTracking()` (lecture optimisée)
- GetChainedListDefault: `AsNoTracking()` (lecture optimisée)
- SetListingNumber: Validation uniquement (pas DB write)
- ResetPrinter: En-mémoire (context/session)
- ConfigurePrinter: UPDATE + SaveChanges
- TestPrinter: INSERT log + SaveChanges
