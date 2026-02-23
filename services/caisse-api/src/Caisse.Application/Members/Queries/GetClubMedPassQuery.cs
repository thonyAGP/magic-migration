using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Members.Queries;

/// <summary>
/// Query pour recuperer le Club Med Pass (carte EzCard)
/// Migration du programme Magic Prg_160 "GetCMP"
///
/// Parametres originaux Magic:
/// 1. Societe (U) - Code societe
/// 2. Compte (N) - Numero de compte GM
/// 3. Filiation (N) - Code filiation
///
/// Retourne: Club Med Pass (card_code) ou null si non trouve
/// </summary>
public record GetClubMedPassQuery(
    string Societe,
    int Compte,
    int Filiation) : IRequest<GetClubMedPassResult>;

public record GetClubMedPassResult
{
    public bool Found { get; init; }
    public string? CardCode { get; init; }
    public string? Status { get; init; }
    public bool IsValid { get; init; }
    public double? Plafond { get; init; }
    public string? Type { get; init; }
}

public class GetClubMedPassQueryValidator : AbstractValidator<GetClubMedPassQuery>
{
    public GetClubMedPassQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.Compte)
            .GreaterThan(0).WithMessage("Compte must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");
    }
}

public class GetClubMedPassQueryHandler : IRequestHandler<GetClubMedPassQuery, GetClubMedPassResult>
{
    private readonly ICaisseDbContext _context;

    public GetClubMedPassQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetClubMedPassResult> Handle(
        GetClubMedPassQuery request,
        CancellationToken cancellationToken)
    {
        // Rechercher la carte EzCard par societe/compte/filiation
        // Condition Magic: status <> 'O' (pas en Opposition)
        var card = await _context.EzCards
            .AsNoTracking()
            .Where(c => c.Societe == request.Societe
                     && c.CodeGm == request.Compte
                     && c.Filiation == request.Filiation
                     && c.Status != "O") // Exclure cartes en opposition
            .FirstOrDefaultAsync(cancellationToken);

        if (card == null)
        {
            return new GetClubMedPassResult
            {
                Found = false
            };
        }

        return new GetClubMedPassResult
        {
            Found = true,
            CardCode = card.CardCode,
            Status = card.Status,
            IsValid = card.IsValid,
            Plafond = card.Plafond,
            Type = card.Type
        };
    }
}
