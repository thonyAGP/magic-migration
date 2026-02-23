# Migration des Programmes Printer Management (Prg_177 à 186)

## Vue d'ensemble

Migration de 10 programmes Magic Unipaas vers une architecture CQRS avec MediatR en C# .NET 8.

### Programmes migrés

| Prg | Nom | Type | Public | Description |
|-----|-----|------|--------|-------------|
| 177 | Init Printer | Batch | Non | Initialise les paramètres d'imprimante |
| 178 | GET_PRINTER | Batch | **OUI** | Obtient les infos imprimante/listing |
| 179 | Liste Printers | Batch | Non | Liste toutes les imprimantes |
| 180 | SET_LIST_NUMBER | Batch | **OUI** | Définit le numéro de listing (1 param) |
| 181 | RAZ_PRINTER | Batch | **OUI** | Réinitialise les paramètres imprimante |
| 182 | Config Printer | Online | Non | Configure une imprimante |
| 183 | Test Print | Batch | Non | Envoie une page de test |
| 184 | Printer Status | Batch | Non | Affiche le statut détaillé (6 params) |
| 185 | CHAINED_LIST_DEFAULT | Batch | **OUI** | Charge config par défaut (6 params) |
| 186 | Printer Log | Online | Non | Historique (stub) |

## Structure créée

### Queries (Lectures)
```
src/Caisse.Application/PrinterManagement/Queries/
├── GetPrinterQuery.cs           → Prg_178 GET_PRINTER
├── ListPrintersQuery.cs         → Prg_179 Liste Printers
├── GetPrinterStatusQuery.cs     → Prg_184 Printer Status
└── GetChainedListDefaultQuery.cs → Prg_185 CHAINED_LIST_DEFAULT
```

### Commands (Écritures)
```
src/Caisse.Application/PrinterManagement/Commands/
├── SetListingNumberCommand.cs   → Prg_180 SET_LIST_NUMBER
├── ResetPrinterCommand.cs       → Prg_181 RAZ_PRINTER
├── ConfigurePrinterCommand.cs   → Prg_182 Config Printer
└── TestPrinterCommand.cs        → Prg_183 Test Print
```

### Endpoints API
```
POST/GET /api/printer/

GET  /api/printer/                           → Prg_179 - List all printers
GET  /api/printer/{printerId}                → Prg_184 - Get printer status
GET  /api/printer/info/{listingNumber}       → Prg_178 - Get printer info
POST /api/printer/set-listing                → Prg_180 - Set listing number
POST /api/printer/reset                      → Prg_181 - Reset printer
POST /api/printer/configure                  → Prg_182 - Configure printer
POST /api/printer/test                       → Prg_183 - Test print
GET  /api/printer/chained-list-default/{num} → Prg_185 - Load default config
```

## Paramètres publics (Magic)

Les programmes publics exposent les paramètres suivants :

### Prg_178: GET_PRINTER
Charge depuis variables globales :
- `CURRENTLISTINGNUM` (GetParam)

Initialise :
- `CURRENTLISTINGNAME`
- `DEFAULTPRINTERNUM` + `DEFAULTPRINTERNAME`
- `CURRENTPRINTERNUM` + `CURRENTPRINTERNAME`
- `NUMBERCOPIES`

### Prg_180: SET_LIST_NUMBER (1 paramètre)
- Param 1: Listing number (NUMERIC 3)
- Réinitialise si NON SPECIFIC: `CURRENTPRINTERNUM=0`, `CURRENTPRINTERNAME=VOID`, `NUMBERCOPIES=0`

### Prg_181: RAZ_PRINTER
Réinitialise :
- `CURRENTPRINTERNUM = 0`
- `CURRENTPRINTERNAME = 'VOID'`
- `NUMBERCOPIES = 0`

### Prg_185: CHAINED_LIST_DEFAULT (6 paramètres)
- Param 1: Listing number
- Param 2: Listing name
- Param 3: Printer number
- Param 4: Printer name
- Param 5: Number of copies
- Param 6: Config code

## Tests

Fichiers de tests créés :
```
tests/Caisse.Application.Tests/PrinterManagement/
├── GetPrinterQueryTests.cs
├── ListPrintersQueryTests.cs
├── GetPrinterStatusQueryTests.cs
├── SetListingNumberCommandTests.cs
├── ResetPrinterCommandTests.cs
├── ConfigurePrinterCommandTests.cs
├── TestPrinterCommandTests.cs
└── GetChainedListDefaultQueryTests.cs (implicite)
```

Exécuter les tests :
```bash
cd tests/Caisse.Application.Tests
dotnet test PrinterManagement/
```

## Pattern CQRS appliqué

### Queries (Lectures)
- Héritent de `IRequest<TResult>`
- Utiliseront `AsNoTracking()` pour les performances
- Validation via `FluentValidation`

### Commands (Écritures)
- Héritent de `IRequest<TResult>`
- Incluent la validation (Validator)
- Modifient les données via DbContext

## Intégration dans Program.cs

Ajouter à Program.cs après le bloc Divers :

```csharp
// Importer
using Caisse.Application.PrinterManagement.Queries;
using Caisse.Application.PrinterManagement.Commands;

// Dans app.Build() :
app.MapPrinterEndpoints();  // À partir de PrinterEndpoints.cs
```

## Tables requises (DbContext)

Les handlers supposent l'existence de :
- `DbSet<Printer>` - Information imprimantes
- `DbSet<PrinterLog>` - Historique des tests/actions

Entités minimales :
```csharp
public class Printer
{
    public int PrinterId { get; set; }
    public string PrinterName { get; set; }
    public string PrinterType { get; set; }
    public bool IsDefault { get; set; }
    public string Status { get; set; }
    public string? HostName { get; set; }
    public int? Port { get; set; }
    public int ListingIndex { get; set; }
    public string ListingName { get; set; }
}

public class PrinterLog
{
    public int Id { get; set; }
    public int PrinterId { get; set; }
    public string ActionType { get; set; }
    public DateOnly? TestDate { get; set; }
    public TimeOnly? TestTime { get; set; }
    public string Status { get; set; }
    public string? Details { get; set; }
}
```

## Notes techniques

1. **Prg_177** : Logique d'initialisation intégrée dans les constructeurs et setup
2. **Prg_186** : Stub vide (pas de logique dans source)
3. **Paramètres Magic** : Simulés via session/context (à adapter selon l'architecture)
4. **Test Print** : Génère contenu simple, à adapter pour vraie imprimante
5. **Statut Imprimante** : Enum `ONLINE|OFFLINE|CONFIGURED|ERROR|UNKNOWN`

## Fichiers créés : 19 au total

### Application Layer (8)
- 4 Queries
- 4 Commands
- 2 Support (Init + ServiceExtensions)

### API Layer (1)
- PrinterEndpoints.cs (regroupement)

### Tests (6)
- Query tests (3)
- Command tests (3)

### Documentation (1)
- Ce fichier

Total : **19 fichiers**
