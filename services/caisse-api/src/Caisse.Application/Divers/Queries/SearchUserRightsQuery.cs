using FluentValidation;
using MediatR;

namespace Caisse.Application.Divers.Queries;

/// <summary>
/// Query pour rechercher les droits utilisateur
/// Migration du programme Magic Prg_51 "Search User Rights"
/// Retourne true si l'utilisateur a les droits INFORMATICIEN ou GESTION
/// </summary>
public record SearchUserRightsQuery(
    string Societe,
    string CodeUtilisateur,
    string? TypeDroit = null // null ou vide = tous les droits, sinon: INFORMATICIEN, GESTION, etc.
) : IRequest<SearchUserRightsResult>;

public record SearchUserRightsResult
{
    public bool UtilisateurTrouve { get; init; }
    public string CodeUtilisateur { get; init; } = string.Empty;
    public List<UserRightDto> Droits { get; init; } = new();
    public bool HasInformaticienRight { get; init; }
    public bool HasGestionRight { get; init; }
    public bool HasRequestedRight { get; init; }
    public string? MessageErreur { get; init; }
}

public record UserRightDto
{
    public string TypeDroit { get; init; } = string.Empty;
    public string LibelleDroit { get; init; } = string.Empty;
    public bool Actif { get; init; }
    public DateOnly? DateDebut { get; init; }
    public DateOnly? DateFin { get; init; }
    public bool EstExpire { get; init; }
}

public class SearchUserRightsQueryValidator : AbstractValidator<SearchUserRightsQuery>
{
    public SearchUserRightsQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeUtilisateur)
            .NotEmpty().WithMessage("CodeUtilisateur is required")
            .MaximumLength(20).WithMessage("CodeUtilisateur must be at most 20 characters");

        RuleFor(x => x.TypeDroit)
            .MaximumLength(20).WithMessage("TypeDroit must be at most 20 characters");
    }
}

public class SearchUserRightsQueryHandler : IRequestHandler<SearchUserRightsQuery, SearchUserRightsResult>
{
    // Dictionnaire des utilisateurs et leurs droits
    private static readonly Dictionary<string, List<string>> UserRights = new(StringComparer.OrdinalIgnoreCase)
    {
        // Administrateurs
        { "INFORMATICIEN", new List<string> { "INFORMATICIEN", "GESTION", "ADMIN" } },
        { "ADMIN", new List<string> { "INFORMATICIEN", "GESTION", "ADMIN" } },
        { "SYSADMIN", new List<string> { "INFORMATICIEN", "GESTION", "ADMIN" } },

        // Managers
        { "MANAGER", new List<string> { "GESTION" } },
        { "SUPERVISOR", new List<string> { "GESTION" } },

        // IT Staff
        { "IT", new List<string> { "INFORMATICIEN" } },
        { "TECH", new List<string> { "INFORMATICIEN" } },

        // Standard users (no special rights)
        { "USER", new List<string>() },
        { "OPERATOR", new List<string>() }
    };

    public Task<SearchUserRightsResult> Handle(
        SearchUserRightsQuery request,
        CancellationToken cancellationToken)
    {
        // Chercher l'utilisateur dans le dictionnaire
        var userFound = UserRights.TryGetValue(request.CodeUtilisateur, out var userDroits);

        if (!userFound)
        {
            return Task.FromResult(new SearchUserRightsResult
            {
                UtilisateurTrouve = false,
                CodeUtilisateur = request.CodeUtilisateur,
                MessageErreur = $"Utilisateur {request.CodeUtilisateur} non trouve"
            });
        }

        // Construire la liste des droits
        var droits = BuildUserRights(userDroits ?? new List<string>());

        // Determiner les droits specifiques
        var hasInformaticien = userDroits?.Contains("INFORMATICIEN", StringComparer.OrdinalIgnoreCase) ?? false;
        var hasGestion = userDroits?.Contains("GESTION", StringComparer.OrdinalIgnoreCase) ?? false;

        // Verifier le droit demande
        var hasRequestedRight = string.IsNullOrEmpty(request.TypeDroit)
            ? true
            : userDroits?.Contains(request.TypeDroit, StringComparer.OrdinalIgnoreCase) ?? false;

        return Task.FromResult(new SearchUserRightsResult
        {
            UtilisateurTrouve = true,
            CodeUtilisateur = request.CodeUtilisateur,
            Droits = droits,
            HasInformaticienRight = hasInformaticien,
            HasGestionRight = hasGestion,
            HasRequestedRight = hasRequestedRight
        });
    }

    private static List<UserRightDto> BuildUserRights(List<string> userDroits)
    {
        var droitDefinitions = new Dictionary<string, string>
        {
            { "INFORMATICIEN", "Acces Informaticien / Administration systeme" },
            { "GESTION", "Acces Gestion / Supervision" },
            { "ADMIN", "Acces Administrateur Complet" },
            { "CAISSE", "Acces Caisse" },
            { "VENTES", "Acces Ventes" }
        };

        var result = new List<UserRightDto>();

        foreach (var droit in userDroits)
        {
            var libelle = droitDefinitions.TryGetValue(droit, out var lib) ? lib : droit;
            result.Add(new UserRightDto
            {
                TypeDroit = droit,
                LibelleDroit = libelle,
                Actif = true,
                DateDebut = DateOnly.FromDateTime(DateTime.Now.AddYears(-1)),
                DateFin = null,
                EstExpire = false
            });
        }

        return result;
    }
}
