using FluentValidation;
using MediatR;

namespace Caisse.Application.Divers.Queries;

/// <summary>
/// Query pour recuperer le titre d'un ecran
/// Migration du programme Magic Prg_43 "Recuperation du titre"
/// </summary>
public record GetTitreEcranQuery(
    string CodeEcran,
    string? TypeProgramme = null,
    string? CodeLangue = null
) : IRequest<GetTitreEcranResult>;

public record GetTitreEcranResult
{
    public bool Found { get; init; }
    public string CodeEcran { get; init; } = string.Empty;
    public string TitreEcran { get; init; } = string.Empty;
    public string TypeProgramme { get; init; } = "CA"; // Default: CA (Caisse)
    public string CodeLangue { get; init; } = "FRA";
}

public class GetTitreEcranQueryValidator : AbstractValidator<GetTitreEcranQuery>
{
    public GetTitreEcranQueryValidator()
    {
        RuleFor(x => x.CodeEcran)
            .NotEmpty().WithMessage("CodeEcran is required")
            .MaximumLength(20).WithMessage("CodeEcran must be at most 20 characters");

        RuleFor(x => x.TypeProgramme)
            .MaximumLength(5).WithMessage("TypeProgramme must be at most 5 characters");

        RuleFor(x => x.CodeLangue)
            .MaximumLength(3).WithMessage("CodeLangue must be at most 3 characters");
    }
}

public class GetTitreEcranQueryHandler : IRequestHandler<GetTitreEcranQuery, GetTitreEcranResult>
{
    public Task<GetTitreEcranResult> Handle(
        GetTitreEcranQuery request,
        CancellationToken cancellationToken)
    {
        // Determiner le type de programme (defaut: CA)
        var typeProgramme = string.IsNullOrEmpty(request.TypeProgramme) ? "CA" : request.TypeProgramme;

        // Determiner la langue (defaut: FRA)
        var codeLangue = string.IsNullOrEmpty(request.CodeLangue) ? "FRA" : request.CodeLangue;

        // Recuperer le titre de l'ecran depuis le dictionnaire interne
        var titre = GetTitreFromDictionary(request.CodeEcran, codeLangue);

        return Task.FromResult(new GetTitreEcranResult
        {
            Found = !string.IsNullOrEmpty(titre),
            CodeEcran = request.CodeEcran,
            TitreEcran = titre ?? request.CodeEcran, // Fallback au code si non trouve
            TypeProgramme = typeProgramme,
            CodeLangue = codeLangue
        });
    }

    private static string? GetTitreFromDictionary(string codeEcran, string codeLangue)
    {
        // Dictionnaire des titres d'ecran par code et langue
        var titres = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            // Ecrans principaux - Francais
            { "DASHBOARD_FRA", "Tableau de bord" },
            { "IDENTIFICATION_FRA", "Identification Operateur" },
            { "SESSION_FRA", "Gestion Session Caisse" },
            { "COMPTAGE_FRA", "Comptage Caisse" },
            { "VENTES_FRA", "Ventes" },
            { "DEVISES_FRA", "Devises et Coffre" },
            { "CHANGE_FRA", "Operations de Change" },
            { "COMPTE_FRA", "Consultation Compte Client" },
            { "EXTRAIT_FRA", "Extrait de Compte" },
            { "GARANTIE_FRA", "Gestion des Garanties" },
            { "CHECKOUT_FRA", "Easy Check-Out" },
            { "FACTURES_FRA", "Facturation" },
            { "TELEPHONE_FRA", "Gestion Telephone" },
            { "EZCARD_FRA", "Cartes EzCard / Club Med Pass" },
            { "DEPOT_FRA", "Gestion des Depots" },
            { "ZOOMS_FRA", "Referentiels" },

            // Ecrans principaux - Anglais
            { "DASHBOARD_ENG", "Dashboard" },
            { "IDENTIFICATION_ENG", "Operator Identification" },
            { "SESSION_ENG", "Cash Session Management" },
            { "COMPTAGE_ENG", "Cash Counting" },
            { "VENTES_ENG", "Sales" },
            { "DEVISES_ENG", "Currencies and Safe" },
            { "CHANGE_ENG", "Currency Exchange" },
            { "COMPTE_ENG", "Client Account Lookup" },
            { "EXTRAIT_ENG", "Account Statement" },
            { "GARANTIE_ENG", "Guarantees Management" },
            { "CHECKOUT_ENG", "Easy Check-Out" },
            { "FACTURES_ENG", "Invoicing" },
            { "TELEPHONE_ENG", "Phone Management" },
            { "EZCARD_ENG", "EzCard / Club Med Pass" },
            { "DEPOT_ENG", "Deposit Management" },
            { "ZOOMS_ENG", "Reference Data" },

            // Ecrans principaux - Espagnol
            { "DASHBOARD_ESP", "Panel de Control" },
            { "VENTES_ESP", "Ventas" },
            { "COMPTE_ESP", "Consulta Cuenta Cliente" }
        };

        // Creer la cle de recherche
        var key = $"{codeEcran.ToUpper()}_{codeLangue.ToUpper()}";

        // Chercher le titre exact
        if (titres.TryGetValue(key, out var titre))
        {
            return titre;
        }

        // Fallback vers le francais si la langue demandee n'existe pas
        if (codeLangue.ToUpper() != "FRA")
        {
            var keyFra = $"{codeEcran.ToUpper()}_FRA";
            if (titres.TryGetValue(keyFra, out var titreFra))
            {
                return titreFra;
            }
        }

        return null;
    }
}
