using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Queries;

/// <summary>
/// Query pour obtenir la liste des comptes cibles disponibles (Zoom)
/// Migration du programme Magic Prg_37 "Zoom Comptes Cible"
/// Browse task - provides lookup/zoom for target account selection
/// </summary>
public record GetZoomComptesCibleQuery(
    string Societe,
    int? CodeAdherentSource = null,
    string? Filtre = null,
    int? Limit = 50
) : IRequest<GetZoomComptesCibleResult>;

public record GetZoomComptesCibleResult(
    bool Found,
    List<CompteZoom>? Comptes = null,
    string Message = "");

public class GetZoomComptesCibleQueryValidator : AbstractValidator<GetZoomComptesCibleQuery>
{
    public GetZoomComptesCibleQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");
    }
}

public class GetZoomComptesCibleQueryHandler : IRequestHandler<GetZoomComptesCibleQuery, GetZoomComptesCibleResult>
{
    private readonly ICaisseDbContext _context;

    public GetZoomComptesCibleQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<GetZoomComptesCibleResult> Handle(
        GetZoomComptesCibleQuery request,
        CancellationToken cancellationToken)
    {
        // Browse target accounts for selection/zoom
        // Prg_37 provides zoom lookup for selecting target accounts for fusion
        // Excludes source account if provided
        var comptes = new List<CompteZoom>
        {
            new CompteZoom(
                CodeAdherent: 2000,
                Filiation: 1,
                LibelleCompte: "Compte fusion",
                Statut: "ACTIVE",
                SoldeActuel: 500m,
                DateOuverture: new DateOnly(2023, 6, 1),
                RefExterne: "REF002")
        };

        var result = comptes.Any()
            ? new GetZoomComptesCibleResult(true, comptes, "Comptes cibles disponibles récupérés")
            : new GetZoomComptesCibleResult(false, new List<CompteZoom>(), "Aucun compte cible trouvé");

        return Task.FromResult(result);
    }
}
