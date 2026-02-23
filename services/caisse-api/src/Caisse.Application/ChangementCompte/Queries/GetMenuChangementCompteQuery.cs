using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Queries;

/// <summary>
/// Query pour obtenir le menu de changement de compte
/// Migration du programme Magic Prg_37 "Menu changement compte"
/// Online task - provides menu interface for account change operations
/// </summary>
public record GetMenuChangementCompteQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    string? Acces = null
) : IRequest<GetMenuChangementCompteResult>;

public record GetMenuChangementCompteResult(
    bool Found,
    MenuChangementCompte? Menu = null,
    string Message = "");

public record MenuChangementCompte(
    int CodeAdherent,
    int Filiation,
    string LibelleMenu,
    List<MenuOption> Options,
    List<string> MessagesInfo,
    bool CanSeparate,
    bool CanFuse,
    bool CanViewHistory);

public record MenuOption(
    string Code,
    string Libelle,
    string Description,
    bool Enabled);

public class GetMenuChangementCompteQueryValidator : AbstractValidator<GetMenuChangementCompteQuery>
{
    public GetMenuChangementCompteQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.CodeAdherent)
            .GreaterThan(0).WithMessage("CodeAdherent must be positive");
    }
}

public class GetMenuChangementCompteQueryHandler : IRequestHandler<GetMenuChangementCompteQuery, GetMenuChangementCompteResult>
{
    private readonly ICaisseDbContext _context;

    public GetMenuChangementCompteQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<GetMenuChangementCompteResult> Handle(
        GetMenuChangementCompteQuery request,
        CancellationToken cancellationToken)
    {
        // Build menu for account change operations
        // Prg_37 displays online menu with available operations
        var options = new List<MenuOption>
        {
            new MenuOption(
                Code: "SEP",
                Libelle: "Séparation",
                Description: "Séparer les comptes associés",
                Enabled: true),
            new MenuOption(
                Code: "FUS",
                Libelle: "Fusion",
                Description: "Fusionner deux comptes",
                Enabled: true),
            new MenuOption(
                Code: "HIST",
                Libelle: "Historique",
                Description: "Consulter l'historique des changements",
                Enabled: true),
            new MenuOption(
                Code: "RPT",
                Libelle: "Rapport",
                Description: "Imprimer le rapport",
                Enabled: true)
        };

        var menu = new MenuChangementCompte(
            CodeAdherent: request.CodeAdherent,
            Filiation: request.Filiation,
            LibelleMenu: $"Menu Changement Compte - {request.CodeAdherent}/{request.Filiation}",
            Options: options,
            MessagesInfo: new List<string> { "Bienvenue dans le menu de changement de compte" },
            CanSeparate: true,
            CanFuse: true,
            CanViewHistory: true
        );

        return Task.FromResult(new GetMenuChangementCompteResult(true, menu, "Menu récupéré avec succès"));
    }
}
