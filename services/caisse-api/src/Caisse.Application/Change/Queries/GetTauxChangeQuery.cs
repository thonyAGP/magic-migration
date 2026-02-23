using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Change.Queries;

/// <summary>
/// Query pour récupérer les taux de change disponibles
/// Migration du programme Magic Prg_20 "Définition monnaie"
/// </summary>
public record GetTauxChangeQuery(
    string Societe,
    string? CodeDevise = null,
    DateOnly? DateReference = null
) : IRequest<GetTauxChangeResult>;

public record GetTauxChangeResult
{
    public bool Found { get; init; }
    public int NombreTaux { get; init; }
    public List<TauxChangeDto> Taux { get; init; } = new();
}

public record TauxChangeDto
{
    public string CodeDevise { get; init; } = string.Empty;
    public string TypeDevise { get; init; } = string.Empty;
    public double TauxAchat { get; init; }
    public double TauxVente { get; init; }
    public DateOnly DateValidite { get; init; }
    public DateOnly? DateFin { get; init; }
    public string ModePaiement { get; init; } = string.Empty;
    public bool IsActif { get; init; }
}

public class GetTauxChangeQueryValidator : AbstractValidator<GetTauxChangeQuery>
{
    public GetTauxChangeQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeDevise)
            .MaximumLength(3).WithMessage("CodeDevise must be at most 3 characters")
            .When(x => x.CodeDevise != null);
    }
}

public class GetTauxChangeQueryHandler : IRequestHandler<GetTauxChangeQuery, GetTauxChangeResult>
{
    private readonly ICaisseDbContext _context;

    public GetTauxChangeQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetTauxChangeResult> Handle(
        GetTauxChangeQuery request,
        CancellationToken cancellationToken)
    {
        var dateRef = request.DateReference ?? DateOnly.FromDateTime(DateTime.Today);

        var query = _context.TauxChanges
            .AsNoTracking()
            .Where(t => t.Societe == request.Societe);

        if (!string.IsNullOrEmpty(request.CodeDevise))
        {
            query = query.Where(t => t.CodeDevise == request.CodeDevise);
        }

        var taux = await query
            .OrderBy(t => t.CodeDevise)
            .ThenByDescending(t => t.DateValidite)
            .Select(t => new TauxChangeDto
            {
                CodeDevise = t.CodeDevise,
                TypeDevise = t.TypeDevise,
                TauxAchat = t.TauxAchat,
                TauxVente = t.TauxVente,
                DateValidite = t.DateValidite,
                DateFin = t.DateFin,
                ModePaiement = t.ModePaiement,
                IsActif = t.DateValidite <= dateRef &&
                          (t.DateFin == null || t.DateFin >= dateRef)
            })
            .ToListAsync(cancellationToken);

        return new GetTauxChangeResult
        {
            Found = taux.Count > 0,
            NombreTaux = taux.Count,
            Taux = taux
        };
    }
}
