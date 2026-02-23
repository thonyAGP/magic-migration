using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Identification.Queries;

/// <summary>
/// Query pour récupérer la liste des Great Members avec statut de carte
/// Migration du programme Magic Prg_159 "Liste des GM"
/// Paramètres : P_SOC, P_VILLAGE, P_SEXE, P_TYPE_CLIENT, P_TYPE_CARTE
/// Retourne une liste de GMs avec statut de leur carte Club Med Pass
/// </summary>
public record GetGreatMembersListQuery(
    string Societe,
    int? Village = null,
    string? Sexe = null,
    string? TypeClient = null,
    string? TypeCarte = null
) : IRequest<GetGreatMembersListResult>;

public record GetGreatMembersListResult
{
    public List<GreatMemberItem> Items { get; init; } = new();
    public int Total { get; init; }
    public string? Message { get; init; }
}

public record GreatMemberItem
{
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public string Nom { get; init; } = string.Empty;
    public string Prenom { get; init; } = string.Empty;
    public string Sexe { get; init; } = string.Empty;
    public string Age { get; init; } = string.Empty;
    public string TypeClient { get; init; } = string.Empty;
    public string Qualite { get; init; } = string.Empty;
    public string? CardCode { get; init; }
    public string? CardStatus { get; init; }
    public bool CardIsValid { get; init; }
}

public class GetGreatMembersListQueryValidator : AbstractValidator<GetGreatMembersListQuery>
{
    public GetGreatMembersListQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.Village)
            .GreaterThanOrEqualTo(0).When(x => x.Village.HasValue)
            .WithMessage("Village must be greater than or equal to 0");

        RuleFor(x => x.Sexe)
            .MaximumLength(1).When(x => !string.IsNullOrEmpty(x.Sexe))
            .WithMessage("Sexe must be at most 1 character");

        RuleFor(x => x.TypeClient)
            .MaximumLength(1).When(x => !string.IsNullOrEmpty(x.TypeClient))
            .WithMessage("TypeClient must be at most 1 character");
    }
}

public class GetGreatMembersListQueryHandler : IRequestHandler<GetGreatMembersListQuery, GetGreatMembersListResult>
{
    private readonly ICaisseDbContext _context;

    public GetGreatMembersListQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetGreatMembersListResult> Handle(
        GetGreatMembersListQuery request,
        CancellationToken cancellationToken)
    {
        // Construire la requête avec filtres optionnels
        var query = _context.GmRecherches
            .AsNoTracking()
            .Where(g => g.Societe == request.Societe);

        // Appliquer les filtres optionnels
        if (request.Village.HasValue && request.Village.Value > 0)
        {
            query = query.Where(g => g.FiliationVillag == request.Village.Value);
        }

        if (!string.IsNullOrEmpty(request.Sexe))
        {
            query = query.Where(g => g.Sexe == request.Sexe);
        }

        if (!string.IsNullOrEmpty(request.TypeClient))
        {
            query = query.Where(g => g.TypeDeClient == request.TypeClient);
        }

        var gms = await query.OrderBy(g => g.Nom).ThenBy(g => g.Prenom).ToListAsync(cancellationToken);

        if (!gms.Any())
        {
            return new GetGreatMembersListResult
            {
                Total = 0,
                Message = "No members found for the specified criteria"
            };
        }

        // Récupérer les cartes EzCard pour tous les GMs
        var gmCodes = gms.Select(g => g.CodeGm).Distinct().ToList();
        var cards = await _context.EzCards
            .AsNoTracking()
            .Where(c => c.Societe == request.Societe && gmCodes.Contains(c.CodeGm))
            .ToListAsync(cancellationToken);

        // Filtrer par type de carte si spécifié
        if (!string.IsNullOrEmpty(request.TypeCarte))
        {
            cards = cards.Where(c => c.Type == request.TypeCarte).ToList();
        }

        // Construire les résultats
        var items = gms.Select(gm =>
        {
            var card = cards.FirstOrDefault(c =>
                c.CodeGm == gm.CodeGm &&
                c.Filiation == gm.FiliationVillag);

            return new GreatMemberItem
            {
                Societe = gm.Societe,
                CodeGm = gm.CodeGm,
                Filiation = gm.FiliationVillag,
                Nom = gm.Nom,
                Prenom = gm.Prenom,
                Sexe = gm.Sexe,
                Age = gm.Age,
                TypeClient = gm.TypeDeClient,
                Qualite = gm.Qualite,
                CardCode = card?.CardCode,
                CardStatus = card?.Status,
                CardIsValid = card?.IsValid ?? false
            };
        }).ToList();

        return new GetGreatMembersListResult
        {
            Items = items,
            Total = items.Count
        };
    }
}
