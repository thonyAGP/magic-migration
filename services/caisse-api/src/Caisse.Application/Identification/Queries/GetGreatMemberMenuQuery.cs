using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Identification.Queries;

/// <summary>
/// Query pour récupérer le menu des Great Members
/// Migration du programme Magic Prg_157 "Menu Great Member"
/// Paramètres : P_SOC, P_CODE_GM, P_FILIATION, P_TYPE_CLIENT, P_ACCES, P_DATE_OP
/// </summary>
public record GetGreatMemberMenuQuery(
    string Societe,
    int CodeGm,
    int Filiation,
    string TypeClient,
    string Acces,
    DateOnly? DateOperation = null
) : IRequest<GetGreatMemberMenuResult>;

public record GetGreatMemberMenuResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public string Nom { get; init; } = string.Empty;
    public string Prenom { get; init; } = string.Empty;
    public string TypeClient { get; init; } = string.Empty;
    public string Acces { get; init; } = string.Empty;
    public string Qualite { get; init; } = string.Empty;
    public string? Message { get; init; }
}

public class GetGreatMemberMenuQueryValidator : AbstractValidator<GetGreatMemberMenuQuery>
{
    public GetGreatMemberMenuQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be greater than 0");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be greater than or equal to 0");

        RuleFor(x => x.TypeClient)
            .NotEmpty().WithMessage("TypeClient is required")
            .MaximumLength(1).WithMessage("TypeClient must be at most 1 character");

        RuleFor(x => x.Acces)
            .NotEmpty().WithMessage("Acces is required")
            .MaximumLength(1).WithMessage("Acces must be at most 1 character");
    }
}

public class GetGreatMemberMenuQueryHandler : IRequestHandler<GetGreatMemberMenuQuery, GetGreatMemberMenuResult>
{
    private readonly ICaisseDbContext _context;

    public GetGreatMemberMenuQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetGreatMemberMenuResult> Handle(
        GetGreatMemberMenuQuery request,
        CancellationToken cancellationToken)
    {
        // Rechercher le GM dans la table GmRecherche
        var gmRecherche = await _context.GmRecherches
            .AsNoTracking()
            .FirstOrDefaultAsync(g =>
                g.Societe == request.Societe &&
                g.CodeGm == request.CodeGm &&
                g.FiliationVillag == request.Filiation &&
                g.TypeDeClient == request.TypeClient,
                cancellationToken);

        if (gmRecherche == null)
        {
            return new GetGreatMemberMenuResult
            {
                Found = false,
                Message = "Great Member not found"
            };
        }

        // Vérifier l'accès
        if (!string.IsNullOrEmpty(gmRecherche.Acces) && gmRecherche.Acces != request.Acces)
        {
            return new GetGreatMemberMenuResult
            {
                Found = false,
                Message = "Access denied"
            };
        }

        return new GetGreatMemberMenuResult
        {
            Found = true,
            Societe = request.Societe,
            CodeGm = request.CodeGm,
            Filiation = request.Filiation,
            Nom = gmRecherche.Nom,
            Prenom = gmRecherche.Prenom,
            TypeClient = gmRecherche.TypeDeClient,
            Acces = gmRecherche.Acces,
            Qualite = gmRecherche.Qualite
        };
    }
}
