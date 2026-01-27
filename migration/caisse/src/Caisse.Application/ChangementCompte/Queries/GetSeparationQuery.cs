using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.ChangementCompte.Queries;

/// <summary>
/// Query pour obtenir les détails de séparation de compte
/// Migration du programme Magic Prg_27 "Separation"
/// Public via ADH.ecf - Browse/Online task
/// </summary>
public record GetSeparationQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    string? TypeFiltre = null,
    string? ValeurFiltre = null,
    int? Limit = null
) : IRequest<GetSeparationResult>;

public record GetSeparationResult(
    bool Found,
    List<SeparationDetail>? Details = null,
    string Message = "");

public record SeparationDetail(
    int CodeAdherent,
    int Filiation,
    string LibelleFiliation,
    decimal SoldeCompte,
    DateTime DateOuverture,
    string Statut,
    List<string>? ComptesDependants = null);

public class GetSeparationQueryValidator : AbstractValidator<GetSeparationQuery>
{
    public GetSeparationQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeAdherent)
            .GreaterThan(0).WithMessage("CodeAdherent must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThan(0).WithMessage("Filiation must be positive");
    }
}

public class GetSeparationQueryHandler : IRequestHandler<GetSeparationQuery, GetSeparationResult>
{
    private readonly ICaisseDbContext _context;

    public GetSeparationQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<GetSeparationResult> Handle(
        GetSeparationQuery request,
        CancellationToken cancellationToken)
    {
        // Browse separation records for account and dependent filings
        // Prg_27 retrieves separation details for a given account
        var separationDetails = new List<SeparationDetail>();

        // This would fetch from histo_fus_sep and related tables
        // For now, returning structure
        var details = new SeparationDetail(
            CodeAdherent: request.CodeAdherent,
            Filiation: request.Filiation,
            LibelleFiliation: "Filiation principale",
            SoldeCompte: 0m,
            DateOuverture: DateTime.Now,
            Statut: "ACTIVE",
            ComptesDependants: new List<string>()
        );

        separationDetails.Add(details);

        var result = separationDetails.Any()
            ? new GetSeparationResult(true, separationDetails, "Détails de séparation récupérés")
            : new GetSeparationResult(false, Details: new List<SeparationDetail>(), "Aucun détail de séparation trouvé");

        return Task.FromResult(result);
    }
}
