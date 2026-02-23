using FluentValidation;
using MediatR;

namespace Caisse.Application.Divers.Queries;

/// <summary>
/// Query pour recuperer la langue de l'utilisateur
/// Migration du programme Magic Prg_45 "Recuperation langue"
/// Note: Version simplifiee utilisant un dictionnaire interne (pas de table Parametres generiques)
/// </summary>
public record GetLangueUtilisateurQuery(
    string Societe,
    string CodeUtilisateur
) : IRequest<GetLangueUtilisateurResult>;

public record GetLangueUtilisateurResult
{
    public bool Found { get; init; }
    public string CodeLangue { get; init; } = "FRA";
    public string LibelleLangue { get; init; } = "Francais";
    public bool EstInformaticien { get; init; }
    public List<MenuVisibiliteDto> MenusVisibles { get; init; } = new();
}

public record MenuVisibiliteDto
{
    public string CodeMenu { get; init; } = string.Empty;
    public string LibelleMenu { get; init; } = string.Empty;
    public bool Visible { get; init; }
}

public class GetLangueUtilisateurQueryValidator : AbstractValidator<GetLangueUtilisateurQuery>
{
    public GetLangueUtilisateurQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeUtilisateur)
            .NotEmpty().WithMessage("CodeUtilisateur is required")
            .MaximumLength(20).WithMessage("CodeUtilisateur must be at most 20 characters");
    }
}

public class GetLangueUtilisateurQueryHandler : IRequestHandler<GetLangueUtilisateurQuery, GetLangueUtilisateurResult>
{
    // Utilisateurs avec droits informaticien
    private static readonly HashSet<string> UtilisateursInformaticiens = new(StringComparer.OrdinalIgnoreCase)
    {
        "INFORMATICIEN", "ADMIN", "SYSADMIN", "IT", "TECH"
    };

    // Langues par defaut par societe
    private static readonly Dictionary<string, string> LanguesParSociete = new(StringComparer.OrdinalIgnoreCase)
    {
        { "FR", "FRA" },
        { "ES", "ESP" },
        { "UK", "ENG" },
        { "US", "ENG" },
        { "DE", "DEU" },
        { "IT", "ITA" },
        { "BR", "POR" },
        { "JP", "JPN" },
        { "CN", "CHN" }
    };

    public Task<GetLangueUtilisateurResult> Handle(
        GetLangueUtilisateurQuery request,
        CancellationToken cancellationToken)
    {
        // Determiner la langue (par defaut: FRA)
        var codeLangue = LanguesParSociete.TryGetValue(request.Societe, out var langue)
            ? langue
            : "FRA";

        var estInformaticien = UtilisateursInformaticiens.Contains(request.CodeUtilisateur);

        var libelleLangue = GetLibelleLangue(codeLangue);

        // Determiner les menus visibles selon la langue et les droits
        var menusVisibles = GetMenusVisibles(codeLangue, estInformaticien);

        return Task.FromResult(new GetLangueUtilisateurResult
        {
            Found = true,
            CodeLangue = codeLangue,
            LibelleLangue = libelleLangue,
            EstInformaticien = estInformaticien,
            MenusVisibles = menusVisibles
        });
    }

    private static string GetLibelleLangue(string code) => code.ToUpper() switch
    {
        "FRA" => "Francais",
        "ENG" => "English",
        "ESP" => "Espanol",
        "DEU" => "Deutsch",
        "ITA" => "Italiano",
        "POR" => "Portugues",
        "NLD" => "Nederlands",
        "JPN" => "Japanese",
        "CHN" => "Chinese",
        _ => code
    };

    private static List<MenuVisibiliteDto> GetMenusVisibles(string codeLangue, bool estInformaticien)
    {
        var menus = new List<MenuVisibiliteDto>
        {
            new() { CodeMenu = "CAISSE", LibelleMenu = "Gestion Caisse", Visible = true },
            new() { CodeMenu = "VENTES", LibelleMenu = "Ventes", Visible = true },
            new() { CodeMenu = "COMPTE", LibelleMenu = "Compte Client", Visible = true },
            new() { CodeMenu = "CHANGE", LibelleMenu = "Change", Visible = true },
            new() { CodeMenu = "TELEPHONE", LibelleMenu = "Telephone", Visible = true },
            new() { CodeMenu = "ADMIN", LibelleMenu = "Administration", Visible = estInformaticien },
            new() { CodeMenu = "DEBUG", LibelleMenu = "Debug", Visible = estInformaticien }
        };

        return menus;
    }
}
