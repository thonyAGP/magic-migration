# Migration des Programmes Garantie (Prg_106-114)

## Vue d'ensemble

Cette documentation décrit la migration des 8 programmes Magic Unipaas relatifs à la gestion des garanties vers l'API .NET 8 avec le pattern CQRS et MediatR.

## Programmes Migrés

### Prg_106 - Init Garantie
**Description:** Maj lignes saisies archive V3 - Initialisation et création de dépôts de garantie

**Endpoint:** `POST /api/garanties/init`

**Commande:**
```csharp
public record InitGarantieCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string TypeDepot,
    string CodeDevise,
    double Montant,
    string? CodeGarantie,
    string OperateurId)
```

**Réponse:**
- `DepotCreated`: Détails du dépôt créé
- `TypesDisponibles`: Liste des types de garantie disponibles

**Fichiers créés:**
- `/src/Caisse.Application/Garanties/Commands/InitGarantieCommand.cs`
- `/tests/Caisse.Application.Tests/Garanties/InitGarantieCommandTests.cs`

---

### Prg_107 - Garantie DETAIL
**Description:** Print creation garantie - Détails complets des garanties d'un compte

**Endpoint:** `GET /api/garanties/detail/{societe}/{codeAdherent}/{filiation}`

**Réponse:**
- `Details`: Liste détaillée des dépôts avec jours de dépôt
- `TotalMontant`: Montant total des garanties
- `TotalDepots`: Nombre total de dépôts

**Fichiers créés:**
- `/src/Caisse.Application/Garanties/Queries/GetGarantieDetailQuery.cs`
- `/tests/Caisse.Application.Tests/Garanties/GetGarantieDetailQueryTests.cs`

---

### Prg_108 - Garantie OBJET
**Description:** Print annulation garantie - Gestion des objets en garantie

**Endpoint:** `GET /api/garanties/objets/{societe}/{codeAdherent}/{filiation}`

**Réponse:**
- `Objets`: Liste des objets déposés avec descriptions
- `TotalObjets`: Nombre d'objets

**Données retournées:**
- DateDepot/DateRetrait
- Description et Type d'objet
- Numéros de dossiers (PMS, AXIS, NA)
- État et Opérateur

**Fichiers créés:**
- `/src/Caisse.Application/Garanties/Queries/GetGarantieObjetsQuery.cs`
- `/tests/Caisse.Application.Tests/Garanties/GetGarantieObjetsQueryTests.cs`

---

### Prg_109 - Garantie DEVISE
**Description:** Print creation garantie TIK V1 - Gestion des devises en garantie

**Endpoint:** `GET /api/garanties/devises/{societe}/{codeAdherent}/{filiation}`

**Réponse:**
- `Devises`: Liste des devises avec montants et taux de change
- `TotalMontant`: Montant équivalent total

**Calculs inclus:**
- MontantEquivalent = Montant * TauxChange

**Fichiers créés:**
- `/src/Caisse.Application/Garanties/Queries/GetGarantieDevisesQuery.cs`

---

### Prg_110 - Garantie SELECTION
**Description:** Print creation garanti PMS-584 - Sélection filtrée des garanties

**Endpoint:** `GET /api/garanties/selection?societe={societe}&typeDepot={typeDepot}&codeDevise={codeDevise}&etatDepot={etatDepot}`

**Paramètres optionnels:**
- `typeDepot`: Filtre par type de dépôt
- `codeDevise`: Filtre par devise
- `etatDepot`: Filtre par état (A=Actif, R=Retiré)

**Réponse:**
- `Garanties`: Liste filtrée avec informations du compte
- `TypesDisponibles`: Valeurs distinctes de types
- `DevisesDisponibles`: Valeurs distinctes de devises
- `EtatsDisponibles`: Valeurs distinctes d'états

**Fichiers créés:**
- `/src/Caisse.Application/Garanties/Queries/GetGarantieSelectionQuery.cs`

---

### Prg_111 - Garantie sur compte ✓ (Existant)
Migration déjà effectuée.

---

### Prg_112 - Print Garantie
**Description:** Garantie sur compte PMS-584 - Impression/Export des données de garantie

**Endpoint:** `POST /api/garanties/print`

**Commande:**
```csharp
public record PrintGarantieCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string Format = "PDF") // PDF, CSV, EXCEL
```

**Formats supportés:**
- PDF: `application/pdf`
- CSV: `text/csv`
- EXCEL: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Réponse:**
- `DocumentData`: Données pour générer le document
- `DocumentName`: Nom du fichier à générer
- `MimeType`: Type MIME approprié

**Fichiers créés:**
- `/src/Caisse.Application/Garanties/Commands/PrintGarantieCommand.cs`
- `/tests/Caisse.Application.Tests/Garanties/PrintGarantieCommandTests.cs`

---

### Prg_113 - Zoom Garantie Type
**Description:** Test Activation ECO - Liste des types de garantie avec zoom

**Endpoint:** `GET /api/garanties/types/{societe}?codeClasse={codeClasse}`

**Paramètres:**
- `codeClasse`: Filtre optionnel par classe

**Réponse:**
- `Types`: Liste des types avec libellés et montants
- `ClassesDisponibles`: Valeurs distinctes de classes
- `Total`: Nombre de types

**Fichiers créés:**
- `/src/Caisse.Application/Garanties/Queries/GetGarantieTypesQuery.cs`

---

### Prg_114 - Validation Garantie
**Description:** Club Med Pass Filiations - Validation des garanties avec contrôles métier

**Endpoint:** `POST /api/garanties/valider`

**Commande:**
```csharp
public record ValiderGarantieCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string TypeGarantie,
    string OperateurId,
    string? Motif)
```

**Validations effectuées:**
1. Existence du compte
2. Type de garantie valide
3. Existence d'au moins un dépôt actif
4. Solde du compte positif
5. État du compte actif

**Réponse:**
- `EtatValidation`: "V" si validée
- `WarningMessages`: Messages d'avertissement
- `ValidationErrors`: Erreurs détectées

**Fichiers créés:**
- `/src/Caisse.Application/Garanties/Commands/ValiderGarantieCommand.cs`
- `/tests/Caisse.Application.Tests/Garanties/ValiderGarantieCommandTests.cs`

---

## Structure des Fichiers

### Application Layer

```
src/Caisse.Application/Garanties/
├── Commands/
│   ├── InitGarantieCommand.cs (Prg_106)
│   ├── PrintGarantieCommand.cs (Prg_112)
│   └── ValiderGarantieCommand.cs (Prg_114)
└── Queries/
    ├── GetGarantieCompteQuery.cs (Prg_111 - Existant)
    ├── GetGarantieDetailQuery.cs (Prg_107)
    ├── GetGarantieObjetsQuery.cs (Prg_108)
    ├── GetGarantieDevisesQuery.cs (Prg_109)
    ├── GetGarantieSelectionQuery.cs (Prg_110)
    └── GetGarantieTypesQuery.cs (Prg_113)
```

### Test Layer

```
tests/Caisse.Application.Tests/Garanties/
├── InitGarantieCommandTests.cs
├── GetGarantieDetailQueryTests.cs
├── GetGarantieObjetsQueryTests.cs
├── PrintGarantieCommandTests.cs
└── ValiderGarantieCommandTests.cs
```

### API Layer

```
src/Caisse.Api/Program.cs
- MapGroup("/api/garanties") avec 8 endpoints
```

---

## Endpoints Résumé

| Méthode | Route | Prg | Description |
|---------|-------|-----|-------------|
| GET | `/{societe}/{codeAdherent}/{filiation}` | 111 | Compte garanties |
| POST | `/init` | 106 | Init garantie |
| GET | `/detail/{societe}/{codeAdherent}/{filiation}` | 107 | Détail garanties |
| GET | `/objets/{societe}/{codeAdherent}/{filiation}` | 108 | Objets en garantie |
| GET | `/devises/{societe}/{codeAdherent}/{filiation}` | 109 | Devises en garantie |
| GET | `/selection` | 110 | Sélection filtrée |
| POST | `/print` | 112 | Impression/Export |
| GET | `/types/{societe}` | 113 | Types de garantie |
| POST | `/valider` | 114 | Validation |

---

## Pattern CQRS Utilisé

### Commands
- `InitGarantieCommand` - Crée un dépôt de garantie
- `PrintGarantieCommand` - Exporte les données de garantie
- `ValiderGarantieCommand` - Valide une garantie

### Queries
- `GetGarantieCompteQuery` - Récupère les garanties d'un compte
- `GetGarantieDetailQuery` - Détails complets des garanties
- `GetGarantieObjetsQuery` - Listes les objets en garantie
- `GetGarantieDevisesQuery` - Listes les devises en garantie
- `GetGarantieSelectionQuery` - Sélection filtrée
- `GetGarantieTypesQuery` - Types disponibles

---

## Entités Utilisées

### Domaine
- `Garantie` - Types de garantie
- `DepotGarantie` - Dépôts monétaires
- `DepotObjet` - Objets en garantie
- `DepotDevise` - Devises en garantie
- `CompteGm` - Comptes de membres
- `Devise` - Devises/Monnaies

### DTOs de Réponse
- `DepotGarantieDto`
- `DetailDepotDto`
- `GarantieObjetDto`
- `GarantieDeviseDto`
- `GarantieSelectionDto`
- `TypeGarantieDetailDto`
- `PrintGarantieDataDto`
- `ValiderGarantieDataDto`

---

## Validations

Toutes les commandes et queries incluent des validateurs FluentValidation :

- Societe: Non vide, max 2 caractères
- CodeGm/CodeAdherent: Positif
- Filiation: ≥ 0
- Montant: Positif (Commands)
- TypeDepot: Non vide (Commands)
- Format: PDF, CSV, ou EXCEL (PrintGarantieCommand)

---

## Tests

Couverture de test:
- ✓ Cas de succès avec données valides
- ✓ Cas d'erreur (compte non trouvé, etc.)
- ✓ Validation des données
- ✓ Différents formats et filtres
- ✓ Warnings et erreurs métier

Exécuter les tests:
```bash
dotnet test tests/Caisse.Application.Tests/Garanties/
```

---

## Notes Techniques

1. **Dates/Heures:** Utilise `DateOnly` et `TimeOnly` (.NET 6+)
2. **Devise:** Montants en `double` (à considérer migrer vers `decimal` pour précision)
3. **État:** Codifié ("A"=Actif, "R"=Retiré, "V"=Validé)
4. **Asynchrone:** Tous les handlers utilisent async/await
5. **No Tracking:** Les queries utilisent `.AsNoTracking()` pour performance
6. **Repository Pattern:** Accès via `ICaisseDbContext`

---

## Dépendances

- MediatR - Pattern CQRS
- FluentValidation - Validation
- Entity Framework Core - ORM
- Microsoft.EntityFrameworkCore

---

## Prochaines Étapes

1. Intégrer les générateurs de documents PDF/Excel
2. Ajouter des logs d'audit pour les modifications
3. Implémenter la sécurité (autorisations par rôle)
4. Ajouter des métriques de performance
5. Documenter les cas d'utilisation dans Swagger

